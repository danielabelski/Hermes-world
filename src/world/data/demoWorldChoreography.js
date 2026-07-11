/**
 * Renderer-neutral social beats for the demo world. These are short, legible
 * moments that explain cooperation at a glance: two agents meet, a package
 * changes hands, or a specialist joins another building's work. The live
 * backend remains authoritative; this fixture only gives the first preview a
 * heartbeat before a fresh snapshot arrives.
 */

const moment = ({ id, type, offsetMs, participants, locationBuildingId, fromBuildingId = null, toBuildingId = null, taskId = null, durationMs, cue, message }) => Object.freeze({
  id,
  type,
  offsetMs,
  participants: Object.freeze(participants),
  locationBuildingId,
  fromBuildingId,
  toBuildingId,
  taskId,
  durationMs,
  cue,
  message,
});

export const DEMO_WORLD_CHOREOGRAPHY = Object.freeze([
  moment({ id: 'moment-briefing', type: 'meeting', offsetMs: 3_600, participants: ['orchestrator', 'researcher'], locationBuildingId: 'fountain', durationMs: 2_400, cue: 'shared-map', message: 'Kasztelan i Uczony porównują mapy przy Fontannie Zdrowia.' }),
  moment({ id: 'moment-forge-review', type: 'package-pass', offsetMs: 8_200, participants: ['coder', 'reviewer'], locationBuildingId: 'inspection-hall', fromBuildingId: 'forge', toBuildingId: 'inspection-hall', taskId: 'demo-forge', durationMs: 1_700, cue: 'package-hand-off', message: 'Kowal przekazuje paczkę Inspektorowi.' }),
  moment({ id: 'moment-builder-engineer', type: 'cooperation', offsetMs: 12_700, participants: ['developer', 'devops'], locationBuildingId: 'siege-workshop', fromBuildingId: 'builders-yard', toBuildingId: 'siege-workshop', taskId: 'demo-build', durationMs: 3_200, cue: 'measure-and-tighten', message: 'Budowniczy i Inżynier wspólnie wzmacniają most.' }),
  moment({ id: 'moment-alchemist-assayer', type: 'meeting', offsetMs: 17_100, participants: ['synthesizer', 'verifier'], locationBuildingId: 'assay-office', fromBuildingId: 'alchemist-lab', toBuildingId: 'assay-office', taskId: 'demo-alchemy', durationMs: 2_100, cue: 'inspect-crystal', message: 'Alchemik pokazuje Probierzowi nowy katalizator.' }),
  moment({ id: 'moment-scout-herald', type: 'package-pass', offsetMs: 21_500, participants: ['prospecting', 'outreach'], locationBuildingId: 'keep', fromBuildingId: 'scout-lodge', toBuildingId: 'herald-tower', durationMs: 1_900, cue: 'scroll-hand-off', message: 'Zwiadowca przekazuje Heroldowi notatki z wyprawy.' }),
  moment({ id: 'moment-guard-support', type: 'cooperation', offsetMs: 26_300, participants: ['komandos', 'reviewer'], locationBuildingId: 'inspection-hall', fromBuildingId: 'barracks', toBuildingId: 'inspection-hall', taskId: 'demo-research', durationMs: 2_600, cue: 'guard-and-review', message: 'Rycerz zabezpiecza Salę Inspekcyjną, gdy Inspektor kończy kontrolę.' }),
]);

export const DEMO_COOPERATION_MOMENTS = DEMO_WORLD_CHOREOGRAPHY;
export const DEMO_CHOREOGRAPHY_PROFILE_IDS = Object.freeze([...new Set(DEMO_WORLD_CHOREOGRAPHY.flatMap((item) => item.participants))]);

function resolveStartAt(startAt) {
  const value = startAt instanceof Date ? startAt.getTime() : new Date(startAt ?? Date.now()).getTime();
  return Number.isFinite(value) ? value : Date.now();
}

/** Expand relative beats into an absolute, replayable choreography. */
export function createDemoWorldChoreography({ startAt = Date.now(), speed = 1 } = {}) {
  const origin = resolveStartAt(startAt);
  const timeScale = Number.isFinite(Number(speed)) && Number(speed) > 0 ? Number(speed) : 1;
  return DEMO_WORLD_CHOREOGRAPHY.map((item) => Object.freeze({
    ...item,
    startsAt: new Date(origin + item.offsetMs / timeScale).toISOString(),
    endsAt: new Date(origin + (item.offsetMs + item.durationMs) / timeScale).toISOString(),
  }));
}

export function getDueChoreography({ startAt = Date.now(), now = Date.now(), speed = 1 } = {}) {
  const current = resolveStartAt(now);
  return createDemoWorldChoreography({ startAt, speed }).filter((item) => {
    const start = new Date(item.startsAt).getTime();
    const end = new Date(item.endsAt).getTime();
    return start <= current && current <= end;
  });
}

