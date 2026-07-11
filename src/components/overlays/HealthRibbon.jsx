import { useWorldStore } from '../../world/store/worldStore.js'

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
  const criticalCount = alerts.filter((alert) => ['critical', 'error'].includes(alert.severity)).length
  const label = COPY[severity] ?? COPY.healthy

  return (
    <button className="health-ribbon" data-severity={severity} type="button" onClick={() => openSheet?.('activity')} aria-label={`${label}${criticalCount ? `. Ważne alerty: ${criticalCount}` : ''}. Otwórz aktywność.`}>
      <span className="health-ribbon__wave" aria-hidden="true" />
      <span className="health-ribbon__label">{label}</span>
      {criticalCount > 0 && <span className="health-ribbon__alert-count" aria-label={`${criticalCount} ważne alerty`}>{criticalCount}</span>}
    </button>
  )
}

export default HealthRibbon
