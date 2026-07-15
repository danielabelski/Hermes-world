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
