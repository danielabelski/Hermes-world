import { AGENT_DEFINITIONS } from './data/agentDefinitions.js'

const freeze = Object.freeze

// Demo-only visual QA placements. They never grant operational ownership of
// an interior and are intentionally kept separate from interiorAgentPresence.
const review = (profileId, buildingId, x, y, scale, direction = 'se', note = null) => freeze({
  profileId,
  displayName: AGENT_DEFINITIONS[profileId]?.displayName ?? profileId,
  buildingId,
  x,
  y,
  scale,
  direction,
  note,
})

export const INTERIOR_ROSTER_REVIEW = freeze([
  review('coder', 'forge', 36, 68, 1.24, 'nw'),
  review('developer', 'forge', 38, 70, 1.22, 'nw'),
  review('devops', 'forge', 38, 70, 1.22, 'nw'),
  review('researcher', 'archive', 51, 68, 1.24, 'ne'),
  review('reviewer', 'archive', 51, 70, 1.20, 'ne'),
  review('verifier', 'archive', 51, 70, 1.22, 'ne'),
  review('orchestrator', 'citadel', 50, 78, 1.20, 'ne'),
  review('default', 'citadel', 47, 79, 1.24, 'ne'),
  review('komandos', 'citadel', 50, 80, 1.40, 'ne', 'Sala testowa: docelowy subsystem ochrony nie ma jeszcze osobnego wnętrza.'),
  review('prospecting', 'watcher', 57, 78, 1.36, 'nw'),
  review('outreach', 'watcher', 57, 78, 1.38, 'nw'),
  review('synthesizer', 'sanctum', 50, 76, 1.22, 'ne'),
])

const byProfile = freeze(Object.fromEntries(INTERIOR_ROSTER_REVIEW.map((entry) => [entry.profileId, entry])))

export function resolveInteriorReviewProfile(value = 'coder') {
  return byProfile[value] ? value : INTERIOR_ROSTER_REVIEW[0].profileId
}

export function getInteriorReviewEntry(profileId = 'coder') {
  return byProfile[resolveInteriorReviewProfile(profileId)]
}

export function getInteriorReviewProfiles(buildingId) {
  return INTERIOR_ROSTER_REVIEW.filter((entry) => entry.buildingId === buildingId)
}

export function stepInteriorReviewProfile(profileId, delta = 1) {
  const current = INTERIOR_ROSTER_REVIEW.findIndex((entry) => entry.profileId === resolveInteriorReviewProfile(profileId))
  const next = (current + Number(delta || 0) + INTERIOR_ROSTER_REVIEW.length) % INTERIOR_ROSTER_REVIEW.length
  return INTERIOR_ROSTER_REVIEW[next].profileId
}
