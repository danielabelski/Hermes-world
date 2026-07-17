import { AGENT_DEFINITIONS } from './agentDefinitions.js'
import { AGENT_ART_DEFINITIONS } from './agentArtDefinitions.js'

const freeze = Object.freeze
const referenceSprites = new Set(Object.keys(AGENT_DEFINITIONS))
const BEHAVIOR_BY_PROFILE = freeze({
  default: 'courier', coder: 'building-worker', developer: 'building-worker', devops: 'monitoring',
  komandos: 'patrol', orchestrator: 'monitoring', outreach: 'courier', prospecting: 'patrol',
  researcher: 'research-worker', reviewer: 'monitoring', synthesizer: 'research-worker', verifier: 'monitoring',
})
const SCALE_BY_PROFILE = freeze({
  default: 0.92,
  coder: 0.84,
  developer: 0.84,
  devops: 0.84,
  komandos: 0.8,
  orchestrator: 0.8,
  outreach: 0.82,
  prospecting: 0.84,
  researcher: 0.82,
  reviewer: 0.86,
  synthesizer: 0.88,
  verifier: 0.84,
})
// `renderScale` normalizes the source canvases on every surface. This second
// value is deliberately map-only and compensates for the perceived area of a
// tiny silhouette without inflating the same sprite inside a cinematic room.
const MAP_VISIBILITY_SCALE_BY_PROFILE = freeze({
  coder: 1.1,
  komandos: 1.04,
  orchestrator: 1.06,
  outreach: 1.07,
  researcher: 1.03,
})
const MAP_TONE_BY_PROFILE = freeze({
  default: freeze({ saturation: 0.94, contrast: 1, brightness: 1.01 }),
  coder: freeze({ saturation: 1.02, contrast: 1.06, brightness: 1.035, edgeRadiusPx: 0.7, edgeColor: 'rgb(247 213 159 / .24)' }),
  developer: freeze({ saturation: 0.96, contrast: 1.01, brightness: 1.02 }),
  devops: freeze({ saturation: 0.98, contrast: 1.04, brightness: 1.04 }),
  komandos: freeze({ saturation: 0.98, contrast: 1.04, brightness: 1.04 }),
  orchestrator: freeze({ saturation: 1, contrast: 1.05, brightness: 1.05 }),
  outreach: freeze({ saturation: 1, contrast: 1.03, brightness: 1.03 }),
  prospecting: freeze({ saturation: 0.98, contrast: 1.04, brightness: 1.04 }),
  researcher: freeze({ saturation: 1, contrast: 1.04, brightness: 1.04, edgeRadiusPx: 0.55, edgeColor: 'rgb(244 211 146 / .18)' }),
  reviewer: freeze({ saturation: 0.96, contrast: 1.02, brightness: 1.02 }),
  synthesizer: freeze({ saturation: 1.02, contrast: 1.04, brightness: 1.03 }),
  verifier: freeze({ saturation: 1, contrast: 1.03, brightness: 1.03 }),
})
const MARKER_CONTENT_TOP_BY_PROFILE = freeze({
  coder: freeze({ alert: 26 / 128, blocked: 26 / 128, stuck: 26 / 128 }),
  devops: freeze({ alert: 24 / 128, blocked: 24 / 128, stuck: 24 / 128 }),
  researcher: freeze({ work: 30 / 128, thinking: 30 / 128, observe: 30 / 128, alert: 18 / 128, blocked: 18 / 128, stuck: 18 / 128 }),
  prospecting: freeze({ work: 41 / 128, alert: 43 / 128, blocked: 43 / 128, stuck: 43 / 128 }),
})
const SHADOW_BY_PROFILE = freeze({
  default: 0.76,
  coder: 1,
  developer: 0.82,
  devops: 0.88,
  komandos: 0.92,
  orchestrator: 0.84,
  outreach: 0.78,
  prospecting: 0.86,
  researcher: 0.9,
  reviewer: 0.8,
  synthesizer: 0.8,
  verifier: 0.84,
})
// Presentation-only spacing for silhouettes that share the same lower
// courtyard. Logical coordinates, routes and semantic nodes stay frozen.
const STATIONARY_CROWD_OFFSET_BY_PROFILE = freeze({
  outreach: freeze({ x: 4.2, y: -2.4 }),
  devops: freeze({ x: -2.8, y: 2.4 }),
})
const BEFORE_NORMALIZATION_SCALE_BY_PROFILE = freeze({
  default: 1,
  coder: 1.25,
  developer: 1.23,
  devops: 1.23,
  komandos: 1.37,
  orchestrator: 1.37,
  outreach: 1.26,
  prospecting: 1.23,
  researcher: 1.31,
  reviewer: 1.2,
  synthesizer: 1.17,
  verifier: 1.23,
})
const SPEED_BY_PROFILE = freeze({ coder: 0.86, researcher: 0.78, prospecting: 1.08, default: 1.05, outreach: 1.02, komandos: 0.9 })
const NAVIGATION_BY_PROFILE = freeze({
  coder: freeze({ homeNode: freeze({ desktop: 'citadel_main_gate', mobile: 'mobile_central_south_plaza' }), workNode: freeze({ desktop: 'forge_workstation', mobile: 'mobile_forge_workstation' }), routeId: 'forge-route' }),
  researcher: freeze({ homeNode: freeze({ desktop: 'citadel_main_gate', mobile: 'mobile_library_lane_junction' }), workNode: freeze({ desktop: 'library_workstation', mobile: 'mobile_library_workstation' }), routeId: 'library-route' }),
  prospecting: freeze({ homeNode: freeze({ desktop: 'observatory_path_west', mobile: 'mobile_fountain_se_lane' }), workNode: freeze({ desktop: 'north_wall_observation', mobile: 'mobile_east_observation_point' }), routeId: 'observation-route' }),
})

const createProfile = (id) => {
  const definition = AGENT_DEFINITIONS[id]
  const art = AGENT_ART_DEFINITIONS[id]
  const hasUniqueSprite = referenceSprites.has(id)
  const navigation = NAVIGATION_BY_PROFILE[id] ?? freeze({
    homeNode: freeze({ desktop: `${id}_desktop_home`, mobile: `${id}_mobile_home` }),
    workNode: freeze({ desktop: `${id}_desktop_work`, mobile: `${id}_mobile_work` }),
    routeId: `${id}-ambient-route`,
  })
  return freeze({
    id,
    role: art.role,
    spriteProfile: hasUniqueSprite ? id : 'fallback',
    isFallback: !hasUniqueSprite,
    behaviorType: BEHAVIOR_BY_PROFILE[id],
    renderScale: SCALE_BY_PROFILE[id] ?? 0.84,
    mapVisibilityScale: MAP_VISIBILITY_SCALE_BY_PROFILE[id] ?? 1,
    mapTone: MAP_TONE_BY_PROFILE[id] ?? MAP_TONE_BY_PROFILE.default,
    markerContentTopByState: MARKER_CONTENT_TOP_BY_PROFILE[id] ?? freeze({}),
    beforeNormalizationScale: BEFORE_NORMALIZATION_SCALE_BY_PROFILE[id] ?? 1,
    anchorCorrection: freeze({ x: 0, yPx: 0 }),
    shadowScale: SHADOW_BY_PROFILE[id] ?? 0.8,
    stationaryCrowdOffset: STATIONARY_CROWD_OFFSET_BY_PROFILE[id] ?? freeze({ x: 0, y: 0 }),
    movementSpeed: SPEED_BY_PROFILE[id] ?? 0.94,
    accent: definition.accentColor,
    homeNode: navigation.homeNode,
    workNode: navigation.workNode,
    routeId: navigation.routeId,
    statusMapping: freeze({ idle: 'idle', walking: 'walk', working: 'work', thinking: 'thinking', waiting: 'waiting', stuck: 'stuck', success: 'success', warning: 'alert', error: 'alert', offline: 'offline' }),
  })
}

export const MAP_AGENT_PROFILE_IDS = freeze(Object.keys(AGENT_DEFINITIONS))
export const MAP_AGENT_PROFILES = freeze(Object.fromEntries(MAP_AGENT_PROFILE_IDS.map((id) => [id, createProfile(id)])))
export const MAP_AGENT_FALLBACK_IDS = freeze(MAP_AGENT_PROFILE_IDS.filter((id) => MAP_AGENT_PROFILES[id].isFallback))

export function getMapAgentProfile(profile) {
  return MAP_AGENT_PROFILES[profile] ?? MAP_AGENT_PROFILES.default
}
