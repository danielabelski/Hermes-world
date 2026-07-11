import { getMovementRoute } from './movementRoutes.js';
import { getAgentVisualState, normalizeAgentVisualState } from './agentVisualStates.js';

/** Per-state movement rhythm. Values are renderer-independent. */
export const AGENT_STATE_TIMINGS = Object.freeze({
  idle: Object.freeze({ speedPxPerSecond: 12, pauseMs: 1_600, arrivalPauseMs: 2_200, movement: 'wander' }),
  walking: Object.freeze({ speedPxPerSecond: 38, pauseMs: 350, arrivalPauseMs: 700, movement: 'walk' }),
  working: Object.freeze({ speedPxPerSecond: 24, pauseMs: 900, arrivalPauseMs: 1_200, movement: 'work' }),
  thinking: Object.freeze({ speedPxPerSecond: 8, pauseMs: 1_500, arrivalPauseMs: 2_500, movement: 'observe' }),
  success: Object.freeze({ speedPxPerSecond: 18, pauseMs: 500, arrivalPauseMs: 1_800, movement: 'celebrate' }),
  error: Object.freeze({ speedPxPerSecond: 0, pauseMs: 700, arrivalPauseMs: 2_200, movement: 'stumble' }),
  sleeping: Object.freeze({ speedPxPerSecond: 0, pauseMs: 1_800, arrivalPauseMs: 3_600, movement: 'rest' }),
});

const profileTiming = (walkSpeed, pauseMs, runMultiplier = 1.35) => Object.freeze({ walkSpeed, pauseMs, runMultiplier });

/**
 * Small personality differences make an otherwise identical route feel alive.
 * This is a profile registry, not a list of renderer slots; new profiles can
 * be appended without changing the timing resolver.
 */
export const AGENT_PATH_TIMINGS = Object.freeze({
  default: profileTiming(42, 1_250, 1.4),
  coder: profileTiming(34, 900, 1.25),
  developer: profileTiming(31, 1_100, 1.15),
  devops: profileTiming(39, 750, 1.3),
  komandos: profileTiming(56, 500, 1.65),
  orchestrator: profileTiming(27, 1_650, 1.1),
  outreach: profileTiming(46, 1_000, 1.45),
  prospecting: profileTiming(52, 850, 1.6),
  researcher: profileTiming(24, 1_850, 1.05),
  reviewer: profileTiming(29, 1_350, 1.15),
  synthesizer: profileTiming(26, 1_500, 1.1),
  verifier: profileTiming(30, 1_300, 1.2),
});

export const PATH_TIMING_REGISTRY = AGENT_PATH_TIMINGS;

const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (first, second) => Math.hypot((first?.x ?? 0) - (second?.x ?? 0), (first?.y ?? 0) - (second?.y ?? 0));

function waypointsFromRoute(route) {
  return Array.isArray(route?.waypoints)
    ? route.waypoints.map((waypoint) => waypoint?.position).filter(Boolean)
    : [];
}

function stateProfileTiming(profile, state) {
  const profileTimingValue = AGENT_PATH_TIMINGS[profile] ?? profileTiming(38, 1_200, 1.3);
  const stateTiming = AGENT_STATE_TIMINGS[state] ?? AGENT_STATE_TIMINGS.idle;
  const baseSpeed = state === 'walking' ? profileTimingValue.walkSpeed : stateTiming.speedPxPerSecond;
  return { ...stateTiming, baseSpeed, profilePauseMs: profileTimingValue.pauseMs, runMultiplier: profileTimingValue.runMultiplier };
}

/**
 * Calculate timing for a route using logical waypoints. `memoryPercent`
 * intentionally slows movement as the machine approaches saturation, while a
 * lower bound keeps a degraded world understandable instead of frozen.
 */
export function getAgentPathTiming(agentOrProfile, {
  state,
  route = null,
  task = null,
  memoryPercent = 0,
  tilePx = 48,
  now = Date.now,
} = {}) {
  const profile = typeof agentOrProfile === 'string' ? agentOrProfile : agentOrProfile?.profile ?? agentOrProfile?.id ?? 'unknown';
  const resolvedState = normalizeAgentVisualState(state ?? agentOrProfile?.visualState ?? agentOrProfile?.state ?? (agentOrProfile?.active || agentOrProfile?.isActive ? 'working' : 'idle'));
  const resolvedRoute = route ?? getMovementRoute(agentOrProfile, { task, now });
  const points = waypointsFromRoute(resolvedRoute);
  const stateTiming = stateProfileTiming(profile, resolvedState);
  const memoryFactor = clamp(1 - clamp(finite(memoryPercent, 0), 0, 100) * 0.004, 0.6, 1);
  const speed = stateTiming.baseSpeed * memoryFactor * (resolvedRoute?.outbound === 'rapid' ? stateTiming.runMultiplier : 1);
  const distances = points.slice(1).map((point, index) => distance(points[index], point) * tilePx);
  const distancePx = distances.reduce((total, value) => total + value, 0);
  const travelDurationMs = speed > 0 ? Math.round((distancePx / speed) * 1_000) : 0;
  const segmentDurationsMs = distances.map((segment) => speed > 0 ? Math.round((segment / speed) * 1_000) : 0);
  const pauseMs = Math.max(stateTiming.pauseMs, stateTiming.profilePauseMs);
  const durationMs = travelDurationMs + pauseMs + stateTiming.arrivalPauseMs;
  return Object.freeze({
    profile,
    state: resolvedState,
    animation: getAgentVisualState(resolvedState),
    speedPxPerSecond: Math.round(speed * 100) / 100,
    memoryFactor: Math.round(memoryFactor * 100) / 100,
    distancePx: Math.round(distancePx),
    travelDurationMs,
    pauseMs,
    arrivalPauseMs: stateTiming.arrivalPauseMs,
    durationMs,
    segmentDurationsMs: Object.freeze(segmentDurationsMs),
    route: resolvedRoute,
    generatedAt: new Date(now()).toISOString(),
  });
}

export function getStateTiming(state = 'idle', profile = 'unknown') {
  const normalized = normalizeAgentVisualState(state);
  return Object.freeze({ state: normalized, ...stateProfileTiming(profile, normalized) });
}

