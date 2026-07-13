import { useWorldStore } from '../../world/store/worldStore.js'
import { countLocalIncidents, resolveHealthSummaryLabel } from '../../world/healthSummary.js'

const COPY = {
  healthy: 'Świat działa spokojnie',
  attention: 'System wymaga uwagi',
  warning: 'Wykryto ostrzeżenie',
  critical: 'Wymagana szybka reakcja',
  offline: 'Brak bieżącego połączenia',
}

function severityFor(system, lifecycle, scenario) {
  if (lifecycle?.connection === 'offline') return 'offline'
  return system?.severity ?? system?.healthStatus ?? (scenario === 'critical' ? 'critical' : scenario === 'warning' ? 'warning' : 'healthy')
}

export function HealthRibbon() {
  const system = useWorldStore((state) => state.system)
  const lifecycle = useWorldStore((state) => state.lifecycle)
  const scenario = useWorldStore((state) => state.scenario)
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const openSheet = useWorldStore((state) => state.openSheet)
  const severity = severityFor(system, lifecycle, scenario)
  const incidentCount = countLocalIncidents(alerts)
  const label = resolveHealthSummaryLabel({ severity, baseLabel: COPY[severity] ?? COPY.healthy, incidentCount })

  return (
    <button className="health-ribbon" data-severity={severity} type="button" onClick={() => openSheet?.('activity')} aria-label={`${label}${incidentCount ? `. Lokalne alerty: ${incidentCount}` : ''}. Otwórz aktywność.`}>
      <span className="health-ribbon__wave" aria-hidden="true" />
      <span className="health-ribbon__label">{label}</span>
      {incidentCount > 0 && <span className="health-ribbon__alert-count" aria-label={`${incidentCount} lokalne alerty`}>{incidentCount}</span>}
    </button>
  )
}

export default HealthRibbon
