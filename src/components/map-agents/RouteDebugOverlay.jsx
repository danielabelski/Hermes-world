import { memo } from 'react'
import { getWorldLifeJourneys } from '../../world/data/roadGraph.js'
import './RouteDebugOverlay.css'

const COLORS = Object.freeze({ coder: '#ff9a52', researcher: '#8bb5ff', prospecting: '#86d49a' })
const pct = (value) => Number(value) * 10
const pathPoints = (points = []) => points.map((point) => `${pct(point.x)},${pct(point.y)}`).join(' ')

function Marker({ point, kind, profile, label }) {
  if (!point) return null
  return <g className={`route-debug__marker is-${kind}`} data-profile={profile}>
    <circle cx={pct(point.x)} cy={pct(point.y)} r={kind === 'work' ? 0.85 : 0.62} />
    <text x={pct(point.x) + 1.1} y={pct(point.y) - 0.9}>{label}</text>
  </g>
}

function RouteDebugOverlay({ layout = 'desktop', presentations = [] }) {
  const journeys = getWorldLifeJourneys(layout)
  return <div className="route-debug" data-layout={layout} aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {Object.entries(journeys).map(([profile, journey]) => <g
        key={profile}
        className="route-debug__journey"
        style={{ '--route-color': COLORS[profile] ?? '#f7d77a' }}
        data-profile={profile}
      >
        <polyline className="route-debug__path is-outbound" points={pathPoints(journey.outboundWaypoints)} />
        <polyline className="route-debug__path is-return" points={pathPoints(journey.returnWaypoints)} />
        {journey.outboundWaypoints.map((point, index) => <g key={`${profile}-${index}`}><circle className="route-debug__waypoint" cx={pct(point.x)} cy={pct(point.y)} r=".34" /><text x={pct(point.x) + .7} y={pct(point.y) + 1.25}>{journey.outboundNodeIds?.[index] ?? `waypoint-${index}`}</text></g>)}
        <Marker point={journey.homePoint} kind="home" profile={profile} label={journey.homeNodeId} />
        <Marker point={journey.entrancePoint} kind="entrance" profile={profile} label={journey.entranceNodeId} />
        <Marker point={journey.workPoint} kind="work" profile={profile} label={journey.workNodeId} />
        <Marker point={journey.safeBlockedPoint} kind="safe" profile={profile} label={journey.safeBlockedNodeId} />
      </g>)}
      {presentations.map((model) => <g className="route-debug__agent-anchor" key={model.profileId}>
        <line x1={model.worldX - 1} y1={model.worldY} x2={model.worldX + 1} y2={model.worldY} />
        <line x1={model.worldX} y1={model.worldY - 1} x2={model.worldX} y2={model.worldY + 1} />
        <text x={model.worldX + 1.2} y={model.worldY + 1.8}>{model.profileId}:feet</text>
      </g>)}
    </svg>
  </div>
}

export default memo(RouteDebugOverlay)
