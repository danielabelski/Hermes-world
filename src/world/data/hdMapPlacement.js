/**
 * HD map art contract for the Living World.
 *
 * Coordinates use the existing 10 x 10 logical fortress plane. They are not
 * pixels: an HD renderer can scale, pan or replace the illustration without
 * rewriting the agent choreography. `sortY` is the floor contact point used
 * for painter's-order depth sorting; a higher y draws in front of lower y.
 */

import { AGENT_DEFINITIONS } from './agentDefinitions.js';
import { BUILDING_DEFINITIONS } from './buildingDefinitions.js';

const point = (x, y) => Object.freeze({ x, y });
const immutablePoints = (points) => Object.freeze(points.map(([x, y]) => point(x, y)));

export const HD_FORTRESS_ARTBOARD = Object.freeze({
  logicalBounds: Object.freeze({ minX: 0.8, maxX: 9.2, minY: 1.25, maxY: 10.15 }),
  tileProjection: Object.freeze({ kind: 'isometric-2-1', tileWidth: 128, tileHeight: 64 }),
  depth: Object.freeze({ ground: 0, paths: 10, building: 100, agent: 200, foreground: 400, uiMarker: 600 }),
});

const buildingPlacement = ({ id, footprint, artLayer = 'building', occlusion = 'none', landmark = false }) => {
  const definition = BUILDING_DEFINITIONS[id];
  if (!definition) throw new Error(`Unknown HD map building: ${id}`);
  return Object.freeze({
    id,
    artLayer,
    landmark,
    occlusion,
    anchor: definition.anchor,
    entrance: definition.entrance,
    workAnchor: definition.workAnchor,
    footprint: Object.freeze({ width: footprint[0], height: footprint[1] }),
    // Buildings sort by their feet, not their roof. This lets a person walk
    // behind the roof but in front of the doorway in an isometric renderer.
    sortY: definition.entrance.y,
  });
};

export const HD_BUILDING_PLACEMENTS = Object.freeze({
  'scout-lodge': buildingPlacement({ id: 'scout-lodge', footprint: [1.45, 1.1], occlusion: 'soft' }),
  keep: buildingPlacement({ id: 'keep', footprint: [2.25, 1.8], occlusion: 'hard', landmark: true }),
  'herald-tower': buildingPlacement({ id: 'herald-tower', footprint: [1.3, 1.65], occlusion: 'hard', landmark: true }),
  library: buildingPlacement({ id: 'library', footprint: [1.55, 1.25], occlusion: 'soft' }),
  fountain: buildingPlacement({ id: 'fountain', footprint: [1.05, 0.8], artLayer: 'landmark', landmark: true }),
  'alchemist-lab': buildingPlacement({ id: 'alchemist-lab', footprint: [1.55, 1.25], occlusion: 'soft' }),
  forge: buildingPlacement({ id: 'forge', footprint: [1.55, 1.25], occlusion: 'hard' }),
  'inspection-hall': buildingPlacement({ id: 'inspection-hall', footprint: [1.55, 1.25], occlusion: 'soft' }),
  'assay-office': buildingPlacement({ id: 'assay-office', footprint: [1.5, 1.25], occlusion: 'soft' }),
  'builders-yard': buildingPlacement({ id: 'builders-yard', footprint: [1.7, 1.1], occlusion: 'none' }),
  'clock-tower': buildingPlacement({ id: 'clock-tower', footprint: [1.15, 1.55], occlusion: 'hard', landmark: true }),
  barracks: buildingPlacement({ id: 'barracks', footprint: [1.65, 1.25], occlusion: 'soft' }),
  'siege-workshop': buildingPlacement({ id: 'siege-workshop', footprint: [1.7, 1.3], occlusion: 'hard' }),
  watchtower: buildingPlacement({ id: 'watchtower', footprint: [1.1, 1.5], occlusion: 'hard' }),
});

const path = (id, points, options = {}) => Object.freeze({
  id,
  points: immutablePoints(points),
  width: options.width ?? 0.42,
  kind: options.kind ?? 'stone-road',
  drawLayer: HD_FORTRESS_ARTBOARD.depth.paths,
});

/** Visible pedestrian lanes, placed between building entrances rather than through roofs. */
export const HD_FORTRESS_PATHS = Object.freeze({
  'north-south-spine': path('north-south-spine', [[5, 3.1], [5, 4.75], [5, 6.7], [5, 8.65], [5, 9.85]], { width: 0.58 }),
  'north-west-lane': path('north-west-lane', [[5, 3.1], [3.65, 3.35], [2.25, 2.7]]),
  'north-east-lane': path('north-east-lane', [[5, 3.1], [6.45, 3.35], [7.75, 2.7]]),
  'library-lane': path('library-lane', [[2.35, 4.65], [3.4, 4.9], [5, 4.75]]),
  'lab-lane': path('lab-lane', [[7.65, 4.65], [6.65, 4.9], [5, 4.75]]),
  'forge-lane': path('forge-lane', [[2.35, 6.65], [3.5, 6.95], [5, 6.7]]),
  'assay-lane': path('assay-lane', [[7.65, 6.65], [6.5, 6.95], [5, 6.7]]),
  'south-west-lane': path('south-west-lane', [[2.35, 8.65], [3.45, 8.9], [5, 8.65]]),
  'south-east-lane': path('south-east-lane', [[7.65, 7.65], [6.65, 8.15], [5, 8.65]]),
  'workshop-lane': path('workshop-lane', [[5.2, 9.55], [5, 8.65]]),
  'watch-lane': path('watch-lane', [[4.1, 9.35], [5, 8.65]]),
});

const placement = ({ profile, idlePathId, queueLaneId, facing = 'south-east', depthBias = 0 }) => {
  const agent = AGENT_DEFINITIONS[profile];
  if (!agent) throw new Error(`Unknown HD map agent: ${profile}`);
  return Object.freeze({
    profile,
    homeBuildingId: agent.buildingId,
    idleAnchor: agent.spawnAnchor,
    workAnchor: agent.workAnchor,
    idlePath: agent.idlePath,
    idlePathId,
    queueLaneId,
    facing,
    // Prevent two agents at the exact same y from flickering between frames.
    depthBias,
    sortY: agent.spawnAnchor.y + depthBias,
  });
};

/** All current 12 profiles are intentionally laid on pedestrian lanes. */
export const HD_AGENT_PLACEMENTS = Object.freeze({
  orchestrator: placement({ profile: 'orchestrator', idlePathId: 'north-south-spine', queueLaneId: 'north-south-spine', facing: 'south' }),
  coder: placement({ profile: 'coder', idlePathId: 'forge-lane', queueLaneId: 'forge-lane', facing: 'south-east', depthBias: 0.01 }),
  researcher: placement({ profile: 'researcher', idlePathId: 'library-lane', queueLaneId: 'library-lane', facing: 'south-east', depthBias: 0.02 }),
  synthesizer: placement({ profile: 'synthesizer', idlePathId: 'lab-lane', queueLaneId: 'lab-lane', facing: 'south-west', depthBias: 0.02 }),
  reviewer: placement({ profile: 'reviewer', idlePathId: 'north-south-spine', queueLaneId: 'forge-lane', facing: 'south', depthBias: 0.01 }),
  verifier: placement({ profile: 'verifier', idlePathId: 'assay-lane', queueLaneId: 'assay-lane', facing: 'south-west', depthBias: 0.02 }),
  developer: placement({ profile: 'developer', idlePathId: 'south-west-lane', queueLaneId: 'south-west-lane', facing: 'south-east' }),
  devops: placement({ profile: 'devops', idlePathId: 'workshop-lane', queueLaneId: 'workshop-lane', facing: 'north-east', depthBias: 0.01 }),
  komandos: placement({ profile: 'komandos', idlePathId: 'south-east-lane', queueLaneId: 'south-east-lane', facing: 'north-west' }),
  outreach: placement({ profile: 'outreach', idlePathId: 'north-east-lane', queueLaneId: 'north-east-lane', facing: 'south-west' }),
  prospecting: placement({ profile: 'prospecting', idlePathId: 'north-west-lane', queueLaneId: 'north-west-lane', facing: 'south-east' }),
  default: placement({ profile: 'default', idlePathId: 'watch-lane', queueLaneId: 'north-south-spine', facing: 'north-east', depthBias: 0.03 }),
});

/** Concrete example: renderer can interpolate these points without touching the building graph. */
export const HD_ROUTE_EXAMPLE_CODER_TO_REVIEW = Object.freeze({
  profile: 'coder',
  intent: 'carry-package-for-review',
  fromBuildingId: 'forge',
  toBuildingId: 'inspection-hall',
  pathIds: Object.freeze(['forge-lane', 'north-south-spine']),
  waypoints: immutablePoints([[2.2, 6.2], [2.35, 6.65], [3.5, 6.95], [5, 6.7], [5.15, 6.2]]),
  arrivalState: 'thinking',
});

export function getHDMapAgentPlacement(profile) {
  return HD_AGENT_PLACEMENTS[profile] ?? null;
}

export function getHDMapRouteExample(id = 'coder-to-review') {
  return id === 'coder-to-review' ? HD_ROUTE_EXAMPLE_CODER_TO_REVIEW : null;
}

/** Data-only invariant check suitable for a build/preflight script. */
export function validateHDMapPlacement() {
  const issues = [];
  const agentIds = Object.keys(AGENT_DEFINITIONS);
  for (const profile of agentIds) {
    const item = HD_AGENT_PLACEMENTS[profile];
    if (!item) issues.push(`Missing HD placement for ${profile}.`);
    else if (!HD_FORTRESS_PATHS[item.queueLaneId]) issues.push(`${profile} references missing lane ${item.queueLaneId}.`);
    else if (!HD_BUILDING_PLACEMENTS[item.homeBuildingId]) issues.push(`${profile} references missing building ${item.homeBuildingId}.`);
  }
  for (const id of Object.keys(BUILDING_DEFINITIONS)) {
    if (!HD_BUILDING_PLACEMENTS[id]) issues.push(`Missing HD building placement for ${id}.`);
  }
  return Object.freeze({ valid: issues.length === 0, agents: agentIds.length, buildings: Object.keys(BUILDING_DEFINITIONS).length, paths: Object.keys(HD_FORTRESS_PATHS).length, issues: Object.freeze(issues) });
}
