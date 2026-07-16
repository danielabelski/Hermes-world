import { useEffect, useMemo, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

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

function compactRawLog(item) {
  const message = item.rawMessage ?? item.message ?? 'Brak treści logu'
  return String(message).replace(/\s+/g, ' ').trim()
}

/**
 * A technical window into the real Hermes journal. Human-readable world
 * narration belongs to ActivityFeed and WorldMomentToast below the map.
 */
export function WorldEventTicker() {
  const rawLogs = useWorldStore((state) => state.raw?.logs ?? [])
  const observabilityFocus = useWorldStore((state) => state.observabilityFocus ?? 'auto')
  const [activeIndex, setActiveIndex] = useState(0)
  const items = useMemo(() => [...rawLogs].slice(-5).reverse(), [rawLogs])
  const selectedIndex = items.length ? activeIndex % items.length : 0
  const item = items[selectedIndex]

  useEffect(() => {
    if (items.length < 2) return undefined
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % items.length), 5_500)
    return () => window.clearInterval(timer)
  }, [items.length])

  if (!items.length || observabilityFocus === 'stable') return null

  return (
    <div className="world-event-ticker" style={TICKER_STYLE} aria-label="Surowe logi Hermesa" aria-live="polite" data-channel="raw-logs">
      <div className="world-event-ticker__surface">
        {(() => {
          const severity = item.severity ?? item.level ?? 'info'
          const color = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.info
          return <div className="world-event-ticker__message" key={item.id ?? selectedIndex} aria-atomic="true">
            <span aria-hidden="true" style={{ color }}>›_</span>
            <span title={compactRawLog(item)}>{compactRawLog(item)}</span>
            <small aria-hidden="true">RAW{items.length > 1 ? ` ${selectedIndex + 1}/${items.length}` : ''}</small>
          </div>
        })()}
      </div>
    </div>
  )
}

export default WorldEventTicker
