const INCIDENT_SEVERITIES = new Set(['critical', 'error', 'fatal'])

export function countLocalCriticalIncidents(alerts = []) {
  return alerts.filter((alert) => INCIDENT_SEVERITIES.has(String(alert?.severity ?? '').toLowerCase())).length
}

export function resolveHealthSummaryLabel({ severity = 'healthy', baseLabel, criticalCount = 0 } = {}) {
  if (severity !== 'healthy' || criticalCount <= 0) return baseLabel
  return `System stabilny · ${criticalCount} ${criticalCount === 1 ? 'incydent lokalny' : 'incydenty lokalne'}`
}
