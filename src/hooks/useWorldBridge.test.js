import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { reconcileWorldEventHistory, resyncWorldSnapshot } from './useWorldBridge.js';
import { createWorldSnapshot } from '../world/WorldBridge.js';
import { DEMO_WORLD_PAYLOADS } from '../world/data/demoWorldData.js';
import { normalizeHermesWorldEvent } from '../world/events/worldEventContract.js';

const edge = (overrides = {}) => ({
  eventId: 'run-1:1',
  runId: 'run-1',
  seq: 1,
  sessionId: 'session-1',
  state: 'working',
  ...overrides,
});

describe('reconcileWorldEventHistory', () => {
  it('removes an unterminated run only when the real session inventory says its stream ended', () => {
    const snapshot = { raw: { sessions: [{ id: 'session-1', is_streaming: false }] } };
    assert.deepEqual(reconcileWorldEventHistory(snapshot, [edge()]), []);
  });

  it('preserves an active stream and does not infer a terminal state', () => {
    const events = [edge()];
    const snapshot = { raw: { sessions: [{ id: 'session-1', is_streaming: true }] } };
    assert.deepEqual(reconcileWorldEventHistory(snapshot, events), events);
  });

  it('preserves completed evidence even when the session is no longer streaming', () => {
    const events = [edge(), edge({ eventId: 'run-1:2', seq: 2, state: 'success' })];
    const snapshot = { raw: { sessions: [{ id: 'session-1', is_streaming: false }] } };
    assert.deepEqual(reconcileWorldEventHistory(snapshot, events), events);
  });

  it('does not discard evidence when the session inventory cannot prove the stream ended', () => {
    const events = [edge()];
    assert.deepEqual(reconcileWorldEventHistory({ raw: { sessions: [] } }, events), events);
  });
});

it('authoritative reconnect resync overlays an event received while the atomic snapshot is in flight', async () => {
  let releaseSnapshot;
  const events = [];
  const bridge = {
    syncOptions: null,
    sync(options) {
      this.syncOptions = options;
      return new Promise((resolve) => { releaseSnapshot = resolve; });
    },
  };
  const pending = resyncWorldSnapshot(bridge, () => events);
  events.push(normalizeHermesWorldEvent({
    event_id: 'resync-run:1',
    run_id: 'resync-run',
    session_id: 'session-live',
    seq: 1,
    event: 'reasoning',
    created_at: '2026-07-18T06:00:00.000Z',
    profile: 'watcher',
  }));
  releaseSnapshot(createWorldSnapshot(DEMO_WORLD_PAYLOADS));

  const result = await pending;
  assert.deepEqual(bridge.syncOptions, { force: true, atomic: true });
  assert.equal(result.events.length, 1);
  assert.equal(result.snapshot.agents.find((agent) => agent.profile === 'prospecting').state, 'thinking');
});
