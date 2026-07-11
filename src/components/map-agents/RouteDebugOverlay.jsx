import { memo } from 'react'
import { getWorldLifeJourneys } from '../../world/data/roadGraph.js'
import { MAP_FOREGROUND_MASKS } from '../../world/data/mapForegroundMasks.js'
import './RouteDebugOverlay.css'

const COLORS = Object.freeze({ coder: '#ff9a52', researcher: '#8bb5ff', prospecting: '#86d49a' })
const pct = (value) => Number(value) * 10
const pathPoints = (points = []) => points.map((point) => `${pct(point.x)},${pct(point.y)}`).join(' ')

function Marker({ point, kind, profile, label, showLabel }) {
  if (!point) return null
  return <g className={`route-debug__marker is-${kind}`} data-profile={profile}>
    <circle cx={pct(point.x)} cy={pct(point.y)} r={kind === 'work' ? 0.85 : 0.62} />
    {showLabel ? <text x={pct(point.x) + 1.1} y={pct(point.y) - 0.9}>{label}</text> : null}
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
  return <div className="route-debug" data-layout={normalizedLayout} data-debug-profile={selectedProfile} data-debug-layers={[...layers].join(',')} aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {showDepth ? MAP_FOREGROUND_MASKS[normalizedLayout].map((mask) => <g className="route-debug__depth-zone" key={mask.id}>
        <rect x={mask.x} y={mask.y} width={mask.width} height={mask.height} />
        {showLabels ? <text x={mask.x + .6} y={mask.y + 1.4}>{mask.id}:occlusion</text> : null}
      </g>) : null}
      {selectedJourneys.map(([profile, journey]) => <g
        key={profile}
        className="route-debug__journey"
        style={{ '--route-color': COLORS[profile] ?? '#f7d77a' }}
        data-profile={profile}
      >
        {showRoute ? <polyline className="route-debug__path is-outbound" points={pathPoints(journey.outboundWaypoints)} /> : null}
        {showRoute ? <polyline className="route-debug__path is-return" points={pathPoints(journey.returnWaypoints)} /> : null}
        {showNodes ? journey.outboundWaypoints.map((point, index) => <g key={`${profile}-${index}`}><circle className="route-debug__waypoint" cx={pct(point.x)} cy={pct(point.y)} r=".34" />{showLabels ? <text x={pct(point.x) + .7} y={pct(point.y) + 1.25}>{journey.outboundNodeIds?.[index] ?? `waypoint-${index}`}</text> : null}</g>) : null}
        {showNodes ? <Marker point={journey.homePoint} kind="home" profile={profile} label={journey.homeNodeId} showLabel={showLabels} /> : null}
        {showEntrances ? <Marker point={journey.entrancePoint} kind="entrance" profile={profile} label={journey.entranceNodeId} showLabel={showLabels} /> : null}
        {showNodes ? <Marker point={journey.workPoint} kind="work" profile={profile} label={journey.workNodeId} showLabel={showLabels} /> : null}
        {showNodes ? <Marker point={journey.safeBlockedPoint} kind="safe" profile={profile} label={journey.safeBlockedNodeId} showLabel={showLabels} /> : null}
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
