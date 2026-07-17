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
import { BUILDING_INTERIOR_CONFIG, BUILDING_INTERIOR_IDS, resolveBuildingEntry } from './buildingEntryConfig.js'
import { preloadInteriorPlate } from '../components/building-interiors/interiorPlateManifest.js'
import { getInteriorReviewEntry, getInteriorReviewProfiles, INTERIOR_ROSTER_REVIEW, resolveInteriorReviewProfile, stepInteriorReviewProfile } from './interiorRosterReview.js'

const MOBILE_MAP_QUERY = '(max-width: 700px)'
const getMapLayout = () => typeof window !== 'undefined' && window.matchMedia?.(MOBILE_MAP_QUERY).matches ? 'mobile' : 'desktop'
const loadBuildingInteriorScene = () => import('../components/building-interiors/BuildingInteriorScene.jsx')
const BuildingInteriorScene = lazy(loadBuildingInteriorScene)

const BUILDINGS = [
  ['keep', 'Cytadela'], ['library', 'Biblioteka'], ['forge', 'Kuźnia'], ['research', 'Research Lab'],
  ['memory', 'Memory Hall'], ['warehouse', 'Magazyn'], ['watch', 'Wieża Obserwacji'], ['api', 'Port API'],
  ['post', 'Poczta'], ['camp', 'Obozowisko'], ['clock', 'Wieża Zegarowa'],
]

export default function WorldFallback() {
  const initialParams = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  const rosterReviewEnabled = initialParams.get('demo') === '1' && initialParams.get('interiorReview') === '1'
  const [reviewProfileId, setReviewProfileId] = useState(() => resolveInteriorReviewProfile(initialParams.get('agent')))
  const [reviewVisualState, setReviewVisualState] = useState(() => initialParams.get('reviewState') === 'idle' ? 'idle' : 'work')
  const mapVariant = getMapVariant(typeof window === 'undefined' ? '' : window.location.search)
  const worldLifePreset = resolveWorldLifePreset(typeof window === 'undefined' ? '' : window.location.search)
  const [mapLayout, setMapLayout] = useState(getMapLayout)
  const buildingEntries = BUILDING_INTERIOR_IDS.map((buildingId) => resolveBuildingEntry(buildingId, mapLayout)).filter(Boolean)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeInterior, setActiveInterior] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (rosterReviewEnabled) return getInteriorReviewEntry(resolveInteriorReviewProfile(params.get('agent'))).buildingId
    const requested = params.get('interior')
    return params.get('demo') === '1' && BUILDING_INTERIOR_IDS.includes(requested) ? requested : null
  })
  const selectReviewProfile = useCallback((profileId) => {
    const resolved = resolveInteriorReviewProfile(profileId)
    const entry = getInteriorReviewEntry(resolved)
    setReviewProfileId(resolved)
    setActiveInterior(entry.buildingId)
    const params = new URLSearchParams(window.location.search)
    params.set('demo', '1')
    params.set('interiorReview', '1')
    params.set('agent', resolved)
    params.set('interior', entry.buildingId)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }, [])
  const stepReviewProfile = useCallback((delta) => selectReviewProfile(stepInteriorReviewProfile(reviewProfileId, delta)), [reviewProfileId, selectReviewProfile])
  const changeReviewState = useCallback((state) => {
    const resolved = state === 'idle' ? 'idle' : 'work'
    setReviewVisualState(resolved)
    const params = new URLSearchParams(window.location.search)
    params.set('reviewState', resolved)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }, [])
  const closeInterior = useCallback(() => setActiveInterior(null), [])
  const entryPointerRef = useRef(null)
  const activeEntryRef = useRef(null)
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
    const warmInteriorCode = () => { loadBuildingInteriorScene().catch(() => undefined) }
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(warmInteriorCode, { timeout: 2_500 })
      return () => window.cancelIdleCallback?.(idleId)
    }
    const timer = window.setTimeout(warmInteriorCode, 1_200)
    return () => window.clearTimeout(timer)
  }, [mapLoaded])
  const agents = useWorldStore((state) => state.agents ?? [])
  const tasks = useWorldStore((state) => state.tasks ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const system = useWorldStore((state) => state.system ?? {})
  const activityItems = useWorldStore((state) => state.activity?.items ?? [])
  const tokenRiver = useWorldStore((state) => state.tokenRiver ?? {})
  const modelSources = useWorldStore((state) => state.modelSources ?? [])
  const memorySummary = useWorldStore((state) => state.memorySummary ?? {})
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
  const presentationNow = usePresentationClock(!activeInterior)
  const directors = useWorldDirectors({ agents, now: presentationNow, layout: mapLayout, ambientEnabled: !activeInterior })
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
    <div ref={stageRef} className={`fallback-map-stage${mapLoaded ? ' is-map-ready is-agents-ready' : ' is-map-pending is-agents-pending'}`} style={stageStyle} data-map-ready={mapLoaded ? 'true' : 'false'} data-agents-ready={mapLoaded ? 'true' : 'false'}>
      <picture className="fallback-world__art"><source media="(max-width: 700px)" srcSet={citadelMobileArtUrl} type="image/webp" /><img src={citadelArtUrl} alt="" fetchPriority="high" decoding="async" onLoad={() => setMapLoaded(true)} /></picture>
      {mapLoaded ? <WorldEnvironmentalLife presentation={environment} debug={worldDebug} preset={worldLifePreset} /> : null}
      {mapLoaded ? <HermesInfrastructureLayer layout={mapLayout} /> : null}
      {mapLoaded ? <WorldOperationsLayer presentation={environment.worldOperations} /> : null}
      <div className="fallback-roads" />
      <div className="fallback-buildings">{BUILDINGS.map(([id, label], index) => <div className={`fallback-building fallback-building--${id}`} key={id} style={{ '--i': index }}><i /><b>{label}</b></div>)}</div>
      {mapLoaded ? <WorldChoreographyLayer presentation={directors.choreography} layout={mapLayout} /> : null}
      {mapLoaded ? buildingEntries.map((entry) => <button
        key={entry.buildingId}
        className={`building-entry-hotspot building-entry-hotspot--${entry.buildingId}`}
        type="button"
        style={{ '--entry-x': `${entry.xPercent}%`, '--entry-y': `${entry.yPercent}%`, '--entry-width': `${entry.hitWidth}px`, '--entry-height': `${entry.hitHeight}px` }}
        data-building-entry={entry.buildingId}
        data-entry-node={entry.nodeId}
        data-entry-anchor-kind={entry.anchorKind}
        aria-label={entry.ariaLabel}
        onPointerEnter={() => { preloadInteriorPlate(entry.buildingId) }}
        onFocus={() => { preloadInteriorPlate(entry.buildingId) }}
        onPointerDown={(event) => {
          event.stopPropagation()
          preloadInteriorPlate(entry.buildingId)
          entryPointerRef.current = { buildingId: entry.buildingId, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }}
        onPointerMove={(event) => {
          const pointer = entryPointerRef.current
          if (!pointer || pointer.pointerId !== event.pointerId || pointer.buildingId !== entry.buildingId) return
          if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.moved = true
        }}
        onPointerUp={(event) => { event.stopPropagation(); event.currentTarget.releasePointerCapture?.(event.pointerId) }}
        onPointerCancel={() => { entryPointerRef.current = null }}
        onClick={(event) => {
          event.stopPropagation()
          const wasDrag = entryPointerRef.current?.moved
          entryPointerRef.current = null
          if (!wasDrag) {
            activeEntryRef.current = event.currentTarget
            const reviewProfile = rosterReviewEnabled ? getInteriorReviewProfiles(entry.buildingId)[0]?.profileId : null
            if (reviewProfile) selectReviewProfile(reviewProfile)
            else setActiveInterior(entry.buildingId)
          }
        }}
      />) : null}
      <MapAgentLayer
        presentations={groundPresentations}
        selectedId={selection?.type === 'agent' ? selection.id : null}
        animationNow={presentationNow}
        animationEnabled={mapLoaded}
        shouldSuppressSelection={shouldSuppressSelection}
        onSelect={(profileId) => selectEntity('agent', profileId)}
      />
      {mapLoaded ? <MapForegroundOcclusion layout={mapLayout} /> : null}
      <MapAgentLayer
        presentations={facadePresentations}
        layer="facade"
        selectedId={selection?.type === 'agent' ? selection.id : null}
        animationNow={presentationNow}
        animationEnabled={mapLoaded}
        shouldSuppressSelection={shouldSuppressSelection}
        onSelect={(profileId) => selectEntity('agent', profileId)}
      />
      {mapLoaded && routeDebug.enabled ? <RouteDebugOverlay layout={mapLayout} presentations={presentations} config={routeDebug} /> : null}
      <div className="fallback-fountain"><i /><i /><i /></div>
    </div>
    {activeInterior ? <Suspense fallback={<div className="building-interior-loading" role="status">Otwieranie subsystemu…</div>}>
      <BuildingInteriorScene
        buildingId={activeInterior}
        system={system}
        lifecycle={lifecycle}
        agent={agents.find((agent) => agent.profile === (rosterReviewEnabled ? reviewProfileId : BUILDING_INTERIOR_CONFIG[activeInterior]?.agentProfile) || agent.id === (rosterReviewEnabled ? reviewProfileId : BUILDING_INTERIOR_CONFIG[activeInterior]?.agentProfile)) ?? null}
        building={buildings.find((building) => BUILDING_INTERIOR_CONFIG[activeInterior]?.canonicalBuildingIds.includes(building.id)) ?? null}
        tasks={tasks}
        alerts={alerts}
        activityItems={activityItems}
        tokenRiver={tokenRiver}
        crons={crons}
        modelSources={modelSources}
        memorySummary={memorySummary}
        layout={mapLayout}
        onAgentSelect={(profileId) => selectEntity('agent', profileId)}
        onExitComplete={closeInterior}
        returnFocusRef={activeEntryRef}
        rosterReview={rosterReviewEnabled ? { enabled: true, ...getInteriorReviewEntry(reviewProfileId), visualState: reviewVisualState, index: INTERIOR_ROSTER_REVIEW.findIndex((entry) => entry.profileId === reviewProfileId), total: INTERIOR_ROSTER_REVIEW.length } : null}
        onReviewStep={stepReviewProfile}
        onReviewStateChange={changeReviewState}
      />
    </Suspense> : null}
  </div>
}
