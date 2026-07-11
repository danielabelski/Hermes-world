// Hermes Citadel pedestrian graph. Coordinates use the locked 10x10 world plane.
// Routes join visible road intersections and terminate at building entrances;
// agents must never interpolate directly across building footprints.
export const ROAD_NODES = Object.freeze({
  north: Object.freeze({ x: 5, y: 3.1 }),
  northWest: Object.freeze({ x: 3.65, y: 3.35 }),
  northEast: Object.freeze({ x: 6.45, y: 3.35 }),
  upperHub: Object.freeze({ x: 5, y: 4.75 }),
  libraryTurn: Object.freeze({ x: 3.4, y: 4.9 }),
  labTurn: Object.freeze({ x: 6.65, y: 4.9 }),
  middleHub: Object.freeze({ x: 5, y: 6.7 }),
  forgeTurn: Object.freeze({ x: 3.5, y: 6.95 }),
  assayTurn: Object.freeze({ x: 6.5, y: 6.95 }),
  lowerHub: Object.freeze({ x: 5, y: 8.65 }),
  builderTurn: Object.freeze({ x: 3.45, y: 8.9 }),
  barracksTurn: Object.freeze({ x: 6.65, y: 8.15 }),
  gate: Object.freeze({ x: 5, y: 9.85 }),
})

const point = (x, y) => Object.freeze({ x, y })
const points = (items) => Object.freeze(items.map((item) => point(item.x, item.y)))

const journey = ({ profile, buildingId, homePoint, dispatchPoint, entrancePoint, workPoint, outboundWaypoints, returnWaypoints, laneOffset = 0, walkDurationMs, arriveDurationMs = 700, workDurationMs, successDurationMs = 1_800, workEffect, workVisibility = 'world', entranceVisibilityThreshold = 0.62, safeBlockedPoint = null }) => Object.freeze({
  profile,
  buildingId,
  homePoint: point(homePoint.x, homePoint.y),
  dispatchPoint: point(dispatchPoint.x, dispatchPoint.y),
  entrancePoint: point(entrancePoint.x, entrancePoint.y),
  workPoint: point(workPoint.x, workPoint.y),
  outboundWaypoints: points(outboundWaypoints),
  returnWaypoints: points(returnWaypoints),
  laneOffset,
  walkDurationMs,
  arriveDurationMs,
  workDurationMs,
  successDurationMs,
  workEffect,
  workVisibility,
  entranceVisibilityThreshold,
  safeBlockedPoint: point((safeBlockedPoint ?? dispatchPoint).x, (safeBlockedPoint ?? dispatchPoint).y),
})

/**
 * Approved vertical-slice journeys. They extend the existing road graph and
 * are presentation data only: live Hermes task/log state decides when a
 * journey begins, never this file.
 */
export const WORLD_LIFE_JOURNEYS = Object.freeze({
  coder: journey({
    profile: 'coder', buildingId: 'forge',
    homePoint: ROAD_NODES.middleHub, dispatchPoint: ROAD_NODES.middleHub,
    entrancePoint: point(2.35, 6.65), workPoint: point(2.2, 6.2),
    outboundWaypoints: [ROAD_NODES.middleHub, point(4.25, 6.84), ROAD_NODES.forgeTurn, point(2.35, 6.65)],
    returnWaypoints: [point(2.35, 6.65), ROAD_NODES.forgeTurn, ROAD_NODES.middleHub],
    safeBlockedPoint: ROAD_NODES.forgeTurn,
    laneOffset: -0.045, walkDurationMs: 6_400, workDurationMs: 6_800, workEffect: 'forge-fire', workVisibility: 'inside',
  }),
  researcher: journey({
    profile: 'researcher', buildingId: 'library',
    homePoint: ROAD_NODES.upperHub, dispatchPoint: ROAD_NODES.upperHub,
    entrancePoint: point(2.35, 4.65), workPoint: point(2.15, 4.15),
    outboundWaypoints: [ROAD_NODES.upperHub, point(4.25, 4.82), ROAD_NODES.libraryTurn, point(2.35, 4.65)],
    returnWaypoints: [point(2.35, 4.65), ROAD_NODES.libraryTurn, ROAD_NODES.upperHub],
    safeBlockedPoint: ROAD_NODES.libraryTurn,
    laneOffset: 0.04, walkDurationMs: 5_900, workDurationMs: 7_200, workEffect: 'archive-pulse', workVisibility: 'inside',
  }),
  prospecting: journey({
    profile: 'prospecting', buildingId: 'scout-lodge',
    homePoint: point(2.25, 2.7), dispatchPoint: point(2.25, 2.7),
    entrancePoint: point(4.45, 2.85), workPoint: point(4.45, 2.85),
    outboundWaypoints: [point(2.25, 2.7), ROAD_NODES.northWest, point(3.9, 2.55), point(4.45, 2.85)],
    returnWaypoints: [point(4.45, 2.85), point(3.9, 2.55), ROAD_NODES.northWest, point(2.25, 2.7)],
    safeBlockedPoint: ROAD_NODES.northWest,
    laneOffset: 0.055, walkDurationMs: 7_000, arriveDurationMs: 900, workDurationMs: 4_200, successDurationMs: 1_500, workEffect: 'scout-signal',
  }),
})

/**
 * The locked mobile artwork is a distinct composition, not a crop of desktop.
 * These presentation-only routes follow its visible plazas, stairs and doors.
 */
export const MOBILE_WORLD_LIFE_JOURNEYS = Object.freeze({
  coder: journey({
    profile: 'coder', buildingId: 'forge',
    homePoint: point(5, 6.55), dispatchPoint: point(5, 6.55),
    entrancePoint: point(3.22, 4.72), workPoint: point(2.35, 4.45),
    outboundWaypoints: [point(5, 6.55), point(5, 6.05), point(4.4, 5.55), point(3.75, 5.05), point(3.22, 4.72)],
    returnWaypoints: [point(3.22, 4.72), point(3.75, 5.05), point(4.4, 5.55), point(5, 6.05), point(5, 6.55)],
    safeBlockedPoint: point(4.4, 5.55),
    laneOffset: -0.025, walkDurationMs: 6_400, workDurationMs: 6_800, workEffect: 'forge-fire', workVisibility: 'inside',
  }),
  researcher: journey({
    profile: 'researcher', buildingId: 'library',
    homePoint: point(5, 6.25), dispatchPoint: point(5, 6.25),
    entrancePoint: point(3.11, 6.86), workPoint: point(2.45, 6.55),
    outboundWaypoints: [point(5, 6.25), point(4.45, 6.35), point(3.9, 6.55), point(3.11, 6.86)],
    returnWaypoints: [point(3.11, 6.86), point(3.9, 6.55), point(4.45, 6.35), point(5, 6.25)],
    safeBlockedPoint: point(3.9, 6.55),
    laneOffset: 0.025, walkDurationMs: 5_900, workDurationMs: 7_200, workEffect: 'archive-pulse', workVisibility: 'inside',
  }),
  prospecting: journey({
    profile: 'prospecting', buildingId: 'scout-lodge',
    homePoint: point(5, 6.55), dispatchPoint: point(5, 6.55),
    entrancePoint: point(7.1, 7.1), workPoint: point(7.1, 7.1),
    outboundWaypoints: [point(5, 6.55), point(5.7, 6.7), point(6.4, 6.9), point(7.1, 7.1)],
    returnWaypoints: [point(7.1, 7.1), point(6.4, 6.9), point(5.7, 6.7), point(5, 6.55)],
    safeBlockedPoint: point(6.4, 6.9),
    laneOffset: 0.025, walkDurationMs: 7_000, arriveDurationMs: 900, workDurationMs: 4_200, successDurationMs: 1_500, workEffect: 'scout-signal',
  }),
})
export const AGENT_ROAD_ROUTES = Object.freeze({
  orchestrator: Object.freeze([ROAD_NODES.middleHub, ROAD_NODES.upperHub, ROAD_NODES.north, point(5, 3.1)]),
  // Showcase route: the coder receives a package at the central junction,
  // follows the western paved lane, reaches the Forge door and only then
  // crosses the threshold to the work anchor.
  coder: Object.freeze([ROAD_NODES.middleHub, ROAD_NODES.forgeTurn, point(2.35, 6.65), point(2.2, 6.2)]),
  researcher: Object.freeze([ROAD_NODES.upperHub, ROAD_NODES.libraryTurn, point(2.35, 4.65), point(2.15, 4.15)]),
  synthesizer: Object.freeze([ROAD_NODES.upperHub, ROAD_NODES.labTurn, point(7.65, 4.65), point(7.85, 4.2)]),
  reviewer: Object.freeze([ROAD_NODES.forgeTurn, ROAD_NODES.middleHub, point(5, 6.7), point(5.15, 6.2)]),
  verifier: Object.freeze([ROAD_NODES.middleHub, ROAD_NODES.assayTurn, point(7.65, 6.65), point(7.85, 6.2)]),
  developer: Object.freeze([ROAD_NODES.lowerHub, ROAD_NODES.builderTurn, point(2.35, 8.65), point(2.2, 7.85)]),
  devops: Object.freeze([ROAD_NODES.middleHub, ROAD_NODES.lowerHub, point(5, 9.55), point(5.2, 8.7)]),
  komandos: Object.freeze([ROAD_NODES.lowerHub, ROAD_NODES.barracksTurn, point(7.65, 7.65), point(7.8, 6.8)]),
  outreach: Object.freeze([ROAD_NODES.north, ROAD_NODES.northEast, point(7.75, 2.7), point(8.3, 2.3)]),
  prospecting: Object.freeze([ROAD_NODES.north, ROAD_NODES.northWest, point(2.25, 2.7), point(1.75, 2.3)]),
  default: Object.freeze([ROAD_NODES.middleHub, ROAD_NODES.lowerHub, point(4.1, 9.35), point(5.25, 7.7)]),
})

export function getAgentRoadRoute(profile, reverse = false) {
  const approvedJourney = WORLD_LIFE_JOURNEYS[profile]
  const route = approvedJourney
    ? (reverse ? approvedJourney.returnWaypoints : approvedJourney.outboundWaypoints)
    : AGENT_ROAD_ROUTES[profile] ?? [ROAD_NODES.lowerHub, ROAD_NODES.middleHub]
  if (approvedJourney) return [...route]
  return reverse ? [...route].reverse() : [...route]
}

export function getWorldLifeJourney(profile, layout = 'desktop') {
  const journeys = layout === 'mobile' ? MOBILE_WORLD_LIFE_JOURNEYS : WORLD_LIFE_JOURNEYS
  return journeys[profile] ?? null
}
