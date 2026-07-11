import { getAgentVisualCue, normalizeAgentVisualState } from './agentVisualStates.js';
import { getBuildingVisualVariant } from './buildingVisualVariants.js';

/**
 * Pure semantic-to-visual resolver shared by Pixi, DOM fallbacks and future
 * sprite renderers.  It deliberately returns visual tokens only: a renderer
 * never has to infer a colour or effect from human-facing copy.
 *
 * The resolver accepts an arbitrary roster. It has no assumptions about the
 * current twelve Hermes profiles, so paging/culling at 50+ agents can consume
 * exactly the same contract.
 */

const DEFAULT_AGENT_PALETTE = Object.freeze({
  idle: '#8DAA8A',
  walking: '#75A7C8',
  working: '#E5A74E',
  thinking: '#A591D1',
  success: '#86C973',
  error: '#E35E58',
  sleeping: '#6D7DAB',
});

const PRIORITY_WEIGHT = Object.freeze({
  critical: 4,
  urgent: 4,
  high: 3,
  medium: 2,
  normal: 2,
  low: 1,
  none: 0,
});

const EFFECTS_BY_STATE = Object.freeze({
  idle: Object.freeze(['ambient']),
  walking: Object.freeze(['footsteps']),
  working: Object.freeze(['work-sparks']),
  thinking: Object.freeze(['thought-pulse']),
  success: Object.freeze(['success-glint']),
  error: Object.freeze(['error-smoke', 'error-beacon']),
  sleeping: Object.freeze(['sleep-zzz']),
});


const asKey = (value) => String(value ?? '').trim().toLowerCase();

const hasFault = (item = {}) => {
  const level = asKey(item.level ?? item.severity ?? item.status);
  return item.error === true || item.failed === true || ['error', 'failed', 'critical', 'fatal'].includes(level);
};

const hasWarning = (item = {}) => {
  const level = asKey(item.level ?? item.severity ?? item.status);
  return item.warning === true || item.blocked === true || ['warning', 'warn', 'blocked', 'degraded'].includes(level);
};

export function getVisualPriority(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.min(4, Math.round(value)));
  return PRIORITY_WEIGHT[asKey(value)] ?? PRIORITY_WEIGHT.normal;
}

/**
 * Explicit runtime states always win. Alerts then override task-derived
 * activity, which prevents a blocked worker appearing healthy just because
 * its profile is still marked as active by the backend.
 */
export function resolveAgentState(agent = {}, context = {}) {
  const explicit = agent.visualState ?? agent.state ?? agent.lifecycleState;
  const task = context.task ?? agent.task ?? {};
  const alerts = [...(context.alerts ?? []), ...(agent.alerts ?? [])];

  if (hasFault(agent) || hasFault(task) || alerts.some(hasFault)) return 'error';
  if (hasWarning(agent) || hasWarning(task) || alerts.some(hasWarning)) return 'thinking';

  if (explicit != null && asKey(explicit)) return normalizeAgentVisualState(explicit);
  if (task.status === 'done' || task.completedAt || task.completed_at) return 'success';
  if (task.status === 'running' || task.status === 'review' || agent.active || agent.isActive) return 'working';
  if (task.status === 'ready' || task.status === 'todo' || task.status === 'scheduled') return 'walking';
  return 'idle';
}

export function resolveAgentVisual(agent = {}, context = {}) {
  const state = resolveAgentState(agent, context);
  const cue = getAgentVisualCue({ ...agent, visualState: state });
  const priority = getVisualPriority(context.priority ?? context.task?.priority ?? agent.priority);
  const accent = agent.accentColor ?? agent.color ?? DEFAULT_AGENT_PALETTE[state];
  const effects = new Set([...(EFFECTS_BY_STATE[state] ?? EFFECTS_BY_STATE.idle), ...(context.extraEffects ?? [])]);

  if (priority >= 3 && state !== 'error') effects.add('priority-beacon');
  if (context.task?.status === 'running' || context.carrying) effects.add('package-carry');
  if (context.task?.status === 'done') effects.add('package-complete');

  return Object.freeze({
    entityType: 'agent',
    entityId: agent.id ?? agent.profile ?? null,
    state,
    priority,
    accent,
    cue,
    effects: Object.freeze([...effects]),
    urgency: priority >= 3 ? 'high' : priority >= 2 ? 'normal' : 'low',
    shouldAnimate: state !== 'idle' || effects.size > 1,
  });
}

export function resolveBuildingState(building = {}, context = {}) {
  const linkedAgents = context.agents ?? [];
  const linkedTasks = context.tasks ?? [];
  const signals = [...(context.signals ?? []), ...(building.signals ?? [])];

  if (hasFault(building) || signals.some(hasFault) || linkedAgents.some(hasFault) || linkedTasks.some(hasFault)) return 'error';
  if (hasWarning(building) || signals.some(hasWarning) || linkedAgents.some(hasWarning) || linkedTasks.some(hasWarning)) return 'warning';
  if (building.active || building.isActive || linkedAgents.some((agent) => resolveAgentState(agent) === 'working')) return 'active';
  return 'normal';
}

export function resolveBuildingVisual(building = {}, context = {}) {
  const state = resolveBuildingState(building, context);
  const visual = getBuildingVisualVariant(building.id ?? building.buildingId, state);
  const priority = Math.max(
    getVisualPriority(building.priority),
    ...((context.tasks ?? []).map((task) => getVisualPriority(task.priority))),
  );
  const effects = new Set();
  if (visual.stateVisual.glow > 0) effects.add('building-glow');
  if (visual.stateVisual.smoke > 0) effects.add('building-smoke');
  if (visual.stateVisual.pulse) effects.add('building-pulse');
  if (priority >= 3 && state !== 'error') effects.add('priority-banner');

  return Object.freeze({
    entityType: 'building',
    entityId: visual.id,
    state,
    priority,
    palette: visual.palette,
    silhouette: visual.silhouette,
    stateVisual: visual.stateVisual,
    effects: Object.freeze([...effects]),
    shouldAnimate: visual.stateVisual.animation !== 'ambient' || effects.size > 0,
  });
}

/** Resolve an arbitrary world roster in O(n) with stable, renderer-ready maps. */
export function resolveWorldVisuals({ agents = [], buildings = [], tasks = [], alerts = [] } = {}) {
  const taskByAssignee = new Map();
  for (const task of tasks) {
    const key = task.assignee ?? task.agentId ?? task.profile;
    if (key && !taskByAssignee.has(key)) taskByAssignee.set(key, task);
  }

  const agentsByBuilding = new Map();
  for (const agent of agents) {
    const buildingId = agent.buildingId ?? agent.homeBuildingId;
    if (!buildingId) continue;
    const bucket = agentsByBuilding.get(buildingId) ?? [];
    bucket.push(agent);
    agentsByBuilding.set(buildingId, bucket);
  }

  return Object.freeze({
    agents: Object.freeze(agents.map((agent) => resolveAgentVisual(agent, {
      task: taskByAssignee.get(agent.id ?? agent.profile),
      alerts,
    }))),
    buildings: Object.freeze(buildings.map((building) => resolveBuildingVisual(building, {
      agents: agentsByBuilding.get(building.id) ?? [],
      tasks: tasks.filter((task) => task.buildingId === building.id),
      signals: alerts.filter((alert) => alert.buildingId === building.id),
    }))),
  });
}
