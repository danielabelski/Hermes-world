import { BUILDING_INTERIOR_CONFIG } from './buildingEntryConfig.js'

const ACTIVE_TASK_STATES = new Set(['running', 'working', 'active', 'in_progress'])
const WARNING_TASK_STATES = new Set(['blocked', 'warning'])
const stateOf = (value) => String(value ?? '').toLowerCase()
const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null
const countState = (items, states) => items.filter((item) => states.has(stateOf(item.status))).length
const profileOf = (item = {}) => item.assignee ?? item.ownerAgentId ?? item.profile ?? item.entityId ?? null

function matchesInterior(item = {}, config) {
  const profile = profileOf(item)
  return item.buildingId === config.buildingId
    || item.sourceBuildingId === config.buildingId
    || config.canonicalBuildingIds.includes(item.buildingId)
    || config.canonicalBuildingIds.includes(item.sourceBuildingId)
    || profile === config.agentProfile
    || item.entityId === config.buildingId
}

const metric = (label, value, suffix = '', precision = 0) => Object.freeze({ label, value, suffix, precision })
const displayCount = (value) => Number.isFinite(Number(value)) ? Number(value) : 0

function metricsFor(buildingId, context, relevantTasks, relevantAlerts) {
  const { system = {}, tokenRiver = {}, activityItems = [], crons = [], memorySummary = {} } = context
  if (buildingId === 'forge') return [
    metric('CPU', finite(system.cpuPercent), '%'),
    metric('TEMP.', finite(system.temperatureC), '°'),
    metric('AKTYWNE BUILDY', countState(relevantTasks, ACTIVE_TASK_STATES)),
  ]
  if (buildingId === 'archive') return [
    metric('SEKCJE PAMIĘCI', memorySummary.available ? displayCount(memorySummary.sectionCount) : null),
    metric('ZDARZENIA', activityItems.length),
    metric('W TOKU', countState(relevantTasks, ACTIVE_TASK_STATES)),
  ]
  if (buildingId === 'citadel') return [
    metric('AKTYWNI', displayCount(system.activeAgentCount)),
    metric('SESJE', displayCount(tokenRiver.activeSessionCount ?? system.activeSessionCount)),
    metric('KOSZT API', finite(tokenRiver.totalEstimatedCost ?? system.totalEstimatedCost), '$', 2),
  ]
  if (buildingId === 'watcher') {
    const completed = crons.filter((cron) => cron.lastCompletionStatus)
    const successful = completed.filter((cron) => ['ok', 'success', 'completed'].includes(stateOf(cron.lastCompletionStatus))).length
    return [
      metric('CRONY', crons.length),
      metric('SUKCES', completed.length ? (successful / completed.length) * 100 : null, '%'),
      metric('ALERTY', relevantAlerts.length),
    ]
  }
  return [
    metric('RAM', finite(system.memoryPercent), '%'),
    metric('HEALTH', finite(system.health?.score), '%'),
    metric('INCYDENTY', relevantAlerts.length),
  ]
}

export function deriveBuildingInteriorPresentation(buildingId, context = {}) {
  const config = BUILDING_INTERIOR_CONFIG[buildingId]
  if (!config) return null
  const { lifecycle = {}, agent = null, building = null, tasks = [], alerts = [], activityItems = [] } = context
  const relevantTasks = tasks.filter((item) => matchesInterior(item, config))
  const relevantAlerts = alerts.filter((item) => matchesInterior(item, config))
  const criticalAlert = relevantAlerts.find((alert) => ['critical', 'error'].includes(stateOf(alert.severity)))
  const warningAlert = relevantAlerts.find((alert) => stateOf(alert.severity) === 'warning')
  const activeTask = relevantTasks.find((task) => ACTIVE_TASK_STATES.has(stateOf(task.status)))
  const blockedTask = relevantTasks.find((task) => WARNING_TASK_STATES.has(stateOf(task.status)))
  const connected = stateOf(lifecycle.hermesStatus ?? lifecycle.runtimeStatus) !== 'offline'
    && stateOf(agent?.presence) !== 'offline'
    && agent?.online !== false
    && stateOf(agent?.state) !== 'offline'
  const phase = !connected ? 'offline' : criticalAlert ? 'critical' : warningAlert || blockedTask ? 'warning' : activeTask ? 'working' : 'standby'
  const latestActivity = activityItems.find((item) => matchesInterior(item, config)) ?? null

  return Object.freeze({
    buildingId,
    phase,
    connected,
    metrics: Object.freeze(metricsFor(buildingId, context, relevantTasks, relevantAlerts)),
    activeTaskCount: countState(relevantTasks, ACTIVE_TASK_STATES),
    taskTitle: activeTask?.title ?? blockedTask?.title ?? latestActivity?.title ?? latestActivity?.message ?? null,
    agentAvailable: Boolean(agent && connected),
    buildingState: stateOf(building?.state) || 'normal',
    evidenceEventId: criticalAlert?.evidenceEventId ?? warningAlert?.evidenceEventId ?? activeTask?.evidenceEventId ?? null,
    source: lifecycle.source ?? 'unknown',
  })
}

export function deriveForgeInteriorPresentation(context = {}) {
  const presentation = deriveBuildingInteriorPresentation('forge', context)
  const [cpu, temperature] = presentation.metrics
  return Object.freeze({ ...presentation, cpuPercent: cpu.value, temperatureC: temperature.value })
}
