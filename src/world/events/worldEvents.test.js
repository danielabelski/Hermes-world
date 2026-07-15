import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeHermesWorldEvent, WorldEventValidationError } from './worldEventContract.js'
import { applyWorldEventToSnapshot } from './worldEventReducer.js'
import { createWorldSnapshot } from '../WorldBridge.js'
import { DEMO_WORLD_PAYLOADS } from '../data/demoWorldData.js'
import { resolveMapAgentPresentation } from '../mapAgentPresentation.js'
import { getWorldLifeJourney } from '../data/roadGraph.js'
import { createWorldEventHub } from '../../../server/worldEventHub.js'

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
  assert.equal(outbound.tasks.find((task) => task.id === assigned.taskId).evidenceEventId, assigned.eventId)
  assert.equal(outbound.tasks.find((task) => task.id === assigned.taskId).buildingId, 'scout-lodge')
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
