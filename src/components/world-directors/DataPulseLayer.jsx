import { memo } from 'react'

const pathData = (points = []) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')

function Pulse({ pulse }) {
  const path = pathData(pulse.points)
  return <g className={`data-pulse data-pulse--${pulse.mode} data-pulse--${pulse.cue ?? 'ambient'} data-pulse--${pulse.state ?? 'normal'}`} data-pulse-id={pulse.id} data-pulse-mode={pulse.mode} data-evidence-event-id={pulse.evidenceEventId ?? ''}>
    <path className="data-pulse__trail" d={path} vectorEffect="non-scaling-stroke" />
    <circle className="data-pulse__packet" r={pulse.mode === 'event' ? 1.05 : 0.7}>
      <animateMotion path={path} dur={`${pulse.duration}s`} begin={`${pulse.delay ?? 0}s`} repeatCount={pulse.mode === 'event' ? '2' : 'indefinite'} />
    </circle>
  </g>
}

function DataPulseLayer({ presentation }) {
  const pulses = presentation.reducedMotion ? [] : [...presentation.ambientPulses, presentation.responsePulse].filter(Boolean)
  return <svg className="data-pulse-layer" viewBox="0 0 100 100" preserveAspectRatio="none" data-data-pulse-count={pulses.length} aria-hidden="true">
    {pulses.map((pulse) => <Pulse pulse={pulse} key={pulse.id} />)}
  </svg>
}

export default memo(DataPulseLayer)
