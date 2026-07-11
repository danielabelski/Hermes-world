import { lazy, Suspense, useEffect, useState } from 'react'
import LoginScreen from './components/LoginScreen.jsx'
import WorldFallback from './world/WorldFallback.jsx'
import WorldRendererBoundary from './world/WorldRendererBoundary.jsx'
import StatusBar from './components/overlays/StatusBar.jsx'
import HealthRibbon from './components/overlays/HealthRibbon.jsx'
import WorldControls from './components/overlays/WorldControls.jsx'
import DesktopCommandPanel from './components/overlays/DesktopCommandPanel.jsx'
import BottomSheet from './components/overlays/BottomSheet.jsx'
import KeyboardShortcuts from './components/overlays/KeyboardShortcuts.jsx'
import AccessibilityAnnouncer from './components/overlays/AccessibilityAnnouncer.jsx'
import DemoLegend from './components/overlays/DemoLegend.jsx'
import WorldEventTicker from './components/overlays/WorldEventTicker.jsx'
import WorldMomentToast from './components/overlays/WorldMomentToast.jsx'
import WorldStatusBadge from './components/overlays/WorldStatusBadge.jsx'
import WorldInsightPanel from './components/overlays/WorldInsightPanel.jsx'
import WorldFocusRing from './components/overlays/WorldFocusRing.jsx'
import WorldTapConfirmation from './components/WorldTapConfirmation.jsx'
import { useWorldBridge } from './hooks/useWorldBridge.js'
import { useWorldStore } from './world/store/worldStore.js'
import { useAmbientMode } from './hooks/useAmbientMode.js'

const AUTH_STATUS_URL = '/api/auth/status'
const FORCE_DEMO_WORLD = import.meta.env.VITE_DEMO_WORLD === 'true'
  || new URLSearchParams(window.location.search).get('demo') === '1'
const BYPASS_AUTH = import.meta.env.DEV || FORCE_DEMO_WORLD
// The illustrated DOM world is the reliable demo baseline. Pixi is an
// enhancement behind an explicit flag until its lifecycle is fully hardened.
const ENABLE_PIXI_ENHANCEMENT = import.meta.env.VITE_ENABLE_PIXI_WORLD === 'true'
// Keep Pixi out of the critical mobile boot path. If a device cannot load a
// WebGL dependency, the CSS world underneath remains fully usable.
const WorldCanvas = lazy(() => import('./world/WorldCanvas.jsx'))

export default function App() {
  const bridge = useWorldBridge({ demoMode: FORCE_DEMO_WORLD })
  const applySnapshot = useWorldStore((state) => state.applySnapshot)
  const selection = useWorldStore((state) => state.selection)
  const ambientMode = useAmbientMode({ disabled: Boolean(selection) })
  const [authState, setAuthState] = useState(BYPASS_AUTH ? 'authenticated' : 'checking')

  useEffect(() => {
    if (BYPASS_AUTH) return undefined
    let cancelled = false

    async function checkAuthentication() {
      try {
        const response = await fetch(AUTH_STATUS_URL, { credentials: 'include' })
        if (!cancelled) setAuthState(response.ok ? 'authenticated' : 'unauthenticated')
      } catch {
        if (!cancelled) setAuthState('unavailable')
      }
    }

    checkAuthentication()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!bridge.snapshot) return
    applySnapshot({
      ...bridge.snapshot,
      lifecycle: {
        ...(bridge.snapshot.lifecycle ?? {}),
        source: bridge.source,
        connection: bridge.connection,
      },
    })
  }, [applySnapshot, bridge.connection, bridge.snapshot, bridge.source])

  useEffect(() => {
    const handleUnauthorized = () => {
      if (!BYPASS_AUTH) setAuthState('unauthenticated')
    }
    window.addEventListener('hermes_unauthorized', handleUnauthorized)
    return () => window.removeEventListener('hermes_unauthorized', handleUnauthorized)
  }, [])

  if (authState === 'checking') {
    return <main className="app-loading" aria-live="polite">Budzenie Cytadeli Hermesa…</main>
  }

  if (authState !== 'authenticated') {
    return <LoginScreen onLogin={() => setAuthState('checking')} error={authState === 'unavailable'} />
  }

  return <main className={`world-shell ${ambientMode ? 'is-ambient' : ''}`}><WorldFallback />{ENABLE_PIXI_ENHANCEMENT ? <WorldRendererBoundary><Suspense fallback={null}><WorldCanvas renderAgents={false} /></Suspense></WorldRendererBoundary> : null}<WorldTapConfirmation /><KeyboardShortcuts /><AccessibilityAnnouncer /><section className="world-overlay"><StatusBar /><WorldControls /><DesktopCommandPanel /><WorldStatusBadge /><WorldInsightPanel /><WorldFocusRing /><DemoLegend /><WorldEventTicker /><WorldMomentToast /><BottomSheet /><HealthRibbon /></section></main>
}
