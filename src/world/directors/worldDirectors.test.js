import assert from 'node:assert/strict'
import test from 'node:test'
import { AGENT_DEFINITIONS } from '../data/agentDefinitions.js'
import { getDemoScenario } from '../data/demoScenarios.js'
import { getWorldLifeJourney } from '../data/roadGraph.js'
import { sampleMapAgentRoute } from '../mapAgentPresentation.js'
import { createWorldSnapshot } from '../WorldBridge.js'
import { applyWorldDirectorPresentation } from './worldDirectorPresentation.js'
import { advanceAmbientDirector, AMBIENT_SELECTION_MAX_MS, AMBIENT_SELECTION_MIN_MS, createAmbientDirectorState, createAmbientRouteHandoff, deriveAmbientHandoffPresentation, deriveAmbientPresentation, interruptAmbientAgent } from './ambientDirector.js'
import { CHOREOGRAPHY_TIMING, createChoreographyState, deriveChoreographyPresentation, reduceChoreographyEvent } from './choreographyDirector.js'

const START = Date.parse('2026-07-12T20:00:00.000Z')
const OPENING_PROFILES_FOR_TEST = new Set(['coder', 'researcher', 'prospecting'])
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
  const archiveSignal = success.signals.find((signal) => signal.kind === 'archive-record')
  assert.equal(archiveSignal.evidenceEventId, 'run-1:0')
  assert.equal(archiveSignal.triggerEventId, 'run-1:2')
  assert.equal(success.lifecycleEvidenceId, 'run-1:0')
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
  assert.equal(presentation.motionByAgent.coder, undefined)
  assert.equal(presentation.motionByAgent.orchestrator.profileId, 'orchestrator')
})

test('real SSE evidence creates a staggered awareness wave without fake work', () => {
  const state = reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned', 'coder'), START)
  const firstWave = deriveChoreographyPresentation(state, { now: START + CHOREOGRAPHY_TIMING.AWARENESS_START_MS + 400, layout: 'mobile' })
  const awareness = Object.values(firstWave.motionByAgent).filter((motion) => motion.phase === 'acknowledge')
  assert.ok(awareness.length >= 2 && awareness.length <= 6)
  assert.equal(awareness.some((motion) => motion.profileId === 'coder'), false)
  assert.equal(awareness.some((motion) => ['work', 'success'].includes(motion.visualState)), false)
  assert.ok(awareness.every((motion) => motion.evidenceEventId === 'run-1:0'))

  const afterWave = deriveChoreographyPresentation(state, { now: START + 6_000, layout: 'mobile' })
  assert.equal(Object.values(afterWave.motionByAgent).some((motion) => motion.phase === 'acknowledge'), false)
})

test('ingress choreography expires after the visible handoff and cannot block a long real task', () => {
  const state = reduceChoreographyEvent(createChoreographyState(), event(0, 'assigned', 'coder'), START)
  const handoff = deriveChoreographyPresentation(state, { now: START + CHOREOGRAPHY_TIMING.DELEGATION_SIGNAL_MS - 1, layout: 'mobile' })
  assert.ok(handoff.signals.some((signal) => signal.kind === 'delegation'))
  for (const elapsed of [CHOREOGRAPHY_TIMING.DELEGATION_SIGNAL_MS + 1, 30_000, 5 * 60_000]) {
    const presentation = deriveChoreographyPresentation(state, { now: START + elapsed, layout: 'mobile' })
    assert.equal(presentation.signals.some((signal) => ['command-core', 'delegation'].includes(signal.kind)), false)
  }
})

test('Archive record retains the true source subsystem only after evidence-backed success', () => {
  let state = reduceChoreographyEvent(createChoreographyState(), { ...event(0, 'assigned', 'coder'), buildingId: 'forge' }, START)
  state = reduceChoreographyEvent(state, { ...event(1, 'success', 'coder'), buildingId: 'forge' }, START + 5_000)
  const presentation = deriveChoreographyPresentation(state, { now: START + 5_000 + CHOREOGRAPHY_TIMING.ARCHIVE_DELAY_MS + 1, layout: 'mobile' })
  const archive = presentation.signals.find((signal) => signal.kind === 'archive-record')
  assert.equal(archive.sourceAgentId, 'coder')
  assert.equal(archive.sourceBuildingId, 'forge')

  const nearCompletion = deriveChoreographyPresentation(state, { now: START + 5_000 + CHOREOGRAPHY_TIMING.ARCHIVE_DELAY_MS + CHOREOGRAPHY_TIMING.ARCHIVE_SIGNAL_MS - 1, layout: 'mobile' })
  assert.ok(nearCompletion.signals.some((signal) => signal.kind === 'archive-record'), 'Archive response must remain mounted for its full visible cycle')
  const completed = deriveChoreographyPresentation(state, { now: START + 5_000 + CHOREOGRAPHY_TIMING.ARCHIVE_DELAY_MS + CHOREOGRAPHY_TIMING.ARCHIVE_SIGNAL_MS + 500, layout: 'mobile' })
  assert.equal(completed.signals.some((signal) => signal.kind === 'archive-record'), false)
})

test('ambient director is deterministic, opens with two visible journeys and schedules every 20–40 seconds', () => {
  const agents = idleAgents()
  const left = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'same' }), { agents, now: START + 2_400, layout: 'mobile' })
  const right = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'same' }), { agents, now: START + 2_400, layout: 'mobile' })
  assert.deepEqual(left, right)
  assert.equal(left.actions.length, 2)
  assert.equal(left.actions.some((action) => action.behavior !== 'rest'), true)
  assert.ok(left.nextSelectionAt - (START + 2_400) >= AMBIENT_SELECTION_MIN_MS)
  assert.ok(left.nextSelectionAt - (START + 2_400) <= AMBIENT_SELECTION_MAX_MS)
  assert.ok(left.actions.every((action) => !['working', 'success'].includes(action.behavior)))
  assert.ok(left.actions.every((action) => action.route.every((point) => (
    point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100
  ))), 'ambient routes must remain inside renderer world space')
  const firstJourney = getWorldLifeJourney(left.actions[0].profileId, 'mobile')
  assert.equal(left.actions[0].route[0].x, firstJourney.homePoint.x * 10)
  assert.equal(left.actions[0].route[0].y, firstJourney.homePoint.y * 10)
  assert.ok(left.actions.every((action) => OPENING_PROFILES_FOR_TEST.has(action.profileId)))
  assert.ok(left.actions.every((action) => {
    const xs = action.route.map((point) => point.x)
    const ys = action.route.map((point) => point.y)
    return Math.max(...xs) - Math.min(...xs) >= 5 || Math.max(...ys) - Math.min(...ys) >= 5
  }), 'opening ambient actions must travel far enough to read clearly on mobile')
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

test('a real event takes over an ambient walker at the exact visible foot position without teleporting', () => {
  const agents = idleAgents()
  const ambientState = advanceAmbientDirector(createAmbientDirectorState({ now: START, seed: 'handoff' }), { agents, now: START + 2_400, layout: 'mobile' })
  const action = ambientState.actions[0]
  const takeoverAt = START + 7_200
  const ambientBefore = deriveAmbientPresentation(ambientState, { now: takeoverAt }).actionByAgent[action.profileId]
  const before = sampleMapAgentRoute(ambientBefore.route, ambientBefore.progress)
  const handoff = createAmbientRouteHandoff(action, { now: takeoverAt, layout: 'mobile', runId: 'real-run', evidenceEventId: 'real-run:0' })
  assert.ok(handoff)
  assert.ok(Math.abs(handoff.route[0].x - before.worldX) < 0.001)
  assert.ok(Math.abs(handoff.route[0].y - before.worldY) < 0.001)

  const operational = {
    ...idleModel(action.profileId),
    phase: 'walking-to-work',
    visualState: 'walk',
    isMoving: true,
    taskId: 'real-run',
  }
  const [atTakeover] = applyWorldDirectorPresentation([operational], {
    handoff: deriveAmbientHandoffPresentation([handoff], { now: takeoverAt }),
  })
  assert.equal(atTakeover.presentationSource, 'operational-handoff')
  assert.ok(Math.abs(atTakeover.worldX - before.worldX) < 0.001)
  assert.ok(Math.abs(atTakeover.worldY - before.worldY) < 0.001)
  assert.equal(atTakeover.evidenceEventId, 'real-run:0')

  const [working] = applyWorldDirectorPresentation([{ ...operational, phase: 'working', visualState: 'work' }], {
    handoff: deriveAmbientHandoffPresentation([handoff], { now: takeoverAt + 100 }),
  })
  assert.notEqual(working.presentationSource, 'operational-handoff')
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

test('a terminal update from an older concurrent run still reaches Archive', () => {
  let state = reduceChoreographyEvent(createChoreographyState(), { ...event(0, 'assigned', 'coder'), runId: 'run-old', eventId: 'run-old:0', buildingId: 'forge' }, START)
  state = reduceChoreographyEvent(state, { ...event(0, 'assigned', 'researcher'), runId: 'run-new', eventId: 'run-new:0', buildingId: 'archive' }, START + 1_000)
  state = reduceChoreographyEvent(state, { ...event(1, 'success', 'coder'), runId: 'run-old', eventId: 'run-old:1', buildingId: 'forge' }, START + 2_000)
  const presentation = deriveChoreographyPresentation(state, { now: START + 2_000 + CHOREOGRAPHY_TIMING.ARCHIVE_DELAY_MS + 1, layout: 'mobile' })
  const archive = presentation.signals.find((signal) => signal.kind === 'archive-record')
  assert.equal(presentation.activeRunId, 'run-old')
  assert.equal(archive?.sourceAgentId, 'coder')
  assert.equal(archive?.sourceBuildingId, 'forge')
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
