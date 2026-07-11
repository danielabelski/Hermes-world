/**
 * Intentional demo data for the first visual slice. It is never mixed into
 * production snapshots; callers opt into it with WorldBridge demoMode.
 */

import { getDemoScenario } from './demoScenarios.js';

/**
 * Readable roster for the first visual slice.  These values intentionally
 * mirror the renderer-neutral shape produced by WorldBridge while adding the
 * small amount of presentation data the canvas needs before the first API
 * snapshot arrives.  Keeping this in demo data makes the initial world
 * deterministic and keeps it completely separate from Hermes OS CAT.
 */
const point = (x, y) => Object.freeze({ x, y });
const demoAgent = ({ profile, role, color, cloak, active, home, work, tool }) => Object.freeze({
  id: profile,
  profile,
  role,
  displayName: role,
  color,
  cloak,
  colorHex: `#${color.toString(16).padStart(6, '0')}`,
  homeAnchor: point(...home),
  workAnchor: point(...work),
  position: point(...home),
  targetPosition: point(...(active ? work : home)),
  active,
  isActive: active,
  state: active ? 'working' : 'idle',
  tool,
});

export const DEMO_AGENT_ROSTER = Object.freeze([
  demoAgent({ profile: 'orchestrator', role: 'Kasztelan', color: 0xd9b66f, cloak: 0x5d3144, active: true, home: [5, 2], work: [5, 2.45], tool: 'laska i pieczęć' }),
  demoAgent({ profile: 'coder', role: 'Kowal', color: 0xdf7657, cloak: 0x6f2632, active: true, home: [2, 6], work: [2.2, 6.2], tool: 'młot i kowadło' }),
  demoAgent({ profile: 'researcher', role: 'Uczony', color: 0x8da8d4, cloak: 0x38466f, active: true, home: [2, 4], work: [2.15, 4.15], tool: 'pióro i księgi' }),
  demoAgent({ profile: 'developer', role: 'Budowniczy', color: 0xc69b56, cloak: 0x67492b, active: true, home: [2, 8], work: [2.2, 7.85], tool: 'plany i kątownik' }),
  demoAgent({ profile: 'synthesizer', role: 'Alchemik', color: 0xb874d0, cloak: 0x54336d, active: true, home: [8, 4], work: [7.85, 4.2], tool: 'retorta i kociołek' }),
  demoAgent({ profile: 'devops', role: 'Inżynier', color: 0x8ca5c2, cloak: 0x3d506c, active: true, home: [5, 9], work: [5.2, 8.7], tool: 'klucz i oliwiarka' }),
  demoAgent({ profile: 'komandos', role: 'Rycerz', color: 0x7fc28a, cloak: 0x315d48, active: false, home: [8, 7], work: [7.8, 6.8], tool: 'miecz i tarcza' }),
  demoAgent({ profile: 'outreach', role: 'Herold', color: 0xd27791, cloak: 0x683d58, active: false, home: [8, 2], work: [8.3, 2.3], tool: 'trąbka i zwoje' }),
  demoAgent({ profile: 'prospecting', role: 'Zwiadowca', color: 0x83b87b, cloak: 0x3d694e, active: false, home: [2, 2], work: [1.75, 2.3], tool: 'lornetka i mapa' }),
  demoAgent({ profile: 'reviewer', role: 'Inspektor', color: 0xc09072, cloak: 0x664637, active: false, home: [5, 6], work: [5.15, 6.2], tool: 'lupa i pieczęć' }),
  demoAgent({ profile: 'verifier', role: 'Probierz', color: 0x67c0c0, cloak: 0x2f5968, active: false, home: [8, 6], work: [7.85, 6.2], tool: 'waga i monokl' }),
  demoAgent({ profile: 'default', role: 'Paź', color: 0x91c68b, cloak: 0x3f694a, active: false, home: [3.75, 8.85], work: [5.25, 7.7], tool: 'torba z narzędziami' }),
]);

export const DEMO_TASKS = Object.freeze([
  Object.freeze({ id: 'demo-architecture', title: 'Map orchestration routes', body: 'Kasztelan wyznacza trasę przez dziedziniec.', assignee: 'orchestrator', status: 'running', priority: 'high', packageState: 'carried' }),
  Object.freeze({ id: 'demo-forge', title: 'Shape first visual slice', body: 'Kowal pracuje przy rozgrzanym palenisku.', assignee: 'coder', status: 'running', priority: 'normal', packageState: 'carried' }),
  Object.freeze({ id: 'demo-research', title: 'Review world signals', body: 'Uczony porównuje najnowsze zapisy.', assignee: 'researcher', status: 'review', priority: 'normal', packageState: 'stored' }),
  Object.freeze({ id: 'demo-build', title: 'Raise the south bridge', body: 'Budowniczy czeka na dostawę desek.', assignee: 'developer', status: 'ready', priority: 'high', packageState: 'stored' }),
  Object.freeze({ id: 'demo-alchemy', title: 'Blend model catalysts', body: 'Alchemik miesza świecący eliksir.', assignee: 'synthesizer', status: 'done', priority: 'low', packageState: 'delivered' }),
]);

/** @deprecated Use getDemoScenario('healthy' | 'warning' | 'critical'). */
export const LEGACY_DEMO_WORLD_PAYLOADS = Object.freeze({
  profiles: Object.freeze({ profiles: Object.freeze([
    { name: 'orchestrator', is_active: true, is_default: false, model: 'gpt-5' },
    { name: 'coder', is_active: true, is_default: false, model: 'gpt-5-codex' },
    { name: 'researcher', is_active: true, is_default: false, model: 'gpt-5-mini' },
    { name: 'komandos', is_active: false, is_default: false, model: 'gpt-5' },
    { name: 'default', is_active: false, is_default: true, model: 'gpt-5-mini' },
  ]) }),
  metrics: Object.freeze({ cpuPercent: 23, memoryPercent: 41, memoryUsedMb: 6554, memoryTotalMb: 16384, temperatureC: 57, temperatureSource: 'demo' }),
  tasks: Object.freeze({ tasks: Object.freeze([
    { id: 'demo-architecture', title: 'Map orchestration routes', assignee: 'orchestrator', status: 'running', priority: 'high', started_at: '2026-07-10T07:00:00.000Z' },
    { id: 'demo-forge', title: 'Shape first visual slice', assignee: 'coder', status: 'running', priority: 'normal', started_at: '2026-07-10T07:05:00.000Z' },
    { id: 'demo-research', title: 'Review world signals', assignee: 'researcher', status: 'review', priority: 'normal' },
  ]) }),
  logs: Object.freeze({ lines: Object.freeze([
    JSON.stringify({ timestamp: '2026-07-10T07:06:00.000Z', level: 'info', logger_name: 'hermes.world', message: 'Citadel systems synchronized' }),
  ]) }),
  crons: Object.freeze({ jobs: Object.freeze([{ id: 'demo-heartbeat', name: 'World heartbeat', enabled: true, last_run_at: '2026-07-10T07:00:00.000Z' }]) }),
  cronHistory: Object.freeze({ completions: Object.freeze([{ job_id: 'demo-heartbeat', name: 'World heartbeat', status: 'ok', completed_at: '2026-07-10T07:00:00.000Z' }]) }),
  sessions: Object.freeze({ sessions: Object.freeze([{ session_id: 'demo-session', profile: 'coder', model: 'gpt-5-codex', estimated_cost: 0.14, created_at: '2026-07-10T07:00:00.000Z' }]) }),
  skills: Object.freeze({ skills: Object.freeze([{ name: 'code', disabled: false }, { name: 'research', disabled: false }]) }),
  models: Object.freeze({ groups: Object.freeze([{ provider: 'openai', models: Object.freeze([{ id: 'gpt-5' }, { id: 'gpt-5-codex' }]) }]) }),
});

// Compatibility export for the existing WorldBridge. New consumers select an
// explicit scenario through demoScenarios.js.
export const DEMO_WORLD_PAYLOADS = getDemoScenario('healthy');
