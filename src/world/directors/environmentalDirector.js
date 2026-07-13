import { resolveWorldSubsystem } from './profileSubsystemMap.js'

const freeze = Object.freeze
const point = (x, y) => freeze({ x, y })
const building = (definition) => freeze({ enabled: true, ...definition })

export const ENVIRONMENT_BUILDINGS = freeze({
  citadel: building({
    buildingId: 'citadel', agentProfile: 'orchestrator', ambientEffects: freeze(['core-breath', 'energy-wave', 'facade-runes']),
    eventResponses: freeze(['thinking', 'working', 'waiting', 'warning', 'critical']), intensity: 0.72, timingOffset: 0,
    points: freeze({ desktop: point(46, 34), mobile: point(50, 43) }),
  }),
  forge: building({
    buildingId: 'forge', agentProfile: 'coder', ambientEffects: freeze(['ember', 'smoke', 'sparks', 'mechanism']),
    eventResponses: freeze(['working', 'waiting', 'success', 'warning', 'critical']), intensity: 0.74, timingOffset: 1.7,
    points: freeze({ desktop: point(84, 46.5), mobile: point(23.5, 44.5) }),
  }),
  watcher: building({
    buildingId: 'watcher', agentProfile: 'prospecting', ambientEffects: freeze(['scanner', 'lens-pulse']),
    eventResponses: freeze(['thinking', 'working', 'waiting', 'warning', 'critical']), intensity: 0.58, timingOffset: 3.2,
    points: freeze({ desktop: point(67, 31.5), mobile: point(65.5, 71.2) }),
  }),
  archive: building({
    buildingId: 'archive', agentProfile: 'researcher', ambientEffects: freeze(['window-sequence', 'information-runes']),
    eventResponses: freeze(['thinking', 'working', 'waiting', 'success', 'warning', 'critical']), intensity: 0.62, timingOffset: 4.6,
    points: freeze({ desktop: point(27, 31), mobile: point(24.5, 65.5) }),
  }),
  sanctum: building({
    buildingId: 'sanctum', agentProfile: null, ambientEffects: freeze(['energy-orbit', 'channel-circulation']),
    eventResponses: freeze(['waiting', 'warning', 'critical']), intensity: 0.5, timingOffset: 6.1,
    points: freeze({ desktop: point(39, 76), mobile: point(72, 80) }),
  }),
  gate: building({
    buildingId: 'gate', agentProfile: 'komandos', ambientEffects: freeze(['energy-lock', 'ward-idle-cycle']),
    eventResponses: freeze(['working', 'waiting', 'warning', 'critical']), intensity: 0.46, timingOffset: 7.4,
    points: freeze({ desktop: point(50, 88.5), mobile: point(50, 88.5) }),
  }),
})

export const ENVIRONMENT_VISUAL_STEPS = freeze([
  freeze({ id: 'citadel-core', label: 'Citadel core', points: freeze({ desktop: point(46, 34), mobile: point(50, 43) }) }),
  freeze({ id: 'forge-cycle', label: 'Forge fire + smoke', points: freeze({ desktop: point(84, 46.5), mobile: point(23.5, 44.5) }) }),
  freeze({ id: 'watcher-lens', label: 'Watcher lens', points: freeze({ desktop: point(67, 31.5), mobile: point(65.5, 71.2) }) }),
  freeze({ id: 'archive-windows', label: 'Archive windows', points: freeze({ desktop: point(27, 31), mobile: point(24.5, 65.5) }) }),
  freeze({ id: 'sanctum-orbit', label: 'Sanctum orbit', points: freeze({ desktop: point(39, 76), mobile: point(72, 80) }) }),
  freeze({ id: 'gate-lock', label: 'Gate lock', points: freeze({ desktop: point(50, 88.5), mobile: point(50, 88.5) }) }),
  freeze({ id: 'water-reflection', label: 'Water reflection', points: freeze({ desktop: point(50, 47), mobile: point(50, 56) }) }),
  freeze({ id: 'fog', label: 'Fog', points: freeze({ desktop: point(27, 29), mobile: point(47, 32) }) }),
])

export const ENVIRONMENT_PERSISTENT_EFFECTS = freeze(['citadel', 'forge', 'watcher', 'archive', 'sanctum', 'gate', 'water'])

const STATE_PRIORITY = freeze({ critical: 6, error: 6, warning: 5, alerted: 5, working: 3, work: 3, thinking: 2, waiting: 1, idle: 0, resting: 0 })
const normalizeState = (model = {}) => String(model.severity === 'critical' || model.severity === 'error' ? 'critical' : model.severity === 'warning' ? 'warning' : model.phase ?? model.visualState ?? 'idle').toLowerCase()

function buildingForSignal(signal = {}) {
  if (signal.kind === 'archive-record') return 'archive'
  if (signal.kind === 'message-pulse' || signal.kind === 'command-core') return 'citadel'
  return resolveWorldSubsystem(signal.targetAgentId, signal.buildingId)
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
    const buildingId = resolveWorldSubsystem(model.profileId, model.buildingId)
    const state = normalizeState(model)
    return buildingId ? { source: 'operational', buildingId, cue: state, state, priority: STATE_PRIORITY[state] ?? 0, evidenceEventId: model.evidenceEventId ?? null } : null
  }).filter(Boolean).sort((left, right) => right.priority - left.priority)
  return candidates[0]?.priority > 0 ? freeze(candidates[0]) : null
}

export function deriveEnvironmentalPresentation({ now = Date.now(), startedAt = now, visible = true, reducedMotion = false, visualDebug = false, layout = 'desktop', choreography = {}, operationalPresentations = [], lifecycle = {} } = {}) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const elapsed = Math.max(0, now - startedAt)
  const connected = !['offline', 'stale'].includes(lifecycle.connection)
  const operational = connected ? operationalResponse(operationalPresentations) : null
  const choreographed = connected ? eventResponse(choreography) : null
  const response = !operational ? choreographed : !choreographed || operational.priority >= choreographed.priority ? operational : choreographed
  const alerting = response?.priority >= 5
  const intensity = !visible ? 0 : alerting ? 0.28 : response ? 0.52 : 1
  const visualElapsed = Math.max(0, elapsed)
  const visualStepIndex = visualDebug && visualElapsed < 15_000 ? Math.min(ENVIRONMENT_VISUAL_STEPS.length - 1, Math.floor(visualElapsed / (15_000 / ENVIRONMENT_VISUAL_STEPS.length))) : -1
  const visualVerification = visualStepIndex >= 0 ? freeze({ ...ENVIRONMENT_VISUAL_STEPS[visualStepIndex], index: visualStepIndex, point: ENVIRONMENT_VISUAL_STEPS[visualStepIndex].points[normalizedLayout] }) : null
  return freeze({
    running: visible, visible, reducedMotion, layout: normalizedLayout, entryActive: elapsed < 5_000, elapsed,
    persistentEffectIds: ENVIRONMENT_PERSISTENT_EFFECTS, response, ambientIntensity: intensity,
    atmosphereBandCount: reducedMotion || !visible ? 0 : 2,
    performanceStatus: !visible ? 'paused' : reducedMotion ? 'reduced-motion' : 'css-composited', visualVerification,
  })
}

export function getEnvironmentalBuildingState(buildingId, presentation) {
  const config = ENVIRONMENT_BUILDINGS[buildingId]
  const response = presentation?.response?.buildingId === buildingId ? presentation.response : null
  return freeze({ config, response })
}

export function resolveBuildingIdForProfile(profileId) {
  return resolveWorldSubsystem(profileId)
}
