import { AGENT_DEFINITIONS } from './agentDefinitions.js'
import { AGENT_ART_DEFINITIONS } from './agentArtDefinitions.js'

const freeze = Object.freeze
const referenceSprites = new Set(Object.keys(AGENT_DEFINITIONS))
const BEHAVIOR_BY_PROFILE = freeze({
  default: 'courier', coder: 'building-worker', developer: 'building-worker', devops: 'monitoring',
  komandos: 'patrol', orchestrator: 'monitoring', outreach: 'courier', prospecting: 'patrol',
  researcher: 'research-worker', reviewer: 'monitoring', synthesizer: 'research-worker', verifier: 'monitoring',
})
const SCALE_BY_PROFILE = freeze({ coder: 1, researcher: 1, prospecting: 1, orchestrator: 1.02, komandos: 1.02, default: 0.92 })
const SHADOW_BY_PROFILE = freeze({ coder: 1, researcher: 0.86, prospecting: 0.86, default: 0.78 })
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
    renderScale: SCALE_BY_PROFILE[id] ?? 0.96,
    anchorCorrection: freeze({ x: 0, yPx: 0 }),
    shadowScale: SHADOW_BY_PROFILE[id] ?? SHADOW_BY_PROFILE.default,
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
