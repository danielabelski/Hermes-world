import { Fragment, useEffect, useState } from 'react'

const SHORTCUTS = Object.freeze([
  ['Space / 1', 'widok całości'],
  ['2 / 3', 'zoom standard / detal'],
  ['A', 'aktywni agenci'],
  ['E', 'najpilniejszy alert'],
  ['T', 'aktywność'],
  ['C', 'chat'],
  ['Esc', 'zamknij wybór'],
])

const ROOT_STYLE = {
  position: 'absolute',
  zIndex: 3,
  bottom: 26,
  left: 24,
  width: 'min(278px, calc(100vw - 48px))',
  color: '#f5ead6',
}

function desktopMatches() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 1100px)').matches
}

/** Desktop-only affordance: the same world gains a command vocabulary. */
export function WorldDesktopHint() {
  const [isDesktop, setIsDesktop] = useState(desktopMatches)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(min-width: 1100px)')
    const onChange = (event) => setIsDesktop(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  if (!isDesktop) return null

  return (
    <aside className="world-desktop-hint" data-expanded={expanded} style={ROOT_STYLE} aria-label="Sterowanie na komputerze">
      <div style={{ padding: '9px 10px', border: '1px solid rgba(242, 219, 154, .26)', borderRadius: 13, background: 'rgba(14, 29, 20, .76)', boxShadow: '0 8px 22px rgba(1, 8, 4, .24)', backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)' }}>
        <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="desktop-shortcuts" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minHeight: 27, padding: 0, border: 0, color: '#f4d785', background: 'transparent', cursor: 'pointer', fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textAlign: 'left' }}>
          <span>COMMAND PANEL · SKRÓTY</span><span aria-hidden="true" style={{ color: '#b9c7bb', fontSize: 13 }}>{expanded ? '⌃' : '⌄'}</span>
        </button>
        {!expanded && <p style={{ margin: '5px 0 0', color: '#b9c7bb', fontSize: 10 }}>Panel dowodzenia po prawej · naciśnij ?</p>}
        {expanded && <div id="desktop-shortcuts" style={{ display: 'grid', gridTemplateColumns: '78px minmax(0, 1fr)', gap: 5, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(242, 219, 154, .14)' }}>
          {SHORTCUTS.map(([key, action]) => <Fragment key={key}><kbd style={{ width: 'fit-content', padding: '2px 5px', border: '1px solid rgba(242, 219, 154, .25)', borderRadius: 4, color: '#f4d785', background: 'rgba(232, 199, 111, .1)', fontSize: 9, fontFamily: 'inherit' }}>{key}</kbd><span style={{ color: '#d5dccd', fontSize: 10 }}>{action}</span></Fragment>)}
        </div>}
      </div>
    </aside>
  )
}

export default WorldDesktopHint
