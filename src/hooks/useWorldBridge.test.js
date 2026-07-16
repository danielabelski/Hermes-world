import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { reconcileWorldEventHistory } from './useWorldBridge.js';

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
