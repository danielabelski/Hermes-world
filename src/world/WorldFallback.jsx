import { useEffect, useState } from 'react'
import './worldFallback.css'
import { useWorldStore } from './store/worldStore.js'
import citadelArtUrl from '../assets/hermes-citadel-hd-v2.png'
import citadelMobileArtUrl from '../assets/hermes-citadel-mobile-v2.png'
import HermesInfrastructureLayer from './HermesInfrastructureLayer.jsx'
import MapAgentLayer from '../components/map-agents/MapAgentLayer.jsx'
import RouteDebugOverlay from '../components/map-agents/RouteDebugOverlay.jsx'
import MapForegroundOcclusion from '../components/map-agents/MapForegroundOcclusion.jsx'
import { useDomWorldCamera } from './useDomWorldCamera.js'
import { usePresentationClock } from './usePresentationClock.js'
import { resolveMapAgentPresentations } from './mapAgentPresentation.js'
import { getMapVariant } from './mapReadabilityMode.js'
import { resolveRouteDebugConfig } from './routeDebugConfig.js'

const MOBILE_MAP_QUERY = '(max-width: 700px)'
const getMapLayout = () => typeof window !== 'undefined' && window.matchMedia?.(MOBILE_MAP_QUERY).matches ? 'mobile' : 'desktop'

const BUILDINGS = [
  ['keep', 'Cytadela'], ['library', 'Biblioteka'], ['forge', 'Kuźnia'], ['research', 'Research Lab'],
  ['memory', 'Memory Hall'], ['warehouse', 'Magazyn'], ['watch', 'Wieża Obserwacji'], ['api', 'Port API'],
  ['post', 'Poczta'], ['camp', 'Obozowisko'], ['clock', 'Wieża Zegarowa'],
]

export default function WorldFallback() {
  const mapVariant = getMapVariant(typeof window === 'undefined' ? '' : window.location.search)
  const [mapLayout, setMapLayout] = useState(getMapLayout)
  useEffect(() => {
    const query = window.matchMedia?.(MOBILE_MAP_QUERY)
    if (!query) return undefined
    const syncLayout = () => setMapLayout(query.matches ? 'mobile' : 'desktop')
    syncLayout()
    query.addEventListener?.('change', syncLayout)
    return () => query.removeEventListener?.('change', syncLayout)
  }, [])
  const agents = useWorldStore((state) => state.agents ?? [])
  const tasks = useWorldStore((state) => state.tasks ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const zoomPreference = useWorldStore((state) => state.camera?.zoomPreference ?? 'standard')
  const selection = useWorldStore((state) => state.selection)
  const selectEntity = useWorldStore((state) => state.selectEntity)
  const {
    viewportRef,
    stageRef,
    handlers: cameraHandlers,
    stageStyle,
    shouldSuppressSelection,
  } = useDomWorldCamera({ zoomPreference })
  const presentationNow = usePresentationClock()
  const presentations = resolveMapAgentPresentations({ agents: agents.slice(0, 12), tasks, alerts, lifecycle, now: presentationNow, layout: mapLayout })
  const routeDebug = resolveRouteDebugConfig(typeof window === 'undefined' ? '' : window.location.search, {
    forceEnabled: import.meta.env.VITE_ROUTE_DEBUG === 'true',
    availableProfiles: presentations.map((model) => model.profileId),
  })
  return <div ref={viewportRef} className={`fallback-world readability-${mapVariant.id}`} data-map-variant={mapVariant.id} data-map-variant-role={mapVariant.role} data-connection={lifecycle.connection ?? 'unknown'} aria-label="Żywy świat agentów Hermes OS" {...cameraHandlers}>
    <div ref={stageRef} className="fallback-map-stage" style={stageStyle}>
      <picture className="fallback-world__art"><source media="(max-width: 700px)" srcSet={citadelMobileArtUrl} /><img src={citadelArtUrl} alt="" /></picture>
      <HermesInfrastructureLayer layout={mapLayout} />
      <div className="fallback-roads" />
      <div className="fallback-buildings">{BUILDINGS.map(([id, label], index) => <div className={`fallback-building fallback-building--${id}`} key={id} style={{ '--i': index }}><i /><b>{label}</b></div>)}</div>
      <MapAgentLayer
        presentations={presentations}
        selectedId={selection?.type === 'agent' ? selection.id : null}
        animationNow={presentationNow}
        shouldSuppressSelection={shouldSuppressSelection}
        onSelect={(profileId) => selectEntity('agent', profileId)}
      />
      <MapForegroundOcclusion layout={mapLayout} />
      {routeDebug.enabled ? <RouteDebugOverlay layout={mapLayout} presentations={presentations} config={routeDebug} /> : null}
      <div className="fallback-fountain"><i /><i /><i /></div>
    </div>
  </div>
}
