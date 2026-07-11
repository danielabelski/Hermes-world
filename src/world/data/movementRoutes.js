import { AGENT_DEFINITIONS } from './agentDefinitions.js';
import { BUILDING_DEFINITIONS } from './buildingDefinitions.js';

/**
 * Logical movement graph for the living fortress. Routes are expressed using
 * building IDs, never renderer coordinates or fixed sprite slots. A map or a
 * future expansion can therefore provide different anchors without changing
 * an agent's route contract.
 */
export const FORTRESS_ROUTE_GRAPH = Object.freeze({
  'scout-lodge': Object.freeze(['keep', 'library']),
  keep: Object.freeze(['scout-lodge', 'herald-tower', 'fountain', 'clock-tower']),
  'herald-tower': Object.freeze(['keep', 'alchemist-lab']),
  library: Object.freeze(['scout-lodge', 'fountain', 'forge']),
  fountain: Object.freeze(['keep', 'library', 'alchemist-lab', 'forge', 'inspection-hall']),
  'alchemist-lab': Object.freeze(['herald-tower', 'fountain', 'assay-office']),
  forge: Object.freeze(['library', 'fountain', 'inspection-hall', 'builders-yard']),
  'inspection-hall': Object.freeze(['fountain', 'forge', 'assay-office', 'keep']),
  'assay-office': Object.freeze(['inspection-hall', 'alchemist-lab', 'barracks']),
  'builders-yard': Object.freeze(['forge', 'clock-tower', 'siege-workshop']),
  'clock-tower': Object.freeze(['keep', 'builders-yard', 'barracks', 'siege-workshop']),
  barracks: Object.freeze(['clock-tower', 'assay-office', 'siege-workshop']),
  'siege-workshop': Object.freeze(['clock-tower', 'barracks', 'builders-yard']),
});

const route = (homeBuildingId, workBuildingId, patrolBuildingIds, options = {}) => Object.freeze({
  homeBuildingId,
  workBuildingId,
  patrolBuildingIds: Object.freeze(patrolBuildingIds),
  outbound: options.outbound ?? 'normal',
  carryPriority: options.carryPriority ?? 'task-destination',
});

/** Profile-specific intent; pathfinding below resolves the shortest graph path. */
export const AGENT_MOVEMENT_ROUTES = Object.freeze({
  default: route('watchtower', 'watchtower', ['watchtower', 'keep', 'fountain']),
  coder: route('forge', 'forge', ['forge', 'fountain', 'inspection-hall']),
  developer: route('builders-yard', 'builders-yard', ['builders-yard', 'forge', 'clock-tower']),
  devops: route('siege-workshop', 'siege-workshop', ['siege-workshop', 'clock-tower', 'barracks']),
  komandos: route('barracks', 'barracks', ['barracks', 'clock-tower', 'keep'], { outbound: 'rapid' }),
  orchestrator: route('keep', 'keep', ['keep', 'fountain', 'clock-tower']),
  outreach: route('herald-tower', 'herald-tower', ['herald-tower', 'keep', 'alchemist-lab'], { outbound: 'outbound' }),
  prospecting: route('scout-lodge', 'scout-lodge', ['scout-lodge', 'library', 'keep'], { outbound: 'outbound' }),
  researcher: route('library', 'library', ['library', 'fountain', 'alchemist-lab']),
  reviewer: route('inspection-hall', 'inspection-hall', ['inspection-hall', 'keep', 'assay-office']),
  synthesizer: route('alchemist-lab', 'alchemist-lab', ['alchemist-lab', 'fountain', 'keep']),
  verifier: route('assay-office', 'assay-office', ['assay-office', 'inspection-hall', 'keep']),
});

export const MOVEMENT_ROUTE_REGISTRY = AGENT_MOVEMENT_ROUTES;

function neighbours(buildingId, graph) {
  return Array.isArray(graph?.[buildingId]) ? graph[buildingId] : [];
}

/** Breadth-first pathfinding is sufficient for the small logical fortress graph. */
export function findBuildingRoute(startBuildingId, targetBuildingId, graph = FORTRESS_ROUTE_GRAPH) {
  if (!startBuildingId || !targetBuildingId) return [];
  if (startBuildingId === targetBuildingId) return [startBuildingId];
  const queue = [[startBuildingId]];
  const visited = new Set([startBuildingId]);
  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];
    for (const next of neighbours(current, graph)) {
      if (visited.has(next)) continue;
      const nextPath = [...path, next];
      if (next === targetBuildingId) return nextPath;
      visited.add(next);
      queue.push(nextPath);
    }
  }
  return [startBuildingId, targetBuildingId];
}

function pointFor(buildingId, type = 'entrance', buildings = BUILDING_DEFINITIONS) {
  const building = buildings?.[buildingId];
  if (!building) return null;
  return building[type] ?? building.anchor ?? null;
}

function routeIntentFor(agentOrProfile) {
  const profile = typeof agentOrProfile === 'string' ? agentOrProfile : agentOrProfile?.profile ?? agentOrProfile?.id;
  return AGENT_MOVEMENT_ROUTES[profile] ?? null;
}

/**
 * Resolve an agent's current route from live task data. A blocked/running task
 * can override the normal patrol destination while all unknown profiles get a
 * safe path through the Keep instead of vanishing from the scene.
 */
export function getMovementRoute(agentOrProfile, { task = null, buildings = BUILDING_DEFINITIONS, graph = FORTRESS_ROUTE_GRAPH, now = Date.now } = {}) {
  const profile = typeof agentOrProfile === 'string' ? agentOrProfile : agentOrProfile?.profile ?? agentOrProfile?.id;
  const intent = routeIntentFor(agentOrProfile);
  const definition = AGENT_DEFINITIONS[profile];
  const home = intent?.homeBuildingId ?? definition?.buildingId ?? 'keep';
  const taskDestination = task?.destinationBuildingId ?? task?.targetBuildingId ?? null;
  const target = taskDestination && buildings?.[taskDestination] ? taskDestination : (intent?.workBuildingId ?? home);
  const buildingIds = findBuildingRoute(home, target, graph);
  const waypoints = buildingIds.map((buildingId) => ({ buildingId, position: pointFor(buildingId, buildingId === target ? 'workAnchor' : 'entrance', buildings) })).filter((waypoint) => waypoint.position);
  const active = Boolean(agentOrProfile?.active ?? agentOrProfile?.isActive ?? agentOrProfile?.state === 'working');
  const status = task?.status ?? null;
  const mode = status === 'blocked' ? 'alerted' : status === 'running' || active ? 'working' : 'patrol';
  return Object.freeze({
    profile: profile ?? 'unknown',
    homeBuildingId: home,
    targetBuildingId: target,
    buildingIds: Object.freeze(buildingIds),
    waypoints: Object.freeze(waypoints),
    mode,
    loop: mode === 'patrol',
    outbound: intent?.outbound ?? 'normal',
    generatedAt: new Date(now()).toISOString(),
  });
}

export function getPatrolRoute(agentOrProfile, options = {}) {
  const intent = routeIntentFor(agentOrProfile);
  const patrol = intent?.patrolBuildingIds ?? ['keep', 'fountain'];
  const routePoints = patrol.flatMap((buildingId, index) => {
    const next = patrol[(index + 1) % patrol.length];
    return index === patrol.length - 1 ? [] : findBuildingRoute(buildingId, next, options.graph ?? FORTRESS_ROUTE_GRAPH).slice(0, -1);
  }).concat(patrol.at(-1) ?? 'keep');
  return getMovementRoute(agentOrProfile, { ...options, task: { destinationBuildingId: routePoints.at(0) ?? 'keep' } });
}

