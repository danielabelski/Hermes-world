import { getAgentDefinition } from '../data/agentDefinitions.js'

const freeze = Object.freeze
const point = (x, y) => freeze({ x, y })
const building = (definition) => freeze({ enabled: true, ...definition })

export const ENVIRONMENT_BUILDINGS = freeze({
  citadel: building({
    buildingId: 'citadel', agentProfile: 'orchestrator', ambientEffects: freeze(['core-breath', 'energy-wave', 'facade-runes']),
    eventResponses: freeze(['thinking', 'working', 'waiting', 'warning', 'critical']), intensity: 0.72, timingOffset: 0,
    points: freeze({ desktop: point(46, 36.5), mobile: point(50, 43) }),
  }),
  forge: building({
    buildingId: 'forge', agentProfile: 'coder', ambientEffects: freeze(['ember', 'smoke', 'sparks', 'mechanism']),
    eventResponses: freeze(['working', 'waiting', 'success', 'warning', 'critical']), intensity: 0.74, timingOffset: 1.7,
    points: freeze({ desktop: point(84, 49), mobile: point(30.5, 49.2) }),
  }),
  watcher: building({
    buildingId: 'watcher', agentProfile: 'prospecting', ambientEffects: freeze(['scanner', 'lens-pulse']),
    eventResponses: freeze(['thinking', 'working', 'waiting', 'warning', 'critical']), intensity: 0.58, timingOffset: 3.2,
    points: freeze({ desktop: point(67, 31.5), mobile: point(65.5, 71.2) }),
  }),
  archive: building({
    buildingId: 'archive', agentProfile: 'researcher', ambientEffects: freeze(['window-sequence', 'information-runes']),
    eventResponses: freeze(['thinking', 'working', 'waiting', 'success', 'warning', 'critical']), intensity: 0.62, timingOffset: 4.6,
    points: freeze({ desktop: point(28.5, 36.5), mobile: point(35.5, 70.5) }),
  }),
  sanctum: building({
    buildingId: 'sanctum', agentProfile: null, ambientEffects: freeze(['healing-breath', 'healing-motes']),
    eventResponses: freeze(['waiting', 'warning', 'critical']), intensity: 0.5, timingOffset: 6.1,
    points: freeze({ desktop: point(39, 76), mobile: point(72, 80) }),
  }),
})

export const ENVIRONMENT_DATA_ROUTES = freeze({
  gateToCitadel: freeze({ desktop: freeze([point(50, 91), point(50, 62), point(46, 36.5)]), mobile: freeze([point(50, 91), point(50, 65), point(50, 43)]) }),
  citadelToForge: freeze({ desktop: freeze([point(46, 36.5), point(58, 48), point(76, 51.5), point(84, 49)]), mobile: freeze([point(50, 43), point(50, 63.5), point(40.5, 59.3), point(30.5, 49.2)]) }),
  citadelToWatcher: freeze({ desktop: freeze([point(46, 36.5), point(58, 32.5), point(67, 31.5)]), mobile: freeze([point(50, 43), point(56.5, 65.8), point(65.5, 71.2)]) }),
  citadelToArchive: freeze({ desktop: freeze([point(46, 36.5), point(40, 36.2), point(28.5, 36.5)]), mobile: freeze([point(50, 43), point(44.5, 64), point(35.5, 70.5)]) }),
  archiveToSanctum: freeze({ desktop: freeze([point(28.5, 36.5), point(35, 58), point(39, 76)]), mobile: freeze([point(35.5, 70.5), point(52, 76), point(72, 80)]) }),
})

const PROFILE_BUILDINGS = freeze({ orchestrator: 'citadel', default: 'citadel', coder: 'forge', prospecting: 'watcher', researcher: 'archive' })
const STATE_PRIORITY = freeze({ critical: 6, error: 6, warning: 5, alerted: 5, working: 3, work: 3, thinking: 2, waiting: 1, idle: 0, resting: 0 })
const normalizeState = (model = {}) => String(model.severity === 'critical' || model.severity === 'error' ? 'critical' : model.severity === 'warning' ? 'warning' : model.phase ?? model.visualState ?? 'idle').toLowerCase()

function buildingForSignal(signal = {}) {
  if (signal.buildingId && ENVIRONMENT_BUILDINGS[signal.buildingId]) return signal.buildingId
  if (signal.kind === 'archive-record') return 'archive'
  if (signal.kind === 'message-pulse' || signal.kind === 'command-core') return 'citadel'
  return PROFILE_BUILDINGS[signal.targetAgentId] ?? null
}

function eventResponse(choreography = {}) {
  const signals = choreography.signals ?? []
  const signal = [...signals].reverse().find((candidate) => buildingForSignal(candidate))
  if (!signal) return null
  const cue = signal.kind === 'archive-record' ? 'record' : signal.kind === 'delegation' ? 'route' : 'receive'
  return freeze({ source: 'choreography', buildingId: buildingForSignal(signal), cue, kind: signal.kind, evidenceEventId: signal.evidenceEventId, priority: signal.kind === 'delegation' ? 4 : 3.5 })
}

function operationalResponse(presentations = []) {
  const candidates = presentations.map((model) => {
    const buildingId = PROFILE_BUILDINGS[model.profileId]
    const state = normalizeState(model)
    return buildingId ? { source: 'operational', buildingId, cue: state, state, priority: STATE_PRIORITY[state] ?? 0, evidenceEventId: model.evidenceEventId ?? null } : null
  }).filter(Boolean).sort((left, right) => right.priority - left.priority)
  return candidates[0]?.priority > 0 ? freeze(candidates[0]) : null
}

function pulseRouteFor(response) {
  if (!response) return null
  if (response.cue === 'record') return 'citadelToArchive'
  if (response.buildingId === 'forge') return 'citadelToForge'
  if (response.buildingId === 'watcher') return 'citadelToWatcher'
  if (response.buildingId === 'archive') return 'citadelToArchive'
  if (response.buildingId === 'sanctum') return 'archiveToSanctum'
  return 'gateToCitadel'
}

export function deriveEnvironmentalPresentation({ now = Date.now(), startedAt = now, visible = true, reducedMotion = false, layout = 'desktop', choreography = {}, operationalPresentations = [] } = {}) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const elapsed = Math.max(0, now - startedAt)
  const cycle = Math.floor(elapsed / 12_000)
  const buildingIds = Object.keys(ENVIRONMENT_BUILDINGS)
  const ambientBuildingIds = freeze(['citadel', buildingIds[1 + (cycle % (buildingIds.length - 1))]])
  const operational = operationalResponse(operationalPresentations)
  const choreographed = eventResponse(choreography)
  const response = !operational ? choreographed : !choreographed || operational.priority >= choreographed.priority ? operational : choreographed
  const alerting = response?.priority >= 5
  const ambientPulseCount = reducedMotion || !visible ? 0 : 1 + (cycle % 3)
  const routeIds = Object.keys(ENVIRONMENT_DATA_ROUTES)
  const ambientPulses = freeze(Array.from({ length: ambientPulseCount }, (_, index) => {
    const routeId = routeIds[(cycle + index) % routeIds.length]
    return freeze({ id: `ambient-${cycle}-${index}`, mode: 'ambient', routeId, points: ENVIRONMENT_DATA_ROUTES[routeId][normalizedLayout], delay: index * 2.1, duration: 8 + index * 1.4 })
  }))
  const responsePulse = response && visible ? freeze({
    id: `event-${response.evidenceEventId ?? response.buildingId}-${response.cue}`, mode: 'event', routeId: pulseRouteFor(response),
    points: ENVIRONMENT_DATA_ROUTES[pulseRouteFor(response)][normalizedLayout], cue: response.cue, state: response.state ?? null,
    evidenceEventId: response.evidenceEventId, duration: alerting ? 1.15 : 1.8,
  }) : null
  const intensity = !visible ? 0 : alerting ? 0.28 : response ? 0.52 : 1
  return freeze({
    running: visible, visible, reducedMotion, layout: normalizedLayout, entryActive: elapsed < 5_000, elapsed,
    ambientBuildingIds, activeBuildingIds: freeze([...new Set([...ambientBuildingIds, response?.buildingId].filter(Boolean))]),
    ambientPulses, responsePulse, response, ambientIntensity: intensity,
    particleCount: reducedMotion || !visible ? 0 : normalizedLayout === 'mobile' ? 8 : 10,
    performanceStatus: reducedMotion || !visible ? 'paused' : 'bounded',
  })
}

export function getEnvironmentalBuildingState(buildingId, presentation) {
  const config = ENVIRONMENT_BUILDINGS[buildingId]
  const response = presentation?.response?.buildingId === buildingId ? presentation.response : null
  return freeze({ config, ambientActive: presentation?.ambientBuildingIds?.includes(buildingId) ?? false, response })
}

export function resolveBuildingIdForProfile(profileId) {
  return PROFILE_BUILDINGS[profileId] ?? getAgentDefinition(profileId)?.buildingId ?? null
}
