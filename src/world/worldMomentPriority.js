const SUCCESS_WORDS = /\b(done|completed|success|sukces|ukończ|zakończ|delivered|dostarcz)\b/i

export const WORLD_MOMENT_PRIORITY = Object.freeze({ info: 1, success: 2, stuck: 3, warning: 4, critical: 5 })

export function classifyWorldMoment(item) {
  const severity = String(item?.severity ?? item?.level ?? '').toLowerCase()
  const state = String(item?.state ?? item?.status ?? '').toLowerCase()
  const text = `${item?.message ?? ''} ${item?.title ?? ''} ${state}`
  if (['critical', 'fatal', 'error'].includes(severity)) return 'critical'
  if (severity === 'warning') return 'warning'
  if (['stuck', 'blocked'].includes(state)) return 'stuck'
  if (SUCCESS_WORDS.test(text)) return 'success'
  return 'info'
}

function activeIssues(alerts, agents) {
  const alertItems = (Array.isArray(alerts) ? alerts : []).filter(Boolean)
  const stuckItems = (Array.isArray(agents) ? agents : [])
    .filter((agent) => ['stuck', 'blocked'].includes(String(agent?.state ?? agent?.status ?? '').toLowerCase()))
    .map((agent) => ({
      id: `stuck-${agent.id ?? agent.profile ?? agent.profileId ?? 'agent'}`,
      severity: 'stuck',
      state: 'stuck',
      message: `${agent.displayName ?? agent.name ?? 'Agent'} nie wykonuje postępu`,
    }))
  return [...alertItems, ...stuckItems]
}

export function resolveWorldMoment(fresh, alerts = [], agents = []) {
  const candidates = [fresh, ...activeIssues(alerts, agents)].filter(Boolean)
  if (!candidates.length) return null
  return candidates.reduce((selected, candidate) => (
    WORLD_MOMENT_PRIORITY[classifyWorldMoment(candidate)] > WORLD_MOMENT_PRIORITY[classifyWorldMoment(selected)]
      ? candidate
      : selected
  ))
}
