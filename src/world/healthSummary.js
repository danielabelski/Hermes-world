const CRITICAL_INCIDENT_SEVERITIES = new Set(['critical', 'error', 'fatal'])
const LOCAL_INCIDENT_SEVERITIES = new Set(['warning', ...CRITICAL_INCIDENT_SEVERITIES])

export function countLocalCriticalIncidents(alerts = []) {
  return alerts.filter((alert) => CRITICAL_INCIDENT_SEVERITIES.has(String(alert?.severity ?? '').toLowerCase())).length
}

export function countLocalIncidents(alerts = []) {
  return alerts.filter((alert) => LOCAL_INCIDENT_SEVERITIES.has(String(alert?.severity ?? '').toLowerCase())).length
}

export function resolveHealthSummaryLabel({ severity = 'healthy', baseLabel, incidentCount, criticalCount = 0 } = {}) {
  const localCount = Number.isFinite(incidentCount) ? incidentCount : criticalCount
  if (severity !== 'healthy' || localCount <= 0) return baseLabel
  return `System stabilny · ${localCount} ${localCount === 1 ? 'incydent lokalny' : 'incydenty lokalne'}`
}
