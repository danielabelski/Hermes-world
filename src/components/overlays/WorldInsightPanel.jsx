import { useMemo } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

const HEALTH = Object.freeze({
  healthy: { label: 'Stabilnie', icon: '●', color: '#9bd2a0' },
  attention: { label: 'Uwaga', icon: '◐', color: '#efc36a' },
  warning: { label: 'Ostrzeżenie', icon: '!', color: '#efaa68' },
  critical: { label: 'Krytycznie', icon: '×', color: '#ff806c' },
  offline: { label: 'Offline', icon: '—', color: '#ff9b80' },
})

const SOURCE = Object.freeze({
  live: { label: 'LIVE', color: '#9bd2a0' },
  demo: { label: 'DEMO', color: '#f4d785' },
  degraded: { label: 'DEGRADED', color: '#efc36a' },
  offline: { label: 'OFFLINE', color: '#ff9b80' },
})

const PANEL_STYLE = {
  position: 'absolute',
  zIndex: 3,
  top: 'max(112px, calc(env(safe-area-inset-top) + 108px))',
  left: 'max(14px, env(safe-area-inset-left))',
  width: 'min(332px, calc(100vw - 28px))',
  padding: '9px 10px',
  border: '1px solid rgba(242, 219, 154, .22)',
  borderRadius: 14,
  color: '#f5ead6',
  background: 'rgba(14, 29, 20, .72)',
  boxShadow: '0 8px 22px rgba(1, 8, 4, .23)',
  backdropFilter: 'blur(9px)',
  WebkitBackdropFilter: 'blur(9px)',
}

function sourceFor({ explicitSource, connection, system, raw }) {
  if (connection === 'offline') return 'offline'
  if (connection === 'degraded') return 'degraded'
  if (explicitSource === 'live' || explicitSource === 'demo') return explicitSource
  if (system.temperatureSource === 'demo' || raw?.metrics?.temperatureSource === 'demo') return 'demo'
  const hasRaw = raw && (Object.keys(raw).length > 0 || Object.keys(raw.metrics ?? {}).length > 0)
  return hasRaw ? 'live' : 'demo'
}

function severityFor(system, lifecycle) {
  if (lifecycle.connection === 'offline') return 'offline'
  return system.severity ?? system.health?.severity ?? 'healthy'
}

/**
 * One-glance world read: a visual sentence about health, motion and risk.
 * It intentionally avoids tables and log text; details belong in a sheet.
 */
export function WorldInsightPanel() {
  const system = useWorldStore((state) => state.system ?? {})
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const agents = useWorldStore((state) => state.agents ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const raw = useWorldStore((state) => state.raw)
  const explicitSource = useWorldStore((state) => state.source ?? state.lifecycle?.source)
  const openSheet = useWorldStore((state) => state.openSheet)
  const observabilityFocus = useWorldStore((state) => state.observabilityFocus ?? 'auto')

  const severity = severityFor(system, lifecycle)
  const health = HEALTH[severity] ?? HEALTH.healthy
  const sourceKey = useMemo(() => sourceFor({ explicitSource, connection: lifecycle.connection, system, raw }), [explicitSource, lifecycle.connection, raw, system])
  const source = SOURCE[sourceKey]
  const activeAgents = Number.isFinite(Number(system.activeAgentCount)) ? Number(system.activeAgentCount) : agents.filter((agent) => agent.active ?? agent.isActive).length
  const totalAgents = Number.isFinite(Number(system.totalAgentCount)) ? Number(system.totalAgentCount) : agents.length
  const alertCount = alerts.filter((alert) => ['warning', 'error', 'critical'].includes(String(alert.severity ?? '').toLowerCase())).length
  const sentence = alertCount > 0 ? `${activeAgents} agentów pracuje · ${alertCount} wymaga uwagi` : `${activeAgents} agentów pracuje · świat jest spokojny`
  const quietStable = observabilityFocus === 'stable' || (severity === 'healthy' && activeAgents === 0 && alertCount === 0)

  if (quietStable) return null

  return (
    <section className="world-insight-panel" data-severity={severity} data-source={sourceKey} style={PANEL_STYLE} aria-label="Szybki odczyt stanu świata">
      <div className="world-insight-panel__headline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 7 }}>
          <span aria-hidden="true" style={{ color: health.color, fontSize: 14, fontWeight: 800 }}>{health.icon}</span>
          <strong style={{ color: health.color, fontSize: 11, letterSpacing: '.04em' }}>{health.label}</strong>
          <span style={{ overflow: 'hidden', color: '#d5dccd', fontSize: 10, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sentence}</span>
        </div>
        <span title={sourceKey === 'demo' ? 'Scena demonstracyjna' : 'Źródło danych'} style={{ flex: '0 0 auto', color: source.color, fontSize: 9, fontWeight: 800, letterSpacing: '.1em' }}>{source.label}</span>
      </div>
      <div className="world-insight-panel__details" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, color: '#b9c7bb', fontSize: 10 }}>
        <span><b style={{ color: '#f5ead6' }}>{activeAgents}</b> / {totalAgents} w ruchu</span>
        <span aria-hidden="true" style={{ opacity: .5 }}>·</span>
        <button type="button" onClick={() => openSheet?.('activity')} aria-label={alertCount ? `Otwórz ${alertCount} alertów` : 'Otwórz aktywność'} style={{ padding: 0, border: 0, color: alertCount ? '#efc36a' : '#b9c7bb', background: 'transparent', cursor: 'pointer', fontSize: 10 }}>{alertCount ? `${alertCount} alert${alertCount === 1 ? '' : 'ów'}` : 'brak alertów'}</button>
      </div>
    </section>
  )
}

export default WorldInsightPanel
