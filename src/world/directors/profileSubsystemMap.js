const freeze = Object.freeze

// Presentation-only ownership. It maps every accepted Hermes role and its
// existing district to one of the already-rendered infrastructure landmarks.
// It never changes task ownership, agent routing or operational state.
export const PROFILE_SUBSYSTEMS = freeze({
  default: 'citadel',
  orchestrator: 'citadel',
  coder: 'forge',
  developer: 'forge',
  devops: 'forge',
  komandos: 'gate',
  outreach: 'watcher',
  prospecting: 'watcher',
  researcher: 'archive',
  reviewer: 'archive',
  synthesizer: 'sanctum',
  verifier: 'archive',
})

export const BUILDING_SUBSYSTEMS = freeze({
  keep: 'citadel',
  citadel: 'citadel',
  watchtower: 'citadel',
  forge: 'forge',
  'builders-yard': 'forge',
  'siege-workshop': 'forge',
  barracks: 'gate',
  'herald-tower': 'watcher',
  watcher: 'watcher',
  'scout-lodge': 'watcher',
  library: 'archive',
  archive: 'archive',
  'inspection-hall': 'archive',
  'assay-office': 'archive',
  'alchemist-lab': 'sanctum',
  sanctum: 'sanctum',
  gate: 'gate',
})

export function resolveWorldSubsystem(profileId, buildingId = null) {
  return BUILDING_SUBSYSTEMS[buildingId] ?? PROFILE_SUBSYSTEMS[profileId] ?? null
}
