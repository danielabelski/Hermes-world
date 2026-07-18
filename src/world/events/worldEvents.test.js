import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeHermesWorldEvent, WorldEventValidationError } from './worldEventContract.js'
import { applyWorldEventToSnapshot } from './worldEventReducer.js'
import { createWorldSnapshot } from '../WorldBridge.js'
import { DEMO_WORLD_PAYLOADS } from '../data/demoWorldData.js'
import { resolveMapAgentPresentation } from '../mapAgentPresentation.js'
import { getWorldLifeJourney } from '../data/roadGraph.js'
import { createWorldEventHub } from '../../../server/worldEventHub.js'
import { resetWorldEventStreamForTests, subscribeWorldEventStream } from './worldEventStream.js'

const at = '2026-07-12T18:00:00.000Z'
const raw = (seq, event, extra = {}) => ({
  event_id: `watcher-run:${seq}`,
  run_id: 'watcher-run',
  session_id: 'session-1',
  seq,
  event,
  created_at: new Date(Date.parse(at) + seq * 1_000).toISOString(),
  profile: 'watcher',
  ...extra,
})

test('normalizes durable Hermes journal events and keeps presence separate', () => {
  const event = normalizeHermesWorldEvent(raw(1, 'reasoning', { presence: 'online' }))
  assert.equal(event.agentId, 'prospecting')
  assert.equal(event.state, 'thinking')
  assert.equal(event.presence, 'online')
  assert.equal(event.eventId, 'watcher-run:1')
})

test('reserves Komandos MoA for incidents', () => {
  assert.throws(
    () => normalizeHermesWorldEvent({ ...raw(1, 'tool'), profile: 'Komandos MoA' }),
    (error) => error instanceof WorldEventValidationError && error.code === 'moa_non_incident',
  )
  assert.equal(normalizeHermesWorldEvent({ ...raw(2, 'error'), profile: 'Komandos MoA' }).agentId, 'komandos')
})

test('reduces a real Watcher run into route, observation, success and return', () => {
  const base = createWorldSnapshot(DEMO_WORLD_PAYLOADS)
  const assigned = normalizeHermesWorldEvent(raw(0, 'run_started', { message: 'Sprawdź północny szlak' }))
  const thinking = normalizeHermesWorldEvent(raw(1, 'reasoning'))
  const working = normalizeHermesWorldEvent(raw(8, 'tool.started', { payload: { name: 'observe_route' } }))
  const success = normalizeHermesWorldEvent(raw(12, 'done'))

  const outbound = applyWorldEventToSnapshot(base, assigned)
  assert.equal(outbound.activity.items[0].message, 'Zwiadowca otrzymał zadanie i zmierza do punktu obserwacyjnego.')
  assert.equal(outbound.activity.items[0].technicalMessage, 'Sprawdź północny szlak')
  assert.equal(outbound.activity.items[0].type, 'agent')
  assert.equal(outbound.tasks.find((task) => task.id === assigned.taskId).evidenceEventId, assigned.eventId)
  assert.equal(outbound.tasks.find((task) => task.id === assigned.taskId).buildingId, 'scout-lodge')
  assert.equal(outbound.tasks.find((task) => task.id === assigned.taskId).motionEvidence, 'observed-edge')
  const outboundAgent = outbound.agents.find((agent) => agent.profile === 'prospecting')
  const outboundModel = resolveMapAgentPresentation({ agent: { ...outboundAgent, state: 'walking' }, tasks: outbound.tasks, now: Date.parse(at) + 2_000 })
  assert.equal(outboundModel.visualState, 'walk')
  assert.equal(outboundModel.isMoving, true)

  const thinkingSnapshot = applyWorldEventToSnapshot(outbound, thinking)
  const thinkingAgent = thinkingSnapshot.agents.find((agent) => agent.profile === 'prospecting')
  assert.equal(resolveMapAgentPresentation({ agent: thinkingAgent, tasks: thinkingSnapshot.tasks, now: Date.parse(at) + 2_000 }).visualState, 'thinking')

  const observingSnapshot = applyWorldEventToSnapshot(thinkingSnapshot, working)
  const observingAgent = observingSnapshot.agents.find((agent) => agent.profile === 'prospecting')
  const observingModel = resolveMapAgentPresentation({ agent: observingAgent, tasks: observingSnapshot.tasks, now: Date.parse(at) + 8_000 })
  assert.equal(observingModel.visualState, 'observe')
  assert.equal(observingModel.journeyStage, 'observe')

  const completed = applyWorldEventToSnapshot(observingSnapshot, success)
  const completedAgent = completed.agents.find((agent) => agent.profile === 'prospecting')
  const successModel = resolveMapAgentPresentation({ agent: completedAgent, tasks: completed.tasks, now: Date.parse(success.occurredAt) + 1_000 })
  assert.equal(successModel.visualState, 'success')
  const journey = getWorldLifeJourney('prospecting')
  const returnModel = resolveMapAgentPresentation({ agent: completedAgent, tasks: completed.tasks, now: Date.parse(success.occurredAt) + journey.successDurationMs + 1_000 })
  assert.equal(returnModel.visualState, 'walk')
  assert.equal(returnModel.journeyStage, 'return')
})

test('event hub deduplicates and rejects old sequence numbers', () => {
  const hub = createWorldEventHub()
  const first = normalizeHermesWorldEvent(raw(1, 'reasoning'))
  const duplicateId = hub.publish(first)
  assert.equal(duplicateId.accepted, true)
  assert.ok(Number.isFinite(Date.parse(duplicateId.event.publishedAt)))
  assert.equal(hub.publish(first).reason, 'duplicate')
  const older = normalizeHermesWorldEvent({ ...raw(0, 'run_started'), event_id: 'watcher-run:older' })
  assert.equal(hub.publish(older).reason, 'out_of_order')
  assert.equal(hub.snapshot().length, 1)
})

test('world state and choreography share one SSE connection and close it after the last unmount', () => {
  class FakeEventSource {
    static instances = []
    constructor(url) { this.url = url; this.listeners = new Map(); this.closed = false; FakeEventSource.instances.push(this) }
    addEventListener(type, listener) { this.listeners.set(type, listener) }
    emit(type, data) { this.listeners.get(type)?.({ data: JSON.stringify(data) }) }
    close() { this.closed = true }
  }
  resetWorldEventStreamForTests()
  const received = []
  const unsubscribeWorld = subscribeWorldEventStream({ onEvent: (event) => received.push(`world:${event.eventId}`) }, { EventSourceImpl: FakeEventSource })
  const unsubscribeDirector = subscribeWorldEventStream({ onEvent: (event) => received.push(`director:${event.eventId}`) }, { EventSourceImpl: FakeEventSource })

  assert.equal(FakeEventSource.instances.length, 1)
  assert.equal(FakeEventSource.instances[0].url, '/api/world/events/stream')
  FakeEventSource.instances[0].emit('world_event', { eventId: 'evt-1' })
  assert.deepEqual(received, ['world:evt-1', 'director:evt-1'])

  unsubscribeWorld()
  assert.equal(FakeEventSource.instances[0].closed, false)
  unsubscribeDirector()
  assert.equal(FakeEventSource.instances[0].closed, true)
  resetWorldEventStreamForTests()
})

function createStreamHarness() {
  class FakeEventSource {
    static instances = []
    constructor(url) {
      this.url = url
      this.listeners = new Map()
      this.closed = false
      FakeEventSource.instances.push(this)
    }
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) ?? []
      listeners.push(listener)
      this.listeners.set(type, listeners)
    }
    emit(type, data = null) {
      const message = data === null ? {} : { data: JSON.stringify(data) }
      for (const listener of this.listeners.get(type) ?? []) listener(message)
    }
    close() { this.closed = true }
  }

  let nextTimerId = 1
  const timers = new Map()
  const scheduler = {
    setTimeoutImpl(callback, delay) {
      const id = nextTimerId++
      timers.set(id, { callback, delay })
      return id
    },
    clearTimeoutImpl(id) { timers.delete(id) },
    runShortest() {
      const selected = [...timers.entries()].sort((a, b) => a[1].delay - b[1].delay)[0]
      assert.ok(selected, 'expected a scheduled timer')
      timers.delete(selected[0])
      selected[1].callback()
      return selected[1].delay
    },
    count: () => timers.size,
  }

  const listeners = new Map()
  const environment = {
    documentRef: { visibilityState: 'visible' },
    navigatorRef: { onLine: true },
    addEventListener(type, listener) {
      const values = listeners.get(type) ?? new Set()
      values.add(listener)
      listeners.set(type, values)
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener) },
    dispatch(type) { for (const listener of listeners.get(type) ?? []) listener() },
    listenerCount: () => [...listeners.values()].reduce((total, values) => total + values.size, 0),
  }

  return { FakeEventSource, scheduler, environment }
}

test('shared SSE lifecycle survives five reconnects without duplicate sources, timers or listeners', () => {
  resetWorldEventStreamForTests()
  const { FakeEventSource, scheduler, environment } = createStreamHarness()
  const statuses = []
  const events = []
  const options = {
    EventSourceImpl: FakeEventSource,
    ...scheduler,
    environment,
    baseReconnectMs: 100,
    maxReconnectMs: 800,
    heartbeatTimeoutMs: 2_000,
    logger: () => {},
  }
  const unsubscribeWorld = subscribeWorldEventStream({
    onStatus: (status) => statuses.push(status.state),
    onEvent: (event) => events.push(event.eventId),
  }, options)
  const unsubscribeDirector = subscribeWorldEventStream({}, options)

  assert.equal(FakeEventSource.instances.length, 1)
  assert.equal(environment.listenerCount(), 4)
  FakeEventSource.instances[0].emit('open')
  FakeEventSource.instances[0].emit('snapshot', { events: [], cursor: 'evt-0' })

  for (let cycle = 1; cycle <= 5; cycle += 1) {
    const current = FakeEventSource.instances.at(-1)
    current.emit('error')
    assert.equal(current.closed, true)
    assert.equal(scheduler.count(), 1, `cycle ${cycle} must own one reconnect timer`)
    scheduler.runShortest()
    assert.equal(FakeEventSource.instances.length, cycle + 1)
    const reconnected = FakeEventSource.instances.at(-1)
    assert.match(reconnected.url, /after=evt-0/)
    reconnected.emit('open')
    reconnected.emit('heartbeat', { at: `cycle-${cycle}` })
  }

  FakeEventSource.instances.at(-1).emit('world_event', { eventId: 'evt-1' })
  assert.deepEqual(events, ['evt-1'])
  assert.equal(FakeEventSource.instances.filter((instance) => !instance.closed).length, 1)
  assert.ok(statuses.includes('connecting'))
  assert.ok(statuses.includes('live'))
  assert.equal(statuses.filter((status) => status === 'reconnecting').length, 5)

  unsubscribeWorld()
  unsubscribeDirector()
  assert.equal(FakeEventSource.instances.at(-1).closed, true)
  assert.equal(scheduler.count(), 0)
  assert.equal(environment.listenerCount(), 0)
  resetWorldEventStreamForTests()
})

test('shared SSE pauses while hidden and reconnects immediately on foreground or network recovery', () => {
  resetWorldEventStreamForTests()
  const { FakeEventSource, scheduler, environment } = createStreamHarness()
  const statuses = []
  const unsubscribe = subscribeWorldEventStream({ onStatus: (status) => statuses.push(status) }, {
    EventSourceImpl: FakeEventSource,
    ...scheduler,
    environment,
    baseReconnectMs: 100,
    heartbeatTimeoutMs: 2_000,
    logger: () => {},
  })
  FakeEventSource.instances[0].emit('open')

  environment.documentRef.visibilityState = 'hidden'
  environment.dispatch('visibilitychange')
  assert.equal(FakeEventSource.instances[0].closed, true)
  assert.equal(scheduler.count(), 0)
  assert.equal(statuses.at(-1).state, 'disconnected')

  environment.documentRef.visibilityState = 'visible'
  environment.dispatch('visibilitychange')
  assert.equal(FakeEventSource.instances.length, 2)
  FakeEventSource.instances[1].emit('open')

  environment.navigatorRef.onLine = false
  environment.dispatch('offline')
  assert.equal(FakeEventSource.instances[1].closed, true)
  environment.navigatorRef.onLine = true
  environment.dispatch('online')
  assert.equal(FakeEventSource.instances.length, 3)

  unsubscribe()
  assert.equal(scheduler.count(), 0)
  assert.equal(environment.listenerCount(), 0)
  resetWorldEventStreamForTests()
})

test('missing named heartbeat closes the stale source and schedules exactly one reconnect', () => {
  resetWorldEventStreamForTests()
  const { FakeEventSource, scheduler, environment } = createStreamHarness()
  const statuses = []
  const unsubscribe = subscribeWorldEventStream({ onStatus: ({ state }) => statuses.push(state) }, {
    EventSourceImpl: FakeEventSource,
    ...scheduler,
    environment,
    baseReconnectMs: 100,
    heartbeatTimeoutMs: 2_000,
    logger: () => {},
  })
  FakeEventSource.instances[0].emit('open')
  assert.equal(scheduler.count(), 1)
  assert.equal(scheduler.runShortest(), 2_000)
  assert.equal(FakeEventSource.instances[0].closed, true)
  assert.equal(scheduler.count(), 1)
  assert.equal(statuses.at(-1), 'reconnecting')
  unsubscribe()
  assert.equal(scheduler.count(), 0)
  resetWorldEventStreamForTests()
})

test('observable server heartbeat is emitted as a named SSE event and cleaned up', () => {
  const intervals = []
  const originalSetInterval = globalThis.setInterval
  const originalClearInterval = globalThis.clearInterval
  globalThis.setInterval = (callback, delay) => {
    const interval = { callback, delay, cleared: false, unref() {} }
    intervals.push(interval)
    return interval
  }
  globalThis.clearInterval = (interval) => { interval.cleared = true }
  try {
    const writes = []
    const hub = createWorldEventHub()
    const cleanup = hub.subscribe({ write: (value) => writes.push(value), flush() {} })
    assert.equal(intervals.length, 1)
    intervals[0].callback()
    assert.match(writes.join(''), /event: heartbeat/)
    assert.match(writes.join(''), /"at":/)
    cleanup()
    assert.equal(intervals[0].cleared, true)
  } finally {
    globalThis.setInterval = originalSetInterval
    globalThis.clearInterval = originalClearInterval
  }
})
