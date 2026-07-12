import { getMapNodes, getMapRouteDefinition } from './mapNavigation.js'

const freeze = Object.freeze
const point = (source) => freeze({ x: source.x, y: source.y })
const pointsFor = (nodes, ids) => freeze(ids.map((id) => point(nodes[id])))

function journeyFromNavigation(profile, layout) {
  const definition = getMapRouteDefinition(profile, layout)
  if (!definition) return null
  const nodes = getMapNodes(layout)
  const resolve = (id) => {
    const resolved = nodes[id]
    if (!resolved) throw new Error(`Unknown ${layout} navigation node: ${id}`)
    return resolved
  }
  return freeze({
    profile,
    layout,
    buildingId: definition.buildingId,
    homeNodeId: definition.homeNodeId,
    dispatchNodeId: definition.dispatchNodeId,
    entranceNodeId: definition.entranceNodeId,
    workNodeId: definition.workNodeId,
    safeBlockedNodeId: definition.safeBlockedNodeId,
    outboundNodeIds: definition.outboundNodeIds,
    returnNodeIds: definition.returnNodeIds,
    homePoint: point(resolve(definition.homeNodeId)),
    dispatchPoint: point(resolve(definition.dispatchNodeId)),
    entrancePoint: point(resolve(definition.entranceNodeId)),
    workPoint: point(resolve(definition.workNodeId)),
    safeBlockedPoint: point(resolve(definition.safeBlockedNodeId)),
    approachPoint: point(resolve(definition.outboundNodeIds.at(-2) ?? definition.entranceNodeId)),
    interactionPoint: point(resolve(definition.entranceNodeId)),
    insidePoint: point(resolve(definition.workNodeId)),
    outboundWaypoints: pointsFor(nodes, definition.outboundNodeIds),
    returnWaypoints: pointsFor(nodes, definition.returnNodeIds),
    laneOffset: definition.laneOffset,
    walkDurationMs: definition.walkDurationMs,
    arriveDurationMs: definition.arriveDurationMs,
    workDurationMs: definition.workDurationMs,
    successDurationMs: definition.successDurationMs,
    workEffect: definition.workEffect,
    workVisibility: definition.workVisibility,
    occupancyMode: definition.workVisibility === 'inside' ? 'facade-front' : 'world',
    entranceVisibilityThreshold: definition.entranceVisibilityThreshold,
  })
}

const JOURNEY_PROFILES = freeze(['default', 'coder', 'developer', 'devops', 'komandos', 'orchestrator', 'outreach', 'prospecting', 'researcher', 'reviewer', 'synthesizer', 'verifier'])
const journeysFor = (layout) => freeze(Object.fromEntries(
  JOURNEY_PROFILES.map((profile) => [profile, journeyFromNavigation(profile, layout)]),
))

export const WORLD_LIFE_JOURNEYS = journeysFor('desktop')
export const MOBILE_WORLD_LIFE_JOURNEYS = journeysFor('mobile')

export const ROAD_NODES = getMapNodes('desktop')
export const AGENT_ROAD_ROUTES = freeze(Object.fromEntries(
  Object.entries(WORLD_LIFE_JOURNEYS).map(([profile, journey]) => [profile, journey.outboundWaypoints]),
))

export function getWorldLifeJourneys(layout = 'desktop') {
  return layout === 'mobile' ? MOBILE_WORLD_LIFE_JOURNEYS : WORLD_LIFE_JOURNEYS
}

export function getWorldLifeJourney(profile, layout = 'desktop') {
  return getWorldLifeJourneys(layout)[profile] ?? null
}

export function getAgentRoadRoute(profile, reverse = false, layout = 'desktop') {
  const journey = getWorldLifeJourney(profile, layout)
  if (!journey) return []
  return [...(reverse ? journey.returnWaypoints : journey.outboundWaypoints)]
}
