import { memo } from 'react'
import { getWorldLifeJourneys } from '../../world/data/roadGraph.js'
import { MAP_FOREGROUND_MASKS } from '../../world/data/mapForegroundMasks.js'
import { getNumberedRouteNodes } from '../../world/routeDebugPresentation.js'
import './RouteDebugOverlay.css'

const COLORS = Object.freeze({ coder: '#ff9a52', researcher: '#8bb5ff', prospecting: '#86d49a' })
const pct = (value) => Number(value) * 10
const pathPoints = (points = []) => points.map((point) => `${pct(point.x)},${pct(point.y)}`).join(' ')

function Marker({ point, kind, profile, label, showLabel }) {
  if (!point) return null
  return <g className={`route-debug__marker is-${kind}`} data-profile={profile}>
    <circle cx={pct(point.x)} cy={pct(point.y)} r={kind === 'work' ? 0.85 : 0.62} />
    <title>{label}</title>
    {showLabel ? <text x={pct(point.x) + 1.1} y={pct(point.y) - 0.9}>{kind}</text> : null}
  </g>
}

function RouteDebugOverlay({ layout = 'desktop', presentations = [], config }) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const journeys = getWorldLifeJourneys(layout)
  const selectedProfile = config?.profile ?? 'coder'
  const layers = new Set(config?.layers ?? ['route', 'nodes', 'entrances'])
  const selectedJourneys = Object.entries(journeys).filter(([profile]) => selectedProfile === 'all' || profile === selectedProfile)
  const selectedPresentations = presentations.filter((model) => selectedProfile === 'all' || model.profileId === selectedProfile)
  const showRoute = layers.has('route')
  const showNodes = layers.has('nodes')
  const showLabels = layers.has('labels')
  const showEntrances = layers.has('entrances')
  const showDepth = layers.has('depth')
  const showHome = layers.has('home') || showNodes
  const showSafe = layers.has('safe') || showNodes
  const showWork = layers.has('work') || showNodes
  const showOcclusion = layers.has('occlusion')
  return <div className="route-debug" data-layout={normalizedLayout} data-debug-profile={selectedProfile} data-debug-layers={[...layers].join(',')} aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {showDepth ? MAP_FOREGROUND_MASKS[normalizedLayout].map((mask) => <g className="route-debug__depth-zone" key={mask.id}>
        <rect x={mask.x} y={mask.y} width={mask.width} height={mask.height} />
        <title>{mask.id}: occlusion depth zone</title>
      </g>) : null}
      {showOcclusion ? MAP_FOREGROUND_MASKS[normalizedLayout].map((mask) => <g className="route-debug__occlusion-marker" key={`marker-${mask.id}`}>
        <circle cx={mask.x + mask.width / 2} cy={mask.y + mask.height / 2} r=".48" />
        <title>{mask.id}: occlusion marker</title>
        {showLabels ? <text x={mask.x + mask.width / 2 + .7} y={mask.y + mask.height / 2 + .35}>mask</text> : null}
      </g>) : null}
      {selectedJourneys.map(([profile, journey]) => <g
        key={profile}
        className="route-debug__journey"
        style={{ '--route-color': COLORS[profile] ?? '#f7d77a' }}
        data-profile={profile}
      >
        {showRoute ? <polyline className="route-debug__path is-outbound" points={pathPoints(journey.outboundWaypoints)} /> : null}
        {showRoute ? <polyline className="route-debug__path is-return" points={pathPoints(journey.returnWaypoints)} /> : null}
        {showNodes ? getNumberedRouteNodes(journey).map((node) => <g key={`${profile}-${node.number}`}><circle className="route-debug__waypoint" cx={pct(node.point.x)} cy={pct(node.point.y)} r=".48" /><title>{node.number}. {node.fullLabel}</title><text className="route-debug__number" x={pct(node.point.x)} y={pct(node.point.y) + .34}>{node.number}</text>{showLabels ? <text x={pct(node.point.x) + .85} y={pct(node.point.y) + 1.35}>{node.shortLabel}</text> : null}</g>) : null}
        {showHome ? <Marker point={journey.homePoint} kind="home" profile={profile} label={journey.homeNodeId} showLabel={showLabels} /> : null}
        {showEntrances ? <Marker point={journey.entrancePoint} kind="entrance" profile={profile} label={journey.entranceNodeId} showLabel={showLabels} /> : null}
        {showWork ? <Marker point={journey.workPoint} kind="work" profile={profile} label={journey.workNodeId} showLabel={showLabels} /> : null}
        {showSafe ? <Marker point={journey.safeBlockedPoint} kind="safe" profile={profile} label={journey.safeBlockedNodeId} showLabel={showLabels} /> : null}
      </g>)}
      {selectedPresentations.map((model) => <g className="route-debug__agent-anchor" key={model.profileId}>
        <line x1={model.worldX - 1} y1={model.worldY} x2={model.worldX + 1} y2={model.worldY} />
        <line x1={model.worldX} y1={model.worldY - 1} x2={model.worldX} y2={model.worldY + 1} />
        {showLabels ? <text x={model.worldX + 1.2} y={model.worldY + 1.8}>{model.profileId}:feet</text> : null}
      </g>)}
    </svg>
  </div>
}

export default memo(RouteDebugOverlay)
