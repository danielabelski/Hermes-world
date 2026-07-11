import { BUILDING_DEFINITIONS } from './buildingDefinitions.js';

/**
 * Optional first-impression tour. It only describes camera intent; the
 * renderer decides how to interpolate a viewport. Because stops are building
 * IDs, a new building can join the tour without adding a coordinate slot.
 */
export const DEMO_CAMERA_TOUR_DURATION_MS = 20_000;
export const DEFAULT_CAMERA_TOUR_BUILDING_IDS = Object.freeze(Object.keys(BUILDING_DEFINITIONS));

const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const resolveTime = (value) => {
  const result = value instanceof Date ? value.getTime() : new Date(value ?? Date.now()).getTime();
  return Number.isFinite(result) ? result : Date.now();
};

function buildStop(buildingId, index, count, offsetMs, durationMs, buildings) {
  const building = buildings?.[buildingId];
  if (!building) return null;
  const progress = count <= 1 ? 0 : index / (count - 1);
  return Object.freeze({
    id: `tour-${buildingId}`,
    buildingId,
    label: building.label ?? buildingId,
    anchor: building.anchor ?? null,
    entrance: building.entrance ?? null,
    workAnchor: building.workAnchor ?? null,
    startOffsetMs: offsetMs,
    durationMs,
    endOffsetMs: offsetMs + durationMs,
    zoom: Math.round((0.68 + progress * 0.12) * 100) / 100,
    ease: index === 0 ? 'ease-out' : 'ease-in-out',
  });
}

/** Build a replayable tour schedule over all configured world anchors. */
export function createDemoCameraTour({ startAt = Date.now(), durationMs = DEMO_CAMERA_TOUR_DURATION_MS, buildingIds = DEFAULT_CAMERA_TOUR_BUILDING_IDS, buildings = BUILDING_DEFINITIONS, enabled = true } = {}) {
  const ids = [...new Set(buildingIds)].filter((id) => buildings?.[id]);
  const totalDuration = Math.max(1, finite(durationMs, DEMO_CAMERA_TOUR_DURATION_MS));
  const stopDuration = ids.length ? Math.floor(totalDuration / ids.length) : totalDuration;
  const remainder = ids.length ? totalDuration - stopDuration * ids.length : 0;
  const stops = ids.map((buildingId, index) => buildStop(
    buildingId,
    index,
    ids.length,
    index * stopDuration,
    stopDuration + (index === ids.length - 1 ? remainder : 0),
    buildings,
  )).filter(Boolean);
  const origin = resolveTime(startAt);
  return Object.freeze({
    id: `demo-camera-tour-${origin}`,
    enabled: Boolean(enabled),
    startAt: new Date(origin).toISOString(),
    durationMs: totalDuration,
    buildingIds: Object.freeze(ids),
    stops: Object.freeze(stops),
  });
}

export function getCameraTourFrame(tour, now = Date.now()) {
  if (!tour || !tour.enabled || !tour.stops?.length) return Object.freeze({ active: false, complete: true, progress: 1, stop: null });
  const elapsed = resolveTime(now) - resolveTime(tour.startAt);
  const clamped = Math.max(0, Math.min(tour.durationMs, elapsed));
  const stop = tour.stops.find((item) => clamped < item.endOffsetMs) ?? tour.stops.at(-1);
  const local = stop ? Math.max(0, clamped - stop.startOffsetMs) : 0;
  return Object.freeze({
    active: elapsed >= 0 && elapsed < tour.durationMs,
    complete: elapsed >= tour.durationMs,
    progress: tour.durationMs ? Math.round((clamped / tour.durationMs) * 1_000) / 1_000 : 1,
    stop,
    stopProgress: stop?.durationMs ? Math.round(Math.min(1, local / stop.durationMs) * 1_000) / 1_000 : 1,
  });
}

/**
 * Small imperative controller for a renderer or UI. `cancel()` is idempotent
 * and keeps cancellation local to the optional tour, never to world state.
 */
export function createCameraTourController(options = {}) {
  let tour = createDemoCameraTour(options);
  let cancelled = false;
  let paused = false;
  let pausedAt = null;
  return {
    getTour: () => tour,
    frame(now = Date.now()) {
      if (cancelled) return Object.freeze({ active: false, cancelled: true, complete: true, progress: 1, stop: null });
      if (paused) return Object.freeze({ ...getCameraTourFrame(tour, pausedAt ?? now), active: false, paused: true });
      return Object.freeze({ ...getCameraTourFrame(tour, now), cancelled: false, paused: false });
    },
    cancel() { cancelled = true; },
    pause(now = Date.now()) { if (!cancelled) { paused = true; pausedAt = now; } },
    resume(now = Date.now()) {
      if (cancelled || !paused || pausedAt === null) return;
      const delta = resolveTime(now) - resolveTime(pausedAt);
      tour = createDemoCameraTour({ ...options, startAt: resolveTime(tour.startAt) + delta });
      paused = false;
      pausedAt = null;
    },
    restart(startAt = Date.now()) {
      tour = createDemoCameraTour({ ...options, startAt });
      cancelled = false;
      paused = false;
      pausedAt = null;
    },
  };
}

