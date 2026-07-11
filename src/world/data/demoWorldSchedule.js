/**
 * A small deterministic story beat for the first Living World preview. It is
 * intentionally renderer-neutral: a WorldRuntime can consume these events,
 * while tests or a React accessibility layer can inspect the same timeline.
 * No event claims to be telemetry from Hermes; live snapshots remain the
 * source of truth once WorldBridge is connected.
 */

const event = ({ id, type, offsetMs, profile = null, buildingId = null, taskId = null, state, cue, message }) => Object.freeze({
  id,
  type,
  offsetMs,
  profile,
  buildingId,
  taskId,
  state,
  cue,
  message,
});

export const DEMO_WORLD_TIMELINE = Object.freeze([
  event({ id: 'demo-morning-patrol', type: 'patrol', offsetMs: 0, profile: 'prospecting', buildingId: 'scout-lodge', state: 'walking', cue: 'morning-patrol', message: 'Zwiadowca obchodzi mury i wraca z mapą.' }),
  event({ id: 'demo-citadel-wakes', type: 'work-started', offsetMs: 2_800, profile: 'orchestrator', buildingId: 'keep', state: 'working', cue: 'command', message: 'Kasztelan otwiera mapę pracy Cytadeli.' }),
  event({ id: 'demo-forge-work', type: 'work-started', offsetMs: 5_400, profile: 'coder', buildingId: 'forge', taskId: 'demo-forge', state: 'working', cue: 'work-sparks', message: 'Kowal rozpala kuźnię i zaczyna pracę.' }),
  event({ id: 'demo-scout-observe', type: 'analysis', offsetMs: 7_200, profile: 'prospecting', buildingId: 'scout-lodge', taskId: 'demo-scout', state: 'observing', cue: 'watch-signal', message: 'Zwiadowca zatrzymuje się przy murach i obserwuje ruch danych.' }),
  event({ id: 'demo-package-delivery', type: 'package-delivered', offsetMs: 10_500, profile: 'developer', buildingId: 'builders-yard', taskId: 'demo-build', state: 'walking', cue: 'package-arrival', message: 'Budowniczy dostarcza paczkę na Plac Budowy.' }),
  event({ id: 'demo-research-thinking', type: 'analysis', offsetMs: 12_300, profile: 'researcher', buildingId: 'library', taskId: 'demo-research', state: 'thinking', cue: 'pages-turn', message: 'Uczony zatrzymuje się nad trudnym pytaniem.' }),
  event({ id: 'demo-alchemy-success', type: 'task-success', offsetMs: 15_800, profile: 'synthesizer', buildingId: 'alchemist-lab', taskId: 'demo-alchemy', state: 'success', cue: 'success-glint', message: 'Alchemik kończy mieszankę modeli.' }),
  event({ id: 'demo-scout-success', type: 'task-success', offsetMs: 13_000, profile: 'prospecting', buildingId: 'scout-lodge', taskId: 'demo-scout', state: 'success', cue: 'map-return', message: 'Zwiadowca wraca z mapą przepływu.' }),
  event({ id: 'demo-forge-success', type: 'task-success', offsetMs: 15_000, profile: 'coder', buildingId: 'forge', taskId: 'demo-forge', state: 'success', cue: 'forged-package', message: 'Kowal kończy paczkę i wychodzi z Kuźni.' }),
  event({ id: 'demo-research-success', type: 'task-success', offsetMs: 18_600, profile: 'researcher', buildingId: 'library', taskId: 'demo-research', state: 'success', cue: 'sealed-scroll', message: 'Uczony zamyka księgę i przekazuje potwierdzony wniosek.' }),
  event({ id: 'demo-review-alert', type: 'alert', offsetMs: 21_000, profile: 'reviewer', buildingId: 'inspection-hall', taskId: 'demo-research', state: 'error', cue: 'warning-pulse', message: 'Inspektor znajduje zadanie wymagające uwagi.' }),
  event({ id: 'demo-guard-response', type: 'recovery-started', offsetMs: 24_500, profile: 'komandos', buildingId: 'barracks', taskId: 'demo-research', state: 'walking', cue: 'rapid-response', message: 'Rycerz rusza do Sali Inspekcyjnej.' }),
  event({ id: 'demo-review-recovery', type: 'recovery', offsetMs: 31_000, profile: 'reviewer', buildingId: 'inspection-hall', taskId: 'demo-research', state: 'thinking', cue: 'recovery-check', message: 'Inspektor ponownie sprawdza dokumenty.' }),
]);

export const DEMO_WORLD_SCHEDULE = DEMO_WORLD_TIMELINE;
export const DEMO_SCHEDULE_PROFILE_IDS = Object.freeze([...new Set(DEMO_WORLD_TIMELINE.map((item) => item.profile).filter(Boolean))]);

function resolveStartAt(startAt) {
  const value = startAt instanceof Date ? startAt.getTime() : new Date(startAt ?? Date.now()).getTime();
  return Number.isFinite(value) ? value : Date.now();
}

/** Create an absolute, replayable schedule from the relative story beats. */
export function createDemoWorldSchedule({ startAt = Date.now(), speed = 1 } = {}) {
  const origin = resolveStartAt(startAt);
  const timeScale = Number.isFinite(Number(speed)) && Number(speed) > 0 ? Number(speed) : 1;
  return DEMO_WORLD_TIMELINE.map((item) => Object.freeze({
    ...item,
    scheduledAt: new Date(origin + item.offsetMs / timeScale).toISOString(),
  }));
}

/** Return events whose scheduled time has arrived, useful for a ticker. */
export function getDueDemoWorldEvents({ startAt = Date.now(), now = Date.now(), speed = 1 } = {}) {
  const schedule = createDemoWorldSchedule({ startAt, speed });
  const current = resolveStartAt(now);
  return schedule.filter((item) => new Date(item.scheduledAt).getTime() <= current);
}
