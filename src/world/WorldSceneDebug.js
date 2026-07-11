/**
 * Development-only inspection helpers for a WorldScene snapshot/effect tree.
 *
 * Nothing in this module mounts Pixi or reaches into WorldCanvas. A runtime
 * can opt in during development, print a compact report, and keep production
 * rendering free of debug UI and instrumentation.
 */

import { createWorldEffects } from './WorldEffects.js';

const DEV_DEFAULT = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);
const REQUIRED_LAYERS = Object.freeze(['river-base', 'crystals', 'agent-effects', 'alert-icons']);

const list = (value) => Array.isArray(value) ? value : [];
const isFinitePoint = (point) => Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y));

function countBy(items, key) {
  return items.reduce((result, item) => {
    const value = String(item?.[key] ?? 'unknown');
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function problem(code, message, entityId = null) {
  return { code, message, entityId, severity: code.startsWith('missing') ? 'warning' : 'error' };
}

/**
 * Convert a snapshot plus its renderer-neutral descriptor tree into a small,
 * serialisable report. Suitable for tests, a console table, or a future dev
 * overlay. It never mutates either input.
 */
export function inspectWorldScene(snapshot = {}, effects = createWorldEffects(snapshot)) {
  const instructions = list(effects?.renderInstructions);
  const layers = countBy(instructions, 'layer');
  const kinds = countBy(instructions, 'kind');
  const agents = list(snapshot.agents);
  const tasks = list(snapshot.tasks);
  const buildings = list(snapshot.buildings);
  const alerts = list(snapshot.alerts);
  const issues = [];

  for (const layer of REQUIRED_LAYERS) {
    // No sessions/models/alerts should not fail the scene. Only require a
    // layer when the matching upstream signal exists.
    const required = layer === 'river-base'
      ? Number(snapshot?.tokenRiver?.activeSessionCount) > 0
      : layer === 'crystals'
        ? list(snapshot.modelSources).length > 0
        : layer === 'alert-icons'
          ? alerts.length > 0
          : agents.some((agent) => agent.isActive ?? agent.active);
    if (required && !layers[layer]) issues.push(problem(`missing-layer:${layer}`, `Expected ${layer} descriptors were not generated.`));
  }

  for (const agent of agents) {
    if (!agent.profile && !agent.id) issues.push(problem('agent-without-id', 'Agent is missing both profile and id.'));
    if (!isFinitePoint(agent.position ?? agent.workAnchor ?? agent.homeAnchor ?? agent.spawnAnchor)) issues.push(problem('agent-without-position', `Agent ${agent.profile ?? agent.id ?? 'unknown'} has no usable map position.`, agent.profile ?? agent.id));
  }
  for (const building of buildings) {
    if (!building.id) issues.push(problem('building-without-id', 'A building has no stable id.'));
    if (!isFinitePoint(building.anchor ?? building.workAnchor)) issues.push(problem('building-without-position', `Building ${building.id ?? 'unknown'} has no usable map anchor.`, building.id));
  }
  for (const instruction of instructions) {
    if (instruction.position && !isFinitePoint(instruction.position)) issues.push(problem('instruction-without-position', `${instruction.kind} has an invalid position.`, instruction.kind));
  }

  const particleBudget = instructions.reduce((total, item) => total + Math.max(0, Number(item?.particleBudget) || 0), 0);
  const activeAgents = agents.filter((agent) => agent.isActive ?? agent.active).length;
  return Object.freeze({
    healthy: issues.length === 0,
    totals: Object.freeze({
      agents: agents.length,
      activeAgents,
      buildings: buildings.length,
      tasks: tasks.length,
      alerts: alerts.length,
      modelSources: list(snapshot.modelSources).length,
      descriptors: instructions.length,
      particleBudget,
    }),
    layers: Object.freeze(layers),
    kinds: Object.freeze(kinds),
    issues: Object.freeze(issues),
  });
}

export function formatWorldSceneReport(report) {
  const totals = report?.totals ?? {};
  const status = report?.healthy ? 'healthy' : `${report?.issues?.length ?? 0} issue(s)`;
  return [
    `World scene: ${status}`,
    `agents ${totals.activeAgents ?? 0}/${totals.agents ?? 0} | buildings ${totals.buildings ?? 0} | tasks ${totals.tasks ?? 0}`,
    `descriptors ${totals.descriptors ?? 0} | particles ${totals.particleBudget ?? 0}`,
  ].join('\n');
}

/**
 * Opt-in logger. Production callers get a no-op unless they explicitly pass
 * enabled: true, which avoids accidental console noise in the PWA.
 */
export function createWorldSceneDebug({ enabled = DEV_DEFAULT, logger = console } = {}) {
  const inspect = (snapshot, effects) => inspectWorldScene(snapshot, effects);
  return Object.freeze({
    enabled: Boolean(enabled),
    inspect,
    report(snapshot, effects) {
      const result = inspect(snapshot, effects);
      if (enabled) {
        logger.groupCollapsed?.(`[Hermes World] ${result.healthy ? 'scene healthy' : 'scene needs attention'}`);
        logger.info?.(formatWorldSceneReport(result));
        if (result.issues.length) logger.table?.(result.issues);
        logger.groupEnd?.();
      }
      return result;
    },
    assert(snapshot, effects) {
      const result = inspect(snapshot, effects);
      if (!result.healthy) {
        const message = `Invalid Hermes world scene:\n${result.issues.map((item) => `- ${item.message}`).join('\n')}`;
        throw new Error(message);
      }
      return result;
    },
  });
}

