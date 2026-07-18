import { api } from '../api.js';
import { AGENT_DEFINITIONS, getAgentDefinition } from './data/agentDefinitions.js';
import { BUILDING_DEFINITIONS } from './data/buildingDefinitions.js';
import { DEMO_WORLD_PAYLOADS } from './data/demoWorldData.js';
import { getPackageVisual } from './data/packageDefinitions.js';
import { getAlertVisual, getProviderCrystal } from './data/worldSignalDefinitions.js';
import { getWorldLifeJourney } from './data/roadGraph.js';
import { describeCronResult, describeLogAlert, describeTaskTransition } from './worldNarrative.js';

const POLL_INTERVALS = Object.freeze({ metrics: 5_000, live: 15_000, slow: 60_000 });
const MAX_ACTIVITY_ITEMS = 40;
const INCIDENT_FRESHNESS_MS = 5 * 60_000;
const KNOWN_PROFILE_IDS = Object.freeze(Object.keys(AGENT_DEFINITIONS));

const list = (value, key) => Array.isArray(value) ? value : Array.isArray(value?.[key]) ? value[key] : [];
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const optionalFinite = (value) => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
const severityFor = (level) => {
  const value = String(level ?? 'info').toLowerCase();
  return value === 'fatal' ? 'critical' : ['critical', 'error', 'warning', 'info'].includes(value) ? value : 'info';
};

export function buildMemorySummary(payload) {
  const rawText = typeof payload?.memory === 'string' ? payload.memory.trim() : '';
  const soul = payload?.soul && typeof payload.soul === 'object' && !Array.isArray(payload.soul) ? payload.soul : null;
  const sectionCount = rawText
    ? Math.max(1, rawText.split(/\r?\n/).filter((line) => /^(#{1,6}\s+|[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ _-]{2,}:)/u.test(line.trim())).length)
    : soul ? Object.keys(soul).length : 0;
  return Object.freeze({
    available: Boolean(rawText || soul),
    sectionCount,
    characterCount: rawText.length || (soul ? JSON.stringify(soul).length : 0),
    kind: rawText ? 'memory-text' : soul ? 'structured-soul' : 'unavailable',
  });
}

function parseLog(line, index) {
  if (line && typeof line === 'object') return { id: `log-${index}-${line.timestamp ?? ''}`, rawMessage: JSON.stringify(line), ...line };
  try {
    const parsed = JSON.parse(line);
    return { id: `log-${index}-${parsed.timestamp ?? ''}`, rawMessage: String(line), ...parsed };
  } catch {
    return { id: `log-${index}`, level: 'info', message: String(line ?? ''), rawMessage: String(line ?? '') };
  }
}

const timestampMs = (value) => {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && value !== null && value !== '') {
    // Hermes WebUI returns cron completion timestamps as Unix seconds,
    // while newer adapters may use Unix milliseconds or ISO strings.
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }
  const parsed = Date.parse(value ?? '');
  return Number.isFinite(parsed) ? parsed : null;
};

function isFreshLog(entry, nowMs, windowMs = INCIDENT_FRESHNESS_MS) {
  const at = timestampMs(entry?.timestamp);
  return at !== null && nowMs - at >= 0 && nowMs - at <= windowMs;
}

function profileForLog(entry) {
  const explicit = String(entry?.profile ?? entry?.agent ?? entry?.agent_id ?? '').toLowerCase();
  if (KNOWN_PROFILE_IDS.includes(explicit)) return explicit;
  const haystack = `${entry?.logger_name ?? ''} ${entry?.message ?? ''}`.toLowerCase();
  return KNOWN_PROFILE_IDS.find((profile) => new RegExp(`(^|[^a-z0-9_-])${profile}([^a-z0-9_-]|$)`, 'i').test(haystack)) ?? null;
}

export function deriveWeather(cpuPercent, temperatureC) {
  if (optionalFinite(cpuPercent) === null) {
    return { kind: 'unknown', intensity: 0, sunIntensity: 0.6, rainRate: 0, lightningEnabled: false };
  }
  const cpu = Math.max(0, Math.min(100, finite(cpuPercent)));
  const temperature = finite(temperatureC);
  const kind = cpu >= 85 ? 'storm' : cpu >= 60 ? 'rain' : cpu >= 30 ? 'cloudy' : 'sunny';
  return {
    kind,
    intensity: Math.round((cpu / 100) * 100) / 100,
    sunIntensity: Math.max(0.2, Math.min(1, 1 - Math.max(0, temperature - 55) / 55)),
    rainRate: kind === 'storm' ? 1 : kind === 'rain' ? 0.55 : 0,
    lightningEnabled: kind === 'storm',
  };
}

export function deriveHealth({ metrics, tasks, logs, crons }) {
  const hasMetrics = ['cpuPercent', 'memoryPercent', 'temperatureC'].some((key) => optionalFinite(metrics?.[key]) !== null);
  if (!hasMetrics && tasks.length === 0 && logs.length === 0 && crons.length === 0) {
    return { score: null, severity: 'unknown', blockedTaskCount: 0, errorCount: 0, failedCronCount: 0 };
  }
  const cpu = finite(metrics?.cpuPercent);
  const memory = finite(metrics?.memoryPercent);
  const temperature = finite(metrics?.temperatureC);
  const blocked = tasks.filter((task) => task.status === 'blocked').length;
  const errors = logs.filter((entry) => String(entry.level).toLowerCase() === 'error').length;
  const failedCrons = crons.filter((cron) => cron.lastCompletionStatus === 'error').length;
  const score = Math.round(Math.max(0, Math.min(100,
    100 - Math.max(0, cpu - 35) * 0.55 - Math.max(0, memory - 60) * 0.35 - Math.max(0, temperature - 70) * 0.7 - blocked * 8 - errors * 10 - failedCrons * 8,
  )));
  const severity = score < 40 ? 'critical' : score < 65 ? 'warning' : score < 85 ? 'attention' : 'healthy';
  return { score, severity, blockedTaskCount: blocked, errorCount: errors, failedCronCount: failedCrons };
}

function normaliseTask(task, previousTask = null, observedAt = Date.now()) {
  const definition = getAgentDefinition(task.assignee);
  const journey = getWorldLifeJourney(task.assignee);
  const priority = String(task.priority ?? 'normal').toLowerCase();
  const status = String(task.status ?? 'todo').toLowerCase();
  const previousStatus = previousTask?.status ?? null;
  // Only a freshly observed edge may replay motion. The first snapshot is a
  // statement of current location, not proof that a transition started now.
  const beginsJourney = Boolean(previousTask) && status === 'running' && previousStatus !== 'running';
  const completesJourney = Boolean(previousTask) && status === 'done' && previousStatus !== 'done';
  const walkDurationMs = journey?.walkDurationMs ?? 5_800;
  const arriveDurationMs = journey?.arriveDurationMs ?? 700;
  const successDurationMs = journey?.successDurationMs ?? 1_800;
  const transitionStartedAt = beginsJourney
    ? new Date(observedAt).toISOString()
    : status === 'running' ? previousTask?.transitionStartedAt ?? null : null;
  const transitionUntil = beginsJourney
    ? new Date(observedAt + walkDurationMs + arriveDurationMs).toISOString()
    : status === 'running' ? previousTask?.transitionUntil ?? null : null;
  const visualCompletedAt = completesJourney
    ? new Date(observedAt).toISOString()
    : status === 'done' ? previousTask?.visualCompletedAt ?? task.completed_at ?? null : null;
  const returnUntil = visualCompletedAt
    ? new Date(Date.parse(visualCompletedAt) + successDurationMs + walkDurationMs).toISOString()
    : null;
  return {
    id: String(task.id),
    title: task.title || 'Untitled task',
    body: task.body || '',
    assignee: task.assignee || null,
    ownerAgentId: definition?.id ?? null,
    visual: getPackageVisual({ priority, status }),
    sourceBuildingId: definition?.buildingId ?? 'keep',
    destinationBuildingId: status === 'review' ? 'inspection-hall' : status === 'scheduled' ? 'clock-tower' : 'keep',
    status,
    priority,
    packageState: status === 'running' ? 'carried' : status === 'blocked' ? 'blocked' : status === 'done' ? 'delivered' : status === 'scheduled' ? 'scheduled' : 'stored',
    createdAt: task.created_at ?? null,
    startedAt: task.started_at ?? null,
    completedAt: task.completed_at ?? null,
    transitionStartedAt,
    transitionUntil,
    visualCompletedAt,
    returnUntil,
    journeyId: journey?.profile ?? null,
    evidenceEventId: task.evidenceEventId ?? task.event_id ?? task.last_event_id ?? previousTask?.evidenceEventId ?? null,
    motionEvidence: beginsJourney || completesJourney ? 'observed-edge' : task.started_at || task.completed_at ? 'backend-timestamp' : 'initial-state',
  };
}

function normaliseAgent(profile, tasks, skills, logs) {
  const definition = getAgentDefinition(profile.name);
  if (!definition) return null;
  const task = tasks.find((item) => item.assignee === profile.name && ['running', 'blocked', 'review'].includes(item.status));
  const errorLog = logs.find((entry) => String(entry.level).toLowerCase() === 'error' && profileForLog(entry) === profile.name);
  const warningLog = logs.find((entry) => String(entry.level).toLowerCase() === 'warning' && profileForLog(entry) === profile.name);
  // The current Hermes API exposes a global skills inventory, not per-profile
  // ownership. Keep this unknown instead of claiming every agent owns any
  // enabled skill.
  const skillEnabled = null;
  const state = errorLog ? 'error' : task?.status === 'blocked' ? 'alerted' : task?.status === 'running' ? 'carrying-package' : task?.status === 'review' ? 'thinking' : profile.is_active ? 'working' : 'idle';
  return {
    ...definition,
    isActive: Boolean(profile.is_active),
    model: profile.model ?? null,
    provider: profile.provider ?? null,
    hasEnvironment: Boolean(profile.has_env),
    skillEnabled,
    state,
    warningLevel: errorLog ? 'error' : warningLog || task?.status === 'blocked' ? 'warning' : 'none',
    carryingTaskId: task?.id ?? null,
    position: definition.spawnAnchor,
    targetPosition: state === 'working' || state === 'carrying-package' ? definition.workAnchor : definition.idlePath[0],
    lastActivityAt: task?.startedAt ?? profile.updated_at ?? null,
  };
}

function normaliseCronHistory(completions, jobs) {
  const jobNames = new Map(jobs.map((job) => [String(job.id), job.name || String(job.id)]));
  const unique = new Map();
  for (const completion of completions) {
    const jobId = String(completion?.job_id ?? completion?.jobId ?? '').trim();
    const completedAt = completion?.completed_at ?? completion?.completedAt ?? null;
    const completedAtMs = timestampMs(completedAt);
    const status = String(completion?.status ?? '').toLowerCase();
    if (!jobId || completedAtMs === null || !status) continue;
    const id = String(completion?.id ?? `cron-${jobId}-${completedAt}-${status}`);
    if (unique.has(id)) continue;
    unique.set(id, {
      id,
      jobId,
      name: completion?.name || jobNames.get(jobId) || jobId,
      status,
      completedAt: new Date(completedAtMs).toISOString(),
      source: 'hermes-cron-history',
    });
  }
  return [...unique.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

function buildActivity({ tasks, cronCompletions, previousSnapshot, now }) {
  const previousTasks = new Map((previousSnapshot?.tasks ?? []).map((task) => [task.id, task]));
  const taskEvents = tasks.flatMap((task) => {
    const previous = previousTasks.get(task.id);
    if (!previous || previous.status === task.status) return [];
    const severity = task.status === 'blocked' ? 'warning' : task.status === 'done' ? 'info' : 'info';
    return [{ id: `task-${task.id}-${task.status}`, type: 'task', severity, entityType: 'task', entityId: task.id, message: describeTaskTransition(task), technicalMessage: `${task.title}: ${task.status}`, createdAt: task.completedAt ?? task.startedAt ?? now }];
  });
  const cronEvents = cronCompletions.map((completion) => ({
    id: completion.id,
    evidenceEventId: completion.id,
    correlationId: completion.id,
    type: 'cron',
    severity: ['error', 'failed', 'fail'].includes(completion.status) ? 'error' : 'info',
    entityType: 'cron',
    entityId: completion.jobId,
    message: describeCronResult({ name: completion.name, lastCompletionStatus: completion.status }),
    technicalMessage: `${completion.name}: ${completion.status}`,
    createdAt: completion.completedAt,
    source: completion.source,
  }));
  return [...taskEvents, ...cronEvents]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, MAX_ACTIVITY_ITEMS);
}

function buildAlerts({ logs, tasks, crons, health, now }) {
  const taskAlerts = tasks.filter((task) => task.status === 'blocked').map((task) => ({
    id: `task-blocked-${task.id}`, source: 'task', entityType: task.ownerAgentId ? 'agent' : 'task', entityId: task.ownerAgentId ?? task.id,
    agentId: task.ownerAgentId, taskId: task.id, buildingId: task.sourceBuildingId,
    message: describeTaskTransition(task), technicalMessage: `${task.title} is blocked`, createdAt: task.startedAt ?? now, ...getAlertVisual('warning'),
  }));
  const logAlerts = logs.filter((entry) => ['warning', 'error', 'critical', 'fatal'].includes(String(entry.level ?? '').toLowerCase())).slice(-10).map((entry) => {
    const profile = profileForLog(entry);
    return {
      id: `log-alert-${entry.id}`, source: 'log', entityType: profile ? 'agent' : 'system', entityId: profile ?? 'system', agentId: profile,
      message: describeLogAlert(entry, profile), technicalMessage: entry.message || entry.rawMessage || 'System alert', createdAt: entry.timestamp ?? now, ...getAlertVisual(severityFor(entry.level)),
    };
  });
  const cronAlerts = crons.filter((cron) => cron.lastCompletionStatus === 'error').map((cron) => ({
    id: `cron-alert-${cron.id}-${cron.lastRunAt ?? ''}`, source: 'cron', entityType: 'building', entityId: 'clock-tower', buildingId: 'clock-tower', cronId: cron.id,
    message: describeCronResult(cron), technicalMessage: `${cron.name} failed`, createdAt: cron.lastRunAt ?? now, ...getAlertVisual('error'),
  }));
  const healthAlerts = health.severity === 'critical' ? [{
    id: `system-health-${health.score}`, source: 'health', entityType: 'system', entityId: 'system',
    message: 'Stan Cytadeli wymaga natychmiastowej reakcji.', technicalMessage: 'Citadel health is critical', createdAt: now, ...getAlertVisual('critical'),
  }] : [];
  return [...taskAlerts, ...logAlerts, ...cronAlerts, ...healthAlerts]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function isSessionActive(session, nowMs) {
  if (session?.is_streaming === true) return true;
  const raw = Number(session?.updated_at);
  const updatedAt = Number.isFinite(raw) ? (raw < 1e12 ? raw * 1000 : raw) : timestampMs(session?.updated_at);
  return Number.isFinite(updatedAt) && nowMs - updatedAt >= 0 && nowMs - updatedAt <= 5 * 60_000;
}

function buildTokenRiver(sessions, nowMs) {
  const totalEstimatedCost = sessions.reduce((total, session) => total + finite(session.estimated_cost), 0);
  const activeSessionCount = sessions.filter((session) => isSessionActive(session, nowMs)).length;
  const intensity = Math.min(1, totalEstimatedCost / 3);
  return {
    totalEstimatedCost,
    activeSessionCount,
    flowSpeed: Math.min(1, 0.18 + intensity * 0.82),
    width: Math.min(1, 0.16 + intensity * 0.84),
    glowIntensity: Math.min(1, 0.2 + intensity * 0.8),
    color: intensity >= 0.8 ? '#C69348' : intensity >= 0.45 ? '#4AA8B2' : '#5E9CC3',
    state: activeSessionCount === 0 ? 'still' : intensity >= 0.8 ? 'surging' : intensity >= 0.45 ? 'flowing' : 'quiet',
  };
}

function buildCrystalSources(modelGroups, sessions, profiles) {
  const sessionCounts = new Map();
  for (const session of sessions) {
    const key = String(session.model ?? 'unknown');
    sessionCounts.set(key, (sessionCounts.get(key) ?? 0) + 1);
  }
  const profileModels = new Set(profiles.map((profile) => String(profile.model ?? '')).filter(Boolean));
  const sources = modelGroups.flatMap((group) => list(group, 'models').map((model) => {
    const modelId = String(model.id ?? model.name ?? 'unknown');
    const visual = getProviderCrystal(group.provider);
    const sessionsUsingModel = sessionCounts.get(modelId) ?? 0;
    return { provider: group.provider || 'unknown', modelId, sessionsUsingModel, isProfileDefault: profileModels.has(modelId), intensity: Math.min(1, 0.25 + sessionsUsingModel * 0.25), ...visual };
  }));
  return sources;
}

/** Converts raw Hermes responses into a renderer-neutral world snapshot. */
export function createWorldSnapshot(payloads = {}, previousSnapshot = null, now = Date.now, provenance = {}) {
  const observedAt = now();
  const rawProfiles = list(payloads.profiles, 'profiles');
  const rawTasks = list(payloads.tasks, 'tasks');
  const rawLogs = list(payloads.logs, 'lines').map(parseLog);
  const freshIncidentLogs = rawLogs.filter((entry) => isFreshLog(entry, observedAt));
  const rawSkills = list(payloads.skills, 'skills');
  const cronHistory = list(payloads.cronHistory, 'completions');
  const rawCronJobs = list(payloads.crons, 'jobs');
  const cronCompletions = normaliseCronHistory(cronHistory, rawCronJobs);
  const latestCompletionByJob = new Map();
  for (const completion of cronCompletions) {
    if (!latestCompletionByJob.has(completion.jobId)) latestCompletionByJob.set(completion.jobId, completion);
  }
  const crons = rawCronJobs.map((job) => {
    const completion = latestCompletionByJob.get(String(job.id));
    return { id: String(job.id), name: job.name || 'Unnamed cron', enabled: Boolean(job.enabled), lastRunAt: completion?.completedAt ?? job.last_run_at ?? null, lastCompletionStatus: completion?.status ?? null };
  });
  const previousTasks = new Map((previousSnapshot?.tasks ?? []).map((task) => [String(task.id), task]));
  const tasks = rawTasks.map((task) => normaliseTask(task, previousTasks.get(String(task.id)), observedAt));
  const knownProfiles = rawProfiles.filter((profile) => getAgentDefinition(profile.name));
  const agents = knownProfiles.map((profile) => normaliseAgent(profile, tasks, rawSkills, freshIncidentLogs)).filter(Boolean);
  const metrics = payloads.metrics && typeof payloads.metrics === 'object' ? payloads.metrics : null;
  const health = deriveHealth({ metrics, tasks, logs: freshIncidentLogs, crons });
  const sessions = list(payloads.sessions, 'sessions');
  const modelGroups = list(payloads.models, 'groups');
  const modelSources = buildCrystalSources(modelGroups, sessions, rawProfiles);
  const tokenRiver = buildTokenRiver(sessions, observedAt);
  const memorySummary = buildMemorySummary(payloads.memory);
  const buildingStates = Object.values(BUILDING_DEFINITIONS).map((definition) => {
    const agent = agents.find((item) => item.buildingId === definition.id);
    const assigned = tasks.filter((task) => task.sourceBuildingId === definition.id);
    return { ...definition, state: agent?.warningLevel === 'error' ? 'error' : agent?.warningLevel === 'warning' ? 'warning' : agent?.isActive ? 'active' : 'normal', activeTaskCount: assigned.filter((task) => task.status === 'running').length, smokeLevel: agent?.warningLevel === 'error' ? 1 : 0, lightLevel: agent?.isActive ? 1 : 0.45 };
  });
  const createdAt = new Date(observedAt).toISOString();
  return {
    lifecycle: {
      phase: provenance.source === 'unknown' ? 'unavailable' : provenance.source === 'stale' ? 'stale' : 'ready',
      source: provenance.source ?? 'unknown',
      lastUpdatedAt: createdAt,
      lastSuccessfulAt: provenance.lastSuccessfulAt ?? null,
      snapshotAgeMs: provenance.snapshotAgeMs ?? 0,
      connection: provenance.connection ?? 'unknown',
      domains: provenance.domains ?? {},
    },
    system: { cpuPercent: optionalFinite(metrics?.cpuPercent), memoryPercent: optionalFinite(metrics?.memoryPercent), memoryUsedMb: optionalFinite(metrics?.memoryUsedMb), memoryTotalMb: optionalFinite(metrics?.memoryTotalMb), temperatureC: optionalFinite(metrics?.temperatureC), temperatureSource: metrics?.temperatureSource ?? null, health, activeAgentCount: agents.filter((agent) => agent.isActive).length, totalAgentCount: agents.length, unmappedProfileCount: Math.max(0, rawProfiles.length - knownProfiles.length), activeSessionCount: tokenRiver.activeSessionCount, totalEstimatedCost: tokenRiver.totalEstimatedCost, weather: deriveWeather(metrics?.cpuPercent, metrics?.temperatureC) },
    agents,
    tasks,
    buildings: buildingStates,
    crons,
    cronHistory: cronCompletions,
    modelSources,
    tokenRiver,
    memorySummary,
    skillSummary: { total: rawSkills.length, enabled: rawSkills.filter((skill) => !skill.disabled).length, disabled: rawSkills.filter((skill) => skill.disabled).map((skill) => skill.name ?? 'Unnamed skill') },
    alerts: buildAlerts({ logs: freshIncidentLogs, tasks, crons, health, now: createdAt }),
    activity: buildActivity({ tasks, cronCompletions, previousSnapshot, now: createdAt }),
    raw: { profiles: rawProfiles, metrics, tasks: rawTasks, logs: rawLogs, crons, cronHistory: cronCompletions, sessions, skills: rawSkills, models: modelGroups, provenance },
  };
}

/**
 * Polling coordinator. It has no Zustand dependency, so UI/store integration
 * stays explicit and testable: `bridge.subscribe(snapshot => store.apply(...))`.
 */
export function createWorldBridge({ apiClient = api, demoMode = false, now = Date.now } = {}) {
  let snapshot = null;
  let running = false;
  let timer = null;
  let syncPromise = null;
  let lastSuccessfulAt = null;
  const lastPayloadByDomain = new Map();
  const lastAttemptByDomain = new Map();
  const lastFailureByDomain = new Map();
  const listeners = new Set();
  const emit = (next) => listeners.forEach((listener) => listener(next));

  const domainReaders = Object.freeze({
    profiles: () => apiClient.getProfiles({ strict: true }),
    metrics: () => apiClient.getSystemMetrics({ strict: true }),
    tasks: () => apiClient.getKanbanTasks({ strict: true }),
    logs: () => apiClient.getLogs({ strict: true }),
    crons: () => apiClient.getCrons({ strict: true }),
    cronHistory: () => apiClient.getCronHistory({ strict: true }),
    sessions: () => apiClient.getSessions({ strict: true }),
    skills: () => apiClient.getSkills({ strict: true }),
    models: () => apiClient.getModels({ strict: true }),
    memory: () => apiClient.getMemory({ strict: true }),
  });
  const domainIntervals = Object.freeze({
    metrics: POLL_INTERVALS.metrics,
    profiles: POLL_INTERVALS.live,
    tasks: POLL_INTERVALS.live,
    logs: POLL_INTERVALS.live,
    crons: POLL_INTERVALS.live,
    cronHistory: POLL_INTERVALS.live,
    sessions: POLL_INTERVALS.slow,
    skills: POLL_INTERVALS.slow,
    models: POLL_INTERVALS.slow,
    memory: POLL_INTERVALS.slow,
  });

  async function fetchPayloads({ onProgress, force = false, forceDomains = [] } = {}) {
    const observedAt = now();
    const forcedDomainIds = new Set(forceDomains);
    if (demoMode) {
      return {
        payloads: DEMO_WORLD_PAYLOADS,
        provenance: { source: 'demo', connection: 'online', lastSuccessfulAt: new Date(observedAt).toISOString(), snapshotAgeMs: 0, domains: Object.fromEntries(Object.keys(domainReaders).map((id) => [id, { state: 'demo', updatedAt: new Date(observedAt).toISOString() }])) },
      };
    }

    const entries = Object.entries(domainReaders);
    const payloads = {};
    const domains = {};
    for (const [id, cached] of lastPayloadByDomain) {
      const failure = lastFailureByDomain.get(id);
      payloads[id] = cached.value;
      domains[id] = {
        state: failure ? 'stale' : 'live',
        updatedAt: new Date(cached.updatedAt).toISOString(),
        ageMs: Math.max(0, observedAt - cached.updatedAt),
        reused: true,
        ...(failure ? { error: failure.message } : {}),
      };
    }

    const buildResult = () => {
      const domainStates = Object.values(domains);
      const liveCount = domainStates.filter((domain) => domain.state === 'live').length;
      const cachedCount = domainStates.filter((domain) => domain.state === 'stale').length;
      if (liveCount > 0) lastSuccessfulAt = observedAt;
      const source = liveCount === entries.length ? 'live' : liveCount > 0 || cachedCount > 0 ? 'stale' : 'unknown';
      const oldestAge = Math.max(0, ...Object.values(domains).map((domain) => Number(domain.ageMs) || 0));
      return {
        payloads: { ...payloads },
        provenance: {
          source,
          connection: source === 'live' ? 'online' : source === 'stale' ? 'degraded' : 'offline',
          lastSuccessfulAt: lastSuccessfulAt ? new Date(lastSuccessfulAt).toISOString() : null,
          snapshotAgeMs: oldestAge,
          domains: Object.fromEntries(Object.entries(domains).map(([id, domain]) => [id, { ...domain }])),
        },
      };
    };

    const applyResult = (id, result) => {
      if (result.status === 'fulfilled') {
        const resolved = result.value;
        payloads[id] = resolved.value;
        if (!resolved.reused) {
          lastPayloadByDomain.set(id, { value: resolved.value, updatedAt: observedAt });
          lastFailureByDomain.delete(id);
        }
        const ageMs = Math.max(0, observedAt - resolved.updatedAt);
        const failure = lastFailureByDomain.get(id);
        const state = failure ? 'stale' : 'live';
        domains[id] = { state, updatedAt: new Date(resolved.updatedAt).toISOString(), ageMs, reused: resolved.reused, ...(failure ? { error: failure.message } : {}) };
        return;
      }
      lastFailureByDomain.set(id, { message: result.reason?.message ?? 'Domain unavailable', failedAt: observedAt });
      const cached = lastPayloadByDomain.get(id);
      if (cached) {
        payloads[id] = cached.value;
        domains[id] = { state: 'stale', updatedAt: new Date(cached.updatedAt).toISOString(), ageMs: Math.max(0, observedAt - cached.updatedAt), error: result.reason?.message ?? 'Domain unavailable' };
      } else {
        domains[id] = { state: 'unknown', updatedAt: null, ageMs: null, error: result.reason?.message ?? 'Domain unavailable' };
      }
    };

    await Promise.allSettled(entries.map(async ([id, read]) => {
      const cached = lastPayloadByDomain.get(id);
      const lastAttempt = lastAttemptByDomain.get(id) ?? 0;
      const due = force || forcedDomainIds.has(id) || !cached || observedAt - lastAttempt >= domainIntervals[id];
      try {
        const resolved = due
          ? (() => {
            lastAttemptByDomain.set(id, observedAt);
            return read().then((value) => ({ reused: false, value, updatedAt: observedAt }));
          })()
          : Promise.resolve({ reused: true, value: cached.value, updatedAt: cached.updatedAt });
        const value = await resolved;
        applyResult(id, { status: 'fulfilled', value });
        onProgress?.(buildResult());
        return value;
      } catch (reason) {
        applyResult(id, { status: 'rejected', reason });
        onProgress?.(buildResult());
        throw reason;
      }
    }));

    return buildResult();
  }

  function sync({ force = false, forceDomains = [], atomic = false } = {}) {
    if (syncPromise) {
      if (!force && forceDomains.length === 0) return syncPromise;
      return syncPromise.catch(() => null).then(() => sync({ force, forceDomains, atomic }));
    }
    const operation = (async () => {
      let emitted = false;
      const publish = ({ payloads, provenance }) => {
        snapshot = createWorldSnapshot(payloads, snapshot, now, provenance);
        emit(snapshot);
        emitted = true;
      };
      const result = await fetchPayloads({ onProgress: atomic ? undefined : publish, force, forceDomains });
      if (atomic || !emitted) publish(result);
      return snapshot;
    })();
    syncPromise = operation;
    return operation.finally(() => {
      if (syncPromise === operation) {
        syncPromise = null;
      }
    });
  }

  function schedule() {
    clearTimeout(timer);
    if (!running || demoMode) return;
    timer = setTimeout(async () => { await sync().catch(() => {}); schedule(); }, POLL_INTERVALS.metrics);
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    async start() { running = true; const next = await sync(); schedule(); return next; },
    stop() { running = false; clearTimeout(timer); timer = null; },
    sync,
    intervals: POLL_INTERVALS,
  };
}
