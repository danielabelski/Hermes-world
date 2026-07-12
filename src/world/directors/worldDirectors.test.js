import assert from 'node:assert/strict'
import test from 'node:test'
import { AGENT_DEFINITIONS } from '../data/agentDefinitions.js'
import { getDemoScenario } from '../data/demoScenarios.js'
import { createWorldSnapshot } from '../WorldBridge.js'
import { applyWorldDirectorPresentation } from './worldDirectorPresentation.js'
import { advanceAmbientDirector, AMBIENT_MAX_ACTIONS, AMBIENT_SELECTION_MAX_MS, AMBIENT_SELECTION_MIN_MS, createAmbientDirectorState, deriveAmbientPresentation, interruptAmbientAgent } from './ambientDirector.js'
import { CHOREOGRAPHY_TIMING, createChoreographyState, deriveChoreographyPresentation, reduceChoreographyEvent } from './choreographyDirector.js'

const START = Date.parse('2026-07-12T20:00:00.000Z')
const event = (seq, state, agentId = 'default') => Object.freeze({
  eventId: `run-1:${seq}`,
  runId: 'run-1',
  seq,
  agentId,
  state,
  occurredAt: new Date(START + seq * 1_000).toISOString(),
})
const idleAgents = () => Object.keys(AGENT_DEFINITIONS).map((profile) => ({ id: profile, profile, operationalState: 'idle', state: 'idle', active: false, isActive: false, presence: 'online' }))
const idleModel = (profileId) => ({ profileId, phase: 'resting', visualState: 'idle', signalState: 'none', severity: 'none', worldX: 50, worldY: 50, sortY: 50, direction: 'se', active: false, isActive: false })

test('directors are presentation-only and never mutate operational snapshots', () => {
  const snapshot = Object.freeze({
    agents: Object.freeze(idleAgents().map(Object.freeze)),
    tasks: Object.freeze([{ id: 'real-task', assignee: 'coder', status: 'running' }]),
    alerts: Object.freeze([{ id: 'real-alert', entityId: 'coder', severity: 'warning' }]),
    system: Object.freeze({ activeAgentCount: 1 }),
  })
  const before = JSON.stringify(snapshot)
  const choreography = deriveChoreographyPresentation(reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned'), START), { now: START, layout: 'mobile' })
  const ambientState = advanceAmbientDirector(createAmbientDirectorState({ now: START }), { agents: snapshot.agents, now: START + 2_400, layout: 'mobile' })
  const ambient = deriveAmbientPresentation(ambientState, { now: START + 2_500 })
  applyWorldDirectorPresentation(snapshot.agents.map((agent) => idleModel(agent.profile)), { choreography, ambient })
  assert.equal(JSON.stringify(snapshot), before)
  assert.equal(snapshot.system.activeAgentCount, 1)
  assert.equal(snapshot.tasks[0].status, 'running')
  assert.equal(snapshot.alerts[0].severity, 'warning')
})

test('chat choreography reacts immediately, moves Kasztelan, records real success and returns', () => {
  let state = reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned'), START)
  const immediate = deriveChoreographyPresentation(state, { now: START + 1, layout: 'mobile' })
  assert.equal(immediate.kind, 'chat')
  assert.equal(immediate.motionByAgent.orchestrator.visualState, 'walk')
  assert.ok(immediate.signals.some((signal) => signal.kind === 'message-pulse'))
  const coreReaction = deriveChoreographyPresentation(state, { now: START + 200, layout: 'mobile' })
  assert.ok(coreReaction.signals.some((signal) => signal.kind === 'command-core'))

  state = reduceChoreographyEvent(state, event(1, 'thinking'), START + 2_300)
  const thinking = deriveChoreographyPresentation(state, { now: START + 2_301, layout: 'mobile' })
  assert.equal(thinking.motionByAgent.orchestrator.visualState, 'thinking')

  state = reduceChoreographyEvent(state, event(2, 'success'), START + 5_000)
  const success = deriveChoreographyPresentation(state, { now: START + 5_500, layout: 'mobile' })
  assert.equal(success.motionByAgent.orchestrator.visualState, 'success')
  assert.ok(success.signals.some((signal) => signal.kind === 'archive-record'))
  const returning = deriveChoreographyPresentation(state, { now: START + 5_000 + CHOREOGRAPHY_TIMING.RETURN_DELAY_MS + 200, layout: 'mobile' })
  assert.equal(returning.motionByAgent.orchestrator.phase, 'return')
  assert.equal(returning.motionByAgent.orchestrator.visualState, 'walk')
})

test('delegation wakes only the true target and keeps worker motion operational', () => {
  const state = reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned', 'coder'), START)
  const presentation = deriveChoreographyPresentation(state, { now: START + 1_000, layout: 'desktop' })
  assert.equal(presentation.kind, 'delegation')
  assert.equal(presentation.targetAgentId, 'coder')
  assert.ok(presentation.signals.some((signal) => signal.kind === 'delegation' && signal.targetAgentId === 'coder'))
  assert.deepEqual(Object.keys(presentation.motionByAgent), ['orchestrator'])
})

test('ambient director is deterministic, capped at three and schedules every 20–60 seconds', () => {
  const agents = idleAgents()
  const left = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'same' }), { agents, now: START + 2_400, layout: 'mobile' })
  const right = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'same' }), { agents, now: START + 2_400, layout: 'mobile' })
  assert.deepEqual(left, right)
  assert.ok(left.actions.length >= 1 && left.actions.length <= AMBIENT_MAX_ACTIONS)
  assert.equal(left.actions.some((action) => action.behavior !== 'rest'), true)
  assert.ok(left.nextSelectionAt - (START + 2_400) >= AMBIENT_SELECTION_MIN_MS)
  assert.ok(left.nextSelectionAt - (START + 2_400) <= AMBIENT_SELECTION_MAX_MS)
  assert.ok(left.actions.every((action) => !['working', 'success'].includes(action.behavior)))
})

test('real event interrupts ambient immediately and ambient cannot override operational work', () => {
  const agents = idleAgents()
  const state = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'interrupt' }), { agents, now: START + 2_400, layout: 'desktop' })
  const interruptedProfile = state.actions[0].profileId
  const interrupted = interruptAmbientAgent(state, interruptedProfile, START + 2_401)
  assert.equal(interrupted.actions.some((action) => action.profileId === interruptedProfile), false)

  const operational = { ...idleModel('orchestrator'), phase: 'working', visualState: 'work', active: true, isActive: true }
  const choreography = deriveChoreographyPresentation(reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned'), START), { now: START + 500, layout: 'desktop' })
  const [resolved] = applyWorldDirectorPresentation([operational], { choreography, ambient: deriveAmbientPresentation(state, { now: START + 2_500 }) })
  assert.equal(resolved.visualState, 'work')
  assert.notEqual(resolved.presentationSource, 'choreography')
})

test('ambient behavior does not repeat for the same profile on its next selection', () => {
  const agents = idleAgents()
  let state = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'history' }), { agents, now: START + 2_400, layout: 'desktop' })
  const firstByProfile = { ...state.history }
  state = { ...state, actions: Object.freeze([]), nextSelectionAt: START + 3_000 }
  state = advanceAmbientDirector(state, { agents, now: START + 3_000, layout: 'desktop' })
  for (const action of state.actions) {
    if (firstByProfile[action.profileId]) assert.notEqual(action.behavior, firstByProfile[action.profileId])
  }
})

test('offline and unknown operational presentations cannot be animated by directors', () => {
  const choreography = deriveChoreographyPresentation(reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned'), START), { now: START + 500, layout: 'desktop' })
  const offline = { ...idleModel('orchestrator'), visualState: 'offline' }
  const unknown = { ...idleModel('default'), phase: 'unknown' }
  const resolved = applyWorldDirectorPresentation([offline, unknown], { choreography, ambient: { actionByAgent: { default: { behavior: 'patrol', moving: true, route: [{ x: 1, y: 1 }, { x: 2, y: 2 }], progress: 0.5 } } } })
  assert.equal(resolved.find((model) => model.profileId === 'orchestrator').visualState, 'offline')
  assert.equal(resolved.find((model) => model.profileId === 'default').phase, 'unknown')
})

test('out-of-order unseen event cannot regress choreography state', () => {
  let state = reduceChoreographyEvent(createChoreographyState(), { ...event(5, 'working'), eventId: 'run-1:5', seq: 5 }, START + 5_000)
  state = reduceChoreographyEvent(state, { ...event(3, 'thinking'), eventId: 'run-1:3-late', seq: 3 }, START + 6_000)
  assert.equal(state.sequences[0].latestState, 'working')
  assert.equal(state.sequences[0].maxSeq, 5)
})

test('polling activation removes an ambient action even without a new SSE event', () => {
  const agents = idleAgents()
  const ambient = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'polling' }), { agents, now: START + 2_400, layout: 'desktop' })
  const activeProfile = ambient.actions[0].profileId
  const activated = agents.map((agent) => agent.profile === activeProfile ? { ...agent, operationalState: 'working', state: 'working', active: true, isActive: true } : agent)
  const advanced = advanceAmbientDirector(ambient, { agents: activated, now: START + 2_500, layout: 'desktop' })
  assert.equal(advanced.actions.some((action) => action.profileId === activeProfile), false)
})

test('a concurrent real run continues Kasztelan motion from the current visual point', () => {
  let state = reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned'), START)
  const before = deriveChoreographyPresentation(state, { now: START + 1_000, layout: 'mobile' }).motionByAgent.orchestrator
  state = reduceChoreographyEvent(state, { ...event(0, 'assigned', 'coder'), runId: 'run-2', eventId: 'run-2:0' }, START + 1_000)
  const after = deriveChoreographyPresentation(state, { now: START + 1_000, layout: 'mobile' }).motionByAgent.orchestrator
  assert.ok(Math.abs(after.worldX - before.worldX) < 0.001)
  assert.ok(Math.abs(after.worldY - before.worldY) < 0.001)
})

test('interrupting one ambient conversation partner removes the pair', () => {
  const paired = {
    ...createAmbientDirectorState({ now: START }),
    actions: Object.freeze([
      Object.freeze({ id: 'left', profileId: 'default', partnerId: 'developer', behavior: 'converse', endsAt: START + 10_000 }),
      Object.freeze({ id: 'right', profileId: 'developer', partnerId: 'default', behavior: 'converse', endsAt: START + 10_000 }),
    ]),
  }
  assert.equal(interruptAmbientAgent(paired, 'default', START + 1).actions.length, 0)
})

test('ambient demo fixture starts with no fabricated operational work', () => {
  const snapshot = createWorldSnapshot(getDemoScenario('ambient'))
  assert.equal(snapshot.tasks.length, 0)
  assert.equal(snapshot.system.activeAgentCount, 0)
  assert.equal(snapshot.agents.length, 12)
  assert.equal(snapshot.agents.some((agent) => agent.active || agent.isActive || agent.state === 'working'), false)
})
