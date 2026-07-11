import { normalizeAgentVisualState } from './agentVisualStates.js';

/**
 * Role language is a visual design contract, not a claim about model quality.
 * It gives a newly added profile a recognizable rhythm while live state still
 * comes from WorldBridge. No throughput is invented when Hermes does not
 * provide it; unknown values remain explicitly unknown.
 */
const personality = ({ profile, archetype, accent, idleCue, workCue, successCue, errorCue, tempo, focus, social }) => Object.freeze({
  profile,
  archetype,
  accent,
  idleCue,
  workCue,
  successCue,
  errorCue,
  tempo,
  focus,
  social,
});

export const AGENT_ROLE_PERSONALITIES = Object.freeze({
  default: personality({ profile: 'default', archetype: 'page', accent: '#78A878', idleCue: 'watchful-patrol', workCue: 'deliver-package', successCue: 'quick-bow', errorCue: 'drop-package', tempo: 0.78, focus: 0.55, social: 0.72 }),
  coder: personality({ profile: 'coder', archetype: 'blacksmith', accent: '#C45A42', idleCue: 'check-anvil', workCue: 'hammer-sparks', successCue: 'raise-hammer', errorCue: 'smoldering-coals', tempo: 0.86, focus: 0.9, social: 0.4 }),
  developer: personality({ profile: 'developer', archetype: 'master-builder', accent: '#B98C4B', idleCue: 'study-plans', workCue: 'carry-timber', successCue: 'plant-flag', errorCue: 'loose-scaffold', tempo: 0.68, focus: 0.82, social: 0.66 }),
  devops: personality({ profile: 'devops', archetype: 'siege-engineer', accent: '#788DA4', idleCue: 'inspect-gears', workCue: 'turn-crank', successCue: 'tighten-bolt', errorCue: 'steam-leak', tempo: 0.8, focus: 0.88, social: 0.5 }),
  komandos: personality({ profile: 'komandos', archetype: 'champion', accent: '#438A62', idleCue: 'guard-stance', workCue: 'rapid-response', successCue: 'salute', errorCue: 'raise-alarm', tempo: 1, focus: 0.8, social: 0.58 }),
  orchestrator: personality({ profile: 'orchestrator', archetype: 'castellan', accent: '#D6A646', idleCue: 'survey-map', workCue: 'point-command', successCue: 'seal-order', errorCue: 'ring-bell', tempo: 0.48, focus: 0.96, social: 0.94 }),
  outreach: personality({ profile: 'outreach', archetype: 'herald', accent: '#B95578', idleCue: 'read-scroll', workCue: 'sound-trumpet', successCue: 'wave-banner', errorCue: 'lost-letter', tempo: 0.82, focus: 0.6, social: 1 }),
  prospecting: personality({ profile: 'prospecting', archetype: 'scout', accent: '#638D68', idleCue: 'scan-horizon', workCue: 'run-scout-route', successCue: 'return-with-notes', errorCue: 'mark-danger', tempo: 0.98, focus: 0.76, social: 0.6 }),
  researcher: personality({ profile: 'researcher', archetype: 'scholar', accent: '#6279CC', idleCue: 'turn-page', workCue: 'write-findings', successCue: 'lift-book', errorCue: 'search-shelves', tempo: 0.38, focus: 0.98, social: 0.48 }),
  reviewer: personality({ profile: 'reviewer', archetype: 'inspector', accent: '#A37353', idleCue: 'polish-lens', workCue: 'stamp-review', successCue: 'place-seal', errorCue: 'raise-loupe', tempo: 0.5, focus: 0.94, social: 0.52 }),
  synthesizer: personality({ profile: 'synthesizer', archetype: 'alchemist', accent: '#A060C0', idleCue: 'stir-cauldron', workCue: 'blend-catalysts', successCue: 'colored-vapor', errorCue: 'spill-smoke', tempo: 0.72, focus: 0.84, social: 0.62 }),
  verifier: personality({ profile: 'verifier', archetype: 'assayer', accent: '#48A2A2', idleCue: 'balance-scales', workCue: 'weigh-sample', successCue: 'mark-proof', errorCue: 'recheck-weight', tempo: 0.46, focus: 0.93, social: 0.5 }),
});

export const STATE_PERSONALITY_MODIFIERS = Object.freeze({
  idle: Object.freeze({ motionCue: 'settled', intensity: 0.28, expressionCue: 'attentive', effectCue: null }),
  walking: Object.freeze({ motionCue: 'purposeful-stride', intensity: 0.55, expressionCue: 'focused', effectCue: 'footstep-dust' }),
  working: Object.freeze({ motionCue: 'signature-action', intensity: 0.82, expressionCue: 'concentrated', effectCue: 'tool-action' }),
  thinking: Object.freeze({ motionCue: 'pause-and-observe', intensity: 0.42, expressionCue: 'curious', effectCue: 'thought-pulse' }),
  success: Object.freeze({ motionCue: 'celebrate', intensity: 0.95, expressionCue: 'relieved', effectCue: 'success-glint' }),
  error: Object.freeze({ motionCue: 'stop-and-signal', intensity: 0.9, expressionCue: 'concerned', effectCue: 'error-smoke' }),
  sleeping: Object.freeze({ motionCue: 'rest', intensity: 0.12, expressionCue: 'peaceful', effectCue: 'sleep-zzz' }),
});

const fallbackPersonality = personality({ profile: 'unknown', archetype: 'traveler', accent: '#8DA8D4', idleCue: 'wait', workCue: 'assist', successCue: 'nod', errorCue: 'signal', tempo: 0.55, focus: 0.55, social: 0.55 });
const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Small stable hash: same profile/state always gets the same phase and scale.
function stablePhase(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 10_000) / 10_000;
}

export function resolveThroughputSignal({ throughput = null, taskCount = null, isActive = false } = {}) {
  const provided = finite(throughput);
  if (provided !== null) return { value: clamp(provided, 0, 1), source: 'provided' };
  const observedTaskCount = finite(taskCount);
  if (observedTaskCount !== null) return { value: clamp(observedTaskCount / 5, 0, 1), source: 'derived-task-count' };
  if (isActive) return { value: null, source: 'unknown-active' };
  return { value: null, source: 'unknown' };
}

export function getAgentPersonalityCue(agentOrProfile, { state, throughput = null, taskCount = null, isActive } = {}) {
  const profile = typeof agentOrProfile === 'string' ? agentOrProfile : agentOrProfile?.profile ?? agentOrProfile?.id ?? 'unknown';
  const agent = typeof agentOrProfile === 'object' ? agentOrProfile : {};
  const role = AGENT_ROLE_PERSONALITIES[profile] ?? fallbackPersonality;
  const active = Boolean(isActive ?? agent.isActive ?? agent.active);
  const normalizedState = normalizeAgentVisualState(state ?? agent.visualState ?? agent.state ?? (active ? 'working' : 'idle'));
  const modifier = STATE_PERSONALITY_MODIFIERS[normalizedState] ?? STATE_PERSONALITY_MODIFIERS.idle;
  const signal = resolveThroughputSignal({ throughput, taskCount: taskCount ?? agent.taskCount, isActive: active });
  const signalScale = signal.value === null ? 1 : 0.75 + signal.value * 0.5;
  return Object.freeze({
    profile,
    archetype: role.archetype,
    state: normalizedState,
    accent: role.accent,
    roleCue: normalizedState === 'working' ? role.workCue : normalizedState === 'success' ? role.successCue : normalizedState === 'error' ? role.errorCue : role.idleCue,
    motionCue: modifier.motionCue,
    expressionCue: modifier.expressionCue,
    effectCue: modifier.effectCue,
    intensity: Math.round(clamp(modifier.intensity * signalScale, 0, 1) * 100) / 100,
    tempo: role.tempo,
    focus: role.focus,
    social: role.social,
    throughputSignal: signal,
    phase: stablePhase(`${profile}:${normalizedState}`),
  });
}

export const getPersonalityCue = getAgentPersonalityCue;

