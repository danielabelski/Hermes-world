const marker = (symbol, tone) => Object.freeze({ symbol, tone })

export const MAP_AGENT_STATUS_MARKERS = Object.freeze({
  thinking: marker('?', 'thinking'),
  waiting: marker('…', 'waiting'),
  stuck: marker('↛', 'stuck'),
  success: marker('✓', 'success'),
  warning: marker('!', 'warning'),
  error: marker('!', 'error'),
})

export function resolveMapAgentStatusMarker({ visualState, severity = 'none', signalState = 'none' } = {}) {
  if (signalState === 'success') return MAP_AGENT_STATUS_MARKERS.success
  if (visualState === 'stuck' || signalState === 'stuck') return MAP_AGENT_STATUS_MARKERS.stuck
  if (visualState === 'blocked' || ['critical', 'error'].includes(severity) || signalState === 'error') return MAP_AGENT_STATUS_MARKERS.error
  if (visualState === 'alert' || severity === 'warning' || signalState === 'warning') return MAP_AGENT_STATUS_MARKERS.warning
  if (visualState === 'thinking') return MAP_AGENT_STATUS_MARKERS.thinking
  if (visualState === 'waiting') return MAP_AGENT_STATUS_MARKERS.waiting
  return null
}

