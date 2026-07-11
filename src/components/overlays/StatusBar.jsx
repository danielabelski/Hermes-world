import { useWorldStore } from '../../world/store/worldStore.js'
import './MobileWorldOverlays.css'
import './WorldOverlaySafeArea.css'
import '../../world/AgentSignalEffects.css'

const WEATHER = {
  unknown: { icon: 'â—‹', label: 'Brak danych' },
  sunny: { icon: '☀️', label: 'Słonecznie' },
  cloudy: { icon: '⛅', label: 'Pochmurnie' },
  rain: { icon: '🌧️', label: 'Deszcz' },
  storm: { icon: '⛈️', label: 'Burza' },
}

const HEALTH_LABELS = {
  healthy: 'Stabilny',
  attention: 'Uwaga',
  warning: 'Ostrzeżenie',
  critical: 'Krytyczny',
  offline: 'Offline',
  unknown: 'Brak danych',
}

function weatherFor(system, weather, scenario) {
  if (weather?.kind && WEATHER[weather.kind]) return weather.kind
  const hasCpu = system?.cpuPercent !== null && system?.cpuPercent !== undefined && system?.cpuPercent !== ''
  const cpu = Number(system?.cpuPercent)
  if (hasCpu && Number.isFinite(cpu)) {
    if (cpu >= 85) return 'storm'
    if (cpu >= 60) return 'rain'
    if (cpu >= 30) return 'cloudy'
    return 'sunny'
  }
  if (scenario === 'critical') return 'storm'
  if (scenario === 'warning') return 'rain'
  if (scenario === 'healthy') return 'sunny'
  return 'unknown'
}

function severityFor(system, lifecycle, scenario) {
  if (lifecycle?.connection === 'offline') return 'offline'
  return system?.severity ?? system?.healthStatus ?? (scenario === 'critical' ? 'critical' : scenario === 'warning' ? 'warning' : 'healthy')
}

/** A compact, readable first impression. Details stay in the world/sheet. */
export function StatusBar() {
  const system = useWorldStore((state) => state.system)
  const weather = useWorldStore((state) => state.weather)
  const lifecycle = useWorldStore((state) => state.lifecycle)
  const scenario = useWorldStore((state) => state.scenario)
  const agents = useWorldStore((state) => state.agents ?? [])
  const openSheet = useWorldStore((state) => state.openSheet)

  const kind = weatherFor(system, weather, scenario)
  const weatherMeta = WEATHER[kind]
  const severity = severityFor(system, lifecycle, scenario)
  const activeAgents = system?.activeAgentCount ?? agents.filter((agent) => agent.active ?? agent.isActive).length
  const totalAgents = system?.totalAgentCount ?? agents.length
  const healthLabel = HEALTH_LABELS[severity] ?? HEALTH_LABELS.unknown
  const showActivity = () => openSheet?.('activity')

  return (
    <header
      className="world-status-bar"
      data-severity={severity}
      aria-label={`Hermes OS: ${weatherMeta.label}; aktywnych agentów ${activeAgents} z ${totalAgents}; stan systemu ${healthLabel}.`}
    >
      <button className="world-status-bar__weather" type="button" onClick={showActivity} aria-label={`Stan świata: ${weatherMeta.label}`}>
        <span aria-hidden="true">{weatherMeta.icon}</span>
      </button>
      <div className="world-status-bar__identity" aria-label="Hermes OS">HERMES</div>
      <button className="world-status-bar__agents" type="button" onClick={showActivity} aria-label={`Aktywnych agentów: ${activeAgents} z ${totalAgents}`}>
        <span aria-hidden="true">♟</span><span>{activeAgents} / {totalAgents}</span>
      </button>
      <button className="world-status-bar__health" type="button" onClick={showActivity} aria-label={`Stan systemu: ${healthLabel}`}>
        <span className="world-status-bar__health-dot" aria-hidden="true" /><span>{healthLabel}</span>
      </button>
    </header>
  )
}

export default StatusBar
