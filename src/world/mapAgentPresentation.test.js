import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getPresentationTask,
  resolveMapAgentPresentation,
} from './mapAgentPresentation.js'
import { resolveLivingAgentState } from './LivingWorldStateMachine.js'
import { getWorldLifeJourney } from './data/roadGraph.js'

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
  closeTo(dispatch.worldX, 50)
  closeTo(dispatch.worldY, 67)

  const road = modelAt(START + 3_200)
  assert.equal(road.journeyStage, 'road')
  assert.equal(road.isMoving, true)
  assert.ok(road.worldX < 50 && road.worldX > 23.5)

  const threshold = modelAt(START + 6_400)
  assert.equal(threshold.journeyStage, 'enter')
  closeTo(threshold.worldX, 23.5)
  closeTo(threshold.worldY, 66.5)

  const entering = modelAt(START + 6_750)
  assert.equal(entering.journeyStage, 'enter')
  closeTo(entering.worldX, 22.75)
  closeTo(entering.worldY, 64.25)

  const working = modelAt(START + 7_100)
  assert.equal(working.journeyStage, 'work')
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'forge-fire')
  assert.equal(working.isInside, true)
  closeTo(working.worldX, 22)
  closeTo(working.worldY, 62)
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
  closeTo(exitStart.worldX, 22)
  closeTo(exitStart.worldY, 62)

  const doorway = modelAt(completedAt + 700, doneTask)
  assert.equal(doorway.journeyStage, 'success')
  assert.equal(doorway.signalState, 'success')
  closeTo(doorway.worldX, 23.5)
  closeTo(doorway.worldY, 66.5)

  const glintEnded = modelAt(completedAt + 1_601, doneTask)
  assert.equal(glintEnded.journeyStage, 'success')
  assert.equal(glintEnded.signalState, 'none')

  const returnStart = modelAt(completedAt + 1_800, doneTask)
  assert.equal(returnStart.journeyStage, 'return')
  assert.equal(returnStart.visualState, 'walk')
  closeTo(returnStart.worldX, 23.5)
  closeTo(returnStart.worldY, 66.5)

  const almostHome = modelAt(completedAt + 8_199, doneTask)
  assert.equal(almostHome.journeyStage, 'return')
  closeTo(almostHome.worldX, 50, 0.12)
  closeTo(almostHome.worldY, 67, 0.12)

  const home = modelAt(completedAt + 8_201, doneTask)
  assert.equal(home.journeyStage, 'idle')
  assert.equal(home.visualState, 'idle')
  closeTo(home.worldX, 50)
  closeTo(home.worldY, 67)
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
  closeTo(dispatch.worldX, 50)
  closeTo(dispatch.worldY, 47.5)

  const threshold = resolve(START + 5_900)
  assert.equal(threshold.journeyStage, 'enter')
  closeTo(threshold.worldX, 23.5)
  closeTo(threshold.worldY, 46.5)

  const working = resolve(START + 6_600)
  assert.equal(working.journeyStage, 'work')
  assert.equal(working.visualState, 'work')
  assert.equal(working.buildingEffect, 'archive-pulse')
  assert.equal(working.isInside, true)
  closeTo(working.worldX, 21.5)
  closeTo(working.worldY, 41.5)
})

test('Zwiadowca patrols to the watch point, observes distinctly and blocks on a safe road node', () => {
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
  closeTo(lodge.worldX, 22.5)
  closeTo(lodge.worldY, 27)

  const patrol = resolve(START + 3_500)
  assert.equal(patrol.journeyStage, 'road')
  assert.equal(patrol.isMoving, true)
  assert.ok(patrol.worldX > 22.5 && patrol.worldX < 44.5)

  const watchPoint = resolve(START + 7_900)
  assert.equal(watchPoint.journeyStage, 'work')
  assert.equal(watchPoint.buildingEffect, 'scout-signal')
  assert.equal(watchPoint.isInside, false)
  closeTo(watchPoint.worldX, 44.5)
  closeTo(watchPoint.worldY, 28.5)

  const observing = resolve(START + 8_000, { ...scout, state: 'observing' }, null)
  assert.equal(observing.journeyStage, 'observe')
  assert.equal(observing.visualState, 'observe')
  assert.equal(observing.isInside, false)
  closeTo(observing.worldX, 44.5)
  closeTo(observing.worldY, 28.5)

  const blocked = resolve(START + 2_000, scout, { ...patrolTask, status: 'blocked' })
  assert.equal(blocked.journeyStage, 'blocked')
  assert.equal(blocked.visualState, 'blocked')
  closeTo(blocked.worldX, 36.5)
  closeTo(blocked.worldY, 33.5)
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
  closeTo(returnStart.worldX, 44.5)
  closeTo(returnStart.worldY, 28.5)

  const home = resolve(completedAt + 8_501)
  assert.equal(home.journeyStage, 'idle')
  closeTo(home.worldX, 22.5)
  closeTo(home.worldY, 27)
})

test('map status contract separates movement, work, success, blocked, error and offline', () => {
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

  const blocked = modelAt(START + 1_000, { ...runningCoderTask, status: 'blocked' })
  assert.equal(blocked.visualState, 'blocked')
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
