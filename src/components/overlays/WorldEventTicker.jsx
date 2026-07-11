import { useEffect, useMemo, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

const TYPE_META = Object.freeze({
  agent: { icon: '●', color: '#9bd2a0' },
  task: { icon: '▣', color: '#efc36a' },
  alert: { icon: '!', color: '#efc36a' },
  log: { icon: '·', color: '#9fc1e4' },
  cron: { icon: '◷', color: '#c6a6e3' },
  system: { icon: '☼', color: '#9fc1e4' },
})

const SEVERITY_COLOR = Object.freeze({
  info: '#9fc1e4',
  healthy: '#9bd2a0',
  warning: '#efc36a',
  error: '#ef8b68',
  critical: '#ff7564',
})

const TICKER_STYLE = {
  position: 'absolute',
  zIndex: 3,
  top: 'max(64px, calc(env(safe-area-inset-top) + 60px))',
  left: '50%',
  width: 'min(520px, calc(100vw - 28px))',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
}

const truncate = (value, max = 58) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

function compactMessage(item) {
  const message = item.message ?? item.title ?? item.name ?? 'Nowe zdarzenie'
  return truncate(message)
}

function normalizeItems(activity, alerts) {
  const source = Array.isArray(activity) && activity.length ? activity : alerts
  if (!Array.isArray(source)) return []
  return source
    .filter(Boolean)
    .slice()
    .sort((a, b) => String(b.createdAt ?? b.timestamp ?? '').localeCompare(String(a.createdAt ?? a.timestamp ?? '')))
    .slice(0, 3)
}

/**
 * A quiet, ambient readout of the latest world changes. It is intentionally
 * shorter than ActivityFeed and never competes with the map for attention.
 */
export function WorldEventTicker() {
  const activity = useWorldStore((state) => state.activity?.items ?? state.activity ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const [activeIndex, setActiveIndex] = useState(0)
  const items = useMemo(() => normalizeItems(activity, alerts), [activity, alerts])
  const selectedIndex = items.length ? activeIndex % items.length : 0

  useEffect(() => {
    if (items.length < 2) return undefined
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % items.length), 5_500)
    return () => window.clearInterval(timer)
  }, [items.length])

  if (!items.length) return null

  return (
    <div className="world-event-ticker" style={TICKER_STYLE} aria-label="Ostatnie zdarzenia Cytadeli" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 27, padding: '4px 8px', border: '1px solid rgba(242, 219, 154, .2)', borderRadius: 999, color: '#e8eadb', background: 'rgba(14, 29, 20, .66)', boxShadow: '0 6px 18px rgba(1, 8, 4, .2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <span aria-hidden="true" style={{ color: '#e8c76f', fontSize: 10 }}>✦</span>
        <ul style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minWidth: 0, margin: 0, padding: 0, listStyle: 'none' }}>
          {items.map((item, index) => {
            const severity = item.severity ?? item.level ?? 'info'
            const type = item.type ?? (['warning', 'error', 'critical'].includes(severity) ? 'alert' : 'system')
            const meta = TYPE_META[type] ?? TYPE_META.system
            const color = SEVERITY_COLOR[severity] ?? meta.color
            const current = index === selectedIndex
            return (
              <li key={item.id ?? `${item.createdAt ?? item.timestamp ?? 'event'}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, maxWidth: current ? 260 : 86, opacity: current ? 1 : .56, transition: 'opacity 180ms ease, max-width 180ms ease' }}>
                <span aria-hidden="true" style={{ flex: '0 0 auto', color, fontSize: 10, fontWeight: 800 }}>{meta.icon}</span>
                <span style={{ overflow: 'hidden', color: current ? '#f5ead6' : '#c6cfbf', fontSize: 10, lineHeight: 1.2, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{compactMessage(item)}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default WorldEventTicker
