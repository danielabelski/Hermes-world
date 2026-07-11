import { useEffect, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

const MOBILE_QUERY = '(max-width: 767px)'

const ROOT_STYLE = {
  position: 'absolute',
  zIndex: 4,
  right: 'max(14px, env(safe-area-inset-right))',
  bottom: 'max(26px, calc(env(safe-area-inset-bottom) + 18px))',
  left: 'max(14px, env(safe-area-inset-left))',
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
}

const BUTTON_STYLE = {
  display: 'grid',
  minWidth: 50,
  minHeight: 43,
  placeItems: 'center',
  gap: 2,
  padding: '5px 8px',
  border: 0,
  color: '#e8eadb',
  background: 'transparent',
  cursor: 'pointer',
}

function isMobileViewport() {
  return typeof window === 'undefined' || typeof window.matchMedia !== 'function' || window.matchMedia(MOBILE_QUERY).matches
}

function severityColor(severity) {
  if (severity === 'critical' || severity === 'error') return '#ff806c'
  if (severity === 'warning') return '#efc36a'
  return '#9bd2a0'
}

/** Mobile action dock for reading the world; it is not route/tab navigation. */
export function WorldMobileNav({ onOpenLegend, onOpenInsight }) {
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const [panel, setPanel] = useState(null)
  const system = useWorldStore((state) => state.system ?? {})
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const agents = useWorldStore((state) => state.agents ?? [])
  const weather = useWorldStore((state) => state.weather ?? {})
  const openSheet = useWorldStore((state) => state.openSheet)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia(MOBILE_QUERY)
    const onChange = (event) => setIsMobile(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  if (!isMobile) return null

  const activeAgents = Number.isFinite(Number(system.activeAgentCount)) ? Number(system.activeAgentCount) : agents.filter((agent) => agent.active ?? agent.isActive).length
  const totalAgents = Number.isFinite(Number(system.totalAgentCount)) ? Number(system.totalAgentCount) : agents.length
  const alertCount = alerts.filter((alert) => ['warning', 'error', 'critical'].includes(String(alert.severity ?? '').toLowerCase())).length
  const severity = system.severity ?? 'healthy'
  const weatherLabel = weather.kind === 'storm' ? 'burza' : weather.kind === 'rain' ? 'deszcz' : weather.kind === 'cloudy' ? 'chmury' : 'słońce'

  const togglePanel = (name, callback) => {
    if (callback) {
      callback()
      return
    }
    setPanel((current) => current === name ? null : name)
  }

  return (
    <nav className="world-mobile-nav" style={ROOT_STYLE} aria-label="Szybki odczyt świata">
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '3px 5px', border: '1px solid rgba(242, 219, 154, .3)', borderRadius: 999, background: 'rgba(14, 29, 20, .88)', boxShadow: '0 9px 25px rgba(1, 8, 4, .35)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', pointerEvents: 'auto' }}>
        <button type="button" onClick={() => togglePanel('legend', onOpenLegend)} aria-label="Pokaż, jak czytać świat" aria-expanded={!onOpenLegend && panel === 'legend'} style={BUTTON_STYLE}>
          <span aria-hidden="true" style={{ color: '#e8c76f', fontSize: 17 }}>✦</span><small style={{ color: '#b9c7bb', fontSize: 8 }}>świat</small>
        </button>
        <button type="button" onClick={() => togglePanel('insight', onOpenInsight)} aria-label="Pokaż szybki stan świata" aria-expanded={!onOpenInsight && panel === 'insight'} style={BUTTON_STYLE}>
          <span aria-hidden="true" style={{ color: severityColor(severity), fontSize: 17 }}>◉</span><small style={{ color: '#b9c7bb', fontSize: 8 }}>stan</small>
        </button>
        <button type="button" onClick={() => openSheet?.('activity')} aria-label={alertCount ? `Pokaż ${alertCount} alertów` : 'Pokaż aktywność'} style={{ ...BUTTON_STYLE, position: 'relative' }}>
          <span aria-hidden="true" style={{ color: alertCount ? '#efc36a' : '#b9c7bb', fontSize: 17 }}>!</span><small style={{ color: '#b9c7bb', fontSize: 8 }}>alerty</small>
          {alertCount > 0 && <span aria-hidden="true" style={{ position: 'absolute', top: 2, right: 4, display: 'grid', width: 15, height: 15, placeItems: 'center', borderRadius: '50%', color: '#fff2db', background: '#a9493f', fontSize: 8, fontWeight: 800 }}>{alertCount > 9 ? '9+' : alertCount}</span>}
        </button>
      </div>

      {!onOpenLegend && panel === 'legend' && <div style={{ position: 'absolute', right: 0, bottom: 56, width: 'min(278px, calc(100vw - 28px))', padding: '10px 11px', border: '1px solid rgba(242, 219, 154, .26)', borderRadius: 13, color: '#d5dccd', background: 'rgba(14, 29, 20, .95)', boxShadow: '0 12px 28px rgba(1, 8, 4, .34)', fontSize: 10, lineHeight: 1.4 }}><strong style={{ display: 'block', marginBottom: 6, color: '#f4d785', fontSize: 9, letterSpacing: '.1em' }}>JAK CZYTAĆ ŚWIAT</strong><span>● ruch = praca&nbsp;&nbsp; ▣ paczka = zadanie&nbsp;&nbsp; ! znak = uwaga</span><br /><span>Niebo pokazuje obciążenie systemu.</span></div>}
      {!onOpenInsight && panel === 'insight' && <div style={{ position: 'absolute', right: 0, bottom: 56, width: 'min(278px, calc(100vw - 28px))', padding: '10px 11px', border: '1px solid rgba(242, 219, 154, .26)', borderRadius: 13, color: '#d5dccd', background: 'rgba(14, 29, 20, .95)', boxShadow: '0 12px 28px rgba(1, 8, 4, .34)', fontSize: 10, lineHeight: 1.4 }}><strong style={{ display: 'block', marginBottom: 6, color: severityColor(severity), fontSize: 11 }}>{activeAgents} / {totalAgents} agentów w ruchu</strong><span>{alertCount ? `${alertCount} alert${alertCount === 1 ? '' : 'ów'} wymaga uwagi` : 'Brak aktywnych alertów'}</span><span style={{ display: 'block', marginTop: 3, color: '#b9c7bb' }}>Pogoda: {weatherLabel}</span></div>}
    </nav>
  )
}

export default WorldMobileNav
