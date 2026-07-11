/**
 * Deterministic, renderer-neutral choreography for the first Living World
 * preview. It decorates a demo snapshot with short-lived state changes and
 * never calls Hermes APIs. Live WorldBridge snapshots remain authoritative.
 */

import { DEMO_WORLD_TIMELINE } from './data/demoWorldSchedule.js';
import { DEMO_WORLD_CHOREOGRAPHY } from './data/demoWorldChoreography.js';
import { createDemoWorldPulseSchedule, getNextWorldPulseAt } from './data/demoWorldPulse.js';
import { getAlertVisual } from './data/worldSignalDefinitions.js';

const MAX_ACTIVITY = 40;
const CYCLE_PADDING_MS = 5_000;

const asTime = (value, fallback = Date.now()) => {
  if (Number.isFinite(value)) return Number(value);
  const result = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(result) ? result : fallback;
};

const copyPoint = (point) => point ? { x: point.x, y: point.y } : null;
const list = (value) => Array.isArray(value) ? value : value?.items ?? [];
const maxTimelineEnd = Math.max(0, ...DEMO_WORLD_TIMELINE.map((item) => item.offsetMs));
const maxChoreographyEnd = Math.max(0, ...DEMO_WORLD_CHOREOGRAPHY.map((item) => item.offsetMs + item.durationMs));
export const DEMO_WORLD_CYCLE_MS = Math.max(maxTimelineEnd, maxChoreographyEnd) + CYCLE_PADDING_MS;

/**
 * The sole ownership rule for the scripted preview. Keeping the decision
 * pure makes it independently testable and prevents demo beats from being
 * accidentally composed over a real Hermes snapshot.
 */
export function shouldRunDemoScene({ enabled = true, source = 'demo' } = {}) {
  return Boolean(enabled) && source === 'demo';
}

function cloneSnapshot(snapshot = {}) {
  return {
    ...snapshot,
    agents: (snapshot.agents ?? []).map((item) => ({ ...item, position: copyPoint(item.position), targetPosition: copyPoint(item.targetPosition) })),
    tasks: (snapshot.tasks ?? []).map((item) => ({ ...item, visual: item.visual ? { ...item.visual } : item.visual })),
    buildings: (snapshot.buildings ?? []).map((item) => ({ ...item })),
    alerts: (snapshot.alerts ?? []).map((item) => ({ ...item })),
    activity: list(snapshot.activity).map((item) => ({ ...item })),
  };
}

function entityIndex(snapshot) {
  return {
    agents: new Map((snapshot.agents ?? []).map((agent) => [agent.profile ?? agent.id, agent])),
    tasks: new Map((snapshot.tasks ?? []).map((task) => [String(task.id), task])),
    buildings: new Map((snapshot.buildings ?? []).map((building) => [building.id, building])),
  };
}

function activity(snapshot, event, at) {
  const items = list(snapshot.activity);
  if (items.some((item) => item.id === event.id)) return;
  snapshot.activity = [{
    id: event.id,
    type: event.type ?? 'scene',
    severity: event.state === 'error' ? 'warning' : 'info',
    entityType: event.profile ? 'agent' : event.buildingId ? 'building' : 'world',
    entityId: event.profile ?? event.buildingId ?? 'world',
    message: event.message ?? event.cue ?? 'Citadel event',
    createdAt: new Date(at).toISOString(),
    demo: true,
  }, ...items].slice(0, MAX_ACTIVITY);
}

function targetForBuilding(building) {
  return copyPoint(building?.workAnchor ?? building?.entrance ?? building?.anchor);
}

function addAlert(snapshot, { id, severity = 'warning', profile = null, buildingId = null, message, at }) {
  if ((snapshot.alerts ?? []).some((alert) => alert.id === id)) return;
  snapshot.alerts = [{
    id,
    source: 'demo-scene-script',
    entityType: profile ? 'agent' : buildingId ? 'building' : 'system',
    entityId: profile ?? buildingId ?? 'system',
    message: message ?? 'Citadel requires attention.',
    createdAt: new Date(at).toISOString(),
    demo: true,
    ...getAlertVisual(severity),
  }, ...(snapshot.alerts ?? [])];
}

function applyTimelineEvent(snapshot, event, at) {
  const entities = entityIndex(snapshot);
  const agent = event.profile ? entities.agents.get(event.profile) : null;
  const task = event.taskId ? entities.tasks.get(String(event.taskId)) : null;
  const building = event.buildingId ? entities.buildings.get(event.buildingId) : null;

  if (agent) {
    agent.state = event.state ?? agent.state;
    agent.active = !['idle', 'sleeping'].includes(event.state);
    agent.isActive = agent.active;
    if (building && ['walking', 'working', 'thinking', 'success'].includes(event.state)) agent.targetPosition = targetForBuilding(building);
  }
  if (building && event.type === 'alert') {
    building.state = 'warning';
    building.lightLevel = Math.max(Number(building.lightLevel) || 0, 0.72);
  }
  if (task && event.type === 'package-delivered') {
    task.status = 'done';
    task.packageState = 'delivered';
    task.completedAt = new Date(at).toISOString();
  }
  if (task && event.type === 'task-success') {
    task.status = 'done';
    task.packageState = 'delivered';
    task.completedAt = new Date(at).toISOString();
  }
  if (event.type === 'alert') addAlert(snapshot, { id: `script-${event.id}`, severity: 'warning', profile: event.profile, buildingId: event.buildingId, message: event.message, at });
  if (event.type === 'recovery') {
    if (building) building.state = 'active';
    snapshot.alerts = (snapshot.alerts ?? []).filter((alert) => alert.entityId !== event.profile && alert.entityId !== event.buildingId);
  }
  activity(snapshot, event, at);
}

function applyChoreography(snapshot, moment, at) {
  const entities = entityIndex(snapshot);
  const building = entities.buildings.get(moment.locationBuildingId);
  const target = targetForBuilding(building);
  for (const profile of moment.participants ?? []) {
    const agent = entities.agents.get(profile);
    if (!agent) continue;
    agent.active = true;
    agent.isActive = true;
    agent.state = 'walking';
    agent.targetPosition = target;
    agent.sceneMoment = { id: moment.id, cue: moment.cue, role: moment.type, endsAt: new Date(at + moment.durationMs).toISOString() };
  }
  snapshot.sceneMoments = [...(snapshot.sceneMoments ?? []).filter((item) => item.id !== moment.id), {
    ...moment,
    active: true,
    startedAt: new Date(at - Math.max(0, moment.offsetMs)).toISOString(),
  }];
}

function applyPulse(snapshot, pulse, at) {
  snapshot.ambientPulses = [...(snapshot.ambientPulses ?? []).filter((item) => item.id !== pulse.id), {
    id: pulse.id,
    targetType: pulse.targetType,
    targetId: pulse.targetId,
    cue: pulse.cue,
    intensity: pulse.intensity,
    startsAt: new Date(at).toISOString(),
    endsAt: new Date(at + pulse.durationMs).toISOString(),
  }];
}

function sceneMeta(snapshot, { origin, current, cycle, activeMoments, pulses }) {
  snapshot.scene = {
    mode: 'demo-script',
    startedAt: new Date(origin).toISOString(),
    elapsedMs: Math.max(0, current - origin),
    cycle,
    activeMomentIds: activeMoments.map((item) => item.id),
    activePulseIds: pulses.map((item) => item.id),
  };
}

function activePulses(schedule, current) {
  return schedule.flatMap((pulse) => {
    const first = asTime(pulse.nextAt);
    const interval = Math.max(1, Number(pulse.intervalMs) || 1);
    const duration = Math.max(1, Number(pulse.durationMs) || 1);
    if (current < first) return [];
    const elapsed = current - first;
    const progress = elapsed % interval;
    if (progress > duration) return [];
    return [{
      ...pulse,
      firedAt: new Date(current - progress).toISOString(),
      nextAt: getNextWorldPulseAt(pulse, current),
    }];
  });
}

/**
 * A pure one-shot transformer. It is convenient for tests and for a runtime
 * that owns its own ticker. To preserve the story, call it with a stable
 * `baseSnapshot` and an elapsed timestamp.
 */
export function applyWorldSceneScript(baseSnapshot, {
  startAt = Date.now(),
  now = Date.now(),
  speed = 1,
  loop = true,
} = {}) {
  const origin = asTime(startAt);
  const current = asTime(now, origin);
  const multiplier = Math.max(0.05, Number(speed) || 1);
  const rawElapsed = Math.max(0, (current - origin) * multiplier);
  const cycle = loop ? Math.floor(rawElapsed / DEMO_WORLD_CYCLE_MS) : 0;
  const elapsed = loop ? rawElapsed % DEMO_WORLD_CYCLE_MS : rawElapsed;
  const effectiveNow = origin + elapsed / multiplier;
  const snapshot = cloneSnapshot(baseSnapshot);

  for (const event of DEMO_WORLD_TIMELINE) {
    if (event.offsetMs <= elapsed) {
      // Keep completedAt stable after a beat. Otherwise every tick would make
      // a finished task look like a brand-new success forever.
      const eventAt = effectiveNow - (elapsed - event.offsetMs) / multiplier;
      applyTimelineEvent(snapshot, event, eventAt);
    }
  }

  const activeMoments = DEMO_WORLD_CHOREOGRAPHY.filter((moment) => moment.offsetMs <= elapsed && elapsed <= moment.offsetMs + moment.durationMs);
  for (const moment of activeMoments) applyChoreography(snapshot, moment, effectiveNow);

  const schedule = createDemoWorldPulseSchedule({ startAt: origin, profiles: snapshot.agents ?? [] });
  const duePulses = activePulses(schedule, effectiveNow);
  for (const pulse of duePulses) applyPulse(snapshot, pulse, effectiveNow);
  sceneMeta(snapshot, { origin, current: effectiveNow, cycle, activeMoments, pulses: duePulses });
  return snapshot;
}

/**
 * Source-aware adapter used by invariant checks and future runtimes. It
 * deliberately preserves object identity for live telemetry.
 */
export function applyDemoSceneForSource(snapshot, { source = 'demo', enabled = true, ...options } = {}) {
  return shouldRunDemoScene({ enabled, source })
    ? applyWorldSceneScript(snapshot, options)
    : snapshot;
}

/**
 * Stateful scheduler for a preview runtime. It emits a new snapshot only;
 * callers decide whether it should feed Zustand, Pixi, tests, or an
 * accessibility summary. It intentionally has no dependency on WorldBridge.
 */
export function createWorldSceneScript({
  baseSnapshot = {},
  startAt = Date.now(),
  speed = 1,
  loop = true,
  now = Date.now,
  onUpdate = null,
} = {}) {
  const origin = asTime(startAt);
  let source = cloneSnapshot(baseSnapshot);
  let timer = null;
  let running = false;
  let lastSnapshot = null;
  const listeners = new Set();

  const emit = (snapshot) => {
    lastSnapshot = snapshot;
    onUpdate?.(snapshot);
    listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  };

  const tick = (at = now()) => emit(applyWorldSceneScript(source, { startAt: origin, now: at, speed, loop }));

  return {
    getSnapshot: () => lastSnapshot,
    setBaseSnapshot(nextSnapshot) { source = cloneSnapshot(nextSnapshot); return this; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    tick,
    start(intervalMs = 250) {
      if (running) return this;
      running = true;
      tick();
      timer = setInterval(() => tick(), Math.max(80, Number(intervalMs) || 250));
      return this;
    },
    stop() { running = false; if (timer) clearInterval(timer); timer = null; return this; },
    destroy() { this.stop(); listeners.clear(); lastSnapshot = null; },
    getPulseSchedule(at = now()) {
      const schedule = createDemoWorldPulseSchedule({ startAt: origin, profiles: source.agents ?? [] });
      return schedule.map((item) => ({ ...item, nextAt: getNextWorldPulseAt(item, at) }));
    },
  };
}
