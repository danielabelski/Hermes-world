const ACTIVE_TASK_STATES = new Set(['running', 'working', 'active', 'in_progress'])
const WARNING_TASK_STATES = new Set(['blocked', 'warning'])

const stateOf = (value) => String(value ?? '').toLowerCase()
const matchesForge = (item = {}) => item.buildingId === 'forge' || item.sourceBuildingId === 'forge' || item.assignee === 'coder' || item.ownerAgentId === 'coder' || item.entityId === 'coder' || item.entityId === 'forge'

export function deriveForgeInteriorPresentation({ system = {}, lifecycle = {}, agent = null, building = null, tasks = [], alerts = [] } = {}) {
  const relevantTasks = tasks.filter(matchesForge)
  const relevantAlerts = alerts.filter(matchesForge)
  const criticalAlert = relevantAlerts.find((alert) => ['critical', 'error'].includes(stateOf(alert.severity)))
  const warningAlert = relevantAlerts.find((alert) => stateOf(alert.severity) === 'warning')
  const activeTask = relevantTasks.find((task) => ACTIVE_TASK_STATES.has(stateOf(task.status)))
  const blockedTask = relevantTasks.find((task) => WARNING_TASK_STATES.has(stateOf(task.status)))
  const connected = !['offline', 'stale'].includes(stateOf(lifecycle.connection))
  const phase = !connected ? 'offline' : criticalAlert ? 'critical' : warningAlert || blockedTask ? 'warning' : activeTask ? 'working' : 'standby'

  return Object.freeze({
    buildingId: 'forge',
    phase,
    connected,
    cpuPercent: Number.isFinite(Number(system.cpuPercent)) ? Number(system.cpuPercent) : null,
    temperatureC: Number.isFinite(Number(system.temperatureC)) ? Number(system.temperatureC) : null,
    activeTaskCount: relevantTasks.filter((task) => ACTIVE_TASK_STATES.has(stateOf(task.status))).length,
    taskTitle: activeTask?.title ?? blockedTask?.title ?? null,
    agentAvailable: Boolean(agent && connected),
    buildingState: stateOf(building?.state) || 'normal',
    evidenceEventId: criticalAlert?.evidenceEventId ?? warningAlert?.evidenceEventId ?? activeTask?.evidenceEventId ?? null,
  })
}
