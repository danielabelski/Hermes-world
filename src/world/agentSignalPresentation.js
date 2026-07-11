/**
 * Semantic presentation data for agent state indicators.
 * Renderer-neutral: a Pixi sprite, DOM fallback or future sprite sheet can use
 * `className`, `tone` and `priority` without duplicating status logic.
 */
const ALERT_STATES = new Set(['error', 'blocked', 'offline', 'stalled'])
const SUCCESS_STATES = new Set(['success', 'done', 'completed'])
const WORK_STATES = new Set(['working', 'walking', 'thinking', 'running'])

export function getAgentSignalPresentation(agent = {}) {
  const state = String(agent.visualState ?? agent.state ?? (agent.active || agent.isActive ? 'working' : 'idle')).toLowerCase()
  const severity = String(agent.alertSeverity ?? agent.severity ?? '').toLowerCase()
  const urgent = ALERT_STATES.has(state) || ['critical', 'error', 'warning'].includes(severity)

  if (urgent) {
    return {
      signal: 'alert',
      tone: severity === 'critical' || state === 'error' ? 'critical' : 'warning',
      priority: 'attention',
      className: 'world-agent-signal world-agent-signal--alert',
      label: `${agent.displayName ?? agent.name ?? 'Agent'} wymaga uwagi`,
    }
  }

  if (SUCCESS_STATES.has(state)) {
    return {
      signal: 'success',
      tone: 'success',
      priority: 'moment',
      className: 'world-agent-signal world-agent-signal--success',
      label: `${agent.displayName ?? agent.name ?? 'Agent'} ukończył zadanie`,
    }
  }

  if (WORK_STATES.has(state)) {
    return {
      signal: 'working',
      tone: state === 'thinking' ? 'arcane' : 'warm',
      priority: 'ambient',
      className: 'world-agent-signal world-agent-signal--working',
      label: `${agent.displayName ?? agent.name ?? 'Agent'} pracuje`,
    }
  }

  return {
    signal: 'idle',
    tone: 'quiet',
    priority: 'ambient',
    className: 'world-agent-signal world-agent-signal--idle',
    label: `${agent.displayName ?? agent.name ?? 'Agent'} odpoczywa`,
  }
}
