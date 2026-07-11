import { resolveAgentState, resolveWorldVisuals } from './visualStateResolver.js';

/**
 * Lightweight executable invariants for the renderer-neutral visual resolver.
 * It is intentionally framework-free so a CI script, smoke test or Storybook
 * scene can import it without pulling React, Pixi or a test runner.
 */

const agent = (index, overrides = {}) => ({
  id: `agent-${index}`,
  profile: `profile-${index}`,
  buildingId: `building-${index % 14}`,
  active: index % 3 === 0,
  ...overrides,
});

const building = (index) => ({ id: `building-${index}` });

export const VISUAL_RESOLVER_FIXTURES = Object.freeze({
  roster12: Object.freeze({
    agents: Object.freeze(Array.from({ length: 12 }, (_, index) => agent(index))),
    buildings: Object.freeze(Array.from({ length: 14 }, (_, index) => building(index))),
    tasks: Object.freeze([{ assignee: 'agent-0', status: 'running', priority: 'high' }]),
    alerts: Object.freeze([]),
  }),
  roster200: Object.freeze({
    agents: Object.freeze(Array.from({ length: 200 }, (_, index) => agent(index))),
    buildings: Object.freeze(Array.from({ length: 14 }, (_, index) => building(index))),
    tasks: Object.freeze(Array.from({ length: 40 }, (_, index) => ({
      assignee: `agent-${index * 5}`,
      status: index % 4 === 0 ? 'running' : 'ready',
      priority: index % 5 === 0 ? 'high' : 'normal',
    }))),
    alerts: Object.freeze([]),
  }),
});

export function runVisualStateResolverInvariants() {
  const small = resolveWorldVisuals(VISUAL_RESOLVER_FIXTURES.roster12);
  const large = resolveWorldVisuals(VISUAL_RESOLVER_FIXTURES.roster200);

  const alertBeatsActivity = resolveAgentState(
    { id: 'alerted-worker', active: true, state: 'working' },
    { alerts: [{ level: 'error' }] },
  ) === 'error';

  const warningBeatsActive = resolveAgentState(
    { id: 'blocked-worker', active: true },
    { task: { status: 'blocked' } },
  ) === 'thinking';

  const report = Object.freeze({
    roster12Count: small.agents.length,
    roster200Count: large.agents.length,
    keepsStableOrder: small.agents.every((visual, index) => visual.entityId === `agent-${index}`),
    alertBeatsActivity,
    warningBeatsActive,
    noTextLabels: [...small.agents, ...small.buildings].every((visual) => !('label' in visual) && !('title' in visual)),
  });

  return Object.freeze({
    ...report,
    passed: report.roster12Count === 12
      && report.roster200Count === 200
      && report.keepsStableOrder
      && report.alertBeatsActivity
      && report.warningBeatsActive
      && report.noTextLabels,
  });
}

