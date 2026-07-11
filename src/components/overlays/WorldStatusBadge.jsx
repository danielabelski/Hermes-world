import { useMemo } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

const SOURCE_META = Object.freeze({
  live: { label: 'LIVE', detail: 'Dane z działającego Hermes API', color: '#9bd2a0', background: 'rgba(24, 75, 49, .82)', border: 'rgba(155, 210, 160, .38)' },
  demo: { label: 'DEMO', detail: 'Scena demonstracyjna — obserwuj język świata', color: '#f4d785', background: 'rgba(75, 57, 19, .82)', border: 'rgba(232, 199, 111, .4)' },
  stale: { label: 'STALE', detail: 'Część domen pokazuje ostatni potwierdzony stan Hermesa', color: '#efc36a', background: 'rgba(79, 57, 24, .84)', border: 'rgba(239, 195, 106, .44)' },
  unknown: { label: 'UNKNOWN', detail: 'Brak potwierdzonego stanu Hermesa — niczego nie zgadujemy', color: '#c5cbd3', background: 'rgba(43, 49, 58, .86)', border: 'rgba(197, 203, 211, .38)' },
  degraded: { label: 'DEGRADED', detail: 'Część danych jest nieaktualna; pokazujemy ostatni znany stan', color: '#efc36a', background: 'rgba(79, 57, 24, .84)', border: 'rgba(239, 195, 106, .44)' },
  offline: { label: 'OFFLINE', detail: 'Brak połączenia — stan świata może być nieaktualny', color: '#ff9b80', background: 'rgba(82, 36, 33, .86)', border: 'rgba(255, 139, 118, .46)' },
})

function hasLiveSnapshot(raw) {
  if (!raw || typeof raw !== 'object') return false
  const profiles = Array.isArray(raw.profiles) ? raw.profiles.length : Object.keys(raw.profiles ?? {}).length
  const metrics = raw.metrics && typeof raw.metrics === 'object' ? Object.keys(raw.metrics).length : 0
  return profiles > 0 || metrics > 0
}

function sourceFor({ explicitSource, connection, system, raw }) {
  if (explicitSource === 'demo') return 'demo'
  if (explicitSource === 'stale') return 'stale'
  if (explicitSource === 'unknown') return 'unknown'
  if (connection === 'offline') return 'offline'
  if (connection === 'degraded') return 'degraded'
  if (explicitSource === 'live') return 'live'
  if (system.temperatureSource === 'demo' || raw?.metrics?.temperatureSource === 'demo') return 'demo'
  if (!hasLiveSnapshot(raw)) return 'unknown'
  return 'live'
}

/** Compact provenance indicator; it prevents demo fixtures being mistaken for telemetry. */
export function WorldStatusBadge() {
  const system = useWorldStore((state) => state.system ?? {})
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const raw = useWorldStore((state) => state.raw)
  const explicitSource = useWorldStore((state) => state.source ?? state.lifecycle?.source)
  const openSheet = useWorldStore((state) => state.openSheet)
  const source = useMemo(() => sourceFor({ explicitSource, connection: lifecycle.connection, system, raw }), [explicitSource, lifecycle.connection, raw, system])
  const meta = SOURCE_META[source]

  return (
    <button className="world-status-badge" data-source={source} type="button" onClick={() => openSheet?.('activity')} title={meta.detail} aria-label={`${meta.label}: ${meta.detail}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 25, padding: '4px 8px', border: `1px solid ${meta.border}`, borderRadius: 999, color: meta.color, background: meta.background, boxShadow: '0 5px 16px rgba(1, 8, 4, .22)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', cursor: 'pointer', fontSize: 9, fontWeight: 800, letterSpacing: '.1em' }}>
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
      <span>{meta.label}</span>
    </button>
  )
}

export default WorldStatusBadge
