const freeze = Object.freeze
const point = (x, y) => freeze({ x, y })

export const WORLD_OPERATION_TYPES = freeze([
  'data-transit', 'citadel-distribution', 'forge-production', 'watcher-sweep',
  'archive-ingestion', 'sanctum-circulation', 'gate-cycle', 'water-machinery',
])

const AMBIENT_CYCLE_MS = 48_000

export const WORLD_OPERATION_POINTS = freeze({
  mobile: freeze({
    gate: point(50, 94), road: point(50, 76), fountain: point(50, 60), citadel: point(50, 43),
    forge: point(30.5, 49.2), watcher: point(65.5, 71.2), archive: point(35.5, 70.5), sanctum: point(72, 80), water: point(50, 43),
  }),
  desktop: freeze({
    gate: point(50, 92), road: point(50, 69), fountain: point(50, 49), citadel: point(46, 36.5),
    forge: point(84, 49), watcher: point(67, 31.5), archive: point(28.5, 36.5), sanctum: point(39, 76), water: point(50, 88),
  }),
})

const TARGET_FOR_PROFILE = freeze({ coder: 'forge', prospecting: 'watcher', researcher: 'archive', orchestrator: 'citadel', default: 'citadel' })
const TYPE_FOR_TARGET = freeze({ forge: 'forge-production', watcher: 'watcher-sweep', archive: 'archive-ingestion', sanctum: 'sanctum-circulation', citadel: 'citadel-distribution' })

const TRANSIT_ROUTES = freeze({
  mobile: freeze({
    citadel: freeze([point(50, 94), point(50, 86), point(50, 76.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43)]),
    forge: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(45.5, 63), point(40.5, 59.3), point(35.2, 53.5), point(30.5, 49.2), point(35.2, 53.5), point(40.5, 59.3), point(44.5, 64), point(39.5, 67), point(37, 69.2), point(35.5, 70.5)]),
    watcher: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(56.5, 65.8), point(61.5, 68.2), point(64, 70), point(65.5, 71.2), point(61.5, 68.2), point(50, 63.5), point(44.5, 64), point(39.5, 67), point(35.5, 70.5)]),
    archive: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(44.5, 64), point(39.5, 67), point(37, 69.2), point(35.5, 70.5)]),
    sanctum: freeze([point(50, 94), point(50, 81.5), point(50, 65.5), point(50, 55), point(50, 45), point(50, 43), point(50, 55), point(50, 63.5), point(56.5, 65.8), point(64, 70), point(68, 74), point(72, 80), point(64, 75), point(52, 72), point(44.5, 68), point(35.5, 70.5)]),
  }),
  desktop: freeze({
    citadel: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5)]),
    forge: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(54, 48), point(57, 54.5), point(66, 56.5), point(76, 51.5), point(84, 49), point(76, 51.5), point(66, 56.5), point(57, 54.5), point(46, 39), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
    watcher: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(52, 35.5), point(58, 32.5), point(63, 31), point(67, 31.5), point(58, 32.5), point(46, 39), point(40, 36.2), point(34, 33.5), point(28.5, 36.5)]),
    archive: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(40, 36.2), point(34, 33.5), point(30.2, 35.2), point(28.5, 36.5)]),
    sanctum: freeze([point(50, 92), point(48, 83.5), point(50, 69), point(50, 55), point(54, 48), point(46, 39), point(46, 36.5), point(50, 55), point(44, 65), point(39, 76), point(34, 58), point(28.5, 36.5)]),
  }),
})

function operation(id, type, mode, phase, progress, extra = {}) {
  return freeze({ id, type, mode, phase, progress: Math.max(0, Math.min(1, progress)), ...extra })
}

function routeFor(target, layout) {
  return TRANSIT_ROUTES[layout]?.[target] ?? TRANSIT_ROUTES[layout].archive
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
  if (cycleElapsed < 8_000) return freeze([
    windowOperation('citadel-distribution', 0, 8_000),
    windowOperation('water-machinery', 0, 8_000),
  ])
  if (cycleElapsed < 16_000) return freeze([
    windowOperation('forge-production', 8_000, 16_000, { targetBuildingId: 'forge' }),
    windowOperation('water-machinery', 8_000, 16_000),
  ])
  if (cycleElapsed < 24_000) return freeze([
    windowOperation('gate-cycle', 16_000, 24_000),
    windowOperation('water-machinery', 16_000, 24_000),
  ])
  if (cycleElapsed < 31_000) return freeze([
    windowOperation('watcher-sweep', 24_000, 31_000, { targetBuildingId: 'watcher' }),
    windowOperation('water-machinery', 24_000, 31_000),
  ])
  if (cycleElapsed < 36_000) return freeze([windowOperation('citadel-distribution', 31_000, 36_000)])
  if (cycleElapsed < 41_000) return freeze([
    windowOperation('archive-ingestion', 36_000, 41_000, { targetBuildingId: 'archive' }),
    windowOperation('water-machinery', 36_000, 41_000),
  ])
  return freeze([
    windowOperation('sanctum-circulation', 41_000, 48_000, { targetBuildingId: 'sanctum' }),
    windowOperation('water-machinery', 41_000, 48_000),
  ])
}

function choreographyOperations(choreography, layout) {
  if (!choreography?.activeRunId) return []
  const signals = choreography.signals ?? []
  const evidence = signals.map((signal) => signal.evidenceEventId).find(Boolean) ?? null
  if (!evidence) return []
  const delegation = signals.find((signal) => signal.kind === 'delegation')
  const archive = signals.find((signal) => signal.kind === 'archive-record')
  const command = signals.find((signal) => signal.kind === 'command-core')
  const message = signals.find((signal) => signal.kind === 'message-pulse')
  const operations = []
  if (message || delegation || archive) {
    const target = archive ? 'archive' : delegation?.buildingId ?? TARGET_FOR_PROFILE[delegation?.targetAgentId] ?? 'citadel'
    operations.push(operation(`event-transit-${evidence}`, 'data-transit', 'event', archive ? 'complete' : 'process', archive ? 0.82 : 0.35, {
      targetBuildingId: target, route: routeFor(target, layout), evidenceEventId: evidence, durationMs: archive ? 4_200 : 5_200,
    }))
  }
  if (archive) operations.push(operation(`event-archive-${evidence}`, 'archive-ingestion', 'event', 'process', 0.42, { targetBuildingId: 'archive', evidenceEventId: evidence, durationMs: 5_800 }))
  else if (command) operations.push(operation(`event-citadel-${evidence}`, 'citadel-distribution', 'event', 'process', 0.44, { targetBuildingId: 'citadel', evidenceEventId: evidence, durationMs: 5_200 }))
  return operations.slice(0, 2)
}

function operationalOperations(presentations = []) {
  const ranked = presentations.map((model) => {
    const target = TARGET_FOR_PROFILE[model.profileId]
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
  if (!visible) return freeze({ running: false, operations: freeze([]), majorCount: 0 })
  const elapsed = Math.max(0, now - startedAt)
  const operational = operationalOperations(operationalPresentations)
  const choreographed = lifecycle.connection === 'offline' ? [] : choreographyOperations(choreography, normalizedLayout)
  const ambient = ambientOperations({ elapsed })
  const selected = operational.length ? [...operational, ...choreographed] : choreographed.length ? choreographed : ambient
  const operations = freeze(selected.slice(0, 2).map((item) => reducedMotion ? freeze({ ...item, phase: 'static', progress: 0.5 }) : item))
  return freeze({ running: true, operations, majorCount: operations.length, mode: operational.length ? 'operational' : choreographed.length ? 'event' : 'ambient' })
}

export const WORLD_OPERATIONS_TIMING = freeze({ AMBIENT_CYCLE_MS })
