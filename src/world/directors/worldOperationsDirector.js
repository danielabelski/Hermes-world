import { resolveWorldSubsystem } from './profileSubsystemMap.js'

const freeze = Object.freeze
const point = (x, y) => freeze({ x, y })

export const WORLD_OPERATION_TYPES = freeze([
  'data-transit', 'citadel-distribution', 'forge-production', 'watcher-sweep',
  'archive-ingestion', 'sanctum-circulation', 'gate-cycle', 'water-machinery',
])

const AMBIENT_CYCLE_MS = 36_000

export const WORLD_OPERATION_POINTS = freeze({
  mobile: freeze({
    gate: point(50, 94), road: point(50, 76), fountain: point(50, 60), citadel: point(50, 43),
    forge: point(30.5, 49.2), watcher: point(65.5, 71.2), archive: point(35.5, 70.5), sanctum: point(72, 80), water: point(50, 59.5),
  }),
  desktop: freeze({
    gate: point(50, 92), road: point(50, 69), fountain: point(50, 49), citadel: point(46, 36.5),
    forge: point(84, 49), watcher: point(67, 31.5), archive: point(28.5, 36.5), sanctum: point(39, 76), water: point(50, 47),
  }),
})

const TYPE_FOR_TARGET = freeze({ forge: 'forge-production', watcher: 'watcher-sweep', archive: 'archive-ingestion', sanctum: 'sanctum-circulation', gate: 'gate-cycle', citadel: 'citadel-distribution' })

export const INGRESS_ROUTES = freeze({
  mobile: freeze({
    citadel: freeze([point(50, 94), point(50, 86), point(50, 76.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43)]),
    forge: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(45.5, 63), point(40.5, 59.3), point(35.2, 53.5), point(30.5, 49.2)]),
    watcher: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(56.5, 65.8), point(61.5, 68.2), point(64, 70), point(65.5, 71.2)]),
    archive: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(44.5, 64), point(39.5, 67), point(37, 69.2), point(35.5, 70.5)]),
    sanctum: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(56.5, 65.8), point(64, 70), point(68, 74), point(72, 80)]),
    gate: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 43), point(50, 55), point(50, 65.5), point(50, 81.5), point(50, 88.5)]),
  }),
  desktop: freeze({
    citadel: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5)]),
    forge: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(54, 48), point(57, 54.5), point(66, 56.5), point(76, 51.5), point(84, 49)]),
    watcher: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(52, 35.5), point(58, 32.5), point(63, 31), point(67, 31.5)]),
    archive: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(40, 36.2), point(34, 33.5), point(30.2, 35.2), point(28.5, 36.5)]),
    sanctum: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(50, 55), point(44, 65), point(39, 76)]),
    gate: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(46, 36.5), point(50, 55), point(50, 69), point(50, 88.5)]),
  }),
})

export const ARCHIVE_RETURN_ROUTES = freeze({
  mobile: freeze({
    citadel: freeze([point(50, 43), point(50, 55), point(50, 63.5), point(44.5, 64), point(39.5, 67), point(35.5, 70.5)]),
    forge: freeze([point(30.5, 49.2), point(35.2, 53.5), point(40.5, 59.3), point(44.5, 64), point(39.5, 67), point(35.5, 70.5)]),
    watcher: freeze([point(65.5, 71.2), point(61.5, 68.2), point(50, 63.5), point(44.5, 64), point(39.5, 67), point(35.5, 70.5)]),
    sanctum: freeze([point(72, 80), point(64, 75), point(52, 72), point(44.5, 68), point(35.5, 70.5)]),
    gate: freeze([point(50, 88.5), point(50, 81.5), point(50, 65.5), point(44.5, 64), point(39.5, 67), point(35.5, 70.5)]),
  }),
  desktop: freeze({
    citadel: freeze([point(46, 36.5), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
    forge: freeze([point(84, 49), point(76, 51.5), point(66, 56.5), point(57, 54.5), point(46, 39), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
    watcher: freeze([point(67, 31.5), point(58, 32.5), point(46, 39), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
    sanctum: freeze([point(39, 76), point(44, 65), point(50, 55), point(46, 39), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
    gate: freeze([point(50, 88.5), point(50, 69), point(50, 55), point(46, 39), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
  }),
})

function operation(id, type, mode, phase, progress, extra = {}) {
  return freeze({ id, type, mode, phase, progress: Math.max(0, Math.min(1, progress)), ...extra })
}

function ingressRouteFor(target, layout) {
  return INGRESS_ROUTES[layout]?.[target] ?? INGRESS_ROUTES[layout].citadel
}

function archiveReturnRouteFor(source, layout) {
  return ARCHIVE_RETURN_ROUTES[layout]?.[source] ?? ARCHIVE_RETURN_ROUTES[layout].citadel
}

function dispatchRouteFor(target, layout) {
  const route = ingressRouteFor(target, layout)
  const citadel = WORLD_OPERATION_POINTS[layout].citadel
  const citadelIndex = route.findIndex((candidate) => candidate.x === citadel.x && candidate.y === citadel.y)
  return citadelIndex >= 0 ? route.slice(citadelIndex) : route
}

function phaseFor(progress) {
  return progress < 0.18 ? 'start' : progress < 0.78 ? 'process' : 'complete'
}

function ambientOperations({ elapsed }) {
  const cycle = Math.floor(elapsed / AMBIENT_CYCLE_MS)
  const cycleElapsed = elapsed % AMBIENT_CYCLE_MS
  const windowOperation = (type, windowStart, windowEnd, extra = {}) => {
    const progress = Math.max(0, Math.min(1, (cycleElapsed - windowStart) / (windowEnd - windowStart)))
    return operation(`ambient-${cycle}-${type}`, type, 'ambient', phaseFor(progress), progress, { durationMs: windowEnd - windowStart, ...extra })
  }
  if (cycleElapsed < 6_000) return freeze([windowOperation('citadel-distribution', 0, 6_000)])
  if (cycleElapsed < 12_000) return freeze([windowOperation('forge-production', 6_000, 12_000, { targetBuildingId: 'forge' })])
  if (cycleElapsed < 18_000) return freeze([windowOperation('watcher-sweep', 12_000, 18_000, { targetBuildingId: 'watcher' })])
  if (cycleElapsed < 24_000) return freeze([windowOperation('archive-ingestion', 18_000, 24_000, { targetBuildingId: 'archive' })])
  if (cycleElapsed < 30_000) return freeze([windowOperation('sanctum-circulation', 24_000, 30_000, { targetBuildingId: 'sanctum' })])
  return freeze([windowOperation('gate-cycle', 30_000, 36_000)])
}

function choreographyOperations(choreography, layout) {
  if (!choreography?.activeRunId) return []
  const signals = choreography.signals ?? []
  const evidence = choreography.lifecycleEvidenceId ?? signals.map((signal) => signal.evidenceEventId).find(Boolean) ?? null
  if (!evidence) return []
  const delegation = signals.find((signal) => signal.kind === 'delegation')
  const archive = signals.find((signal) => signal.kind === 'archive-record')
  const command = signals.find((signal) => signal.kind === 'command-core')
  const message = signals.find((signal) => signal.kind === 'message-pulse')
  const elapsed = Number(choreography.elapsedMs ?? 0)
  const operations = []
  if (archive) {
    const source = resolveWorldSubsystem(archive?.sourceAgentId ?? choreography.targetAgentId, archive?.sourceBuildingId)
    if (source !== 'archive') operations.push(operation(`event-return-${evidence}`, 'data-transit', 'event', 'complete', 0.82, {
      targetBuildingId: 'archive', route: archiveReturnRouteFor(source, layout), evidenceEventId: evidence, triggerEventId: archive.triggerEventId, durationMs: 4_200,
    }))
    operations.push(operation(`event-archive-${evidence}`, 'archive-ingestion', 'event', 'process', 0.42, { targetBuildingId: 'archive', evidenceEventId: evidence, triggerEventId: archive.triggerEventId, durationMs: 5_800 }))
    return operations.slice(0, 2)
  }
  if (elapsed < 3_000) {
    operations.push(operation(`event-ingress-${evidence}`, 'data-transit', 'event', 'receive', Math.min(1, elapsed / 3_000), {
      targetBuildingId: 'citadel', route: ingressRouteFor('citadel', layout), evidenceEventId: evidence, triggerEventId: message?.triggerEventId ?? choreography.triggerEventId, durationMs: 3_000,
    }))
    operations.push(operation(`event-intake-${evidence}`, 'citadel-distribution', 'event', 'intake', Math.min(1, elapsed / 3_000), { targetBuildingId: 'citadel', evidenceEventId: evidence, triggerEventId: command?.triggerEventId ?? choreography.triggerEventId, durationMs: 3_000 }))
    return operations
  }
  const target = resolveWorldSubsystem(delegation?.targetAgentId ?? choreography.targetAgentId, delegation?.buildingId) ?? 'citadel'
  if (delegation && target !== 'citadel') {
    const type = TYPE_FOR_TARGET[target]
    operations.push(operation(`event-dispatch-${evidence}`, 'data-transit', 'event', 'dispatch', Math.min(1, (elapsed - 3_000) / 2_800), {
      targetBuildingId: target, route: dispatchRouteFor(target, layout), evidenceEventId: evidence, triggerEventId: delegation.triggerEventId, durationMs: 2_800,
    }))
    if (type) operations.push(operation(`event-receive-${evidence}-${target}`, type, 'event', 'receive', 0.35, { targetBuildingId: target, evidenceEventId: evidence, triggerEventId: delegation.triggerEventId, durationMs: 2_800 }))
  } else if (command) operations.push(operation(`event-citadel-${evidence}`, 'citadel-distribution', 'event', 'analysis', 0.58, { targetBuildingId: 'citadel', evidenceEventId: evidence, triggerEventId: command.triggerEventId, durationMs: 4_800 }))
  return operations.slice(0, 2)
}

function operationalOperations(presentations = []) {
  const ranked = presentations.map((model) => {
    const target = resolveWorldSubsystem(model.profileId, model.buildingId)
    const state = String(model.phase ?? model.visualState ?? '').toLowerCase()
    if (!target || ['idle', 'resting', 'offline', 'unknown'].includes(state)) return null
    const severity = String(model.severity ?? '').toLowerCase()
    const priority = ['critical', 'error'].includes(severity) ? 6 : ['warning', 'stuck', 'alerted'].includes(state) || severity === 'warning' ? 5 : ['working', 'work', 'carrying', 'observing', 'observe', 'thinking'].includes(state) ? 4 : 1
    if (priority <= 1) return null
    return { model, target, state, priority }
  }).filter(Boolean).sort((left, right) => right.priority - left.priority)
  return ranked.slice(0, 2).map(({ model, target, state, priority }) => operation(
    `operational-${model.profileId}-${model.evidenceEventId ?? state}`,
    TYPE_FOR_TARGET[target], 'operational', priority >= 5 ? 'interrupted' : 'process', 0.5,
    { targetBuildingId: target, evidenceEventId: model.evidenceEventId ?? null, sourcePhase: state, priority, durationMs: 6_500 },
  ))
}

export function deriveWorldOperations({ now = Date.now(), startedAt = now, visible = true, reducedMotion = false, layout = 'desktop', choreography = {}, operationalPresentations = [], lifecycle = {} } = {}) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  if (!visible) return freeze({ running: false, operations: freeze([]), majorCount: 0, mode: 'paused', layout: normalizedLayout })
  const elapsed = Math.max(0, now - startedAt)
  const telemetryFresh = !['offline', 'stale'].includes(lifecycle.connection)
  const operational = telemetryFresh ? operationalOperations(operationalPresentations) : []
  const choreographed = telemetryFresh ? choreographyOperations(choreography, normalizedLayout) : []
  const ambient = ambientOperations({ elapsed })
  const urgentOperational = operational.filter((item) => item.priority >= 5)
  const selected = urgentOperational.length
    ? [...urgentOperational, ...choreographed]
    : choreographed.length
      ? [...choreographed, ...operational]
      : operational.length ? operational : ambient
  const operations = freeze(selected.slice(0, 2).map((item) => reducedMotion ? freeze({ ...item, phase: 'static', progress: 0.5 }) : item))
  return freeze({ running: true, operations, majorCount: operations.length, mode: urgentOperational.length ? 'operational' : choreographed.length ? 'event' : operational.length ? 'operational' : 'ambient', layout: normalizedLayout })
}

export const WORLD_OPERATIONS_TIMING = freeze({ AMBIENT_CYCLE_MS })
