/**
 * Explicit scenarios make the first world inspectable without a live Hermes
 * process. They are product fixtures, not simulated telemetry: every value
 * mirrors a shape that the existing API can return.
 */

const at = (minutes) => `2026-07-10T${String(7 + Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00.000Z`;
const line = (timestamp, level, message) => JSON.stringify({ timestamp, level, logger_name: 'hermes.world', message });

const profile = (name, active, model = 'gpt-5') => ({ name, is_active: active, is_default: name === 'default', model });
const task = (id, title, assignee, status, priority = 'normal', minute = 0) => ({
  id,
  title,
  assignee,
  status,
  priority,
  started_at: ['running', 'review', 'blocked', 'error'].includes(status) ? at(minute) : null,
  completed_at: status === 'done' ? at(minute) : null,
});

const base = {
  skills: { skills: [{ name: 'code', disabled: false }, { name: 'research', disabled: false }, { name: 'review', disabled: false }] },
  models: { groups: [{ provider: 'openai', models: [{ id: 'gpt-5' }, { id: 'gpt-5-codex' }, { id: 'gpt-5-mini' }] }] },
  crons: { jobs: [{ id: 'world-heartbeat', name: 'World heartbeat', enabled: true, last_run_at: at(0) }] },
};

const freezePayload = (payload) => Object.freeze(payload);

export const DEMO_WORLD_SCENARIOS = Object.freeze({
  ambient: freezePayload({
    ...base,
    profiles: { profiles: [
      profile('orchestrator', false), profile('coder', false, 'gpt-5-codex'), profile('researcher', false, 'gpt-5-mini'),
      profile('developer', false), profile('synthesizer', false, 'gpt-5-mini'), profile('devops', false),
      profile('komandos', false), profile('outreach', false), profile('prospecting', false),
      profile('reviewer', false), profile('verifier', false), profile('default', false, 'gpt-5-mini'),
    ] },
    metrics: { cpuPercent: 18, memoryPercent: 37, memoryUsedMb: 6062, memoryTotalMb: 16384, temperatureC: 52, temperatureSource: 'demo' },
    tasks: { tasks: [] },
    logs: { lines: [] },
    cronHistory: { completions: [{ job_id: 'world-heartbeat', name: 'World heartbeat', status: 'ok', completed_at: at(0) }] },
    sessions: { sessions: [] },
  }),
  healthy: freezePayload({
    ...base,
    // The healthy opening scene deliberately shows a small working community,
    // not a single hero: every profile maps to a different building anchor.
    profiles: { profiles: [
      profile('orchestrator', true),
      profile('coder', true, 'gpt-5-codex'),
      profile('researcher', true, 'gpt-5-mini'),
      profile('developer', true),
      profile('synthesizer', true, 'gpt-5-mini'),
      profile('devops', true),
      profile('komandos', false),
      profile('outreach', false),
      profile('prospecting', false),
      profile('reviewer', false),
      profile('verifier', false),
      profile('default', false, 'gpt-5-mini'),
    ] },
    metrics: { cpuPercent: 23, memoryPercent: 41, memoryUsedMb: 6554, memoryTotalMb: 16384, temperatureC: 57, temperatureSource: 'demo' },
    tasks: { tasks: [
      task('demo-architecture', 'Map orchestration routes', 'orchestrator', 'running', 'high', 0),
      task('demo-forge', 'Shape first visual slice', 'coder', 'running', 'normal', 5),
      task('demo-research', 'Review world signals', 'researcher', 'running', 'normal', 6),
      task('demo-scout', 'Patrol the data walls', 'prospecting', 'running', 'normal', 4),
      task('demo-build', 'Raise the south bridge', 'developer', 'ready', 'high', 4),
      task('demo-alchemy', 'Blend model catalysts', 'synthesizer', 'done', 'low', 3),
    ] },
    logs: { lines: [line(at(6), 'info', 'Citadel systems synchronized')] },
    cronHistory: { completions: [{ job_id: 'world-heartbeat', name: 'World heartbeat', status: 'ok', completed_at: at(0) }] },
    sessions: { sessions: [{ session_id: 'demo-coder', profile: 'coder', model: 'gpt-5-codex', estimated_cost: 0.14, created_at: at(0) }] },
  }),
  warning: freezePayload({
    ...base,
    profiles: { profiles: [profile('orchestrator', true), profile('coder', true, 'gpt-5-codex'), profile('developer', true), profile('reviewer', false), profile('default', true, 'gpt-5-mini')] },
    metrics: { cpuPercent: 72, memoryPercent: 76, memoryUsedMb: 12452, memoryTotalMb: 16384, temperatureC: 76, temperatureSource: 'demo' },
    tasks: { tasks: [task('warning-deploy', 'Review deployment manifest', 'reviewer', 'blocked', 'high', 10), task('warning-build', 'Repair integration bridge', 'coder', 'running', 'high', 8), task('warning-queue', 'Prepare worker rollout', 'developer', 'ready', 'normal', 6)] },
    logs: { lines: [line(at(10), 'warning', 'reviewer is waiting for a deployment signature'), line(at(9), 'warning', 'Memory pressure rising in worker pool')] },
    cronHistory: { completions: [{ job_id: 'world-heartbeat', name: 'World heartbeat', status: 'ok', completed_at: at(0) }] },
    sessions: { sessions: [{ session_id: 'warning-coder', profile: 'coder', model: 'gpt-5-codex', estimated_cost: 0.93, created_at: at(8) }, { session_id: 'warning-builder', profile: 'developer', model: 'gpt-5', estimated_cost: 0.41, created_at: at(6) }] },
  }),
  critical: freezePayload({
    ...base,
    profiles: { profiles: [profile('orchestrator', true), profile('coder', false, 'gpt-5-codex'), profile('devops', true), profile('komandos', true), profile('default', true, 'gpt-5-mini')] },
    metrics: { cpuPercent: 93, memoryPercent: 94, memoryUsedMb: 15401, memoryTotalMb: 16384, temperatureC: 91, temperatureSource: 'demo' },
    tasks: { tasks: [task('critical-deploy', 'Restore deployment path', 'devops', 'running', 'urgent', 14), task('critical-coder', 'Recover failed build', 'coder', 'error', 'critical', 13), task('critical-response', 'Contain production incident', 'komandos', 'running', 'urgent', 14), task('critical-cron', 'Nightly cache recovery', 'default', 'scheduled', 'high', 12)] },
    logs: { lines: [line(at(14), 'error', 'coder failed to compile deployment artifact'), line(at(14), 'error', 'System load critical: worker queue is saturated'), line(at(13), 'warning', 'devops is rerouting execution traffic')] },
    cronHistory: { completions: [{ job_id: 'world-heartbeat', name: 'World heartbeat', status: 'error', completed_at: at(12) }] },
    sessions: { sessions: [{ session_id: 'critical-ops', profile: 'devops', model: 'gpt-5', estimated_cost: 2.4, created_at: at(14) }, { session_id: 'critical-response', profile: 'komandos', model: 'gpt-5', estimated_cost: 1.85, created_at: at(14) }] },
  }),
});

export const DEMO_SCENARIO_IDS = Object.freeze(Object.keys(DEMO_WORLD_SCENARIOS));

export function getDemoScenario(id = 'healthy') {
  return DEMO_WORLD_SCENARIOS[id] ?? DEMO_WORLD_SCENARIOS.healthy;
}
