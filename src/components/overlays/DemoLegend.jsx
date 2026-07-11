import { useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

const SIGNALS = Object.freeze([
  { key: 'working', icon: '●', title: 'Postać w ruchu', detail: 'Agent wykonuje zadanie.', color: '#9bd2a0' },
  { key: 'idle', icon: '◌', title: 'Postać spokojna', detail: 'Agent czeka na pracę.', color: '#b8c7cf' },
  { key: 'package', icon: '▣', title: 'Paczka', detail: 'Fizyczne zadanie przemieszczane po świecie.', color: '#efc36a' },
  { key: 'warning', icon: '!', title: 'Znak ostrzeżenia', detail: 'Coś wymaga uwagi.', color: '#efc36a' },
  { key: 'critical', icon: '×', title: 'Czerwony alert', detail: 'Problem krytyczny lub błąd.', color: '#ff7564' },
  { key: 'weather', icon: '☁', title: 'Niebo', detail: 'Pogoda pokazuje obciążenie systemu.', color: '#9fc1e4' },
])

const PANEL_STYLE = {
  position: 'absolute',
  zIndex: 4,
  left: 'max(14px, env(safe-area-inset-left))',
  bottom: 'max(72px, calc(env(safe-area-inset-bottom) + 62px))',
  width: 'min(294px, calc(100vw - 28px))',
  color: '#f5ead6',
  fontSize: 12,
}

const BUTTON_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 36,
  padding: '7px 11px',
  border: '1px solid rgba(242, 219, 154, .36)',
  borderRadius: 999,
  color: '#faebc4',
  background: 'rgba(15, 31, 22, .86)',
  boxShadow: '0 8px 24px rgba(1, 8, 4, .32)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700,
}

/**
 * First-visit reading key for the living world. This is deliberately short:
 * it explains the visual language without turning the map into a dashboard.
 */
export function DemoLegend({ defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const openSheet = useWorldStore((state) => state.openSheet)
  const system = useWorldStore((state) => state.system ?? {})
  const agents = useWorldStore((state) => state.agents ?? [])
  const weather = useWorldStore((state) => state.weather ?? {})
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const isDemo = system.temperatureSource === 'demo'
  const importantAlerts = alerts.filter((alert) => ['warning', 'error', 'critical'].includes(alert.severity)).length
  const activeAgents = Number.isFinite(Number(system.activeAgentCount))
    ? Number(system.activeAgentCount)
    : agents.filter((agent) => agent.active ?? agent.isActive).length
  const totalAgents = Number.isFinite(Number(system.totalAgentCount))
    ? Number(system.totalAgentCount)
    : agents.length
  const weatherLabel = weather.kind === 'storm' ? 'burza' : weather.kind === 'rain' ? 'deszcz' : weather.kind === 'cloudy' ? 'chmury' : 'słońce'
  const connectionLabel = lifecycle.connection === 'offline' ? 'offline' : isDemo ? 'scena demonstracyjna' : 'połączono'

  return (
    <aside className="demo-legend" style={PANEL_STYLE} data-expanded={expanded} aria-label="Jak czytać żywy świat Hermesa">
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <button type="button" style={BUTTON_STYLE} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="demo-legend-panel">
          <span aria-hidden="true" style={{ color: '#e8c76f', fontSize: 15 }}>✦</span>
          <span>Jak czytać świat</span>
          <span aria-hidden="true" style={{ opacity: .72 }}>{expanded ? '⌃' : '⌄'}</span>
        </button>
        {isDemo && <span style={{ padding: '4px 6px', border: '1px solid rgba(232, 199, 111, .42)', borderRadius: 999, color: '#f4d785', background: 'rgba(75, 57, 19, .68)', fontSize: 9, fontWeight: 800, letterSpacing: '.1em' }}>DEMO</span>}
      </div>

      {expanded && (
        <div id="demo-legend-panel" style={{ marginTop: 8, padding: '12px 12px 11px', border: '1px solid rgba(242, 219, 154, .27)', borderRadius: 14, background: 'rgba(14, 29, 20, .94)', boxShadow: '0 14px 34px rgba(1, 8, 4, .34)' }}>
          <p style={{ margin: '0 0 10px', color: '#d5dccd', fontSize: 11, lineHeight: 1.4 }}>Nie czytasz panelu — obserwujesz sygnały. Ruch pokazuje pracę, a kolor pokazuje stan.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SIGNALS.map((signal) => (
              <div key={signal.key} title={signal.detail} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#eceddc', fontSize: 10 }}>
                <span aria-hidden="true" style={{ display: 'grid', width: 19, height: 19, placeItems: 'center', borderRadius: 6, color: signal.color, background: `${signal.color}22`, fontSize: 12, fontWeight: 800 }}>{signal.icon}</span>
                <span>{signal.title}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11, paddingTop: 9, borderTop: '1px solid rgba(242, 219, 154, .14)', color: '#b9c7bb', fontSize: 10 }}>
            <span>Niebo: {weatherLabel}</span><span aria-hidden="true">·</span><span>{activeAgents} / {totalAgents} agentów w ruchu</span><span aria-hidden="true">·</span><span>{connectionLabel}</span>
          </div>
          {importantAlerts > 0 && <button type="button" onClick={() => openSheet?.('activity')} style={{ width: '100%', minHeight: 32, marginTop: 9, padding: '6px 9px', border: '1px solid rgba(239, 117, 100, .44)', borderRadius: 8, color: '#ffd0c0', background: 'rgba(125, 42, 37, .32)', cursor: 'pointer', fontSize: 10, textAlign: 'left' }}>Zobacz {importantAlerts} alert{importantAlerts === 1 ? '' : 'y'} w aktywności →</button>}
        </div>
      )}
    </aside>
  )
}

export default DemoLegend
