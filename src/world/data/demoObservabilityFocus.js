const freeze = Object.freeze

export const DEMO_OBSERVABILITY_FOCUSES = freeze([
  'auto', 'stable', 'working', 'waiting', 'thinking', 'warning', 'critical', 'stuck', 'success', 'offline',
])

export function resolveDemoObservabilityFocus(value = 'auto') {
  return DEMO_OBSERVABILITY_FOCUSES.includes(value) ? value : 'auto'
}

const replaceAgent = (agents, profile, changes) => agents.map((agent) => (
  agent.profile === profile ? { ...agent, ...changes } : agent
))
const withoutProfileTasks = (tasks, profile) => tasks.filter((task) => task.assignee !== profile && task.agentId !== profile && task.ownerAgentId !== profile)
const withHealth = (snapshot, severity) => ({
  ...snapshot.system,
  severity,
  health: { ...(snapshot.system?.health ?? {}), severity },
})

export function applyDemoObservabilityFocus(snapshot, focus = 'auto', now = Date.now()) {
  const resolved = resolveDemoObservabilityFocus(focus)
  if (!snapshot || resolved === 'auto') return snapshot

  const base = {
    ...snapshot,
    observabilityFocus: resolved,
    agents: [...(snapshot.agents ?? [])],
    tasks: [...(snapshot.tasks ?? [])],
    alerts: [...(snapshot.alerts ?? [])],
    lifecycle: { ...(snapshot.lifecycle ?? {}), source: 'demo', connection: 'online', phase: 'ready' },
  }

  if (resolved === 'stable' || resolved === 'waiting') return freeze(base)

  if (resolved === 'working') {
    return freeze({
      ...base,
      agents: replaceAgent(base.agents, 'coder', { active: true, isActive: true, state: 'working' }),
      tasks: base.tasks.map((task) => task.assignee === 'coder' && task.status === 'running'
        ? { ...task, transitionStartedAt: new Date(now - 10_000).toISOString(), transitionUntil: new Date(now - 3_000).toISOString() }
        : task),
    })
  }

  if (resolved === 'thinking') {
    return freeze({
      ...base,
      agents: replaceAgent(base.agents, 'researcher', { active: false, isActive: false, state: 'thinking' }),
      tasks: withoutProfileTasks(base.tasks, 'researcher'),
    })
  }

  if (resolved === 'warning') {
    return freeze({
      ...base,
      system: withHealth(base, 'warning'),
      alerts: [{ id: 'focus-warning-coder', entityType: 'agent', entityId: 'coder', agentId: 'coder', severity: 'warning', message: 'Kuźnia pracuje pod zwiększonym obciążeniem.' }],
    })
  }

  if (resolved === 'critical') {
    const task = { id: 'focus-critical-coder', assignee: 'coder', status: 'error', title: 'Recover failed build', startedAt: new Date(now - 4_000).toISOString() }
    return freeze({
      ...base,
      system: withHealth(base, 'critical'),
      tasks: [...withoutProfileTasks(base.tasks, 'coder'), task],
      alerts: [{ id: 'focus-critical-coder', entityType: 'agent', entityId: 'coder', agentId: 'coder', severity: 'critical', message: 'Kuźnia wymaga natychmiastowej reakcji.' }],
    })
  }

  if (resolved === 'stuck') {
    const task = { id: 'focus-stuck-reviewer', assignee: 'reviewer', status: 'blocked', title: 'Await deployment signature', startedAt: new Date(now - 12_000).toISOString() }
    return freeze({
      ...base,
      agents: replaceAgent(base.agents, 'reviewer', { active: false, isActive: false, state: 'blocked' }),
      tasks: [...withoutProfileTasks(base.tasks, 'reviewer'), task],
      alerts: [],
    })
  }

  if (resolved === 'success') {
    const completedAt = new Date(now - 1_000).toISOString()
    const task = { id: 'focus-success-coder', assignee: 'coder', status: 'done', title: 'Build completed', completedAt, visualCompletedAt: completedAt, returnUntil: new Date(now + 7_000).toISOString() }
    return freeze({
      ...base,
      agents: replaceAgent(base.agents, 'coder', { active: false, isActive: false, state: 'idle' }),
      tasks: [...withoutProfileTasks(base.tasks, 'coder'), task],
      alerts: [],
    })
  }

  if (resolved === 'offline') {
    return freeze({
      ...base,
      lifecycle: { ...base.lifecycle, connection: 'offline', phase: 'unavailable' },
      alerts: [],
    })
  }

  return freeze(base)
}
