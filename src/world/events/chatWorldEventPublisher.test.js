import test from 'node:test'
import assert from 'node:assert/strict'
import { createChatWorldEventPublisher } from './chatWorldEventPublisher.js'

test('publishes one ordered evidence chain from confirmed Hermes SSE edges', async () => {
  const events = []
  const publisher = createChatWorldEventPublisher({
    runId: 'stream-real-42',
    sessionId: 'session-7',
    profile: 'coder',
    now: () => '2026-07-15T12:00:00.000Z',
    publish: async (event) => { events.push(event); return true },
  })

  await publisher.started()
  await publisher.thinking()
  await publisher.thinking()
  await publisher.working('shell_command')
  await publisher.working('another_tool')
  await publisher.success()
  await publisher.success()

  assert.deepEqual(events.map(({ event, seq }) => [event, seq]), [
    ['stream_start', 0],
    ['reasoning', 1],
    ['tool', 2],
    ['done', 3],
  ])
  assert.ok(events.every((event) => event.run_id === 'stream-real-42' && event.profile === 'coder'))
  assert.deepEqual(events.map((event) => event.event_id), [
    'stream-real-42:0', 'stream-real-42:1', 'stream-real-42:2', 'stream-real-42:3',
  ])
  assert.equal(events[2].payload.tool_name, 'shell_command')
})

test('critical is terminal and never becomes a fake success', async () => {
  const events = []
  const publisher = createChatWorldEventPublisher({
    runId: 'stream-error-9',
    profile: 'default',
    publish: async (event) => { events.push(event); return true },
  })

  await publisher.started()
  await publisher.critical()
  await publisher.success()
  await publisher.working('late_tool')

  assert.deepEqual(events.map((event) => event.event), ['stream_start', 'apperror'])
})

test('does not publish anything without a confirmed stream id', async () => {
  const events = []
  const publisher = createChatWorldEventPublisher({ publish: async (event) => { events.push(event); return true } })
  assert.equal(await publisher.started(), false)
  assert.deepEqual(events, [])
})

test('retries a failed panel edge with the same evidence id and preserves lifecycle order', async () => {
  const attempts = []
  const sleeps = []
  let failStartedOnce = true
  const publisher = createChatWorldEventPublisher({
    runId: 'stream-retry-1',
    retryDelaysMs: [10, 20],
    sleep: async (delayMs) => { sleeps.push(delayMs) },
    publish: async (event) => {
      attempts.push({ id: event.event_id, event: event.event })
      if (event.event === 'stream_start' && failStartedOnce) {
        failStartedOnce = false
        return false
      }
      return true
    },
  })

  const started = publisher.started()
  const thinking = publisher.thinking()
  assert.equal(await started, true)
  assert.equal(await thinking, true)
  assert.deepEqual(attempts, [
    { id: 'stream-retry-1:0', event: 'stream_start' },
    { id: 'stream-retry-1:0', event: 'stream_start' },
    { id: 'stream-retry-1:1', event: 'reasoning' },
  ])
  assert.deepEqual(sleeps, [10])
})

test('does not mark a permanently failed edge as emitted', async () => {
  let attempts = 0
  const publisher = createChatWorldEventPublisher({
    runId: 'stream-retry-2',
    retryDelaysMs: [0],
    sleep: async () => {},
    publish: async () => { attempts += 1; return false },
  })
  assert.equal(await publisher.started(), false)
  assert.equal(await publisher.started(), false)
  assert.equal(attempts, 4)
})
