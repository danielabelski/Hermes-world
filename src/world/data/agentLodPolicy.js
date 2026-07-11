/**
 * Agent LOD/culling policy for the living world. It has no Pixi/DOM imports:
 * renderers receive stable modes and decide whether `full` is a sprite sheet,
 * `simplified` is a static character, and `signal` is an edge/minimap beacon.
 *
 * Important system states are never dropped: selected, error, warning,
 * blocked, working and carrying agents always receive at least `signal`.
 */

const freeze = Object.freeze;

export const AGENT_LOD_POPULATION_TIERS = freeze([
  freeze({ maxAgents: 12, id: 'slice-12', fullBudget: 12, simplifiedBudget: 0, cullHz: 12 }),
  freeze({ maxAgents: 50, id: 'expanded-50', fullBudget: 24, simplifiedBudget: 26, cullHz: 10 }),
  freeze({ maxAgents: 100, id: 'district-100', fullBudget: 28, simplifiedBudget: 44, cullHz: 8 }),
  freeze({ maxAgents: 200, id: 'large-200', fullBudget: 32, simplifiedBudget: 48, cullHz: 6 }),
]);

const numeric = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const key = (value) => String(value ?? '').trim().toLowerCase();

export function getAgentLodTier(population = 0) {
  const count = Math.max(0, numeric(population));
  return AGENT_LOD_POPULATION_TIERS.find((tier) => count <= tier.maxAgents)
    ?? AGENT_LOD_POPULATION_TIERS.at(-1);
}

export function isCriticalAgentSignal(agent = {}, selectedId = null) {
  const id = String(agent.id ?? agent.profile ?? '');
  const state = key(agent.visualState ?? agent.state);
  const severity = key(agent.level ?? agent.severity ?? agent.status);
  return id !== '' && (
    id === String(selectedId ?? '')
    || agent.selected === true
    || agent.blocked === true
    || agent.carrying === true
    || agent.carryingTaskId != null
    || ['error', 'failed', 'alerted', 'warning', 'blocked', 'working', 'carrying', 'carrying-package'].includes(state)
    || ['error', 'failed', 'critical', 'fatal', 'warning', 'warn', 'blocked'].includes(severity)
  );
}

/** Higher number means a more detailed individual representation. */
export function getAgentVisualRank(agent = {}, { selectedId = null } = {}) {
  const state = key(agent.visualState ?? agent.state);
  const severity = key(agent.level ?? agent.severity ?? agent.status);
  const priority = key(agent.priority);
  let rank = 0;
  if (agent.id === selectedId || agent.profile === selectedId || agent.selected) rank += 1000;
  if (['error', 'failed', 'critical', 'fatal'].includes(severity) || ['error', 'failed'].includes(state)) rank += 800;
  if (agent.blocked || ['warning', 'warn', 'blocked'].includes(severity) || ['alerted', 'warning', 'blocked'].includes(state)) rank += 600;
  if (agent.carrying || agent.carryingTaskId || ['carrying', 'carrying-package'].includes(state)) rank += 400;
  if (state === 'working' || agent.active || agent.isActive) rank += 300;
  if (priority === 'critical' || priority === 'urgent') rank += 80;
  else if (priority === 'high') rank += 40;
  else if (priority === 'medium') rank += 10;
  if (agent.inViewport !== false) rank += 5;
  return rank;
}

/**
 * Produces a stable plan, preserving source ordering when two agents have the
 * same importance. `signal` deliberately survives off-screen culling for
 * critical states, so the UI can render an edge pulse rather than hide risk.
 */
export function createAgentLodPlan(agents = [], options = {}) {
  const roster = Array.isArray(agents) ? agents : [];
  const tier = getAgentLodTier(roster.length);
  const selectedId = options.selectedId ?? null;
  const ranked = roster.map((agent, index) => ({ agent, index, rank: getAgentVisualRank(agent, { selectedId }) }))
    .sort((left, right) => right.rank - left.rank || left.index - right.index);

  let fullRemaining = tier.fullBudget;
  let simplifiedRemaining = tier.simplifiedBudget;
  const byId = new Map();

  for (const { agent, index, rank } of ranked) {
    const id = String(agent.id ?? agent.profile ?? index);
    const critical = isCriticalAgentSignal(agent, selectedId);
    let mode = 'culled';

    if (tier.maxAgents <= 12 && fullRemaining > 0) {
      // The vertical slice always presents its complete twelve-character cast.
      mode = 'full';
      fullRemaining -= 1;
    } else if (critical && fullRemaining > 0) {
      mode = 'full';
      fullRemaining -= 1;
    } else if (agent.inViewport !== false && fullRemaining > 0) {
      mode = 'full';
      fullRemaining -= 1;
    } else if (agent.inViewport !== false && simplifiedRemaining > 0) {
      mode = 'simplified';
      simplifiedRemaining -= 1;
    } else if (critical) {
      mode = 'signal';
    }

    byId.set(id, freeze({
      id,
      mode,
      rank,
      critical,
      animate: mode === 'full',
      showShadow: mode === 'full',
      showPackage: mode === 'full' && Boolean(agent.carrying || agent.carryingTaskId),
      edgeSignal: mode === 'signal',
    }));
  }

  return freeze({
    tier,
    population: roster.length,
    byId,
    fullCount: [...byId.values()].filter((item) => item.mode === 'full').length,
    simplifiedCount: [...byId.values()].filter((item) => item.mode === 'simplified').length,
    signalCount: [...byId.values()].filter((item) => item.mode === 'signal').length,
    culledCount: [...byId.values()].filter((item) => item.mode === 'culled').length,
  });
}

export function getAgentLod(plan, agent = {}, index = 0) {
  return plan?.byId?.get(String(agent.id ?? agent.profile ?? index))
    ?? freeze({ id: String(agent.id ?? agent.profile ?? index), mode: 'culled', rank: 0, critical: false, animate: false, showShadow: false, showPackage: false, edgeSignal: false });
}
