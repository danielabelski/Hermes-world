/**
 * Generic interaction contract for moments where the world explains
 * cooperation spatially. A renderer can animate these phases, while a text
 * overlay can describe the same event. Participants are profile IDs supplied
 * at runtime; no fixed character slot is required.
 */

const phase = (id, durationMs, cue) => Object.freeze({ id, durationMs, cue });

export const INTERACTION_MOMENT_DEFINITIONS = Object.freeze({
  cooperation: Object.freeze({
    type: 'cooperation',
    phases: Object.freeze([
      phase('approach', 1_000, 'walk-together'),
      phase('align', 500, 'face-each-other'),
      phase('work', 2_400, 'shared-tool'),
      phase('depart', 800, 'return-to-post'),
    ]),
    defaultDurationMs: 4_700,
    completionCue: 'cooperation-complete',
  }),
  meeting: Object.freeze({
    type: 'meeting',
    phases: Object.freeze([
      phase('approach', 1_000, 'walk-to-meeting'),
      phase('greet', 700, 'wave-or-bow'),
      phase('share', 1_600, 'show-object'),
      phase('depart', 800, 'return-to-post'),
    ]),
    defaultDurationMs: 4_100,
    completionCue: 'meeting-complete',
  }),
  'package-handoff': Object.freeze({
    type: 'package-handoff',
    phases: Object.freeze([
      phase('approach', 1_000, 'carry-package'),
      phase('transfer', 700, 'pass-package'),
      phase('confirm', 650, 'seal-confirmation'),
      phase('depart', 800, 'return-to-post'),
    ]),
    defaultDurationMs: 3_150,
    completionCue: 'package-accepted',
  }),
});

export const INTERACTION_MOMENT_TYPES = Object.freeze(Object.keys(INTERACTION_MOMENT_DEFINITIONS));

function finite(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function resolveStartAt(startedAt) {
  const value = startedAt instanceof Date ? startedAt.getTime() : new Date(startedAt ?? Date.now()).getTime();
  return Number.isFinite(value) ? value : Date.now();
}

function stableId({ type, participants, taskId, startedAt }) {
  return [type, participants.join('+'), taskId ?? 'world', resolveStartAt(startedAt)].join(':');
}

function phasesFor(definition, durationMs) {
  const baseDuration = definition.phases.reduce((total, item) => total + item.durationMs, 0);
  const scale = baseDuration > 0 ? durationMs / baseDuration : 1;
  let cursor = 0;
  return definition.phases.map((item) => {
    const scaledDurationMs = Math.max(1, Math.round(item.durationMs * scale));
    const result = { ...item, startOffsetMs: cursor, durationMs: scaledDurationMs, endOffsetMs: cursor + scaledDurationMs };
    cursor += scaledDurationMs;
    return Object.freeze(result);
  });
}

/** Create an interaction instance from dynamic profile IDs. */
export function createInteractionMoment({ type = 'cooperation', participants = [], locationBuildingId = null, fromBuildingId = null, toBuildingId = null, taskId = null, startedAt = Date.now(), durationMs, metadata = {} } = {}) {
  const definition = INTERACTION_MOMENT_DEFINITIONS[type] ?? INTERACTION_MOMENT_DEFINITIONS.cooperation;
  const participantIds = [...new Set(participants.map((participant) => String(participant)).filter(Boolean))];
  const start = resolveStartAt(startedAt);
  const length = Math.max(1, finite(durationMs, definition.defaultDurationMs));
  return Object.freeze({
    id: stableId({ type: definition.type, participants: participantIds, taskId, startedAt: start }),
    type: definition.type,
    participants: Object.freeze(participantIds),
    locationBuildingId,
    fromBuildingId,
    toBuildingId,
    taskId,
    startedAt: new Date(start).toISOString(),
    endsAt: new Date(start + length).toISOString(),
    durationMs: length,
    phases: Object.freeze(phasesFor(definition, length)),
    completionCue: definition.completionCue,
    metadata: Object.freeze({ ...metadata }),
  });
}

/** Return the active phase and normalized progress for a clock instant. */
export function getInteractionProgress(moment, now = Date.now()) {
  if (!moment) return Object.freeze({ phase: 'unknown', cue: null, progress: 0, complete: true });
  const start = resolveStartAt(moment.startedAt);
  const elapsed = finite(now instanceof Date ? now.getTime() : now, Date.now()) - start;
  const clampedElapsed = Math.max(0, Math.min(moment.durationMs ?? 0, elapsed));
  const activePhase = (moment.phases ?? []).find((item) => clampedElapsed < item.endOffsetMs) ?? moment.phases?.at(-1);
  return Object.freeze({
    phase: elapsed >= (moment.durationMs ?? 0) ? 'complete' : activePhase?.id ?? 'unknown',
    cue: elapsed >= (moment.durationMs ?? 0) ? moment.completionCue ?? null : activePhase?.cue ?? null,
    progress: moment.durationMs ? Math.round((clampedElapsed / moment.durationMs) * 1_000) / 1_000 : 1,
    complete: elapsed >= (moment.durationMs ?? 0),
  });
}

export function isInteractionActive(moment, now = Date.now()) {
  return !getInteractionProgress(moment, now).complete;
}

