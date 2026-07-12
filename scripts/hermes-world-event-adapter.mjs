#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { normalizeHermesWorldEvent, WorldEventValidationError } from '../src/world/events/worldEventContract.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.dirname(__dirname)
const args = process.argv.slice(2)
const valueFor = (name, fallback = null) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const endpoint = valueFor('--endpoint', process.env.HERMES_WORLD_ENDPOINT || 'http://127.0.0.1:4176/api/world/events')
const profile = valueFor('--profile', process.env.HERMES_WORLD_PROFILE || 'prospecting')
const journalPath = valueFor('--journal')
const streamUrl = valueFor('--stream-url')
const streamRunId = valueFor('--run-id')
const token = valueFor('--token', process.env.HERMES_WORLD_INGEST_TOKEN || '')
const upstreamCookie = process.env.HERMES_WEBUI_COOKIE || ''
const queuePath = valueFor('--queue', path.join(root, 'data', 'world-event-adapter-queue.json'))
const follow = args.includes('--follow')
let queue = []
let flushing = false
let retryMs = 1_000

function loadQueue() {
  try { queue = JSON.parse(fs.readFileSync(queuePath, 'utf8')) } catch { queue = [] }
  if (!Array.isArray(queue)) queue = []
}

function saveQueue() {
  fs.mkdirSync(path.dirname(queuePath), { recursive: true })
  const temp = `${queuePath}.${process.pid}.tmp`
  fs.writeFileSync(temp, JSON.stringify(queue, null, 2))
  fs.renameSync(temp, queuePath)
}

async function post(event) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { 'x-hermes-world-token': token } : {}) },
    body: JSON.stringify(event),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${response.status} ${body.detail || body.error || response.statusText}`)
  return body
}

async function flush() {
  if (flushing || !queue.length) return
  flushing = true
  try {
    while (queue.length) {
      await post(queue[0])
      queue.shift()
      saveQueue()
      retryMs = 1_000
    }
  } catch (error) {
    console.error(`[world-adapter] delivery delayed: ${error.message}`)
    setTimeout(flush, retryMs).unref?.()
    retryMs = Math.min(30_000, retryMs * 2)
  } finally {
    flushing = false
  }
}

function accept(raw) {
  try {
    const event = normalizeHermesWorldEvent({ ...raw, profile: raw.profile ?? raw.payload?.profile ?? profile })
    if (!queue.some((item) => item.eventId === event.eventId)) {
      queue.push(event)
      saveQueue()
      void flush()
    }
  } catch (error) {
    if (error instanceof WorldEventValidationError && error.code === 'unsupported_event') return
    console.error(`[world-adapter] rejected event: ${error.message}`)
  }
}

async function readLines(stream) {
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity })
  for await (const line of lines) {
    if (!line.trim()) continue
    try { accept(JSON.parse(line)) } catch (error) { console.error(`[world-adapter] invalid JSONL: ${error.message}`) }
  }
}

async function readJournal() {
  let offset = 0
  for (;;) {
    const size = fs.statSync(journalPath).size
    if (size > offset) {
      const stream = fs.createReadStream(journalPath, { start: offset, end: size - 1, encoding: 'utf8' })
      await readLines(stream)
      offset = size
    }
    if (!follow) break
    await new Promise((resolve) => setTimeout(resolve, 750))
  }
}

async function readSseStream() {
  if (!streamRunId) throw new Error('--run-id is required with --stream-url')
  const response = await fetch(streamUrl, { headers: { accept: 'text/event-stream', ...(upstreamCookie ? { cookie: upstreamCookie } : {}) } })
  if (!response.ok || !response.body) throw new Error(`Upstream SSE failed: ${response.status} ${response.statusText}`)
  const decoder = new TextDecoder()
  let buffer = ''
  let sequence = 0
  let current = { id: '', event: 'message', data: [] }
  const dispatch = () => {
    if (!current.data.length) return
    const dataText = current.data.join('\n')
    let payload
    try { payload = JSON.parse(dataText) } catch { payload = { text: dataText } }
    const seqFromId = Number(String(current.id).split(':').at(-1))
    const seq = Number.isInteger(seqFromId) && seqFromId >= 0 ? seqFromId : sequence
    accept({
      event_id: current.id || `${streamRunId}:${seq}`,
      run_id: streamRunId,
      seq,
      event: current.event,
      created_at: new Date().toISOString(),
      profile,
      payload,
    })
    sequence = Math.max(sequence + 1, seq + 1)
  }
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line) {
        dispatch()
        current = { id: '', event: 'message', data: [] }
      } else if (line.startsWith('id:')) current.id = line.slice(3).trim()
      else if (line.startsWith('event:')) current.event = line.slice(6).trim()
      else if (line.startsWith('data:')) current.data.push(line.slice(5).trimStart())
    }
  }
  dispatch()
}

loadQueue()
void flush()
if (streamUrl) await readSseStream()
else if (journalPath) await readJournal()
else await readLines(process.stdin)
