import { useEffect, useState } from 'react'

const HINTS = Object.freeze([
  { key: 'pan', icon: '↔', action: 'Przeciągnij', detail: 'rozejrzyj się po świecie' },
  { key: 'pinch', icon: '⤢', action: 'Uszczypnij', detail: 'przybliż lub oddal mapę' },
  { key: 'tap', icon: '◉', action: 'Dotknij', detail: 'wybierz agenta lub budynek' },
])

const ROOT_STYLE = {
  position: 'absolute',
  zIndex: 4,
  right: 'max(14px, env(safe-area-inset-right))',
  bottom: 'max(118px, calc(env(safe-area-inset-bottom) + 104px))',
  left: 'max(14px, env(safe-area-inset-left))',
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
}

function mediaMatches(query, fallback = false) {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : fallback
}

/** A gentle first-visit gesture hint; it disappears without blocking the map. */
export function WorldControlsHelp({ durationMs = 9_000, mobileOnly = true }) {
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(() => mediaMatches('(prefers-reduced-motion: reduce)'))
  const [isMobile, setIsMobile] = useState(() => mediaMatches('(max-width: 767px)', true))

  useEffect(() => {
    const motionQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const mobileQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 767px)') : null
    if (!motionQuery && !mobileQuery) return undefined

    const onMotionChange = (event) => setReducedMotion(event.matches)
    const onMobileChange = (event) => setIsMobile(event.matches)
    motionQuery?.addEventListener?.('change', onMotionChange)
    mobileQuery?.addEventListener?.('change', onMobileChange)
    return () => {
      motionQuery?.removeEventListener?.('change', onMotionChange)
      mobileQuery?.removeEventListener?.('change', onMobileChange)
    }
  }, [])

  useEffect(() => {
    if (!visible) return undefined
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? Math.min(durationMs, 5_500) : durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs, reducedMotion, visible])

  if (!visible || (mobileOnly && !isMobile)) return null

  return (
    <aside className="world-controls-help" data-reduced-motion={reducedMotion} style={{ ...ROOT_STYLE, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(7px)', transition: reducedMotion ? 'none' : 'opacity 220ms ease, transform 220ms ease' }} aria-label="Sterowanie światem" aria-live="polite">
      <div style={{ width: 'min(430px, 100%)', padding: '10px 11px 9px', border: '1px solid rgba(242, 219, 154, .27)', borderRadius: 15, color: '#f5ead6', background: 'rgba(14, 29, 20, .9)', boxShadow: '0 10px 26px rgba(1, 8, 4, .3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
          <span style={{ color: '#f4d785', fontSize: 9, fontWeight: 800, letterSpacing: '.12em' }}>ROZEJRZYJ SIĘ</span>
          <button type="button" onClick={() => setVisible(false)} aria-label="Ukryj podpowiedź sterowania" style={{ padding: '1px 4px', border: 0, color: 'rgba(245, 234, 214, .64)', background: 'transparent', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {HINTS.map((hint) => (
            <div key={hint.key} style={{ display: 'grid', gridTemplateColumns: '23px minmax(0, 1fr)', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span aria-hidden="true" style={{ display: 'grid', width: 22, height: 22, placeItems: 'center', border: '1px solid rgba(242, 219, 154, .28)', borderRadius: 7, color: '#e8c76f', background: 'rgba(232, 199, 111, .1)', fontSize: 13 }}>{hint.icon}</span>
              <span style={{ display: 'grid', minWidth: 0, gap: 1 }}><strong style={{ color: '#eceddc', fontSize: 10, fontWeight: 700 }}>{hint.action}</strong><small style={{ overflow: 'hidden', color: '#b9c7bb', fontSize: 8, lineHeight: 1.25, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hint.detail}</small></span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default WorldControlsHelp
