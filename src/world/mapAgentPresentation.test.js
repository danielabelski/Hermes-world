import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getPresentationTask,
  resolveMapAgentPresentation,
} from './mapAgentPresentation.js'
import { resolveLivingAgentState } from './LivingWorldStateMachine.js'
import { getWorldLifeJourney } from './data/roadGraph.js'
import { createWorldBridge, createWorldSnapshot } from './WorldBridge.js'
import { getDemoScenario } from './data/demoScenarios.js'
import { resolveMapAgentStatusMarker } from './mapAgentStatusGrammar.js'
import { resolveInfrastructureFlowPresentation } from './infrastructureFlowPresentation.js'
import { classifyWorldMoment, resolveWorldMoment } from './worldMomentPriority.js'
import { getMapVariant, resolveMapReadabilityMode } from './mapReadabilityMode.js'
import { resolveRouteDebugConfig } from './routeDebugConfig.js'
import { getNumberedRouteNodes, shortRouteNodeLabel } from './routeDebugPresentation.js'
import { applyDemoObservabilityFocus, resolveDemoObservabilityFocus } from './data/demoObservabilityFocus.js'
import { resolveDemoRuntimeMode } from './demoRuntimeMode.js'
import { mergeWorldActivityItems } from './worldActivityItems.js'
import { collapseWorldActivityTimeline, orderWorldActivityRotation, presentWorldActivity } from './worldActivityPresentation.js'
import { applyWorldSceneScript } from './WorldSceneScript.js'
import { getBuildingRefreshDomains } from './buildingEntryConfig.js'

const START = Date.UTC(2026, 6, 11, 12, 0, 0)

test('cron activity names the real cron and never attributes it to Paź', () => {
  const presentation = presentWorldActivity({ type: 'cron', entityId: 'morning-health', cronName: 'Morning health check', cronStatus: 'success', severity: 'info' })
  assert.equal(presentation.label, 'CRON · SUKCES')
  assert.match(presentation.message, /Morning health check/)
  assert.doesNotMatch(presentation.message, /Paź/)
})

test('activity rotation surfaces a real cron before a burst of agent lifecycle messages', () => {
  const agentOne = { id: 'agent-1', type: 'agent', operationalState: 'assigned' }
  const agentTwo = { id: 'agent-2', type: 'agent', operationalState: 'thinking' }
  const cron = { id: 'cron-1', type: 'cron', cronName: 'Backup', cronStatus: 'success' }
  const ordered = orderWorldActivityRotation([agentOne, agentTwo, cron])
  assert.equal(ordered[0], cron)
  assert.equal(ordered.length, 3)
})

test('activity sheet keeps the newest lifecycle stage per run and preserves independent crons', () => {
  const items = [
    { id: 'done', type: 'agent', runId: 'run-1', operationalState: 'success' },
    { id: 'thinking', type: 'agent', runId: 'run-1', operationalState: 'thinking' },
    { id: 'assigned', type: 'agent', runId: 'run-1', operationalState: 'assigned' },
    { id: 'cron', type: 'cron', cronName: 'Morning health check', cronStatus: 'success' },
    { id: 'other-run', type: 'agent', runId: 'run-2', operationalState: 'working' },
  ]
  assert.deepEqual(collapseWorldActivityTimeline(items).map((item) => item.id), ['done', 'cron', 'other-run'])
})

test('activity sheet hides legacy unnamed gateway runs without hiding named gateway work or crons', () => {
  const items = [
    { id: 'legacy', type: 'agent', runId: 'gateway-session-40514', operationalState: 'success' },
    { id: 'named', type: 'agent', runId: 'gateway-session-40516', taskTitle: 'Sprawdź stan systemu', operationalState: 'success' },
    { id: 'cron', type: 'cron', cronName: 'Morning health check', cronStatus: 'success' },
  ]
  assert.deepEqual(collapseWorldActivityTimeline(items).map((item) => item.id), ['named', 'cron'])
})
const iso = (time) => new Date(time).toISOString()
const closeTo = (actual, expected, tolerance = 0.08) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`)

const coder = Object.freeze({
  id: 'coder',
  profile: 'coder',
  buildingId: 'forge',
  displayName: 'Kowal',
  state: 'carrying-package',
  isActive: true,
  warningLevel: 'none',
})

const runningCoderTask = Object.freeze({
  id: 'forge-task',
  assignee: 'coder',
  status: 'running',
  priority: 'normal',
  transitionStartedAt: iso(START),
  transitionUntil: iso(START + 7_100),
  startedAt: iso(START),
})

const modelAt = (now, task = runningCoderTask, agent = coder) => resolveMapAgentPresentation({
  agent,
  tasks: task ? [task] : [],
  alerts: [],
  lifecycle: { phase: 'ready', connection: 'online' },
  now,
})

test('mobile layout selects road-calibrated journeys with continuous entrances and safe points', () => {
  for (const profile of ['coder', 'researcher', 'prospecting']) {
    const journey = getWorldLifeJourney(profile, 'mobile')
    assert.deepEqual(journey.outboundWaypoints.at(-1), journey.entrancePoint)
    assert.deepEqual(journey.returnWaypoints[0], journey.entrancePoint)
    assert.deepEqual(journey.returnWaypoints.at(-1), journey.homePoint)
    assert.ok(journey.outboundWaypoints.some((waypoint) => waypoint.x === journey.safeBlockedPoint.x && waypoint.y === journey.safeBlockedPoint.y))
  }

  const mobileDispatch = resolveMapAgentPresentation({
    agent: coder,
    tasks: [runningCoderTask],
    alerts: [],
    lifecycle: { phase: 'ready', connection: 'online' },
    now: START,
    layout: 'mobile',
  })
  closeTo(mobileDispatch.worldX, 50)
  closeTo(mobileDispatch.worldY, 65.5)
})
test('Kowal crosses the Forge threshold as one complete sprite instead of being clipped by the facade', () => {
  const dispatch = modelAt(START)
  assert.equal(dispatch.journeyStage, 'dispatch')
  assert.equal(dispatch.visualState, 'walk')
  closeTo(dispatch.worldX, 46)
  closeTo(dispatch.worldY, 36.5)

  const road = modelAt(START + 3_200)
  assert.equal(road.journeyStage, 'road')
  assert.equal(road.isMoving, true)
  assert.ok(road.worldX > 46 && road.worldX < 84)

  const finalApproach = modelAt(START + 5_900)
  assert.equal(finalApproach.journeyStage, 'road')
  assert.equal(finalApproach.isInside, false)
  assert.equal(finalApproach.occupancyMode, 'facade-front', 'the whole sprite must clear the Forge facade before entry')

  const threshold = modelAt(START + 6_400)
  assert.equal(threshold.journeyStage, 'enter')
  closeTo(threshold.worldX, 84)
  closeTo(threshold.worldY, 49)

  const entering = modelAt(START + 6_750)
  assert.equal(entering.journeyStage, 'enter')
  assert.equal(entering.isInside, false)
  assert.equal(entering.occupancyMode, 'facade-front')
  closeTo(entering.worldX, 84)
  closeTo(entering.worldY, 49)

  const crossedThreshold = modelAt(START + 6_900)
  assert.equal(crossedThreshold.journeyStage, 'enter')
  assert.equal(crossedThreshold.isInside, true)
  assert.equal(crossedThreshold.occupancyMode, 'facade-front')

  const working = modelAt(START + 7_100)
  assert.equal(working.journeyStage, 'work')
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'forge-fire')
  assert.equal(working.isInside, true)
  assert.equal(working.occupancyMode, 'facade-front')
  closeTo(working.worldX, 84)
  closeTo(working.worldY, 49)
})

test('Kowal exits before success, returns by road and settles at home without teleporting', () => {
  const completedAt = START + 20_000
  const doneTask = Object.freeze({
    ...runningCoderTask,
    status: 'done',
    visualCompletedAt: iso(completedAt),
    completedAt: iso(completedAt),
    returnUntil: iso(completedAt + 8_200),
  })

  const exitStart = modelAt(completedAt, doneTask)
  assert.equal(exitStart.journeyStage, 'exit')
  assert.equal(exitStart.visualState, 'walk')
  assert.equal(exitStart.isInside, true)
  assert.equal(exitStart.occupancyMode, 'facade-front')
  closeTo(exitStart.worldX, 84)
  closeTo(exitStart.worldY, 49)

  const emerged = modelAt(completedAt + 400, doneTask)
  assert.equal(emerged.journeyStage, 'exit')
  assert.equal(emerged.isInside, false)
  assert.equal(emerged.occupancyMode, 'facade-front')

  const doorway = modelAt(completedAt + 700, doneTask)
  assert.equal(doorway.journeyStage, 'success')
  assert.equal(doorway.signalState, 'success')
  closeTo(doorway.worldX, 84)
  closeTo(doorway.worldY, 49)

  const glintEnded = modelAt(completedAt + 1_601, doneTask)
  assert.equal(glintEnded.journeyStage, 'success')
  assert.equal(glintEnded.signalState, 'none')

  const returnStart = modelAt(completedAt + 1_800, doneTask)
  assert.equal(returnStart.journeyStage, 'return')
  assert.equal(returnStart.visualState, 'walk')
  assert.equal(returnStart.occupancyMode, 'facade-front')
  closeTo(returnStart.worldX, 84)
  closeTo(returnStart.worldY, 49)

  const almostHome = modelAt(completedAt + 8_199, doneTask)
  assert.equal(almostHome.journeyStage, 'return')
  assert.equal(almostHome.occupancyMode, 'world')
  closeTo(almostHome.worldX, 46, 0.12)
  closeTo(almostHome.worldY, 36.5, 0.12)

  const home = modelAt(completedAt + 8_201, doneTask)
  assert.equal(home.journeyStage, 'idle')
  assert.equal(home.visualState, 'idle')
  closeTo(home.worldX, 46)
  closeTo(home.worldY, 36.5)

  const inferredReturn = { ...doneTask, returnUntil: undefined }
  const inferredAlmostHome = modelAt(completedAt + 8_199, inferredReturn)
  assert.equal(inferredAlmostHome.journeyStage, 'return', 'fallback return window must include the Success hold')
  closeTo(inferredAlmostHome.worldX, 46, 0.12)
  closeTo(inferredAlmostHome.worldY, 36.5, 0.12)
  const inferredHome = modelAt(completedAt + 8_201, inferredReturn)
  assert.equal(inferredHome.journeyStage, 'idle')
})

test('five release movement runs keep the same worker, route, building entry and terminal home state', () => {
  for (let run = 1; run <= 5; run += 1) {
    const runStart = START + run * 100_000
    const runningTask = Object.freeze({
      ...runningCoderTask,
      id: `forge-release-run-${run}`,
      transitionStartedAt: iso(runStart),
      transitionUntil: iso(runStart + 7_100),
      startedAt: iso(runStart),
    })
    const resolveRun = (at, task = runningTask) => modelAt(at, task)
    const outbound = []
    for (let elapsed = 0; elapsed <= 7_100; elapsed += 250) outbound.push(resolveRun(runStart + elapsed))

    assert.ok(outbound.every((model) => model.profileId === 'coder'), `run ${run}: wrong worker`)
    assert.ok(outbound.every((model) => model.taskId === runningTask.id), `run ${run}: wrong task ownership`)
    assert.ok(outbound.every((model) => model.buildingId === 'forge'), `run ${run}: wrong building`)
    assert.ok(outbound.some((model) => model.journeyStage === 'road' && model.isMoving), `run ${run}: no road motion`)
    assert.ok(outbound.some((model) => model.journeyStage === 'enter' && model.occupancyMode === 'facade-front'), `run ${run}: no Forge threshold`)

    for (let index = 1; index < outbound.length; index += 1) {
      const dx = outbound[index].worldX - outbound[index - 1].worldX
      const dy = outbound[index].worldY - outbound[index - 1].worldY
      assert.ok(Math.hypot(dx, dy) < 5, `run ${run}: outbound teleport at sample ${index}`)
    }

    const working = resolveRun(runStart + 7_100)
    assert.equal(working.journeyStage, 'work', `run ${run}: missing work state`)
    assert.equal(working.visualState, 'work', `run ${run}: work presentation mismatch`)
    assert.equal(working.isInside, true, `run ${run}: worker did not enter Forge`)

    const completedAt = runStart + 20_000
    const doneTask = Object.freeze({
      ...runningTask,
      status: 'done',
      visualCompletedAt: iso(completedAt),
      completedAt: iso(completedAt),
      returnUntil: iso(completedAt + 8_200),
    })
    const returning = []
    for (let elapsed = 0; elapsed <= 8_250; elapsed += 250) returning.push(resolveRun(completedAt + elapsed, doneTask))
    assert.ok(returning.some((model) => model.journeyStage === 'exit'), `run ${run}: no exit`)
    assert.ok(returning.some((model) => model.journeyStage === 'success'), `run ${run}: no success acknowledgement`)
    assert.ok(returning.some((model) => model.journeyStage === 'return' && model.isMoving), `run ${run}: no return motion`)
    for (let index = 1; index < returning.length; index += 1) {
      const dx = returning[index].worldX - returning[index - 1].worldX
      const dy = returning[index].worldY - returning[index - 1].worldY
      assert.ok(Math.hypot(dx, dy) < 5, `run ${run}: return teleport at sample ${index}`)
    }
    const home = resolveRun(completedAt + 8_201, doneTask)
    assert.equal(home.journeyStage, 'idle', `run ${run}: terminal state is not idle`)
    closeTo(home.worldX, 46)
    closeTo(home.worldY, 36.5)
  }
})

test('presentation timestamps survive polling and an active task outranks stale done work', () => {
  const now = START + 2_900
  const first = modelAt(now, runningCoderTask)
  const afterPoll = modelAt(now, { ...runningCoderTask, title: 'same task, refreshed payload' })
  assert.deepEqual(afterPoll, first)

  const staleDone = {
    id: 'old-task',
    assignee: 'coder',
    status: 'done',
    visualCompletedAt: iso(START - 40_000),
  }
  assert.equal(getPresentationTask(coder, [staleDone, runningCoderTask]).id, runningCoderTask.id)
})

test('Uczony uses the same resolver and enters the Knowledge Archive through its threshold', () => {
  const researcher = {
    id: 'researcher',
    profile: 'researcher',
    buildingId: 'library',
    displayName: 'Uczony',
    state: 'carrying-package',
    isActive: true,
    warningLevel: 'none',
  }
  const task = {
    id: 'archive-task',
    assignee: 'researcher',
    status: 'running',
    transitionStartedAt: iso(START),
    transitionUntil: iso(START + 6_600),
    startedAt: iso(START),
  }
  const resolve = (now) => modelAt(now, task, researcher)

  const dispatch = resolve(START)
  closeTo(dispatch.worldX, 46)
  closeTo(dispatch.worldY, 36.5)

  const finalApproach = resolve(START + 5_300)
  assert.equal(finalApproach.journeyStage, 'road')
  assert.equal(finalApproach.isInside, false)
  assert.equal(finalApproach.occupancyMode, 'facade-front', 'the full researcher sprite must pass in front of the Archive facade')

  const threshold = resolve(START + 5_900)
  assert.equal(threshold.journeyStage, 'enter')
  closeTo(threshold.worldX, 28.5)
  closeTo(threshold.worldY, 36.5)

  const working = resolve(START + 6_600)
  assert.equal(working.journeyStage, 'work')
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'archive-pulse')
  assert.equal(working.isInside, true)
  assert.equal(working.occupancyMode, 'facade-front')
  closeTo(working.worldX, 28.5)
  closeTo(working.worldY, 36.5)
})

test('Zwiadowca patrols, observes distinctly and stops as stuck on a safe road node', () => {
  const scout = {
    id: 'prospecting',
    profile: 'prospecting',
    buildingId: 'scout-lodge',
    displayName: 'Zwiadowca',
    state: 'carrying-package',
    isActive: true,
    warningLevel: 'none',
  }
  const patrolTask = {
    id: 'scout-task',
    assignee: 'prospecting',
    status: 'running',
    transitionStartedAt: iso(START),
    transitionUntil: iso(START + 7_900),
    startedAt: iso(START),
  }
  const resolve = (now, agent = scout, task = patrolTask, alerts = []) => resolveMapAgentPresentation({
    agent,
    tasks: task ? [task] : [],
    alerts,
    lifecycle: { phase: 'ready', connection: 'online' },
    now,
  })

  const lodge = resolve(START)
  closeTo(lodge.worldX, 52)
  closeTo(lodge.worldY, 35.5)

  const patrol = resolve(START + 3_500)
  assert.equal(patrol.journeyStage, 'road')
  assert.equal(patrol.isMoving, true)
  assert.ok(patrol.worldX > 52 && patrol.worldX < 67)

  const watchPoint = resolve(START + 7_900)
  assert.equal(watchPoint.journeyStage, 'work')
  assert.equal(watchPoint.buildingEffect, 'scout-signal')
  assert.equal(watchPoint.isInside, false)
  closeTo(watchPoint.worldX, 67)
  closeTo(watchPoint.worldY, 31.5)

  const observing = resolve(START + 8_000, { ...scout, state: 'observing' }, null)
  assert.equal(observing.journeyStage, 'observe')
  assert.equal(observing.visualState, 'observe')
  assert.equal(observing.isInside, false)
  closeTo(observing.worldX, 67)
  closeTo(observing.worldY, 31.5)

  const blocked = resolve(START + 2_000, scout, { ...patrolTask, status: 'blocked' })
  assert.equal(blocked.journeyStage, 'stuck')
  assert.equal(blocked.visualState, 'stuck')
  closeTo(blocked.worldX, 58)
  closeTo(blocked.worldY, 32.5)
})

test('Zwiadowca returns from the watch point to the lodge after success', () => {
  const completedAt = START + 30_000
  const scout = {
    id: 'prospecting', profile: 'prospecting', buildingId: 'scout-lodge',
    displayName: 'Zwiadowca', state: 'idle', isActive: false, warningLevel: 'none',
  }
  const doneTask = {
    id: 'scout-task', assignee: 'prospecting', status: 'done',
    visualCompletedAt: iso(completedAt), completedAt: iso(completedAt),
    returnUntil: iso(completedAt + 8_500),
  }
  const resolve = (now) => resolveMapAgentPresentation({
    agent: scout,
    tasks: [doneTask],
    alerts: [],
    lifecycle: { phase: 'ready', connection: 'online' },
    now,
  })

  const returnStart = resolve(completedAt + 1_500)
  assert.equal(returnStart.journeyStage, 'return')
  closeTo(returnStart.worldX, 67)
  closeTo(returnStart.worldY, 31.5)

  const home = resolve(completedAt + 8_501)
  assert.equal(home.journeyStage, 'idle')
  closeTo(home.worldX, 52)
  closeTo(home.worldY, 35.5)
})

test('map status contract separates movement, work, success, waiting, warning, stuck, error and offline', () => {
  const moving = modelAt(START + 1_000)
  assert.equal(moving.visualState, 'walk')
  assert.equal(moving.carryPackage, true)
  assert.equal(moving.isMoving, true)

  const working = modelAt(START + 7_100)
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'forge-fire')

  const completedAt = START + 20_000
  const doneTask = {
    ...runningCoderTask,
    status: 'done',
    visualCompletedAt: iso(completedAt),
    completedAt: iso(completedAt),
    returnUntil: iso(completedAt + 8_200),
  }
  assert.equal(modelAt(completedAt + 700, doneTask).signalState, 'success')
  assert.equal(modelAt(completedAt + 1_600, doneTask).signalState, 'none')

  const staleDone = { ...doneTask, id: 'stale-done', visualCompletedAt: iso(START - 30_000), completedAt: iso(START - 30_000) }
  const waiting = resolveMapAgentPresentation({
    agent: coder,
    tasks: [staleDone, { ...runningCoderTask, id: 'queued', status: 'pending' }],
    alerts: [],
    lifecycle: { phase: 'ready', connection: 'online' },
    now: START,
  })
  assert.equal(waiting.visualState, 'waiting')
  assert.equal(waiting.severity, 'none')

  const warning = resolveMapAgentPresentation({
    agent: coder,
    tasks: [{ ...runningCoderTask, status: 'pending' }],
    alerts: [{ entityId: 'coder', severity: 'warning' }],
    lifecycle: { phase: 'ready', connection: 'online' },
    now: START,
  })
  assert.equal(warning.visualState, 'alert')
  assert.equal(warning.severity, 'warning')

  const blocked = modelAt(START + 1_000, { ...runningCoderTask, status: 'blocked' })
  assert.equal(blocked.visualState, 'stuck')
  assert.equal(blocked.severity, 'warning')
  assert.equal(blocked.isMoving, false)

  const incident = resolveMapAgentPresentation({
    agent: coder,
    tasks: [{ ...runningCoderTask, status: 'error' }],
    alerts: [{ entityId: 'coder', severity: 'critical' }],
    lifecycle: { phase: 'ready', connection: 'online' },
    now: START + 1_000,
  })
  assert.equal(incident.visualState, 'alert')
  assert.equal(incident.severity, 'critical')

  const transportLoss = resolveMapAgentPresentation({
    agent: { ...coder, state: 'idle', isActive: false, presence: 'online' },
    tasks: [],
    alerts: [],
    lifecycle: { phase: 'unavailable', connection: 'offline', transport: 'reconnecting' },
    now: START,
  })
  assert.notEqual(transportLoss.visualState, 'offline')

  const offline = resolveMapAgentPresentation({
    agent: { ...coder, state: 'idle', isActive: false, presence: 'offline' },
    tasks: [],
    alerts: [],
    lifecycle: { phase: 'ready', connection: 'online', transport: 'live' },
    now: START,
  })
  assert.equal(offline.visualState, 'offline')
})

test('living-world building effects prefer a real active task over stale completed history', () => {
  const staleDone = {
    id: 'old', assignee: 'coder', status: 'done', visualCompletedAt: iso(START - 30_000),
  }
  const state = resolveLivingAgentState({
    agent: coder,
    tasks: [staleDone, runningCoderTask],
    alerts: [],
    now: START + 7_100,
  })
  assert.equal(state.phase, 'carrying')
  assert.equal(state.buildingEffect, 'forge-fire')
})

test('initial runtime snapshots do not fabricate a fresh journey or Success', () => {
  const observedAt = START
  const payload = {
    profiles: { profiles: [{ name: 'coder', is_active: true }] },
    tasks: { tasks: [
      { id: 'already-running', title: 'Existing build', assignee: 'coder', status: 'running' },
      { id: 'historical-done', title: 'Old build', assignee: 'researcher', status: 'done' },
    ] },
    logs: { lines: [] }, crons: { jobs: [] }, cronHistory: { completions: [] }, sessions: { sessions: [] }, skills: { skills: [] }, models: { groups: [] },
  }
  const snapshot = createWorldSnapshot(payload, null, () => observedAt, { source: 'live', connection: 'online' })
  const runningTask = snapshot.tasks.find((item) => item.id === 'already-running')
  const historicalTask = snapshot.tasks.find((item) => item.id === 'historical-done')
  assert.equal(runningTask.transitionStartedAt, null)
  assert.equal(runningTask.motionEvidence, 'initial-state')
  assert.equal(historicalTask.visualCompletedAt, null)
  assert.equal(historicalTask.motionEvidence, 'initial-state')
  assert.equal(resolveLivingAgentState({ agent: snapshot.agents.find((item) => item.profile === 'coder'), tasks: [runningTask], now: observedAt }).phase, 'carrying')
  assert.equal(resolveLivingAgentState({ agent: { profile: 'researcher' }, tasks: [historicalTask], now: observedAt }).phase, 'resting')
})

test('mobile observability fixtures expose waiting, stuck and error as distinct agent states', () => {
  const observedAt = Date.UTC(2026, 6, 10, 7, 15, 0)
  const snapshotFor = (scenario) => createWorldSnapshot(
    getDemoScenario(scenario),
    null,
    () => observedAt,
    { source: 'demo', connection: 'online' },
  )
  const presentationFor = (snapshot, profile) => resolveMapAgentPresentation({
    agent: snapshot.agents.find((agent) => agent.profile === profile),
    tasks: snapshot.tasks,
    alerts: snapshot.alerts,
    lifecycle: snapshot.lifecycle,
    now: observedAt,
    layout: 'mobile',
  })

  const healthy = snapshotFor('healthy')
  assert.equal(presentationFor(healthy, 'developer').visualState, 'waiting')

  const warning = snapshotFor('warning')
  const stuck = presentationFor(warning, 'reviewer')
  assert.equal(stuck.visualState, 'stuck')
  assert.equal(stuck.severity, 'warning')

  const critical = snapshotFor('critical')
  const incident = presentationFor(critical, 'coder')
  assert.equal(incident.visualState, 'alert')
  assert.equal(incident.severity, 'critical')
  assert.equal(incident.signalState, 'error')
  assert.equal(incident.buildingId, 'forge')
})

test('Cat-shaped live payload maps real telemetry without demo fallbacks', () => {
  const observedAt = Date.UTC(2026, 6, 12, 4, 30, 0)
  const snapshot = createWorldSnapshot({
    profiles: { profiles: [
      { name: 'coder', is_active: true, model: 'gpt-live', provider: 'openai', has_env: true },
      { name: 'researcher', is_active: false, model: 'gpt-live', provider: 'openai' },
      { name: 'future-agent', is_active: false },
    ] },
    metrics: { ok: true, cpuPercent: 42, memoryPercent: 63, memoryUsedMb: 10_000, memoryTotalMb: 16_000, temperatureC: 58, temperatureSource: 'hardware' },
    tasks: { tasks: [
      { id: 'blocked-build', title: 'Release build', assignee: 'coder', status: 'blocked', priority: 'high', started_at: iso(observedAt - 30_000) },
      { id: 'review-report', title: 'Review report', assignee: 'researcher', status: 'review', priority: 'normal' },
    ] },
    logs: { lines: [] },
    crons: { jobs: [{ id: 'nightly', name: 'Nightly sync', enabled: true, last_run_at: iso(observedAt - 60_000) }] },
    cronHistory: { completions: [{ job_id: 'nightly', status: 'error', completed_at: iso(observedAt - 60_000) }] },
    sessions: { sessions: [
      { id: 'live-session', is_streaming: true, estimated_cost: 0.5, updated_at: observedAt / 1000 },
      { id: 'old-session', is_streaming: false, estimated_cost: 0.25, updated_at: (observedAt - 3_600_000) / 1000 },
    ] },
    skills: { skills: [{ name: 'browser', disabled: false }] },
    models: { groups: [{ provider: 'openai', models: [{ id: 'gpt-live' }] }] },
  }, null, () => observedAt, { source: 'live', connection: 'online', lastSuccessfulAt: iso(observedAt) })

  assert.equal(snapshot.lifecycle.source, 'live')
  assert.equal(snapshot.lifecycle.connection, 'online')
  assert.equal(snapshot.system.cpuPercent, 42)
  assert.equal(snapshot.system.memoryPercent, 63)
  assert.equal(snapshot.system.temperatureC, 58)
  assert.equal(snapshot.system.unmappedProfileCount, 1)
  assert.equal(snapshot.system.activeSessionCount, 1)
  assert.equal(snapshot.system.totalEstimatedCost, 0.75)
  assert.equal(snapshot.agents[0].skillEnabled, null)
  assert.equal(snapshot.agents.find((agent) => agent.profile === 'researcher').state, 'thinking')
  assert.equal(snapshot.alerts.find((alert) => alert.taskId === 'blocked-build').agentId, 'coder')
  assert.equal(snapshot.alerts.find((alert) => alert.taskId === 'blocked-build').buildingId, 'forge')
  assert.equal(snapshot.alerts.find((alert) => alert.cronId === 'nightly').buildingId, 'clock-tower')
})

test('production bridge keeps domain cadence and exposes stale recovery honestly', async () => {
  let now = Date.UTC(2026, 6, 12, 5, 0, 0)
  let failMetrics = false
  const calls = { metrics: 0, profiles: 0 }
  const apiClient = {
    async getProfiles() { calls.profiles += 1; return { profiles: [{ name: 'coder', is_active: false }] } },
    async getSystemMetrics() { calls.metrics += 1; if (failMetrics) throw new Error('sensor offline'); return { ok: true, cpuPercent: 30, memoryPercent: 50, temperatureC: 55 } },
    async getKanbanTasks() { return { tasks: [] } },
    async getLogs() { return { lines: [] } },
    async getCrons() { return { jobs: [] } },
    async getCronHistory() { return { completions: [] } },
    async getSessions() { return { sessions: [] } },
    async getSkills() { return { skills: [] } },
    async getModels() { return { groups: [] } },
    async getMemory() { return { memory: '' } },
  }
  const bridge = createWorldBridge({ apiClient, now: () => now })
  const initial = await bridge.sync()
  assert.equal(initial.lifecycle.source, 'live')
  assert.equal(calls.metrics, 1)
  assert.equal(calls.profiles, 1)

  now += 5_000
  const metricsRefresh = await bridge.sync()
  assert.equal(metricsRefresh.lifecycle.source, 'live')
  assert.equal(calls.metrics, 2)
  assert.equal(calls.profiles, 1)

  failMetrics = true
  now += 5_000
  const stale = await bridge.sync()
  assert.equal(stale.lifecycle.source, 'stale')
  assert.equal(stale.lifecycle.connection, 'degraded')
  assert.equal(stale.lifecycle.domains.metrics.state, 'stale')
  assert.equal(stale.system.cpuPercent, 30)

  failMetrics = false
  now += 5_000
  const recovered = await bridge.sync()
  assert.equal(recovered.lifecycle.source, 'live')
  assert.equal(recovered.lifecycle.connection, 'online')
  assert.equal(recovered.lifecycle.domains.metrics.state, 'live')
})

test('production bridge publishes real metrics without clearing a previously confirmed roster', async () => {
  let now = Date.UTC(2026, 6, 18, 6, 0, 0)
  let cpuPercent = 37
  let profilesResponse = Promise.resolve({ profiles: [{ name: 'coder', is_active: false }] })
  const apiClient = {
    getProfiles: async () => profilesResponse,
    async getSystemMetrics() { return { ok: true, cpuPercent, memoryPercent: 51, temperatureC: 56 } },
    async getKanbanTasks() { return { tasks: [] } },
    async getLogs() { return { lines: [] } },
    async getCrons() { return { jobs: [] } },
    async getCronHistory() { return { completions: [] } },
    async getSessions() { return { sessions: [] } },
    async getSkills() { return { skills: [] } },
    async getModels() { return { groups: [] } },
    async getMemory() { return { memory: '' } },
  }
  const bridge = createWorldBridge({ apiClient, now: () => now })
  const emissions = []
  bridge.subscribe((snapshot) => emissions.push(snapshot))

  const initial = await bridge.sync()
  assert.equal(initial.agents.some((agent) => agent.profile === 'coder'), true)
  emissions.length = 0

  let releaseProfiles
  profilesResponse = new Promise((resolve) => { releaseProfiles = resolve })
  cpuPercent = 41
  now += 15_000
  const pending = bridge.sync()
  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(emissions.some((snapshot) => snapshot.system.cpuPercent === 41), true)
  assert.equal(emissions.every((snapshot) => snapshot.agents.some((agent) => agent.profile === 'coder')), true)

  releaseProfiles({ profiles: [{ name: 'coder', is_active: false }] })
  const finalSnapshot = await pending
  assert.equal(finalSnapshot.agents.some((agent) => agent.profile === 'coder'), true)
  assert.equal(finalSnapshot.lifecycle.source, 'live')
})

test('forced atomic bridge sync refreshes every domain and emits only the complete snapshot', async () => {
  let now = Date.UTC(2026, 6, 18, 6, 0, 0)
  let releaseProfiles = null
  let profileCalls = 0
  let metricCalls = 0
  const apiClient = {
    async getProfiles() {
      profileCalls += 1
      if (releaseProfiles) return new Promise((resolve) => { releaseProfiles.resolve = resolve })
      return { profiles: [{ name: 'coder', is_active: false }] }
    },
    async getSystemMetrics() { metricCalls += 1; return { ok: true, cpuPercent: 37, memoryPercent: 51, temperatureC: 56 } },
    async getKanbanTasks() { return { tasks: [] } },
    async getLogs() { return { lines: [] } },
    async getCrons() { return { jobs: [] } },
    async getCronHistory() { return { completions: [] } },
    async getSessions() { return { sessions: [] } },
    async getSkills() { return { skills: [] } },
    async getModels() { return { groups: [] } },
    async getMemory() { return { memory: '' } },
  }
  const bridge = createWorldBridge({ apiClient, now: () => now })
  await bridge.sync()
  const emissions = []
  bridge.subscribe((snapshot) => emissions.push(snapshot))

  releaseProfiles = {}
  now += 1_000
  const resync = bridge.sync({ force: true, atomic: true })
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(profileCalls, 2)
  assert.equal(metricCalls, 2)
  assert.equal(emissions.length, 0)

  releaseProfiles.resolve({ profiles: [{ name: 'coder', is_active: true }] })
  const complete = await resync
  assert.equal(emissions.length, 1)
  assert.equal(complete.agents.find((agent) => agent.profile === 'coder').isActive, true)
})

test('forced reconnect resync waits for an in-flight poll and then performs a fresh atomic read', async () => {
  let now = Date.UTC(2026, 6, 18, 6, 0, 0)
  let profileCalls = 0
  let releasePollingProfiles
  const apiClient = {
    async getProfiles() {
      profileCalls += 1
      if (profileCalls === 2) return new Promise((resolve) => { releasePollingProfiles = resolve })
      return { profiles: [{ name: 'coder', is_active: profileCalls >= 3 }] }
    },
    async getSystemMetrics() { return { ok: true, cpuPercent: 37, memoryPercent: 51, temperatureC: 56 } },
    async getKanbanTasks() { return { tasks: [] } },
    async getLogs() { return { lines: [] } },
    async getCrons() { return { jobs: [] } },
    async getCronHistory() { return { completions: [] } },
    async getSessions() { return { sessions: [] } },
    async getSkills() { return { skills: [] } },
    async getModels() { return { groups: [] } },
    async getMemory() { return { memory: '' } },
  }
  const bridge = createWorldBridge({ apiClient, now: () => now })
  await bridge.sync()
  now += 15_000

  const polling = bridge.sync()
  await new Promise((resolve) => setTimeout(resolve, 0))
  const reconnectResync = bridge.sync({ force: true, atomic: true })
  assert.equal(profileCalls, 2)

  releasePollingProfiles({ profiles: [{ name: 'coder', is_active: false }] })
  await polling
  const complete = await reconnectResync
  assert.equal(profileCalls, 3)
  assert.equal(complete.agents.find((agent) => agent.profile === 'coder').isActive, true)
})

test('five Archive re-entries refresh only its live domains and replace stale memory atomically', async () => {
  let memoryRevision = 0
  const calls = Object.fromEntries(['profiles', 'metrics', 'tasks', 'logs', 'crons', 'cronHistory', 'sessions', 'skills', 'models', 'memory'].map((id) => [id, 0]))
  const hit = (id, value) => { calls[id] += 1; return value }
  const apiClient = {
    async getProfiles() { return hit('profiles', { profiles: [{ name: 'researcher', is_active: false }] }) },
    async getSystemMetrics() { return hit('metrics', { ok: true, cpuPercent: 25, memoryPercent: 48, temperatureC: 52 }) },
    async getKanbanTasks() { return hit('tasks', { tasks: [] }) },
    async getLogs() { return hit('logs', { lines: [] }) },
    async getCrons() { return hit('crons', { jobs: [] }) },
    async getCronHistory() { return hit('cronHistory', { completions: [] }) },
    async getSessions() { return hit('sessions', { sessions: [] }) },
    async getSkills() { return hit('skills', { skills: [] }) },
    async getModels() { return hit('models', { groups: [] }) },
    async getMemory() { return hit('memory', { memory: `# Revision ${memoryRevision}` }) },
  }
  const bridge = createWorldBridge({ apiClient })
  await bridge.sync()
  const emissions = []
  bridge.subscribe((snapshot) => emissions.push(snapshot))

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    memoryRevision = attempt
    const before = emissions.length
    const snapshot = await bridge.sync({ forceDomains: getBuildingRefreshDomains('archive'), atomic: true })
    assert.equal(snapshot.memorySummary.available, true)
    assert.equal(snapshot.raw.provenance.domains.memory.reused, false)
    assert.equal(emissions.length, before + 1)
  }

  assert.deepEqual(
    { memory: calls.memory, logs: calls.logs, tasks: calls.tasks, cronHistory: calls.cronHistory },
    { memory: 6, logs: 6, tasks: 6, cronHistory: 6 },
  )
  assert.deepEqual(
    { profiles: calls.profiles, metrics: calls.metrics, crons: calls.crons, sessions: calls.sessions, skills: calls.skills, models: calls.models },
    { profiles: 1, metrics: 1, crons: 1, sessions: 1, skills: 1, models: 1 },
  )
})

test('concurrent resume and polling reuse one in-flight domain synchronization', async () => {
  let releaseProfiles
  let profileCalls = 0
  const profiles = new Promise((resolve) => { releaseProfiles = resolve })
  const apiClient = {
    async getProfiles() { profileCalls += 1; return profiles },
    async getSystemMetrics() { return { ok: true, cpuPercent: 37, memoryPercent: 51, temperatureC: 56 } },
    async getKanbanTasks() { return { tasks: [] } },
    async getLogs() { return { lines: [] } },
    async getCrons() { return { jobs: [] } },
    async getCronHistory() { return { completions: [] } },
    async getSessions() { return { sessions: [] } },
    async getSkills() { return { skills: [] } },
    async getModels() { return { groups: [] } },
    async getMemory() { return { memory: '' } },
  }
  const bridge = createWorldBridge({ apiClient })
  const polling = bridge.sync()
  const resume = bridge.sync()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(profileCalls, 1)
  releaseProfiles({ profiles: [{ name: 'coder', is_active: false }] })
  const [pollingSnapshot, resumeSnapshot] = await Promise.all([polling, resume])
  assert.equal(pollingSnapshot, resumeSnapshot)
})

test('status marker grammar keeps thinking, waiting, stuck and error visually distinct', () => {
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'thinking' }), { symbol: '⌬', tone: 'thinking' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'waiting' }), { symbol: '◷', tone: 'waiting' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'stuck', severity: 'warning', signalState: 'stuck' }), { symbol: '↛', tone: 'stuck' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'alert', severity: 'critical', signalState: 'error' }), { symbol: '!', tone: 'error' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'success', severity: 'critical', signalState: 'success' }), { symbol: '!', tone: 'error' })
  assert.equal(resolveMapAgentStatusMarker({ visualState: 'idle' }), null)
})

test('critical source localization maps only meaningful phases onto subsystem flows', () => {
  assert.deepEqual(resolveInfrastructureFlowPresentation('working'), { state: 'flowing', tone: 'normal' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('waiting'), { state: 'waiting', tone: 'normal' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('stuck'), { state: 'problem', tone: 'warning' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('incident'), { state: 'problem', tone: 'error' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('resting'), { state: 'dormant', tone: 'normal' })
})

test('world moment hierarchy keeps alerts and stuck above concurrent success', () => {
  const success = { id: 'done', status: 'completed', message: 'Build completed successfully' }
  const warning = { id: 'warn', severity: 'warning', message: 'Queue pressure warning' }
  const critical = { id: 'critical', severity: 'critical', message: 'Forge failed' }
  const stuckAgent = { id: 'scout', displayName: 'Zwiadowca', state: 'stuck' }

  assert.equal(classifyWorldMoment(success), 'success')
  assert.equal(resolveWorldMoment(success, [critical], []).id, 'critical')
  assert.equal(resolveWorldMoment(success, [warning], []).id, 'warn')
  assert.equal(resolveWorldMoment(success, [], [stuckAgent]).severity, 'stuck')
  assert.equal(resolveWorldMoment(success, [], []).id, 'done')
})

test('activity stream keeps alerts visible even when ordinary activity exists', () => {
  const items = mergeWorldActivityItems(
    [{ id: 'success', severity: 'info', message: 'Build completed', createdAt: '2026-07-12T01:00:00Z' }],
    [{ id: 'critical', severity: 'critical', message: 'Forge failed' }],
  )
  assert.deepEqual(items.map((item) => item.id), ['critical', 'success'])
})

test('activity stream keeps all cron completions alongside agent task events in chronological order', () => {
  const taskEvents = Array.from({ length: 12 }, (_, index) => ({
    id: `task-${index}`,
    type: 'task',
    message: `Agent zakończył zadanie ${index}`,
    createdAt: `2026-07-18T${String(8 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}:00Z`,
  }))
  const cronEvents = [8, 9, 10, 12].map((hour) => ({
    id: `cron-${hour}`,
    type: 'cron',
    message: `Automatyzacja ${hour} zakończyła cykl poprawnie`,
    createdAt: `2026-07-18T${String(hour).padStart(2, '0')}:15:00Z`,
  }))
  const items = mergeWorldActivityItems([...taskEvents, ...cronEvents], [], 40)

  assert.equal(items.filter((item) => item.type === 'cron').length, 4)
  assert.equal(items.find((item) => item.type === 'cron').id, 'cron-12')
})

test('raw Hermes logs stay technical while the world narrative remains human-readable', () => {
  const now = Date.UTC(2026, 6, 16, 10, 0, 0)
  const rawLine = JSON.stringify({ timestamp: new Date(now - 1_000).toISOString(), level: 'warning', message: 'MCP keepalive failed', profile: 'coder' })
  const snapshot = createWorldSnapshot({
    ...getDemoScenario('healthy'),
    logs: { lines: [rawLine] },
  }, null, () => now)

  assert.equal(snapshot.raw.logs[0].rawMessage, rawLine)
  assert.equal(snapshot.activity.some((item) => item.type === 'log'), false)
  assert.equal(snapshot.alerts[0].message, 'Kowal zgłasza ostrzeżenie w Kuźni.')
  assert.equal(snapshot.alerts[0].technicalMessage, 'MCP keepalive failed')
})

test('explicit observability focus enables deterministic demo runtime', () => {
  assert.deepEqual(resolveDemoRuntimeMode('?focus=critical', false), { focus: 'critical', scenario: 'healthy', demoMode: true })
  assert.deepEqual(resolveDemoRuntimeMode('?focus=auto', false), { focus: 'auto', scenario: 'healthy', demoMode: false })
  assert.equal(resolveDemoRuntimeMode('?demo=1&focus=stable&scenario=warning', false).demoMode, true)
})

test('map variants are explicit, reversible and default to the accepted baseline production pass', () => {
  assert.equal(resolveMapReadabilityMode(''), 'baseline')
  assert.equal(resolveMapReadabilityMode('?mapReadability=baseline'), 'baseline')
  assert.equal(resolveMapReadabilityMode('?mapReadability=light'), 'light')
  assert.equal(resolveMapReadabilityMode('?mapReadability=strong'), 'strong')
  assert.equal(resolveMapReadabilityMode('?mapReadability=unknown'), 'baseline')
})

test('map variants have explicit production, showcase and fallback roles', () => {
  assert.deepEqual(getMapVariant(''), { id: 'baseline', role: 'production', label: 'Hermes Citadel' })
  assert.equal(getMapVariant('?mapVariant=strong').role, 'showcase')
  assert.equal(getMapVariant('?mapVariant=light').role, 'fallback')
  assert.equal(resolveMapReadabilityMode('?mapReadability=strong'), 'strong')
})

test('route debug config is off by default and filters one agent and explicit layers', () => {
  const profiles = ['coder', 'researcher', 'prospecting']
  assert.equal(resolveRouteDebugConfig('', { availableProfiles: profiles }).enabled, false)
  assert.deepEqual(resolveRouteDebugConfig('?debugRoutes=1', { availableProfiles: profiles }), {
    enabled: true,
    profile: 'coder',
    layers: ['route', 'nodes', 'entrances'],
  })
  assert.deepEqual(resolveRouteDebugConfig('?debugRoutes=1&debugAgent=researcher&debugLayers=route,labels,depth', { availableProfiles: profiles }), {
    enabled: true,
    profile: 'researcher',
    layers: ['route', 'labels', 'depth'],
  })
  assert.equal(resolveRouteDebugConfig('?debugRoutes=1&debugAgent=all', { availableProfiles: profiles }).profile, 'all')
  assert.equal(resolveRouteDebugConfig('?debugRoutes=1&debugAgent=missing', { availableProfiles: profiles }).profile, 'coder')
})

test('route debug presentation numbers one route and shortens technical labels', () => {
  const journey = getWorldLifeJourney('coder', 'mobile')
  const nodes = getNumberedRouteNodes(journey)
  assert.deepEqual(nodes.map((node) => node.number), nodes.map((_, index) => index + 1))
  assert.equal(nodes[0].fullLabel, journey.outboundNodeIds[0])
  assert.ok(nodes.every((node) => node.shortLabel.length < node.fullLabel.length || !node.fullLabel.includes('_')))
  assert.equal(shortRouteNodeLabel('forge_main_entrance', 0), 'Kuźnia · wejście')
  const config = resolveRouteDebugConfig('?debugRoutes=1&debugAgent=coder&debugLayers=route,home,safe,work,occlusion', { availableProfiles: ['coder'] })
  assert.deepEqual(config.layers, ['route', 'home', 'safe', 'work', 'occlusion'])
})

test('demo observability matrix produces deterministic mobile states without changing the FSM', () => {
  const observedAt = Date.UTC(2026, 6, 11, 20, 0, 0)
  const base = createWorldSnapshot(getDemoScenario('healthy'), null, () => observedAt, { source: 'demo', connection: 'online' })
  const presentationFor = (focus, profile) => {
    const snapshot = applyDemoObservabilityFocus(base, focus, observedAt)
    return resolveMapAgentPresentation({
      agent: snapshot.agents.find((agent) => agent.profile === profile),
      tasks: snapshot.tasks,
      alerts: snapshot.alerts,
      lifecycle: snapshot.lifecycle,
      now: observedAt,
      layout: 'mobile',
    })
  }

  assert.equal(resolveDemoObservabilityFocus('unknown'), 'auto')
  assert.equal(presentationFor('working', 'coder').visualState, 'work')
  assert.equal(presentationFor('waiting', 'developer').visualState, 'waiting')
  assert.equal(presentationFor('thinking', 'researcher').visualState, 'thinking')
  assert.equal(presentationFor('warning', 'coder').severity, 'warning')
  assert.equal(presentationFor('critical', 'coder').severity, 'critical')
  assert.equal(presentationFor('stuck', 'reviewer').visualState, 'stuck')
  assert.equal(presentationFor('success', 'coder').signalState, 'success')
  assert.equal(presentationFor('offline', 'coder').visualState, 'offline')
})

test('demo patrol advances the scout along the existing route instead of walking in place', () => {
  const observedAt = Date.UTC(2026, 6, 18, 12, 0, 0)
  const base = createWorldSnapshot(getDemoScenario('healthy'), null, () => observedAt, { source: 'demo', connection: 'online' })
  const snapshot = applyWorldSceneScript(base, {
    startAt: observedAt,
    now: observedAt + 3_600,
    loop: false,
  })
  const scout = snapshot.agents.find((agent) => agent.profile === 'prospecting')

  assert.equal(scout.state, 'walking')
  assert.ok(scout.routeProgress > 0 && scout.routeProgress < 1, `routeProgress=${scout.routeProgress}`)
  const presentation = resolveMapAgentPresentation({
    agent: scout,
    tasks: snapshot.tasks,
    alerts: snapshot.alerts,
    lifecycle: snapshot.lifecycle,
    now: observedAt + 3_600,
    layout: 'mobile',
  })
  assert.equal(presentation.isMoving, true)
  assert.ok(presentation.routeProgress > 0 && presentation.routeProgress < 1, `presentation.routeProgress=${presentation.routeProgress}`)
})
