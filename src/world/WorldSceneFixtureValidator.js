/**
 * Validates the first Living World fixture against the Vertical Slice
 * directive: a legible settlement with all currently known Hermes roles,
 * their buildings, routes, and visual system signals.
 *
 * It is intentionally data-only. No Canvas, React, Zustand, or API client is
 * imported here, so it can run in unit tests or a release preflight.
 */

import { createWorldEffects } from './WorldEffects.js';
import { AGENT_DEFINITIONS } from './data/agentDefinitions.js';
import { BUILDING_DEFINITIONS } from './data/buildingDefinitions.js';
import { SCENE_DECORATIONS } from './SceneDecorations.js';

const asList = (value) => Array.isArray(value) ? value : Object.values(value ?? {});
const hasPoint = (point) => Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y));
const issue = (code, message, severity = 'error') => Object.freeze({ code, message, severity });

export const DIRECTIVE_V1_EXPECTATIONS = Object.freeze({
  currentAgentCount: Object.keys(AGENT_DEFINITIONS).length,
  currentBuildingCount: Object.keys(BUILDING_DEFINITIONS).length,
  requiredTaskStates: Object.freeze(['running', 'blocked', 'done']),
  requiredSignalKinds: Object.freeze(['token-river', 'model-crystal']),
});

function entityMaps(snapshot) {
  const agents = asList(snapshot?.agents ?? snapshot?.agentsById);
  const buildings = asList(snapshot?.buildings ?? snapshot?.buildingsById);
  return {
    agents,
    buildings,
    tasks: asList(snapshot?.tasks ?? snapshot?.tasksById),
    agentByProfile: new Map(agents.map((item) => [item.profile ?? item.id, item])),
    buildingById: new Map(buildings.map((item) => [item.id, item])),
  };
}

function validateRoster(maps, issues) {
  for (const definition of Object.values(AGENT_DEFINITIONS)) {
    const agent = maps.agentByProfile.get(definition.profile);
    if (!agent) {
      issues.push(issue('missing-agent', `Missing ${definition.profile} (${definition.displayName}) from world snapshot.`));
      continue;
    }
    if (!hasPoint(agent.position ?? agent.workAnchor ?? agent.homeAnchor ?? agent.spawnAnchor)) {
      issues.push(issue('agent-without-anchor', `${definition.profile} has no usable world anchor.`));
    }
    const building = maps.buildingById.get(definition.buildingId);
    if (!building) issues.push(issue('missing-agent-building', `${definition.profile} needs ${definition.buildingId} in the scene.`));
  }
}

function validateBuildings(maps, issues) {
  for (const definition of Object.values(BUILDING_DEFINITIONS)) {
    const building = maps.buildingById.get(definition.id);
    if (!building) {
      issues.push(issue('missing-building', `Missing ${definition.label} (${definition.id}) from world snapshot.`));
      continue;
    }
    if (!hasPoint(building.anchor ?? building.workAnchor)) issues.push(issue('building-without-anchor', `${definition.id} has no usable world anchor.`));
  }
}

function validateRoutes(issues) {
  const roads = SCENE_DECORATIONS.filter((item) => item.type === 'road');
  if (!roads.length) {
    issues.push(issue('missing-roads', 'The Citadel has no circulation routes.'));
    return roads;
  }
  for (const road of roads) {
    if (!hasPoint(road.from) || !hasPoint(road.to)) issues.push(issue('invalid-road', `${road.id} requires stable from/to anchors.`));
    if (!road.routeId) issues.push(issue('road-without-route-id', `${road.id} has no stable routeId.`, 'warning'));
  }
  return roads;
}

function validateTasks(tasks, issues) {
  const statuses = new Set(tasks.map((task) => String(task.status ?? '').toLowerCase()));
  for (const status of DIRECTIVE_V1_EXPECTATIONS.requiredTaskStates) {
    if (!statuses.has(status)) issues.push(issue('missing-task-state', `Demo fixture has no ${status} task to demonstrate its physical package state.`, 'warning'));
  }
}

function validateEffects(snapshot, effects, issues) {
  const descriptors = asList(effects?.renderInstructions);
  const kinds = new Set(descriptors.map((item) => item.kind));
  if (Number(snapshot?.tokenRiver?.activeSessionCount) > 0 && !kinds.has('flow-particles')) {
    issues.push(issue('missing-token-river-effect', 'Active sessions require an animated token-river effect.'));
  }
  if (asList(snapshot?.modelSources).length > 0 && !kinds.has('diamond')) {
    issues.push(issue('missing-crystal-effect', 'Configured models require visible crystal descriptors.'));
  }
  const activeCount = asList(snapshot?.agents).filter((agent) => agent.isActive ?? agent.active).length;
  if (activeCount > 0 && !kinds.has('work-aura')) issues.push(issue('missing-working-agent-effect', 'Active agents require work descriptors.'));
  const errorBuildings = asList(snapshot?.buildings).filter((building) => building.state === 'error' || Number(building.smokeLevel) > 0);
  if (errorBuildings.length > 0 && !kinds.has('smoke-emitter')) issues.push(issue('missing-smoke-effect', 'An error building requires smoke descriptors.'));
}

/** Returns a serialisable release-preflight report; it never mutates input. */
export function validateWorldSceneFixture(snapshot = {}, { effects = createWorldEffects(snapshot) } = {}) {
  const issues = [];
  const maps = entityMaps(snapshot);
  validateRoster(maps, issues);
  validateBuildings(maps, issues);
  const roads = validateRoutes(issues);
  validateTasks(maps.tasks, issues);
  validateEffects(snapshot, effects, issues);

  const errors = issues.filter((item) => item.severity === 'error');
  return Object.freeze({
    valid: errors.length === 0,
    directive: 'Hermes OS Execution Directive V1 — Living World Vertical Slice',
    counts: Object.freeze({
      agents: maps.agents.length,
      expectedAgents: DIRECTIVE_V1_EXPECTATIONS.currentAgentCount,
      buildings: maps.buildings.length,
      expectedBuildings: DIRECTIVE_V1_EXPECTATIONS.currentBuildingCount,
      roads: roads.length,
      effects: asList(effects?.renderInstructions).length,
    }),
    issues: Object.freeze(issues),
  });
}

export function assertWorldSceneFixture(snapshot, options) {
  const report = validateWorldSceneFixture(snapshot, options);
  if (!report.valid) throw new Error(`Living World fixture is incomplete:\n${report.issues.filter((item) => item.severity === 'error').map((item) => `- ${item.message}`).join('\n')}`);
  return report;
}

