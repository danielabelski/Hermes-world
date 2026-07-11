import { resolveLivingAgentState } from './LivingWorldStateMachine.js'
import { getAgentDefinition } from './data/agentDefinitions.js'
import { getWorldLifeJourney } from './data/roadGraph.js'

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value))
const point = (x, y) => ({ x: Number(x) || 0, y: Number(y) || 0 })

const STATUS_RANK = Object.freeze({ error: 0, blocked: 1, running: 2, review: 3, scheduled: 4, ready: 5, done: 6 })
function asTime(value, fallback = 0) {
  if (Number.isFinite(Number(value)) && value !== null && value !== '') return Number(value)
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : fallback
}

function taskMatchesAgent(task, agent) {
  return task?.assignee === agent.profile || task?.ownerAgentId === agent.id || task?.agentId === agent.profile
}

export function getPresentationTask(agent, tasks = []) {
  return tasks
    .filter((task) => taskMatchesAgent(task, agent))
    .sort((left, right) => {
      const statusOrder = (STATUS_RANK[left?.status] ?? 99) - (STATUS_RANK[right?.status] ?? 99)
      if (statusOrder) return statusOrder
      const leftAt = asTime(left?.visualCompletedAt ?? left?.startedAt ?? left?.createdAt, 0)
      const rightAt = asTime(right?.visualCompletedAt ?? right?.startedAt ?? right?.createdAt, 0)
      return rightAt - leftAt
    })[0] ?? null
}

function alertsForAgent(agent, alerts = []) {
  return alerts.filter((alert) => alert?.entityId === agent.profile || alert?.agentId === agent.profile || alert?.profile === agent.profile)
}

function severityFor({ living, agent }) {
  const raw = String(living.alert?.severity ?? living.alert?.level ?? agent.warningLevel ?? 'none').toLowerCase()
  if (living.phase === 'incident' || ['critical', 'fatal', 'error'].includes(raw)) return 'critical'
  if (['warning', 'stuck', 'blocked'].includes(living.phase) || ['warning', 'blocked'].includes(raw)) return 'warning'
  return 'none'
}

function directionFor(from, to) {
  const dx = Number(to?.x) - Number(from?.x)
  const dy = Number(to?.y) - Number(from?.y)
  if (Math.abs(dx) < 0.001) return dy < 0 ? 'ne' : 'se'
  if (dx < 0) return dy < 0 ? 'nw' : 'sw'
  return dy < 0 ? 'ne' : 'se'
}

export function applyJourneyLane(points = [], laneOffset = 0) {
  return points.map((source, index) => {
    const endpoint = index === 0 || index === points.length - 1
    return point(
      (source.x + (endpoint ? 0 : laneOffset)) * 10,
      (source.y - (endpoint ? 0 : laneOffset * 0.45)) * 10,
    )
  })
}

export function sampleMapAgentRoute(points = [], progress = 0) {
  if (!points.length) return { worldX: 50, worldY: 50, direction: 'se', segmentIndex: 0 }
  if (points.length === 1) return { worldX: points[0].x, worldY: points[0].y, direction: 'se', segmentIndex: 0 }
  const lengths = points.slice(1).map((target, index) => Math.hypot(target.x - points[index].x, target.y - points[index].y))
  const total = Math.max(0.0001, lengths.reduce((sum, length) => sum + length, 0))
  const travelled = clamp(progress) * total
  let consumed = 0
  let segmentIndex = 0
  while (segmentIndex < lengths.length - 1 && consumed + lengths[segmentIndex] < travelled) {
    consumed += lengths[segmentIndex]
    segmentIndex += 1
  }
  const from = points[segmentIndex]
  const to = points[segmentIndex + 1] ?? from
  const localProgress = lengths[segmentIndex] > 0 ? clamp((travelled - consumed) / lengths[segmentIndex]) : 1
  return {
    worldX: from.x + (to.x - from.x) * localProgress,
    worldY: from.y + (to.y - from.y) * localProgress,
    direction: directionFor(from, to),
    segmentIndex,
  }
}

function progressFrom(now, startedAt, durationMs, fallback = 0) {
  const start = asTime(startedAt, 0)
  if (!start) return clamp(fallback)
  return clamp((now - start) / Math.max(1, durationMs))
}

function genericPosition(agent, atWork) {
  const definition = getAgentDefinition(agent.profile)
  const source = atWork
    ? agent.workAnchor ?? definition?.workAnchor
    : agent.homeAnchor ?? agent.position ?? definition?.spawnAnchor
  return point((source?.x ?? 5) * 10, (source?.y ?? 5) * 10)
}

function visualStateForPhase(phase) {
  if (['walking-to-work', 'walking-home', 'arriving'].includes(phase)) return 'walk'
  if (['working', 'carrying'].includes(phase)) return 'work'
  if (phase === 'observing') return 'observe'
  if (phase === 'success') return 'success'
  if (phase === 'waiting') return 'waiting'
  if (phase === 'warning') return 'alert'
  if (phase === 'stuck') return 'stuck'
  if (phase === 'blocked') return 'blocked'
  if (phase === 'incident') return 'alert'
  return 'idle'
}

function buildBaseModel({ agent, living, task, lifecycle }) {
  const explicitlyOffline = lifecycle?.connection === 'offline' || lifecycle?.phase === 'unavailable'
  return {
    profileId: agent.profile,
    buildingId: living.buildingId ?? agent.buildingId,
    label: agent.displayName ?? agent.role ?? agent.profile,
    phase: living.phase,
    journeyStage: living.phase,
    visualState: explicitlyOffline ? 'offline' : String(agent.state ?? '').toLowerCase().includes('thinking') ? 'thinking' : visualStateForPhase(living.phase),
    signalState: living.phase === 'stuck' ? 'stuck' : living.phase === 'warning' ? 'warning' : living.phase === 'blocked' ? 'blocked' : living.phase === 'incident' ? 'error' : 'none',
    severity: severityFor({ living, agent }),
    direction: 'se',
    worldX: 50,
    worldY: 50,
    sortY: 50,
    baseScale: 1,
    routeProgress: 0,
    isMoving: false,
    isInside: false,
    carryPackage: Boolean(living.carryPackage),
    buildingEffect: living.buildingEffect ?? 'idle',
    taskId: task?.id ?? null,
    walkCycleMs: agent.profile === 'coder' ? 720 : agent.profile === 'prospecting' ? 520 : 620,
  }
}

function resolveGenericModel({ base, agent, living }) {
  const atWork = ['working', 'carrying', 'observing', 'incident'].includes(living.phase)
  const position = genericPosition(agent, atWork)
  return {
    ...base,
    worldX: position.x,
    worldY: position.y,
    sortY: position.y,
    baseScale: 0.9 + clamp(position.y / 100, 0, 1) * 0.12,
  }
}

function resolveJourneyModel({ base, agent, living, task, journey, now }) {
  const outbound = applyJourneyLane(journey.outboundWaypoints, journey.laneOffset)
  const returning = applyJourneyLane(journey.returnWaypoints, journey.laneOffset)
  const home = point(journey.homePoint.x * 10, journey.homePoint.y * 10)
  const entrance = point(journey.entrancePoint.x * 10, journey.entrancePoint.y * 10)
  const work = point(journey.workPoint.x * 10, journey.workPoint.y * 10)
  let sampled = { worldX: home.x, worldY: home.y, direction: 'se' }
  let routeProgress = 0
  let journeyStage = 'idle'
  let visualState = base.visualState
  let signalState = base.signalState
  let isMoving = false
  let isInside = false

  if (living.phase === 'walking-to-work') {
    routeProgress = progressFrom(now, task?.transitionStartedAt ?? task?.startedAt ?? task?.started_at, journey.walkDurationMs, agent.routeProgress)
    sampled = sampleMapAgentRoute(outbound, routeProgress)
    journeyStage = routeProgress < 0.05 ? 'dispatch' : 'road'
    visualState = 'walk'
    isMoving = true
  } else if (living.phase === 'arriving') {
    const startedAt = asTime(task?.transitionStartedAt ?? task?.startedAt ?? task?.started_at, 0) + journey.walkDurationMs
    routeProgress = progressFrom(now, startedAt, journey.arriveDurationMs, agent.routeProgress)
    sampled = sampleMapAgentRoute([entrance, work], routeProgress)
    journeyStage = 'enter'
    visualState = 'walk'
    isMoving = true
    isInside = journey.workVisibility === 'inside' && routeProgress > journey.entranceVisibilityThreshold
  } else if (['working', 'carrying'].includes(living.phase)) {
    sampled = { worldX: work.x, worldY: work.y, direction: 'se' }
    routeProgress = 1
    journeyStage = 'work'
    visualState = 'work'
    isInside = journey.workVisibility === 'inside'
  } else if (living.phase === 'observing') {
    sampled = { worldX: work.x, worldY: work.y, direction: 'se' }
    routeProgress = 1
    journeyStage = 'observe'
    visualState = 'observe'
  } else if (living.phase === 'success') {
    const completedAt = asTime(task?.visualCompletedAt ?? task?.completedAt ?? task?.completed_at, now)
    const elapsed = Math.max(0, now - completedAt)
    const exitDuration = Math.min(800, journey.arriveDurationMs)
    if (elapsed < exitDuration) {
      routeProgress = clamp(elapsed / exitDuration)
      sampled = sampleMapAgentRoute([work, entrance], routeProgress)
      journeyStage = 'exit'
      visualState = 'walk'
      isMoving = true
      isInside = journey.workVisibility === 'inside' && routeProgress < (1 - journey.entranceVisibilityThreshold)
    } else {
      sampled = { worldX: entrance.x, worldY: entrance.y, direction: 'se' }
      routeProgress = 1
      journeyStage = 'success'
      visualState = 'success'
      signalState = elapsed - exitDuration < 900 ? 'success' : 'none'
    }
  } else if (living.phase === 'walking-home') {
    const completedAt = asTime(task?.visualCompletedAt ?? task?.completedAt ?? task?.completed_at, 0)
    const returnStartedAt = completedAt ? completedAt + journey.successDurationMs : task?.returnStartedAt
    routeProgress = progressFrom(now, returnStartedAt, journey.walkDurationMs, agent.routeProgress)
    sampled = sampleMapAgentRoute(returning, routeProgress)
    journeyStage = 'return'
    visualState = 'walk'
    isMoving = true
  } else if (living.phase === 'waiting') {
    sampled = { worldX: home.x, worldY: home.y, direction: 'se' }
    journeyStage = 'waiting'
    visualState = 'waiting'
  } else if (['warning', 'stuck', 'blocked'].includes(living.phase)) {
    const safe = journey.safeBlockedPoint ?? journey.dispatchPoint
    sampled = { worldX: safe.x * 10, worldY: safe.y * 10, direction: 'se' }
    journeyStage = living.phase
    visualState = living.phase === 'warning' ? 'alert' : living.phase === 'stuck' ? 'stuck' : 'blocked'
  } else if (living.phase === 'incident') {
    sampled = { worldX: entrance.x, worldY: entrance.y, direction: 'se' }
    journeyStage = 'incident'
    visualState = 'alert'
  }

  return {
    ...base,
    visualState: base.visualState === 'offline' ? 'offline' : visualState,
    signalState,
    journeyStage,
    worldX: sampled.worldX,
    worldY: sampled.worldY,
    sortY: sampled.worldY,
    direction: sampled.direction,
    routeProgress,
    isMoving,
    isInside,
    baseScale: 0.9 + clamp(sampled.worldY / 100, 0, 1) * 0.12,
  }
}

export function resolveMapAgentPresentation({ agent, tasks = [], alerts = [], lifecycle = {}, now = Date.now(), layout = 'desktop' }) {
  const task = getPresentationTask(agent, tasks)
  const living = resolveLivingAgentState({
    agent,
    tasks: task ? [task] : [],
    alerts: alertsForAgent(agent, alerts),
    now,
  })
  const journey = getWorldLifeJourney(agent.profile, layout)
  const base = buildBaseModel({ agent, living: { ...living, buildingId: agent.buildingId }, task, lifecycle })
  return Object.freeze(journey
    ? resolveJourneyModel({ base, agent, living, task, journey, now })
    : resolveGenericModel({ base, agent, living }))
}

export function sortMapAgentPresentations(presentations = []) {
  return [...presentations].sort((left, right) => Number(left.sortY ?? left.worldY) - Number(right.sortY ?? right.worldY) || String(left.profileId).localeCompare(String(right.profileId)))
}

export function resolveMapAgentPresentations({ agents = [], tasks = [], alerts = [], lifecycle = {}, now = Date.now(), layout = 'desktop' }) {
  return Object.freeze(sortMapAgentPresentations(agents.map((agent) => resolveMapAgentPresentation({ agent, tasks, alerts, lifecycle, now, layout }))))
}
