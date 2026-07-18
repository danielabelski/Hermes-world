import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function readStoredEvents(storagePath, maxEvents, logger) {
  if (!storagePath) return []
  try {
    if (!fs.existsSync(storagePath)) return []
    const parsed = JSON.parse(fs.readFileSync(storagePath, 'utf8'))
    if (!Array.isArray(parsed)) return []
    return parsed.filter((event) => event && typeof event === 'object' && event.eventId && event.runId && Number.isInteger(event.seq)).slice(-maxEvents)
  } catch (error) {
    logger('WORLD_EVENT_HISTORY_LOAD_FAILED', { error: error?.message ?? String(error) })
    return []
  }
}

function writeStoredEvents(storagePath, events) {
  if (!storagePath) return
  fs.mkdirSync(path.dirname(storagePath), { recursive: true })
  const temporaryPath = `${storagePath}.${process.pid}.tmp`
  fs.writeFileSync(temporaryPath, JSON.stringify(events, null, 2), 'utf8')
  fs.renameSync(temporaryPath, storagePath)
}

export function createWorldEventHub({ maxEvents = 500, storagePath = null, logger = () => {} } = {}) {
  const events = readStoredEvents(storagePath, maxEvents, logger)
  const eventIds = new Set()
  const lastSeqByRun = new Map()
  const clients = new Set()

  for (const event of events) {
    eventIds.add(event.eventId)
    const previousSeq = lastSeqByRun.get(event.runId)
    if (!Number.isInteger(previousSeq) || event.seq > previousSeq) lastSeqByRun.set(event.runId, event.seq)
  }

  const send = (res, eventName, data, id = null) => {
    if (id) res.write(`id: ${id}\n`)
    res.write(`event: ${eventName}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    res.flush?.()
  }

  function publish(event) {
    if (eventIds.has(event.eventId)) return { accepted: false, reason: 'duplicate', event }
    const previousSeq = lastSeqByRun.get(event.runId)
    if (Number.isInteger(previousSeq) && event.seq <= previousSeq) return { accepted: false, reason: 'out_of_order', event }

    const publishedEvent = Object.freeze({ ...event, publishedAt: new Date().toISOString() })
    const nextEvents = [...events, publishedEvent].slice(-maxEvents)
    try {
      writeStoredEvents(storagePath, nextEvents)
    } catch (error) {
      logger('WORLD_EVENT_PERSIST_FAILED', { eventId: event.eventId, runId: event.runId, seq: event.seq, error: error?.message ?? String(error) })
      return { accepted: false, reason: 'persistence_failed', event }
    }

    events.splice(0, events.length, ...nextEvents)
    eventIds.clear()
    for (const retained of events) eventIds.add(retained.eventId)
    lastSeqByRun.set(event.runId, event.seq)
    logger('WORLD_EVENT_PERSISTED', { eventId: publishedEvent.eventId, runId: publishedEvent.runId, seq: publishedEvent.seq, eventType: publishedEvent.eventType })
    for (const client of clients) send(client, 'world_event', publishedEvent, publishedEvent.eventId)
    return { accepted: true, reason: null, event: publishedEvent }
  }

  function subscribe(res, lastEventId = '') {
    clients.add(res)
    const lastIndex = lastEventId ? events.findIndex((event) => event.eventId === lastEventId) : -1
    const replay = lastIndex >= 0 ? events.slice(lastIndex + 1) : events
    send(res, 'snapshot', { events: replay, cursor: events.at(-1)?.eventId ?? null })
    const heartbeat = setInterval(() => send(res, 'heartbeat', { at: new Date().toISOString() }), 15_000)
    heartbeat.unref?.()
    return () => {
      clearInterval(heartbeat)
      clients.delete(res)
    }
  }

  return Object.freeze({ publish, subscribe, snapshot: () => [...events], clientCount: () => clients.size })
}
