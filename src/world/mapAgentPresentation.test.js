import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getPresentationTask,
  resolveMapAgentPresentation,
} from './mapAgentPresentation.js'
import { resolveLivingAgentState } from './LivingWorldStateMachine.js'
import { getWorldLifeJourney } from './data/roadGraph.js'
import { createWorldSnapshot } from './WorldBridge.js'
import { getDemoScenario } from './data/demoScenarios.js'
import { resolveMapAgentStatusMarker } from './mapAgentStatusGrammar.js'
import { resolveInfrastructureFlowPresentation } from './infrastructureFlowPresentation.js'
import { resolveMapReadabilityMode } from './mapReadabilityMode.js'
import { resolveRouteDebugConfig } from './routeDebugConfig.js'
import { applyDemoObservabilityFocus, resolveDemoObservabilityFocus } from './data/demoObservabilityFocus.js'

const START = Date.UTC(2026, 6, 11, 12, 0, 0)
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
test('Kowal follows dispatch, road, exact Forge threshold and work anchor', () => {
  const dispatch = modelAt(START)
  assert.equal(dispatch.journeyStage, 'dispatch')
  assert.equal(dispatch.visualState, 'walk')
  closeTo(dispatch.worldX, 46)
  closeTo(dispatch.worldY, 36.5)

  const road = modelAt(START + 3_200)
  assert.equal(road.journeyStage, 'road')
  assert.equal(road.isMoving, true)
  assert.ok(road.worldX > 46 && road.worldX < 84)

  const threshold = modelAt(START + 6_400)
  assert.equal(threshold.journeyStage, 'enter')
  closeTo(threshold.worldX, 84)
  closeTo(threshold.worldY, 49)

  const entering = modelAt(START + 6_750)
  assert.equal(entering.journeyStage, 'enter')
  closeTo(entering.worldX, 84)
  closeTo(entering.worldY, 47.75)

  const working = modelAt(START + 7_100)
  assert.equal(working.journeyStage, 'work')
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'forge-fire')
  assert.equal(working.isInside, true)
  closeTo(working.worldX, 84)
  closeTo(working.worldY, 46.5)
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
  closeTo(exitStart.worldX, 84)
  closeTo(exitStart.worldY, 46.5)

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
  closeTo(returnStart.worldX, 84)
  closeTo(returnStart.worldY, 49)

  const almostHome = modelAt(completedAt + 8_199, doneTask)
  assert.equal(almostHome.journeyStage, 'return')
  closeTo(almostHome.worldX, 46, 0.12)
  closeTo(almostHome.worldY, 36.5, 0.12)

  const home = modelAt(completedAt + 8_201, doneTask)
  assert.equal(home.journeyStage, 'idle')
  assert.equal(home.visualState, 'idle')
  closeTo(home.worldX, 46)
  closeTo(home.worldY, 36.5)
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

  const threshold = resolve(START + 5_900)
  assert.equal(threshold.journeyStage, 'enter')
  closeTo(threshold.worldX, 28.5)
  closeTo(threshold.worldY, 36.5)

  const working = resolve(START + 6_600)
  assert.equal(working.journeyStage, 'work')
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'archive-pulse')
  assert.equal(working.isInside, true)
  closeTo(working.worldX, 27)
  closeTo(working.worldY, 31)
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

  const offline = resolveMapAgentPresentation({
    agent: { ...coder, state: 'idle', isActive: false },
    tasks: [],
    alerts: [],
    lifecycle: { phase: 'unavailable', connection: 'offline' },
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

test('status marker grammar keeps thinking, waiting, stuck and error visually distinct', () => {
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'thinking' }), { symbol: '?', tone: 'thinking' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'waiting' }), { symbol: '…', tone: 'waiting' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'stuck', severity: 'warning', signalState: 'stuck' }), { symbol: '↛', tone: 'stuck' })
  assert.deepEqual(resolveMapAgentStatusMarker({ visualState: 'alert', severity: 'critical', signalState: 'error' }), { symbol: '!', tone: 'error' })
  assert.equal(resolveMapAgentStatusMarker({ visualState: 'idle' }), null)
})

test('critical source localization maps only meaningful phases onto subsystem flows', () => {
  assert.deepEqual(resolveInfrastructureFlowPresentation('working'), { state: 'flowing', tone: 'normal' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('waiting'), { state: 'waiting', tone: 'normal' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('stuck'), { state: 'problem', tone: 'warning' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('incident'), { state: 'problem', tone: 'error' })
  assert.deepEqual(resolveInfrastructureFlowPresentation('resting'), { state: 'dormant', tone: 'normal' })
})

test('map readability variants are explicit, reversible and default to the accepted light pass', () => {
  assert.equal(resolveMapReadabilityMode(''), 'light')
  assert.equal(resolveMapReadabilityMode('?mapReadability=baseline'), 'baseline')
  assert.equal(resolveMapReadabilityMode('?mapReadability=light'), 'light')
  assert.equal(resolveMapReadabilityMode('?mapReadability=strong'), 'strong')
  assert.equal(resolveMapReadabilityMode('?mapReadability=unknown'), 'light')
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
