import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import './worldFallback.css'
import { useWorldStore } from './store/worldStore.js'
import citadelArtUrl from '../assets/hermes-citadel-hd-v2.webp'
import citadelMobileArtUrl from '../assets/hermes-citadel-mobile-v2.webp'
import HermesInfrastructureLayer from './HermesInfrastructureLayer.jsx'
import MapAgentLayer from '../components/map-agents/MapAgentLayer.jsx'
import RouteDebugOverlay from '../components/map-agents/RouteDebugOverlay.jsx'
import MapForegroundOcclusion from '../components/map-agents/MapForegroundOcclusion.jsx'
import { useDomWorldCamera } from './useDomWorldCamera.js'
import { usePresentationClock } from './usePresentationClock.js'
import { resolveMapAgentPresentations } from './mapAgentPresentation.js'
import { getMapVariant } from './mapReadabilityMode.js'
import { resolveRouteDebugConfig } from './routeDebugConfig.js'
import { useWorldDirectors } from './directors/useWorldDirectors.js'
import { applyWorldDirectorPresentation } from './directors/worldDirectorPresentation.js'
import WorldChoreographyLayer from '../components/world-directors/WorldChoreographyLayer.jsx'
import WorldEnvironmentalLife from '../components/world-directors/WorldEnvironmentalLife.jsx'
import { useEnvironmentalDirector } from './directors/useEnvironmentalDirector.js'
import WorldOperationsLayer from '../components/world-directors/WorldOperationsLayer.jsx'
import { resolveWorldLifePreset } from './directors/worldLifePreset.js'
import { resolveBuildingEntry } from './buildingEntryConfig.js'

const MOBILE_MAP_QUERY = '(max-width: 700px)'
const getMapLayout = () => typeof window !== 'undefined' && window.matchMedia?.(MOBILE_MAP_QUERY).matches ? 'mobile' : 'desktop'
const BuildingInteriorScene = lazy(() => import('../components/building-interiors/BuildingInteriorScene.jsx'))

const BUILDINGS = [
  ['keep', 'Cytadela'], ['library', 'Biblioteka'], ['forge', 'Kuźnia'], ['research', 'Research Lab'],
  ['memory', 'Memory Hall'], ['warehouse', 'Magazyn'], ['watch', 'Wieża Obserwacji'], ['api', 'Port API'],
  ['post', 'Poczta'], ['camp', 'Obozowisko'], ['clock', 'Wieża Zegarowa'],
]

export default function WorldFallback() {
  const mapVariant = getMapVariant(typeof window === 'undefined' ? '' : window.location.search)
  const worldLifePreset = resolveWorldLifePreset(typeof window === 'undefined' ? '' : window.location.search)
  const [mapLayout, setMapLayout] = useState(getMapLayout)
  const forgeEntry = resolveBuildingEntry('forge', mapLayout)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [agentAnimationReady, setAgentAnimationReady] = useState(false)
  const [activeInterior, setActiveInterior] = useState(null)
  const closeInterior = useCallback(() => setActiveInterior(null), [])
  const entryPointerRef = useRef(null)
  const forgeEntryRef = useRef(null)
  useEffect(() => {
    const query = window.matchMedia?.(MOBILE_MAP_QUERY)
    if (!query) return undefined
    const syncLayout = () => setMapLayout(query.matches ? 'mobile' : 'desktop')
    syncLayout()
    query.addEventListener?.('change', syncLayout)
    return () => query.removeEventListener?.('change', syncLayout)
  }, [])
  useEffect(() => {
    if (!mapLoaded) return undefined
    const timer = window.setTimeout(() => setAgentAnimationReady(true), 700)
    return () => window.clearTimeout(timer)
  }, [mapLoaded])
  const agents = useWorldStore((state) => state.agents ?? [])
  const tasks = useWorldStore((state) => state.tasks ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const system = useWorldStore((state) => state.system ?? {})
  const activityItems = useWorldStore((state) => state.activity?.items ?? [])
  const tokenRiver = useWorldStore((state) => state.tokenRiver ?? {})
  const crons = useWorldStore((state) => state.crons ?? [])
  const buildings = useWorldStore((state) => state.buildings ?? [])
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
  const directors = useWorldDirectors({ agents, now: presentationNow, layout: mapLayout })
  const operationalPresentations = resolveMapAgentPresentations({ agents: agents.slice(0, 12), tasks, alerts, lifecycle, now: presentationNow, layout: mapLayout })
  const worldDebugParam = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('worldDebug')
  const worldDebug = worldDebugParam === 'visual' ? 'visual' : worldDebugParam === '1' ? 'panel' : 'off'
  const environment = useEnvironmentalDirector({
    now: presentationNow, layout: mapLayout, choreography: directors.choreography, operationalPresentations, lifecycle,
    telemetry: { system, activityItems, tokenRiver, tasks, crons }, visualDebug: worldDebug === 'visual',
  })
  const presentations = applyWorldDirectorPresentation(operationalPresentations, directors)
  const groundPresentations = presentations.filter((model) => model.occupancyMode !== 'facade-front')
  const facadePresentations = presentations.filter((model) => model.occupancyMode === 'facade-front')
  const routeDebug = resolveRouteDebugConfig(typeof window === 'undefined' ? '' : window.location.search, {
    forceEnabled: import.meta.env.VITE_ROUTE_DEBUG === 'true',
    availableProfiles: presentations.map((model) => model.profileId),
  })
  return <div ref={viewportRef} className={`fallback-world readability-${mapVariant.id}${activeInterior ? ' has-open-interior' : ''}`} data-map-variant={mapVariant.id} data-map-variant-role={mapVariant.role} data-world-life-preset={worldLifePreset.id} data-connection={lifecycle.connection ?? 'unknown'} aria-label="Żywy świat agentów Hermes OS" aria-hidden={activeInterior ? 'true' : undefined} inert={activeInterior ? true : undefined} {...cameraHandlers}>
    <div ref={stageRef} className="fallback-map-stage" style={stageStyle}>
      <picture className="fallback-world__art"><source media="(max-width: 700px)" srcSet={citadelMobileArtUrl} type="image/webp" /><img src={citadelArtUrl} alt="" fetchPriority="high" decoding="async" onLoad={() => setMapLoaded(true)} /></picture>
      <WorldEnvironmentalLife presentation={environment} debug={worldDebug} preset={worldLifePreset} />
      <HermesInfrastructureLayer layout={mapLayout} />
      <WorldOperationsLayer presentation={environment.worldOperations} />
      <div className="fallback-roads" />
      <div className="fallback-buildings">{BUILDINGS.map(([id, label], index) => <div className={`fallback-building fallback-building--${id}`} key={id} style={{ '--i': index }}><i /><b>{label}</b></div>)}</div>
      <WorldChoreographyLayer presentation={directors.choreography} layout={mapLayout} />
      <button
        ref={forgeEntryRef}
        className="building-entry-hotspot building-entry-hotspot--forge"
        type="button"
        style={{ '--entry-x': `${forgeEntry.xPercent}%`, '--entry-y': `${forgeEntry.yPercent}%` }}
        data-entry-node={forgeEntry.nodeId}
        aria-label={forgeEntry.ariaLabel}
        onPointerDown={(event) => {
          event.stopPropagation()
          entryPointerRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={(event) => {
          const pointer = entryPointerRef.current
          if (!pointer || pointer.pointerId !== event.pointerId) return
          if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.moved = true
        }}
        onPointerUp={(event) => {
          event.stopPropagation()
          event.currentTarget.releasePointerCapture?.(event.pointerId)
        }}
        onPointerCancel={() => { entryPointerRef.current = null }}
        onClick={(event) => {
          event.stopPropagation()
          const wasDrag = entryPointerRef.current?.moved
          entryPointerRef.current = null
          if (!wasDrag) setActiveInterior('forge')
        }}
      />
      <MapAgentLayer
        presentations={groundPresentations}
        selectedId={selection?.type === 'agent' ? selection.id : null}
        animationNow={presentationNow}
        animationEnabled={agentAnimationReady}
        shouldSuppressSelection={shouldSuppressSelection}
        onSelect={(profileId) => selectEntity('agent', profileId)}
      />
      <MapForegroundOcclusion layout={mapLayout} />
      <MapAgentLayer
        presentations={facadePresentations}
        layer="facade"
        selectedId={selection?.type === 'agent' ? selection.id : null}
        animationNow={presentationNow}
        animationEnabled={agentAnimationReady}
        shouldSuppressSelection={shouldSuppressSelection}
        onSelect={(profileId) => selectEntity('agent', profileId)}
      />
      {routeDebug.enabled ? <RouteDebugOverlay layout={mapLayout} presentations={presentations} config={routeDebug} /> : null}
      <div className="fallback-fountain"><i /><i /><i /></div>
    </div>
    {activeInterior ? <Suspense fallback={<div className="building-interior-loading" role="status">Otwieranie Kuźni…</div>}>
      <BuildingInteriorScene
        buildingId={activeInterior}
        system={system}
        lifecycle={lifecycle}
        agent={agents.find((agent) => agent.profile === 'coder' || agent.id === 'coder') ?? null}
        building={buildings.find((building) => building.id === 'forge') ?? null}
        tasks={tasks}
        alerts={alerts}
        onExitComplete={closeInterior}
        returnFocusRef={forgeEntryRef}
      />
    </Suspense> : null}
  </div>
}
