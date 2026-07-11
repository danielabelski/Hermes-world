const freeze = Object.freeze
const node = (id, xPercent, yPercent, kind = 'path') => freeze({
  id,
  x: xPercent / 10,
  y: yPercent / 10,
  xPercent,
  yPercent,
  kind,
})

export const DESKTOP_MAP_NODES = freeze({
  citadel_main_gate: node('citadel_main_gate', 46, 36.5, 'home'),
  citadel_front_plaza: node('citadel_front_plaza', 46, 39, 'plaza'),
  central_fountain_east: node('central_fountain_east', 54, 48, 'path'),
  archive_southwest_apron: node('archive_southwest_apron', 57, 54.5, 'path'),
  archive_south_apron: node('archive_south_apron', 66, 56.5, 'path'),
  forge_west_approach: node('forge_west_approach', 76, 51.5, 'safe'),
  forge_entrance: node('forge_entrance', 84, 49, 'entrance'),
  forge_workstation: node('forge_workstation', 84, 46.5, 'work'),
  library_plaza_junction: node('library_plaza_junction', 40, 36.2, 'path'),
  library_east_approach: node('library_east_approach', 34, 33.5, 'safe'),
  library_stair_approach: node('library_stair_approach', 30.2, 35.2, 'stairs'),
  library_entrance: node('library_entrance', 28.5, 36.5, 'entrance'),
  library_workstation: node('library_workstation', 27, 31, 'work'),
  observatory_path_west: node('observatory_path_west', 52, 35.5, 'path'),
  observatory_path_mid: node('observatory_path_mid', 58, 32.5, 'safe'),
  observatory_stair_approach: node('observatory_stair_approach', 63, 31, 'stairs'),
  north_wall_observation: node('north_wall_observation', 67, 31.5, 'observation'),
  default_desktop_home: node('default_desktop_home', 47, 83.5, 'home'),
  default_desktop_safe: node('default_desktop_safe', 47.5, 82, 'safe'),
  default_desktop_work: node('default_desktop_work', 48, 80.5, 'work'),
  developer_desktop_home: node('developer_desktop_home', 34, 76, 'home'),
  developer_desktop_safe: node('developer_desktop_safe', 32, 78, 'safe'),
  developer_desktop_work: node('developer_desktop_work', 30, 80.5, 'work'),
  devops_desktop_home: node('devops_desktop_home', 69, 80, 'home'),
  devops_desktop_safe: node('devops_desktop_safe', 71, 78, 'safe'),
  devops_desktop_work: node('devops_desktop_work', 73, 75.5, 'work'),
  komandos_desktop_home: node('komandos_desktop_home', 72, 58.5, 'home'),
  komandos_desktop_safe: node('komandos_desktop_safe', 71, 56.5, 'safe'),
  komandos_desktop_work: node('komandos_desktop_work', 70, 54.5, 'work'),
  orchestrator_desktop_home: node('orchestrator_desktop_home', 46, 39, 'home'),
  orchestrator_desktop_safe: node('orchestrator_desktop_safe', 46, 37.8, 'safe'),
  orchestrator_desktop_work: node('orchestrator_desktop_work', 46, 36.5, 'work'),
  outreach_desktop_home: node('outreach_desktop_home', 70, 35.5, 'home'),
  outreach_desktop_safe: node('outreach_desktop_safe', 73, 35.8, 'safe'),
  outreach_desktop_work: node('outreach_desktop_work', 76, 36.2, 'work'),
  reviewer_desktop_home: node('reviewer_desktop_home', 60, 52, 'home'),
  reviewer_desktop_safe: node('reviewer_desktop_safe', 63.5, 53.5, 'safe'),
  reviewer_desktop_work: node('reviewer_desktop_work', 67, 55, 'work'),
  synthesizer_desktop_home: node('synthesizer_desktop_home', 37, 54, 'home'),
  synthesizer_desktop_safe: node('synthesizer_desktop_safe', 34, 56, 'safe'),
  synthesizer_desktop_work: node('synthesizer_desktop_work', 31, 58, 'work'),
  verifier_desktop_home: node('verifier_desktop_home', 44, 52, 'home'),
  verifier_desktop_safe: node('verifier_desktop_safe', 41, 52, 'safe'),
  verifier_desktop_work: node('verifier_desktop_work', 38, 51.5, 'work'),
})

export const MOBILE_MAP_NODES = freeze({
  mobile_central_south_plaza: node('mobile_central_south_plaza', 50, 65.5, 'home'),
  mobile_fountain_south_split: node('mobile_fountain_south_split', 50, 63.5, 'path'),
  mobile_fountain_sw_bypass: node('mobile_fountain_sw_bypass', 45.5, 63, 'path'),
  mobile_forge_lower_lane: node('mobile_forge_lower_lane', 40.5, 59.3, 'safe'),
  mobile_forge_stairs: node('mobile_forge_stairs', 35.2, 53.5, 'stairs'),
  mobile_forge_entrance: node('mobile_forge_entrance', 30.5, 49.2, 'entrance'),
  mobile_forge_workstation: node('mobile_forge_workstation', 23.5, 44.5, 'work'),
  mobile_library_dispatch: node('mobile_library_dispatch', 50, 62.8, 'home'),
  mobile_library_lane_junction: node('mobile_library_lane_junction', 44.5, 64, 'path'),
  mobile_library_approach: node('mobile_library_approach', 39.5, 67, 'safe'),
  mobile_library_stairs: node('mobile_library_stairs', 37, 69.2, 'stairs'),
  mobile_library_entrance: node('mobile_library_entrance', 35.5, 70.5, 'entrance'),
  mobile_library_workstation: node('mobile_library_workstation', 24.5, 65.5, 'work'),
  mobile_fountain_se_lane: node('mobile_fountain_se_lane', 56.5, 65.8, 'path'),
  mobile_observation_west_approach: node('mobile_observation_west_approach', 61.5, 68.2, 'safe'),
  mobile_observation_steps: node('mobile_observation_steps', 64, 70, 'stairs'),
  mobile_east_observation_point: node('mobile_east_observation_point', 65.5, 71.2, 'observation'),
  default_mobile_home: node('default_mobile_home', 50, 81.5, 'home'),
  default_mobile_safe: node('default_mobile_safe', 50, 79, 'safe'),
  default_mobile_work: node('default_mobile_work', 50, 76.5, 'work'),
  developer_mobile_home: node('developer_mobile_home', 41, 84, 'home'),
  developer_mobile_safe: node('developer_mobile_safe', 39, 82, 'safe'),
  developer_mobile_work: node('developer_mobile_work', 36.5, 80.5, 'work'),
  devops_mobile_home: node('devops_mobile_home', 59, 82, 'home'),
  devops_mobile_safe: node('devops_mobile_safe', 62, 78, 'safe'),
  devops_mobile_work: node('devops_mobile_work', 65, 74, 'work'),
  komandos_mobile_home: node('komandos_mobile_home', 67, 54.5, 'home'),
  komandos_mobile_safe: node('komandos_mobile_safe', 69, 52.5, 'safe'),
  komandos_mobile_work: node('komandos_mobile_work', 72, 50, 'work'),
  orchestrator_mobile_home: node('orchestrator_mobile_home', 50, 45, 'home'),
  orchestrator_mobile_safe: node('orchestrator_mobile_safe', 50, 44, 'safe'),
  orchestrator_mobile_work: node('orchestrator_mobile_work', 50, 43, 'work'),
  outreach_mobile_home: node('outreach_mobile_home', 72, 73, 'home'),
  outreach_mobile_safe: node('outreach_mobile_safe', 68, 71, 'safe'),
  outreach_mobile_work: node('outreach_mobile_work', 64, 70, 'work'),
  reviewer_mobile_home: node('reviewer_mobile_home', 66, 62, 'home'),
  reviewer_mobile_safe: node('reviewer_mobile_safe', 69, 64, 'safe'),
  reviewer_mobile_work: node('reviewer_mobile_work', 72, 66, 'work'),
  synthesizer_mobile_home: node('synthesizer_mobile_home', 39, 56, 'home'),
  synthesizer_mobile_safe: node('synthesizer_mobile_safe', 36, 58, 'safe'),
  synthesizer_mobile_work: node('synthesizer_mobile_work', 34, 60, 'work'),
  verifier_mobile_home: node('verifier_mobile_home', 42, 68, 'home'),
  verifier_mobile_safe: node('verifier_mobile_safe', 40, 71, 'safe'),
  verifier_mobile_work: node('verifier_mobile_work', 38, 74, 'work'),
})

const route = ({
  profile,
  buildingId,
  home,
  outbound,
  entrance,
  work,
  safe,
  laneOffset = 0,
  walkDurationMs,
  arriveDurationMs = 700,
  workDurationMs,
  successDurationMs = 1_800,
  workEffect,
  workVisibility = 'world',
  entranceVisibilityThreshold = 0.62,
}) => freeze({
  profile,
  buildingId,
  homeNodeId: home,
  dispatchNodeId: home,
  outboundNodeIds: freeze([...outbound]),
  returnNodeIds: freeze([...outbound].reverse()),
  entranceNodeId: entrance,
  workNodeId: work,
  safeBlockedNodeId: safe,
  laneOffset,
  walkDurationMs,
  arriveDurationMs,
  workDurationMs,
  successDurationMs,
  workEffect,
  workVisibility,
  entranceVisibilityThreshold,
})

export const MAP_ROUTE_DEFINITIONS = freeze({
  desktop: freeze({
    coder: route({
      profile: 'coder', buildingId: 'forge', home: 'citadel_main_gate',
      outbound: ['citadel_main_gate', 'citadel_front_plaza', 'central_fountain_east', 'archive_southwest_apron', 'archive_south_apron', 'forge_west_approach', 'forge_entrance'],
      entrance: 'forge_entrance', work: 'forge_workstation', safe: 'forge_west_approach',
      laneOffset: -0.15, walkDurationMs: 6_400, workDurationMs: 6_800, workEffect: 'forge-fire', workVisibility: 'inside',
    }),
    researcher: route({
      profile: 'researcher', buildingId: 'library', home: 'citadel_main_gate',
      outbound: ['citadel_main_gate', 'library_plaza_junction', 'library_east_approach', 'library_stair_approach', 'library_entrance'],
      entrance: 'library_entrance', work: 'library_workstation', safe: 'library_east_approach',
      laneOffset: 0.15, walkDurationMs: 5_900, workDurationMs: 7_200, workEffect: 'archive-pulse', workVisibility: 'inside',
    }),
    prospecting: route({
      profile: 'prospecting', buildingId: 'scout-lodge', home: 'observatory_path_west',
      outbound: ['observatory_path_west', 'observatory_path_mid', 'observatory_stair_approach', 'north_wall_observation'],
      entrance: 'north_wall_observation', work: 'north_wall_observation', safe: 'observatory_path_mid',
      laneOffset: 0.18, walkDurationMs: 7_000, arriveDurationMs: 900, workDurationMs: 4_200, successDurationMs: 1_500, workEffect: 'scout-signal',
    }),
  }),
  mobile: freeze({
    coder: route({
      profile: 'coder', buildingId: 'forge', home: 'mobile_central_south_plaza',
      outbound: ['mobile_central_south_plaza', 'mobile_fountain_south_split', 'mobile_fountain_sw_bypass', 'mobile_forge_lower_lane', 'mobile_forge_stairs', 'mobile_forge_entrance'],
      entrance: 'mobile_forge_entrance', work: 'mobile_forge_workstation', safe: 'mobile_forge_lower_lane',
      laneOffset: -0.15, walkDurationMs: 6_400, workDurationMs: 6_800, workEffect: 'forge-fire', workVisibility: 'inside',
    }),
    researcher: route({
      profile: 'researcher', buildingId: 'library', home: 'mobile_library_lane_junction',
      outbound: ['mobile_library_lane_junction', 'mobile_library_approach', 'mobile_library_stairs', 'mobile_library_entrance'],
      entrance: 'mobile_library_entrance', work: 'mobile_library_workstation', safe: 'mobile_library_approach',
      laneOffset: 0.15, walkDurationMs: 5_900, workDurationMs: 7_200, workEffect: 'archive-pulse', workVisibility: 'inside',
    }),
    prospecting: route({
      profile: 'prospecting', buildingId: 'scout-lodge', home: 'mobile_fountain_se_lane',
      outbound: ['mobile_fountain_se_lane', 'mobile_observation_west_approach', 'mobile_observation_steps', 'mobile_east_observation_point'],
      entrance: 'mobile_east_observation_point', work: 'mobile_east_observation_point', safe: 'mobile_observation_west_approach',
      laneOffset: 0.18, walkDurationMs: 7_000, arriveDurationMs: 900, workDurationMs: 4_200, successDurationMs: 1_500, workEffect: 'scout-signal',
    }),
  }),
})

const AMBIENT_PROFILES = freeze(['default', 'developer', 'devops', 'komandos', 'orchestrator', 'outreach', 'reviewer', 'synthesizer', 'verifier'])
const ambientRoutesFor = (layout) => freeze(Object.fromEntries(AMBIENT_PROFILES.map((profile) => {
  const home = `${profile}_${layout}_home`
  const safe = `${profile}_${layout}_safe`
  const work = `${profile}_${layout}_work`
  return [profile, route({
    profile,
    buildingId: profile,
    home,
    outbound: [home, safe, work],
    entrance: work,
    work,
    safe,
    laneOffset: 0,
    walkDurationMs: 5_200,
    arriveDurationMs: 500,
    workDurationMs: 5_600,
    successDurationMs: 1_300,
    workEffect: 'working',
  })]
})))

export const MAP_AMBIENT_ROUTE_DEFINITIONS = freeze({
  desktop: ambientRoutesFor('desktop'),
  mobile: ambientRoutesFor('mobile'),
})
export function getMapNodes(layout = 'desktop') {
  return layout === 'mobile' ? MOBILE_MAP_NODES : DESKTOP_MAP_NODES
}

export function getMapRouteDefinition(profile, layout = 'desktop') {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  return MAP_ROUTE_DEFINITIONS[normalizedLayout]?.[profile] ?? MAP_AMBIENT_ROUTE_DEFINITIONS[normalizedLayout]?.[profile] ?? null
}
