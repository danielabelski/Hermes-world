import assert from 'node:assert/strict'
import { once } from 'node:events'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createJudgeSandboxServer } from './judge-sandbox-server.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist-judge')

async function withServer(run) {
  const server = createJudgeSandboxServer({ rootDir: ROOT })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  try {
    const address = server.address()
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.closeAllConnections?.()
    server.close()
    await once(server, 'close')
  }
}

test('serves the fixture-only bundle with defensive browser headers', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/`)
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type') || '', /^text\/html/)
    assert.equal(response.headers.get('x-frame-options'), 'DENY')
    assert.match(response.headers.get('content-security-policy') || '', /default-src 'self'/)
    assert.match(await response.text(), /<div id="root">/)
  })
})

test('exposes only empty read-only world transport and no private Hermes APIs', async () => {
  await withServer(async (base) => {
    const health = await (await fetch(`${base}/healthz`)).json()
    assert.deepEqual(health, { ok: true, mode: 'judge-sandbox', data: 'fixture-only', writable: false })

    const snapshotResponse = await fetch(`${base}/api/world/events/snapshot`)
    assert.equal(snapshotResponse.status, 200)
    assert.deepEqual(await snapshotResponse.json(), { ok: true, events: [], cursor: null, source: 'judge-sandbox' })

    const profiles = await fetch(`${base}/api/profiles`)
    assert.equal(profiles.status, 404)

    const sessions = await fetch(`${base}/api/sessions`)
    assert.equal(sessions.status, 404)

    const logs = await fetch(`${base}/api/logs`)
    assert.equal(logs.status, 404)

    const ingest = await fetch(`${base}/api/world/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    assert.equal(ingest.status, 405)
  })
})

test('provides a bounded SSE heartbeat without operational events', async () => {
  await withServer(async (base) => {
    const controller = new AbortController()
    const response = await fetch(`${base}/api/world/events/stream`, { signal: controller.signal })
    assert.equal(response.status, 200)
    const reader = response.body.getReader()
    const first = await reader.read()
    const text = new TextDecoder().decode(first.value)
    assert.match(text, /event: snapshot/)
    assert.match(text, /"events":\[\]/)
    assert.doesNotMatch(text, /world_event/)
    controller.abort()
  })
})
