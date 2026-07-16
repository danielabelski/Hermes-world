import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { createWorldBridge, createWorldSnapshot } from '../world/WorldBridge.js';
import { DEMO_WORLD_PAYLOADS } from '../world/data/demoWorldData.js';
import { getDemoScenario } from '../world/data/demoScenarios.js';
import { applyDemoObservabilityFocus, resolveDemoObservabilityFocus } from '../world/data/demoObservabilityFocus.js';
import { createWorldSceneScript, shouldRunDemoScene } from '../world/WorldSceneScript.js';
import { applyWorldEventToSnapshot, applyWorldEventsToSnapshot } from '../world/events/worldEventReducer.js';
import { subscribeWorldEventStream } from '../world/events/worldEventStream.js';

// sync() runs every 5s so metrics stay live; WorldBridge independently reuses
// 15s/60s domain caches for profiles, tasks and slower inventories.
const RETRY_INTERVAL_MS = 5_000;
const DEMO_SCENE_TICK_MS = 250;
const DEMO_SCENE_SPEED = 1.25;
const TERMINAL_WORLD_STATES = new Set(['success', 'idle', 'critical']);

/**
 * A dropped browser SSE can leave the last observed edge at `working` even
 * after Hermes has already closed the corresponding session.  The session
 * inventory is authoritative for whether that stream still exists.  When it
 * explicitly says a session is no longer streaming and no terminal edge was
 * observed, discard that run's transient overlay and let the live snapshot
 * describe the agent.  This never fabricates Success/Idle.
 */
export function reconcileWorldEventHistory(liveSnapshot, events = []) {
  const sessions = Array.isArray(liveSnapshot?.raw?.sessions) ? liveSnapshot.raw.sessions : [];
  if (!sessions.length || !events.length) return events;

  const sessionById = new Map(sessions.map((session) => [String(session?.id ?? session?.session_id ?? ''), session]));
  const eventsByRun = new Map();
  for (const event of events) {
    const runId = String(event?.runId ?? '');
    if (!runId) continue;
    const bucket = eventsByRun.get(runId) ?? [];
    bucket.push(event);
    eventsByRun.set(runId, bucket);
  }

  const abandonedRuns = new Set();
  for (const [runId, runEvents] of eventsByRun) {
    const latest = [...runEvents].sort((a, b) => Number(a?.seq ?? 0) - Number(b?.seq ?? 0)).at(-1);
    if (!latest?.sessionId || TERMINAL_WORLD_STATES.has(latest.state)) continue;
    const session = sessionById.get(String(latest.sessionId));
    if (session && session.is_streaming === false) abandonedRuns.add(runId);
  }

  return abandonedRuns.size ? events.filter((event) => !abandonedRuns.has(String(event?.runId ?? ''))) : events;
}

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
 * live snapshot as genuine Hermes domains arrive.
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
  const bridgeUnsubscribeRef = useRef(null);
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

  const applyLiveSnapshot = useCallback((liveSnapshot) => {
    if (!mountedRef.current) return;
    if (hasUsableHermesData(liveSnapshot)) {
      eventHistoryRef.current = reconcileWorldEventHistory(liveSnapshot, eventHistoryRef.current);
      const resolvedSnapshot = eventHistoryRef.current.length ? applyWorldEventsToSnapshot(liveSnapshot, eventHistoryRef.current) : liveSnapshot;
      const source = eventDrivenRef.current ? 'live' : liveSnapshot.lifecycle?.source ?? 'live';
      setState({
        snapshot: resolvedSnapshot,
        source,
        connection: eventDrivenRef.current ? 'online' : liveSnapshot.lifecycle?.connection ?? 'online',
        error: source === 'unknown' ? new Error('Hermes data is currently unavailable.') : null,
      });
      return;
    }
    const error = new Error('Hermes API is unavailable or returned no trustworthy world data.');
    setState({ snapshot: liveSnapshot, source: liveSnapshot.lifecycle?.source ?? 'unknown', connection: liveSnapshot.lifecycle?.connection ?? 'offline', error });
  }, []);

  const refresh = useCallback(async () => {
    if (demoMode) return demoSnapshotRef.current;
    if (!enabled) return null;
    if (!bridgeRef.current) {
      bridgeRef.current = createWorldBridge({ apiClient: api });
      bridgeUnsubscribeRef.current = bridgeRef.current.subscribe(applyLiveSnapshot);
    }

    try {
      const liveSnapshot = await bridgeRef.current.sync();
      applyLiveSnapshot(liveSnapshot);
      return liveSnapshot;
    } catch (error) {
      if (mountedRef.current) {
        setState((previous) => ({ ...previous, source: previous.snapshot ? 'stale' : 'unknown', connection: 'offline', error }));
      }
      return null;
    }
  }, [applyLiveSnapshot, demoMode, enabled]);

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
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') await refresh();
      if (!cancelled) retryTimerRef.current = setTimeout(attempt, retryIntervalMs);
    };
    attempt();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearRetry();
      bridgeUnsubscribeRef.current?.();
      bridgeUnsubscribeRef.current = null;
      bridgeRef.current?.stop?.();
      bridgeRef.current = null;
    };
  }, [clearRetry, demoMode, enabled, refresh, retryIntervalMs]);

  useEffect(() => {
    if (!enabled || demoMode) return undefined;
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
    const handleEvent = (event) => {
      if (!eventHistoryRef.current.some((item) => item.eventId === event.eventId)) eventHistoryRef.current = [...eventHistoryRef.current, event].slice(-500);
      eventDrivenRef.current = true;
      sceneScriptRef.current?.stop?.();
      setState((previous) => ({
        snapshot: applyWorldEventToSnapshot(previous.snapshot ?? demoSnapshotRef.current, event),
        source: 'live',
        connection: 'online',
        error: null,
      }));
    };
    return subscribeWorldEventStream({ onSnapshot: applyEvents, onEvent: handleEvent });
  }, [demoMode, enabled]);

  useEffect(() => {
    if (!enabled || demoMode) return undefined;
    const resume = () => {
      if (document.visibilityState === 'hidden') return;
      refresh();
    };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume);
    window.addEventListener('online', resume);
    return () => {
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('online', resume);
    };
  }, [demoMode, enabled, refresh]);

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
