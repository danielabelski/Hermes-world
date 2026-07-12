import { useEffect, useMemo, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'
import { mergeWorldActivityItems } from '../../world/worldActivityItems.js'

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

function compactMessage(item) {
  const message = item.message ?? item.title ?? item.name ?? 'Nowe zdarzenie'
  return String(message).replace(/\s+/g, ' ').trim()
}

/**
 * A quiet, ambient readout of the latest world changes. It is intentionally
 * shorter than ActivityFeed and never competes with the map for attention.
 */
export function WorldEventTicker() {
  const activity = useWorldStore((state) => state.activity?.items ?? state.activity ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const [activeIndex, setActiveIndex] = useState(0)
  const items = useMemo(() => mergeWorldActivityItems(activity, alerts), [activity, alerts])
  const selectedIndex = items.length ? activeIndex % items.length : 0
  const item = items[selectedIndex]

  useEffect(() => {
    if (items.length < 2) return undefined
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % items.length), 5_500)
    return () => window.clearInterval(timer)
  }, [items.length])

  if (!items.length) return null

  return (
    <div className="world-event-ticker" style={TICKER_STYLE} aria-label="Ostatnie zdarzenia Cytadeli" aria-live="polite">
      <div className="world-event-ticker__surface">
        {(() => {
          const severity = item.severity ?? item.level ?? 'info'
          const type = item.type ?? (['warning', 'error', 'critical'].includes(severity) ? 'alert' : 'system')
          const meta = TYPE_META[type] ?? TYPE_META.system
          const color = SEVERITY_COLOR[severity] ?? meta.color
          return <div className="world-event-ticker__message" key={item.id ?? selectedIndex} aria-atomic="true">
            <span aria-hidden="true" style={{ color }}>{meta.icon}</span>
            <span title={compactMessage(item)}>{compactMessage(item)}</span>
            {items.length > 1 ? <small aria-hidden="true">{selectedIndex + 1}/{items.length}</small> : null}
          </div>
        })()}
      </div>
    </div>
  )
}

export default WorldEventTicker
