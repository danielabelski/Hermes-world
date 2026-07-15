import { getAgentDefinition } from '../data/agentDefinitions.js'

const TASK_STATUS = Object.freeze({
  assigned: 'running', thinking: 'thinking', working: 'running', waiting: 'waiting', stuck: 'blocked',
  warning: 'running', critical: 'error', success: 'done', idle: 'done',
})

const AGENT_STATE = Object.freeze({
  assigned: 'walking', thinking: 'thinking', working: 'working', waiting: 'waiting', stuck: 'stuck',
  warning: 'warning', critical: 'error', success: 'success', idle: 'idle',
})

const isActiveState = (state) => ['assigned', 'thinking', 'working', 'waiting', 'stuck', 'warning', 'critical'].includes(state)

function replaceById(items, id, replacement, key) {
  const index = items.findIndex((item) => String(item?.[key] ?? item?.id) === id)
  if (index < 0) return [...items, replacement]
  const next = [...items]
  next[index] = replacement
  return next
}

export function applyWorldEventToSnapshot(snapshot, event) {
  if (!snapshot || !event?.agentId) return snapshot
  const definition = getAgentDefinition(event.agentId)
  if (!definition) return snapshot

  const agents = Array.isArray(snapshot.agents) ? snapshot.agents : []
  const previousAgent = agents.find((agent) => (agent.profile ?? agent.id) === event.agentId) ?? {
    id: event.agentId,
    profile: event.agentId,
    displayName: definition.displayName,
    buildingId: definition.buildingId,
    homeAnchor: definition.spawnAnchor,
    workAnchor: definition.workAnchor,
    position: definition.spawnAnchor,
  }
  const operationalState = event.state ?? previousAgent.operationalState ?? 'idle'
  const presence = event.presence ?? previousAgent.presence ?? 'online'
  const active = presence !== 'offline' && isActiveState(operationalState)
  const nextAgent = {
    ...previousAgent,
    presence,
    online: presence !== 'offline',
    operationalState,
    state: presence === 'offline' ? 'offline' : operationalState === 'working' && event.agentId === 'prospecting' ? 'observe' : AGENT_STATE[operationalState] ?? previousAgent.state,
    active,
    isActive: active,
    lastEventId: event.eventId,
    lastEventAt: event.occurredAt,
  }

  const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : []
  const previousTask = tasks.find((task) => String(task.id) === event.taskId) ?? {}
  const task = {
    ...previousTask,
    id: event.taskId,
    title: event.message ?? previousTask.title ?? `${definition.displayName}: ${event.eventType}`,
    assignee: event.agentId,
    status: TASK_STATUS[operationalState] ?? previousTask.status ?? 'running',
    startedAt: previousTask.startedAt ?? event.occurredAt,
    transitionStartedAt: previousTask.transitionStartedAt ?? event.occurredAt,
    updatedAt: event.occurredAt,
    buildingId: event.buildingId ?? previousTask.buildingId ?? definition.buildingId,
    evidenceEventId: event.eventId,
    runId: event.runId ?? previousTask.runId ?? null,
    motionEvidence: 'observed-edge',
    ...(operationalState === 'success' ? { completedAt: event.occurredAt, visualCompletedAt: event.occurredAt } : {}),
  }

  const retainedAlerts = (snapshot.alerts ?? []).filter((alert) => alert.entityId !== event.agentId)
  const nextAlerts = ['warning', 'stuck', 'critical'].includes(operationalState)
    ? [...retainedAlerts, {
        id: `world-event-${event.eventId}`,
        severity: operationalState === 'critical' ? 'critical' : 'warning',
        entityType: 'agent',
        entityId: event.agentId,
        buildingId: event.buildingId ?? definition.buildingId,
        message: event.message ?? `${definition.displayName}: ${operationalState}`,
        timestamp: event.occurredAt,
        evidenceEventId: event.eventId,
        runId: event.runId ?? null,
      }]
    : retainedAlerts
  const nextAgents = replaceById(agents, event.agentId, nextAgent, 'profile')
  const tasksWithoutSupersededWork = tasks.filter((item) => {
    if (String(item.id) === event.taskId || item.assignee !== event.agentId) return true
    return ['done', 'success', 'completed'].includes(String(item.status ?? '').toLowerCase())
  })
  const nextTasks = replaceById(tasksWithoutSupersededWork, event.taskId, task, 'id')

  return {
    ...snapshot,
    agents: nextAgents,
    tasks: nextTasks,
    alerts: nextAlerts,
    activity: {
      items: [{
        id: event.eventId,
        timestamp: event.occurredAt,
        profile: event.agentId,
        level: event.severity === 'none' ? 'info' : event.severity,
        message: event.message ?? `${definition.displayName}: ${operationalState ?? event.presence}`,
        source: event.source,
      }, ...((Array.isArray(snapshot.activity) ? snapshot.activity : snapshot.activity?.items) ?? []).filter((item) => item.id !== event.eventId)].slice(0, 40),
    },
    system: {
      ...(snapshot.system ?? {}),
      activeAgentCount: nextAgents.filter((agent) => agent.active || agent.isActive).length,
    },
    lifecycle: {
      ...(snapshot.lifecycle ?? {}),
      source: 'live',
      connection: 'online',
      lastEventAt: event.occurredAt,
    },
  }
}

export function applyWorldEventsToSnapshot(snapshot, events = []) {
  return events.reduce((current, event) => applyWorldEventToSnapshot(current, event), snapshot)
}
