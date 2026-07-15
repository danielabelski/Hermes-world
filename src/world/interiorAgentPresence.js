import { BUILDING_INTERIOR_CONFIG } from './buildingEntryConfig.js'

const freeze = Object.freeze
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0))
const ACTIVE_TASK_STATES = new Set(['running', 'working', 'active', 'in_progress'])

export const INTERIOR_AGENT_PLACEMENTS = freeze({
  forge: freeze({
    profileId: 'coder', enabled: true, entranceThreshold: 0.62, scale: 1.24,
    route: freeze([freeze({ x: 50, y: 94 }), freeze({ x: 49, y: 82 }), freeze({ x: 42, y: 75 }), freeze({ x: 36, y: 68 })]),
  }),
  archive: freeze({
    profileId: 'researcher', enabled: true, entranceThreshold: 0.62, scale: 1.18,
    route: freeze([freeze({ x: 50, y: 94 }), freeze({ x: 50, y: 80 }), freeze({ x: 51, y: 68 })]),
  }),
  // These rooms are visually complete, but their mapped agents still work at
  // verified exterior points. Keep them disabled until the real navigation
  // contract can prove an interior location.
  citadel: freeze({ profileId: 'orchestrator', enabled: false, reason: 'no-verified-inside-route' }),
  watcher: freeze({ profileId: 'prospecting', enabled: false, reason: 'verified-exterior-observation-point' }),
  sanctum: freeze({ profileId: 'synthesizer', enabled: false, reason: 'no-verified-inside-route' }),
})

function taskMatchesProfile(task, profileId) {
  return task?.assignee === profileId || task?.agentId === profileId || task?.ownerAgentId === profileId
}

function findEvidenceTask(presentation, tasks, profileId) {
  return tasks.find((task) => String(task?.id) === String(presentation?.taskId))
    ?? tasks.find((task) => taskMatchesProfile(task, profileId) && ACTIVE_TASK_STATES.has(String(task?.status ?? '').toLowerCase()))
    ?? null
}

function pointOnRoute(points, progress) {
  if (!points?.length) return freeze({ x: 50, y: 90, direction: 'ne' })
  if (points.length === 1) return freeze({ ...points[0], direction: 'ne' })
  const lengths = points.slice(1).map((target, index) => Math.hypot(target.x - points[index].x, target.y - points[index].y))
  const total = Math.max(0.0001, lengths.reduce((sum, value) => sum + value, 0))
  const targetDistance = clamp(progress) * total
  let consumed = 0
  let segment = 0
  while (segment < lengths.length - 1 && consumed + lengths[segment] < targetDistance) {
    consumed += lengths[segment]
    segment += 1
  }
  const from = points[segment]
  const to = points[segment + 1] ?? from
  const local = lengths[segment] ? clamp((targetDistance - consumed) / lengths[segment]) : 1
  const dx = to.x - from.x
  const dy = to.y - from.y
  const direction = dx < 0 ? (dy < 0 ? 'nw' : 'sw') : (dy < 0 ? 'ne' : 'se')
  return freeze({ x: from.x + dx * local, y: from.y + dy * local, direction })
}

function interiorProgress(presentation, placement) {
  const threshold = placement.entranceThreshold ?? 0.62
  if (presentation.journeyStage === 'enter') return clamp((presentation.routeProgress - threshold) / Math.max(0.01, 1 - threshold))
  if (presentation.journeyStage === 'exit') return 1 - clamp(presentation.routeProgress / Math.max(0.01, 1 - threshold))
  return 1
}

/**
 * A single evidence gate shared by map and interior renderers.
 * `presentation.isInside` is the atomically exclusive location bit: when it
 * is false the map owns the sprite; when true the matching interior may own it.
 */
export function deriveInteriorAgentPresence({ buildingId, presentation, tasks = [], lifecycle = {} }) {
  const config = BUILDING_INTERIOR_CONFIG[buildingId]
  const placement = INTERIOR_AGENT_PLACEMENTS[buildingId]
  if (!config || !placement?.enabled || !presentation) return null
  if (['offline', 'stale'].includes(String(lifecycle.connection ?? '').toLowerCase())) return null
  if (presentation.profileId !== config.agentProfile || presentation.profileId !== placement.profileId) return null
  if (presentation.buildingId !== config.buildingId && !config.canonicalBuildingIds.includes(presentation.buildingId)) return null
  if (presentation.isInside !== true || !['enter', 'work', 'exit'].includes(presentation.journeyStage)) return null

  const task = findEvidenceTask(presentation, tasks, placement.profileId)
  if (!task || String(task.id) !== String(presentation.taskId)) return null
  const progress = interiorProgress(presentation, placement)
  const position = pointOnRoute(placement.route, progress)
  const stage = presentation.journeyStage === 'enter' ? 'entering' : presentation.journeyStage === 'exit' ? 'exiting' : 'station'
  const source = lifecycle.source === 'demo'
    ? 'controlled-demo'
    : presentation.evidenceEventId || task.evidenceEventId
      ? 'live-event'
      : 'runtime-task'

  return freeze({
    buildingId,
    profileId: placement.profileId,
    taskId: String(task.id),
    taskTitle: task.title ?? null,
    evidenceEventId: presentation.evidenceEventId ?? task.evidenceEventId ?? null,
    evidenceSource: source,
    stage,
    visualState: stage === 'station' ? presentation.visualState : 'walk',
    signalState: presentation.signalState,
    severity: presentation.severity,
    routeProgress: presentation.routeProgress,
    interiorProgress: progress,
    x: position.x,
    y: position.y,
    direction: position.direction,
    scale: placement.scale,
    carryPackage: stage !== 'station' && Boolean(presentation.carryPackage),
    label: presentation.label,
    canDrillDown: true,
  })
}

