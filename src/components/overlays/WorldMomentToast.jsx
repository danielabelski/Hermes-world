import { useEffect, useMemo, useRef, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'
import { classifyWorldMoment, resolveWorldMoment } from '../../world/worldMomentPriority.js'
import { mergeWorldActivityItems, recentWorldActivityItems } from '../../world/worldActivityItems.js'

const TONE = Object.freeze({
  info: { icon: 'i', label: 'INFO', color: '#9fc7d8', border: 'rgba(159, 199, 216, .42)', background: 'rgba(28, 52, 65, .88)' },
  success: { icon: '✓', label: 'SUKCES', color: '#9bd2a0', border: 'rgba(155, 210, 160, .42)', background: 'rgba(25, 72, 48, .88)' },
  stuck: { icon: '↛', label: 'BRAK POSTĘPU', color: '#efbd69', border: 'rgba(239, 189, 105, .52)', background: 'rgba(76, 54, 25, .91)' },
  alert: { icon: '!', label: 'UWAGA', color: '#efc36a', border: 'rgba(239, 195, 106, .5)', background: 'rgba(79, 57, 24, .9)' },
  critical: { icon: '×', label: 'KRYTYCZNE', color: '#ff8b76', border: 'rgba(255, 117, 100, .58)', background: 'rgba(94, 35, 34, .92)' },
})

const ROOT_STYLE = {
  position: 'absolute',
  zIndex: 5,
  right: 'max(14px, env(safe-area-inset-right))',
  bottom: 'max(62px, calc(env(safe-area-inset-bottom) + 52px))',
  left: 'max(14px, env(safe-area-inset-left))',
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
}

const shorten = (value, max = 86) => {
  const text = String(value ?? 'Nowe zdarzenie').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

function itemId(item, index) {
  return String(item.id ?? `${item.createdAt ?? item.timestamp ?? 'event'}-${item.message ?? index}`)
}

function toneFor(item) {
  const tone = classifyWorldMoment(item)
  return tone === 'warning' ? 'alert' : tone
}

/**
 * Rolling, human-readable history of meaningful operational changes. New
 * events appear immediately; recent verified events remain inspectable.
 */
export function WorldMomentToast() {
  const activity = useWorldStore((state) => state.activity?.items ?? state.activity ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const agents = useWorldStore((state) => state.agents ?? [])
  const openSheet = useWorldStore((state) => state.openSheet)
  const [moment, setMoment] = useState(null)
  const [mountedAt] = useState(() => Date.now())
  const activeIndexRef = useRef(0)
  const seenRef = useRef(new Set())
  const initializedRef = useRef(false)
  const items = useMemo(() => recentWorldActivityItems(mergeWorldActivityItems(activity, alerts), mountedAt), [activity, alerts, mountedAt])

  useEffect(() => {
    const ids = items.map(itemId)
    if (!initializedRef.current) {
      ids.forEach((id) => seenRef.current.add(id))
      initializedRef.current = true
      if (!items.length) return undefined
      const initialTimer = window.setTimeout(() => setMoment(resolveWorldMoment(items[0], alerts, agents)), 0)
      return () => window.clearTimeout(initialTimer)
    }

    const fresh = items.find((item, index) => !seenRef.current.has(itemId(item, index)))
    ids.forEach((id) => seenRef.current.add(id))
    if (!fresh) return undefined

    const showTimer = window.setTimeout(() => {
      activeIndexRef.current = Math.max(0, items.findIndex((item, index) => itemId(item, index) === itemId(fresh)))
      setMoment(resolveWorldMoment(fresh, alerts, agents))
    }, 0)
    return () => window.clearTimeout(showTimer)
  }, [items, alerts, agents])

  useEffect(() => {
    if (!initializedRef.current || !moment) return undefined
    const escalated = resolveWorldMoment(moment, alerts, agents)
    if (!escalated || itemId(escalated) === itemId(moment)) return undefined
    const escalationTimer = window.setTimeout(() => setMoment(escalated), 0)
    return () => window.clearTimeout(escalationTimer)
  }, [alerts, agents, moment])

  useEffect(() => {
    if (items.length < 2) return undefined
    const rotateTimer = window.setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % items.length
      activeIndexRef.current = nextIndex
      setMoment(resolveWorldMoment(items[nextIndex], alerts, agents))
    }, 5_500)
    return () => window.clearInterval(rotateTimer)
  }, [items, alerts, agents])

  if (!moment) return null

  const tone = TONE[toneFor(moment)]
  const message = shorten(moment.message ?? moment.title ?? moment.name)
  const eventTime = new Date(moment.createdAt ?? moment.timestamp ?? '')
  const timeLabel = Number.isNaN(eventTime.getTime()) ? '' : new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' }).format(eventTime)
  const eventLabel = moment.type === 'cron' ? 'CRON' : tone.label

  return (
    <div className="world-moment-toast" style={ROOT_STYLE}>
      <button type="button" onClick={() => openSheet?.('activity')} aria-label={`${tone.label}: ${message}. Otwórz aktywność.`} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) 18px', alignItems: 'center', gap: 9, width: 'min(430px, 100%)', minHeight: 52, padding: '8px 10px', border: `1px solid ${tone.border}`, borderRadius: 14, color: '#f5ead6', background: tone.background, boxShadow: '0 12px 30px rgba(1, 8, 4, .38)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer', pointerEvents: 'auto', textAlign: 'left' }}>
        <span aria-hidden="true" style={{ display: 'grid', width: 26, height: 26, placeItems: 'center', border: `1px solid ${tone.color}66`, borderRadius: 9, color: tone.color, background: `${tone.color}1f`, fontSize: 16, fontWeight: 800 }}>{tone.icon}</span>
        <span style={{ display: 'grid', minWidth: 0, gap: 2 }}>
          <span style={{ color: tone.color, fontSize: 9, fontWeight: 800, letterSpacing: '.12em' }}>{eventLabel}{timeLabel ? ` · ${timeLabel}` : ''}</span>
          <span style={{ overflow: 'hidden', color: '#f2eee0', fontSize: 11, lineHeight: 1.3, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message}</span>
        </span>
        <span aria-hidden="true" style={{ color: 'rgba(245, 234, 214, .62)', fontSize: 15 }}>›</span>
      </button>
    </div>
  )
}

export default WorldMomentToast
