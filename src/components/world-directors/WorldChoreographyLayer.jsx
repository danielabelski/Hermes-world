import { memo } from 'react'
import { getWorldLifeJourney } from '../../world/data/roadGraph.js'
import './WorldChoreographyLayer.css'

const LAYOUT_POINTS = Object.freeze({
  desktop: Object.freeze({ gate: { x: 50, y: 91 }, core: { x: 46, y: 36.5 }, archive: { x: 28.5, y: 36.5 } }),
  mobile: Object.freeze({ gate: { x: 50, y: 91 }, core: { x: 50, y: 43 }, archive: { x: 35.5, y: 70.5 } }),
})

function targetPoint(signal, layout, points) {
  if (signal.kind === 'archive-record') return points.archive
  if (signal.kind === 'message-pulse' || signal.kind === 'command-core') return points.core
  const journey = getWorldLifeJourney(signal.targetAgentId, layout)
  return journey ? { x: journey.entrancePoint.x * 10, y: journey.entrancePoint.y * 10 } : points.core
}

function WorldChoreographyLayer({ presentation, layout = 'desktop' }) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const points = LAYOUT_POINTS[normalizedLayout]
  const signals = presentation?.signals ?? []
  return <svg
    className="world-choreography-layer"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    data-active-run={presentation?.activeRunId ?? ''}
    data-choreography-kind={presentation?.kind ?? 'none'}
    data-choreography-signal-count={signals.length}
    data-response-latency-ms={presentation?.responseLatencyMs ?? ''}
    aria-hidden="true"
  >
    {signals.map((signal) => {
      const from = signal.kind === 'message-pulse' ? points.gate : points.core
      const to = targetPoint(signal, normalizedLayout, points)
      return <g
        className={`world-choreography-signal signal-${signal.kind}`}
        data-signal-kind={signal.kind}
        data-target-agent={signal.targetAgentId ?? ''}
        data-evidence-event-id={signal.evidenceEventId}
        key={`${signal.runId}-${signal.kind}-${signal.targetAgentId ?? 'system'}`}
      >
        {signal.kind !== 'command-core' ? <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" /> : null}
        <circle className="signal-endpoint" cx={to.x} cy={to.y} r={signal.kind === 'command-core' ? 2.1 : 1.15} vectorEffect="non-scaling-stroke" />
      </g>
    })}
  </svg>
}

export default memo(WorldChoreographyLayer)
