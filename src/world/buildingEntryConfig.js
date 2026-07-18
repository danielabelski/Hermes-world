import { getMapNodes } from './data/mapNavigation.js'

const freeze = Object.freeze
const nodeEntry = (definition) => freeze({ enabled: true, anchorKind: 'semantic-node', ...definition })
const landmarkEntry = (definition) => freeze({ enabled: true, anchorKind: 'verified-landmark', ...definition })

// One interaction registry bridges the canonical snapshot IDs, the visible
// map labels and the six environmental subsystems. It does not alter routing.
export const BUILDING_INTERIOR_CONFIG = freeze({
  forge: nodeEntry({
    buildingId: 'forge', subsystemId: 'forge', label: 'Kuźnia', title: 'Kuźnia Systemowa', agentProfile: 'coder',
    canonicalBuildingIds: freeze(['forge', 'builders-yard', 'siege-workshop']), ariaLabel: 'Wejdź do Kuźni Systemowej',
    hitWidth: 52, hitHeight: 62, nodes: freeze({ desktop: 'forge_entrance', mobile: 'mobile_forge_entrance' }),
  }),
  archive: nodeEntry({
    buildingId: 'archive', subsystemId: 'archive', label: 'Archiwum', title: 'Archiwum Wiedzy', agentProfile: 'researcher',
    canonicalBuildingIds: freeze(['library', 'inspection-hall', 'assay-office']), ariaLabel: 'Wejdź do Archiwum Wiedzy',
    hitWidth: 54, hitHeight: 62, nodes: freeze({ desktop: 'library_entrance', mobile: 'mobile_library_entrance' }),
  }),
  citadel: nodeEntry({
    buildingId: 'citadel', subsystemId: 'citadel', label: 'Cytadela', title: 'Komnata Dowodzenia', agentProfile: 'orchestrator',
    canonicalBuildingIds: freeze(['keep', 'watchtower']), ariaLabel: 'Wejdź do Komnaty Dowodzenia Cytadeli',
    hitWidth: 58, hitHeight: 66, nodes: freeze({ desktop: 'citadel_main_gate', mobile: 'orchestrator_mobile_work' }),
  }),
  watcher: nodeEntry({
    buildingId: 'watcher', subsystemId: 'watcher', label: 'Obserwatorium', title: 'Obserwatorium Watchera', agentProfile: 'prospecting',
    canonicalBuildingIds: freeze(['scout-lodge', 'herald-tower']), ariaLabel: 'Otwórz Obserwatorium Watchera',
    hitWidth: 56, hitHeight: 60, nodes: freeze({ desktop: 'north_wall_observation', mobile: 'mobile_east_observation_point' }),
  }),
  sanctum: landmarkEntry({
    buildingId: 'sanctum', subsystemId: 'sanctum', label: 'Sanctum', title: 'Sanctum Regeneracji', agentProfile: 'synthesizer',
    canonicalBuildingIds: freeze(['alchemist-lab']), ariaLabel: 'Wejdź do Sanctum Regeneracji', hitWidth: 56, hitHeight: 62,
    points: freeze({ desktop: freeze({ xPercent: 39, yPercent: 76 }), mobile: freeze({ xPercent: 72, yPercent: 80 }) }),
  }),
})

export const BUILDING_INTERIOR_IDS = freeze(Object.keys(BUILDING_INTERIOR_CONFIG))

// Each interior refreshes only the telemetry it actually presents. This keeps
// entry fast on mobile while ensuring a re-open never waits for the global
// 15/60 second polling cadence.
export const BUILDING_DATA_DOMAINS = freeze({
  forge: freeze(['metrics', 'tasks', 'logs']),
  archive: freeze(['memory', 'logs', 'tasks', 'cronHistory']),
  citadel: freeze(['profiles', 'sessions', 'tasks']),
  watcher: freeze(['crons', 'cronHistory', 'logs']),
  sanctum: freeze(['metrics', 'logs', 'tasks']),
})

export function getBuildingRefreshDomains(buildingId) {
  return BUILDING_DATA_DOMAINS[buildingId] ?? freeze([])
}

export function resolveBuildingEntry(buildingId, layout = 'desktop') {
  const config = BUILDING_INTERIOR_CONFIG[buildingId]
  if (!config?.enabled) return null
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  if (config.nodes) {
    const nodeId = config.nodes[normalizedLayout]
    const point = getMapNodes(normalizedLayout)[nodeId]
    if (!point) return null
    return freeze({ ...config, layout: normalizedLayout, nodeId, xPercent: point.xPercent, yPercent: point.yPercent })
  }
  const point = config.points?.[normalizedLayout]
  if (!point) return null
  return freeze({ ...config, layout: normalizedLayout, nodeId: `${buildingId}_${normalizedLayout}_landmark`, ...point })
}
