import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { createWorldBridge, createWorldSnapshot } from '../world/WorldBridge.js';
import { DEMO_WORLD_PAYLOADS } from '../world/data/demoWorldData.js';
import { getDemoScenario } from '../world/data/demoScenarios.js';
import { applyDemoObservabilityFocus, resolveDemoObservabilityFocus } from '../world/data/demoObservabilityFocus.js';
import { createWorldSceneScript, shouldRunDemoScene } from '../world/WorldSceneScript.js';
import { applyWorldEventToSnapshot, applyWorldEventsToSnapshot } from '../world/events/worldEventReducer.js';

// sync() runs every 5s so metrics stay live; WorldBridge independently reuses
// 15s/60s domain caches for profiles, tasks and slower inventories.
const RETRY_INTERVAL_MS = 5_000;
const DEMO_SCENE_TICK_MS = 250;
const DEMO_SCENE_SPEED = 1.25;

/**
 * A snapshot made from empty API fallbacks is not a trustworthy representation
 * of Hermes. The current api.js deliberately swallows network errors and
 * returns empty collections, so the hook checks the raw payload rather than
 * relying solely on rejected promises.
 */
function hasUsableHermesData(snapshot) {
  if (!snapshot?.raw) return false;
  const profiles = Array.isArray(snapshot.raw.profiles) ? snapshot.raw.profiles : [];
  const metrics = snapshot.raw.metrics ?? {};
  const hasMetrics = ['cpuPercent', 'memoryPercent', 'temperatureC'].some((key) =>
    Number.isFinite(Number(metrics[key])),
  );
  return profiles.length > 0 || hasMetrics || snapshot.raw.tasks?.length > 0 || snapshot.raw.sessions?.length > 0;
}

/**
 * Keeps the visual world immediately useful without pretending demo data is
 * live data. It retries the real Hermes API in the background and swaps to the
 * live snapshot atomically as soon as it is available.
 *
 * The hook intentionally does not import Zustand: callers may pass the result
 * to any store/action, keeping the bridge testable and renderer-neutral.
 */
export function useWorldBridge({ enabled = true, demoMode = false, demoScenario = 'healthy', demoFocus = 'auto', retryIntervalMs = RETRY_INTERVAL_MS } = {}) {
  const demoSnapshotRef = useRef(null);
  if (!demoSnapshotRef.current) {
    const payloads = demoScenario === 'healthy' ? DEMO_WORLD_PAYLOADS : getDemoScenario(demoScenario);
    demoSnapshotRef.current = applyDemoObservabilityFocus(createWorldSnapshot(payloads), demoFocus);
  }
  const demoSnapshot = demoSnapshotRef.current;
  const bridgeRef = useRef(null);
  const retryTimerRef = useRef(null);
  const sceneScriptRef = useRef(null);
  const eventDrivenRef = useRef(false);
  const eventHistoryRef = useRef([]);
  const demoSceneStartedAtRef = useRef(Date.now());
  const mountedRef = useRef(false);
  const [state, setState] = useState(() => ({
    snapshot: demoMode ? demoSnapshot : null,
    source: demoMode ? 'demo' : 'unknown',
    connection: demoMode ? 'online' : 'connecting',
    error: null,
  }));

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (demoMode) return demoSnapshotRef.current;
    if (!enabled) return null;
    if (!bridgeRef.current) bridgeRef.current = createWorldBridge({ apiClient: api });

    try {
      const liveSnapshot = await bridgeRef.current.sync();
      if (!mountedRef.current) return liveSnapshot;

      if (hasUsableHermesData(liveSnapshot)) {
        const resolvedSnapshot = eventHistoryRef.current.length ? applyWorldEventsToSnapshot(liveSnapshot, eventHistoryRef.current) : liveSnapshot;
        const source = eventDrivenRef.current ? 'live' : liveSnapshot.lifecycle?.source ?? 'live';
        setState({
          snapshot: resolvedSnapshot,
          source,
          connection: eventDrivenRef.current ? 'online' : liveSnapshot.lifecycle?.connection ?? 'online',
          error: source === 'unknown' ? new Error('Hermes data is currently unavailable.') : null,
        });
        return liveSnapshot;
      }

      const error = new Error('Hermes API is unavailable or returned no trustworthy world data.');
      setState({ snapshot: liveSnapshot, source: liveSnapshot.lifecycle?.source ?? 'unknown', connection: liveSnapshot.lifecycle?.connection ?? 'offline', error });
      return liveSnapshot;
    } catch (error) {
      if (mountedRef.current) {
        setState((previous) => ({ ...previous, source: previous.snapshot ? 'stale' : 'unknown', connection: 'offline', error }));
      }
      return null;
    }
  }, [demoMode, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    clearRetry();

    if (demoMode) {
      setState({ snapshot: demoSnapshotRef.current, source: 'demo', connection: 'online', error: null });
      return () => { mountedRef.current = false; };
    }

    if (!enabled) {
      setState({ snapshot: null, source: 'unknown', connection: 'offline', error: null });
      return () => { mountedRef.current = false; };
    }

    let cancelled = false;
    const attempt = async () => {
      await refresh();
      if (!cancelled) retryTimerRef.current = setTimeout(attempt, retryIntervalMs);
    };
    attempt();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearRetry();
      bridgeRef.current?.stop?.();
      bridgeRef.current = null;
    };
  }, [clearRetry, demoMode, enabled, refresh, retryIntervalMs]);

  useEffect(() => {
    if (!enabled || demoMode || typeof EventSource === 'undefined') return undefined;
    const source = new EventSource('/api/world/events/stream');
    const applyEvents = (events) => {
      if (!events.length) return;
      const known = new Set(eventHistoryRef.current.map((event) => event.eventId));
      eventHistoryRef.current = [...eventHistoryRef.current, ...events.filter((event) => !known.has(event.eventId))].slice(-500);
      eventDrivenRef.current = true;
      sceneScriptRef.current?.stop?.();
      setState((previous) => {
        const base = previous.snapshot ?? demoSnapshotRef.current;
        return {
          snapshot: applyWorldEventsToSnapshot(base, events),
          source: 'live',
          connection: 'online',
          error: null,
        };
      });
    };
    const handleSnapshot = (message) => {
      try {
        const payload = JSON.parse(message.data || '{}');
        applyEvents(Array.isArray(payload.events) ? payload.events : []);
      } catch { /* malformed server events are ignored; ingestion validates them */ }
    };
    const handleEvent = (message) => {
      try {
        const event = JSON.parse(message.data || '{}');
        if (!eventHistoryRef.current.some((item) => item.eventId === event.eventId)) eventHistoryRef.current = [...eventHistoryRef.current, event].slice(-500);
        eventDrivenRef.current = true;
        sceneScriptRef.current?.stop?.();
        setState((previous) => ({
          snapshot: applyWorldEventToSnapshot(previous.snapshot ?? demoSnapshotRef.current, event),
          source: 'live',
          connection: 'online',
          error: null,
        }));
      } catch { /* malformed server events are ignored; ingestion validates them */ }
    };
    source.addEventListener('snapshot', handleSnapshot);
    source.addEventListener('world_event', handleEvent);
    return () => source.close();
  }, [demoMode, enabled]);

  /**
   * Give the offline preview an honest heartbeat: it is a deterministic
   * fixture, never a fabricated overlay on live Hermes data. Keeping this
   * here (rather than in Pixi) means overlays, accessibility text and the
   * canvas all observe exactly the same agent/task story.
   */
  useEffect(() => {
    if (!demoMode || demoScenario !== 'healthy' || resolveDemoObservabilityFocus(demoFocus) !== 'auto' || !shouldRunDemoScene({ enabled, source: state.source })) return undefined;

    const scene = createWorldSceneScript({
      baseSnapshot: demoSnapshotRef.current,
      startAt: demoSceneStartedAtRef.current,
      speed: DEMO_SCENE_SPEED,
      loop: true,
      onUpdate: (snapshot) => {
        if (!mountedRef.current || eventDrivenRef.current) return;
        setState((previous) => {
          // A sync may have switched us to real telemetry between scene ticks.
          // Returning the previous object avoids stale demo updates winning.
          if (previous.source !== 'demo') return previous;
          return { ...previous, snapshot };
        });
      },
    });

    sceneScriptRef.current = scene;
    scene.start(DEMO_SCENE_TICK_MS);

    return () => {
      scene.stop();
      if (sceneScriptRef.current === scene) sceneScriptRef.current = null;
    };
  }, [demoFocus, demoMode, demoScenario, enabled, state.source]);

  return {
    ...state,
    isDemo: state.source === 'demo',
    isLive: state.source === 'live',
    isStale: state.source === 'stale',
    isUnknown: state.source === 'unknown',
    refresh,
  };
}

export { hasUsableHermesData };
