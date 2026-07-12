/**
 * Renderer-neutral visual language for a living agent roster.
 *
 * The world renderer can map `animationKey`, `motionCue`, and `effectCue` to
 * sprites or procedural graphics. Keeping the timing contract here means a
 * newly added profile gets a coherent personality without a Canvas change.
 * Timings are deliberately in milliseconds so they can be used by either a
 * Pixi ticker or a React accessibility description.
 */

const cue = ({ animationKey, motionCue, effectCue = null, loop = true, durationMs = null, transitionMs = 220, frameRate = 8, speedMultiplier = 1, pauseMs = 0 }) => Object.freeze({
  animationKey,
  motionCue,
  effectCue,
  loop,
  durationMs,
  transitionMs,
  frameRate,
  speedMultiplier,
  pauseMs,
});

export const AGENT_VISUAL_STATES = Object.freeze({
  idle: cue({ animationKey: 'idle', motionCue: 'breathe', transitionMs: 360, frameRate: 5, speedMultiplier: 0.2 }),
  walking: cue({ animationKey: 'walk', motionCue: 'patrol', transitionMs: 160, frameRate: 10, speedMultiplier: 0.72 }),
  working: cue({ animationKey: 'working', motionCue: 'work-loop', effectCue: 'work-sparks', transitionMs: 180, frameRate: 12, speedMultiplier: 0.45 }),
  thinking: cue({ animationKey: 'thinking', motionCue: 'look-around', effectCue: 'thought-pulse', transitionMs: 280, frameRate: 7, speedMultiplier: 0.1, pauseMs: 900 }),
  waiting: cue({ animationKey: 'idle', motionCue: 'wait', effectCue: 'waiting-pulse', transitionMs: 320, frameRate: 5, speedMultiplier: 0, pauseMs: 1_200 }),
  stuck: cue({ animationKey: 'idle', motionCue: 'halted', effectCue: 'stuck-beacon', transitionMs: 120, frameRate: 5, speedMultiplier: 0, pauseMs: 1_400 }),
  warning: cue({ animationKey: 'idle', motionCue: 'alert', effectCue: 'warning-beacon', transitionMs: 120, frameRate: 7, speedMultiplier: 0, pauseMs: 700 }),
  success: cue({ animationKey: 'success', motionCue: 'celebrate', effectCue: 'success-glint', loop: false, durationMs: 1_600, transitionMs: 120, frameRate: 12, speedMultiplier: 0.2, pauseMs: 600 }),
  error: cue({ animationKey: 'error', motionCue: 'stumble', effectCue: 'error-smoke', loop: true, transitionMs: 90, frameRate: 8, speedMultiplier: 0, pauseMs: 700 }),
  sleeping: cue({ animationKey: 'sleeping', motionCue: 'rest', effectCue: 'sleep-zzz', transitionMs: 700, frameRate: 4, speedMultiplier: 0, pauseMs: 1_800 }),
});

export const AGENT_VISUAL_STATE_IDS = Object.freeze(Object.keys(AGENT_VISUAL_STATES));

// API/WorldBridge states are intentionally accepted as aliases. Unknown
// values remain visible as idle rather than disappearing from the world.
const STATE_ALIASES = Object.freeze({
  spawn: 'idle',
  spawning: 'idle',
  idle: 'idle',
  resting: 'sleeping',
  sleep: 'sleeping',
  sleeping: 'sleeping',
  walk: 'walking',
  walking: 'walking',
  running: 'walking',
  carrying: 'walking',
  'carrying-package': 'walking',
  work: 'working',
  working: 'working',
  inspect: 'thinking',
  inspecting: 'thinking',
  thinking: 'thinking',
  wait: 'waiting',
  waiting: 'waiting',
  blocked: 'stuck',
  stuck: 'stuck',
  alerted: 'error',
  warning: 'warning',
  error: 'error',
  failed: 'error',
  success: 'success',
  celebrate: 'success',
  celebrating: 'success',
});

export function normalizeAgentVisualState(value) {
  const key = String(value ?? 'idle').trim().toLowerCase();
  return STATE_ALIASES[key] ?? 'idle';
}

export function getAgentVisualState(value) {
  return AGENT_VISUAL_STATES[normalizeAgentVisualState(value)];
}

/**
 * Resolve an agent object while preserving its profile-specific animation key.
 * Consumers may use this directly for a dynamic roster.
 */
export function getAgentVisualCue(agent = {}) {
  const state = normalizeAgentVisualState(agent.visualState ?? agent.state ?? (agent.isActive || agent.active ? 'working' : 'idle'));
  const base = AGENT_VISUAL_STATES[state];
  const profileKey = agent.profile ?? agent.id ?? 'agent';
  return Object.freeze({
    state,
    ...base,
    animationKey: agent.animationKeys?.[state] ?? agent.animationKey ?? `${profileKey}.${base.animationKey}`,
  });
}
