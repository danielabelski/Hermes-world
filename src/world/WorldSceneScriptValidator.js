/**
 * Deterministic preflight for the demo heartbeat. This is intentionally a
 * plain module instead of a renderer test: it can run in CI without WebGL,
 * React, Zustand or a reachable Hermes backend.
 */

import { createWorldSnapshot } from './WorldBridge.js';
import {
  applyDemoSceneForSource,
  applyWorldSceneScript,
  shouldRunDemoScene,
} from './WorldSceneScript.js';
import { DEMO_WORLD_PAYLOADS } from './data/demoWorldData.js';

const START_AT = 1_700_000_000_000;
const agentFor = (snapshot, profile) => (snapshot.agents ?? []).find((item) => item.profile === profile || item.id === profile);
const taskFor = (snapshot, id) => (snapshot.tasks ?? []).find((item) => String(item.id) === String(id));
const alertFor = (snapshot, id) => (snapshot.alerts ?? []).find((item) => item.entityId === id);

function snapshotAt(baseSnapshot, offsetMs) {
  return applyWorldSceneScript(baseSnapshot, {
    startAt: START_AT,
    now: START_AT + offsetMs,
    loop: false,
  });
}

function expect(condition, code, message, issues) {
  if (!condition) issues.push(Object.freeze({ code, message, severity: 'error' }));
}

/**
 * Checks the readable story required by the vertical slice: work -> thinking
 * -> success, a contained warning -> recovery, and strict source ownership.
 * It never mutates its optional fixture argument.
 */
export function validateWorldSceneScriptCycle(baseSnapshot = createWorldSnapshot(DEMO_WORLD_PAYLOADS)) {
  const issues = [];
  const before = JSON.stringify(baseSnapshot);

  // The 3.6–6.0s briefing intentionally makes the researcher walk to the
  // fountain, so sample immediately after it to verify the work phase itself.
  const working = snapshotAt(baseSnapshot, 6_100);
  expect(agentFor(working, 'researcher')?.state === 'working', 'missing-working-beat', 'Researcher must visibly work at the beginning of the cycle.', issues);

  const thinking = snapshotAt(baseSnapshot, 12_400);
  expect(agentFor(thinking, 'researcher')?.state === 'thinking', 'missing-thinking-beat', 'Researcher must enter a readable thinking state before completion.', issues);

  const success = snapshotAt(baseSnapshot, 18_700);
  expect(agentFor(success, 'researcher')?.state === 'success', 'missing-success-beat', 'Researcher must visibly complete the same work cycle.', issues);
  expect(taskFor(success, 'demo-research')?.status === 'done', 'task-not-completed', 'Research task must become a delivered package on success.', issues);

  const warning = snapshotAt(baseSnapshot, 21_100);
  expect(agentFor(warning, 'reviewer')?.state === 'error', 'missing-warning-beat', 'Reviewer must expose the warning/error beat.', issues);
  expect(Boolean(alertFor(warning, 'reviewer')), 'missing-alert', 'Warning beat must create an inspectable alert.', issues);

  const recovery = snapshotAt(baseSnapshot, 31_100);
  expect(agentFor(recovery, 'reviewer')?.state === 'thinking', 'missing-recovery-state', 'Reviewer must leave error state during recovery.', issues);
  expect(!alertFor(recovery, 'reviewer'), 'alert-not-cleared', 'Recovery must clear the reviewer alert.', issues);

  const liveSnapshot = Object.freeze({ lifecycle: Object.freeze({ connection: 'online' }), agents: Object.freeze([]) });
  const liveBefore = JSON.stringify(liveSnapshot);
  const liveResult = applyDemoSceneForSource(liveSnapshot, { source: 'live', startAt: START_AT, now: START_AT + 50_000 });
  expect(shouldRunDemoScene({ enabled: true, source: 'live' }) === false, 'live-guard-open', 'Demo scheduler must be disabled for a live source.', issues);
  expect(liveResult === liveSnapshot && JSON.stringify(liveSnapshot) === liveBefore, 'live-snapshot-mutated', 'Live snapshot must remain the exact same immutable object.', issues);
  expect(JSON.stringify(baseSnapshot) === before, 'fixture-mutated', 'Scene transformer must not mutate its base fixture.', issues);

  return Object.freeze({
    valid: issues.length === 0,
    directive: 'Living World demo scene cycle',
    checkpoints: Object.freeze({ working: 6_100, thinking: 12_400, success: 18_700, warning: 21_100, recovery: 31_100 }),
    issues: Object.freeze(issues),
  });
}

export function assertWorldSceneScriptCycle(baseSnapshot, options) {
  const report = validateWorldSceneScriptCycle(baseSnapshot, options);
  if (!report.valid) throw new Error(`Living World scene cycle is invalid:\n${report.issues.map((item) => `- ${item.message}`).join('\n')}`);
  return report;
}
