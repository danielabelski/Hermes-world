/**
 * Quiet background life for the first preview. Pulses are recurring cues, not
 * fake telemetry: they keep water, flags and resting characters breathing
 * while the API has no new event. All intervals are deterministic and can be
 * paused when the document is hidden or reduced motion is enabled.
 */

const pulse = ({ id, targetType, targetId = null, cue, intervalMs, durationMs, intensity, offsetMs = 0 }) => Object.freeze({
  id,
  targetType,
  targetId,
  cue,
  intervalMs,
  durationMs,
  intensity,
  offsetMs,
});

export const CALM_AMBIENT_PULSE = Object.freeze({
  intervalMs: 7_500,
  durationMs: 1_800,
  intensity: 0.22,
  cue: 'ambient-breathe',
});

export const DEMO_WORLD_PULSE_CHANNELS = Object.freeze([
  pulse({ id: 'pulse-fountain', targetType: 'building', targetId: 'fountain', cue: 'water-ripple', intervalMs: 4_800, durationMs: 1_200, intensity: 0.42, offsetMs: 400 }),
  pulse({ id: 'pulse-keep-flags', targetType: 'building', targetId: 'keep', cue: 'flag-wave', intervalMs: 6_400, durationMs: 2_100, intensity: 0.2, offsetMs: 1_100 }),
  pulse({ id: 'pulse-market-dust', targetType: 'world', targetId: 'courtyard', cue: 'dust-mote', intervalMs: 9_000, durationMs: 2_500, intensity: 0.14, offsetMs: 2_700 }),
  pulse({ id: 'pulse-token-river', targetType: 'world', targetId: 'token-river', cue: 'token-glimmer', intervalMs: 5_600, durationMs: 900, intensity: 0.26, offsetMs: 1_900 }),
]);

const stableHash = (value) => {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
};

const resolveTime = (value) => {
  const result = value instanceof Date ? value.getTime() : new Date(value ?? Date.now()).getTime();
  return Number.isFinite(result) ? result : Date.now();
};

/** Add profile-targeted idle breaths without assuming a fixed roster size. */
export function createDemoWorldPulseSchedule({ startAt = Date.now(), profiles = [], channels = DEMO_WORLD_PULSE_CHANNELS, includeAgentPulses = true } = {}) {
  const origin = resolveTime(startAt);
  const base = channels.map((channel) => Object.freeze({
    ...channel,
    nextAt: new Date(origin + channel.offsetMs).toISOString(),
  }));
  if (!includeAgentPulses) return Object.freeze(base);
  const agentPulses = [...new Set(profiles.map((profile) => typeof profile === 'string' ? profile : profile?.profile ?? profile?.id).filter(Boolean))].map((profile) => {
    const channel = pulse({
      id: `pulse-agent-${profile}`,
      targetType: 'agent',
      targetId: profile,
      cue: 'idle-breathe',
      intervalMs: CALM_AMBIENT_PULSE.intervalMs + (stableHash(profile) % 1_200) - 600,
      durationMs: CALM_AMBIENT_PULSE.durationMs,
      intensity: CALM_AMBIENT_PULSE.intensity,
      offsetMs: stableHash(`${profile}:offset`) % CALM_AMBIENT_PULSE.intervalMs,
    });
    return Object.freeze({ ...channel, nextAt: new Date(origin + channel.offsetMs).toISOString() });
  });
  return Object.freeze([...base, ...agentPulses]);
}

export function getDueWorldPulses(schedule = [], now = Date.now()) {
  const current = resolveTime(now);
  return schedule.filter((item) => resolveTime(item.nextAt) <= current).map((item) => Object.freeze({
    ...item,
    firedAt: new Date(current).toISOString(),
    nextAt: new Date(resolveTime(item.nextAt) + Math.max(1, item.intervalMs)).toISOString(),
  }));
}

export function getNextWorldPulseAt(item, now = Date.now()) {
  const current = resolveTime(now);
  const next = resolveTime(item?.nextAt);
  const interval = Math.max(1, Number(item?.intervalMs) || CALM_AMBIENT_PULSE.intervalMs);
  if (next > current) return new Date(next).toISOString();
  const steps = Math.floor((current - next) / interval) + 1;
  return new Date(next + steps * interval).toISOString();
}

