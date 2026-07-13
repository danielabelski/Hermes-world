import { memo } from 'react'
import { getWorldVisualAnchors } from '../../world/directors/worldVisualAnchors.js'
import forgeSparksStrip from '../../assets/world-effects/forge-sparks-strip.runtime.png'
import archiveDataRunesStrip from '../../assets/world-effects/archive-data-runes-strip.runtime.png'
import citadelEnergyWaveStrip from '../../assets/world-effects/citadel-energy-wave-strip.runtime.png'
import citadelRuneRingStrip from '../../assets/world-effects/citadel-rune-ring-strip.runtime.png'
import watcherScanBeamStrip from '../../assets/world-effects/watcher-scan-beam-strip.runtime.png'
import './WorldOperationsLayer.css'

const pathData = (points = []) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
const styleAt = (point, operation) => ({ '--operation-x': `${point.x}%`, '--operation-y': `${point.y}%`, '--operation-lifetime': `${operation.durationMs ?? 6_000}ms` })

function SpriteStrip({ src, className = '', staticFrame = false }) {
  return <span className={`operation-sprite ${className}${staticFrame ? ' is-static-frame' : ''}`}><img src={src} alt="" /></span>
}

function DataTransitOperation({ operation }) {
  const path = pathData(operation.route)
  const destination = operation.route.at(-1)
  const baseDuration = Math.max(4, Math.min(8, operation.durationMs / 1_000))
  const duration = operation.mode === 'event' ? Math.max(4, baseDuration * 0.78) : baseDuration
  return <svg className={`world-operation world-operation--data-transit mode-${operation.mode}`} style={{ '--transit-duration': `${duration}s`, '--operation-lifetime': `${operation.durationMs ?? 6_000}ms` }} viewBox="0 0 100 100" preserveAspectRatio="none" data-world-operation={operation.type} data-operation-mode={operation.mode} data-evidence-event-id={operation.evidenceEventId ?? ''}>
    {operation.phase === 'static' ? <circle className="operation-artery__core is-static" cx={destination.x} cy={destination.y} r=".68" /> : <>
      <path className="operation-artery__wake" d={path} pathLength="100" vectorEffect="non-scaling-stroke" />
      <path className="operation-artery__segments" d={path} pathLength="100" vectorEffect="non-scaling-stroke" />
      <circle className="operation-artery__halo" r={operation.mode === 'event' ? 1.5 : 1.05}><animateMotion path={path} dur={`${duration}s`} repeatCount="1" fill="freeze" /></circle>
      <circle className="operation-artery__core" r={operation.mode === 'event' ? 0.82 : 0.58}><animateMotion path={path} dur={`${duration}s`} repeatCount="1" fill="freeze" /></circle>
    </>}
  </svg>
}

function CitadelOperation({ operation, point }) {
  return <div className={`world-operation operation-citadel mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point, operation)}>
    <SpriteStrip src={citadelEnergyWaveStrip} className="operation-citadel__wave" />
    <SpriteStrip src={citadelRuneRingStrip} className="operation-citadel__ring" staticFrame />
  </div>
}

function ForgeOperation({ operation, point }) {
  return <div className={`world-operation operation-forge mode-${operation.mode} phase-${operation.phase}`} data-world-operation={operation.type} data-operation-phase={operation.phase} data-evidence-event-id={operation.evidenceEventId ?? ''} style={styleAt(point, operation)}>
    <span className="operation-forge__sprite operation-forge__sparks"><img src={forgeSparksStrip} alt="" /></span>
  </div>
}

function WatcherOperation({ operation, point }) {
  return <div className={`world-operation operation-watcher mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point, operation)}>
    <SpriteStrip src={watcherScanBeamStrip} className="operation-watcher__beam" />
  </div>
}

function ArchiveOperation({ operation, point }) {
  return <div className={`world-operation operation-archive mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} data-evidence-event-id={operation.evidenceEventId ?? ''} style={styleAt(point, operation)}>
    <SpriteStrip src={archiveDataRunesStrip} className="operation-archive__runes" />
  </div>
}

function WorldOperationsLayer({ presentation }) {
  const operations = presentation?.operations ?? []
  const layout = presentation?.layout === 'mobile' ? 'mobile' : 'desktop'
  const points = getWorldVisualAnchors(layout)
  return <div className={`world-operations-layer mode-${presentation?.mode ?? 'ambient'}${presentation?.running ? '' : ' is-paused'}`} data-world-operations-count={operations.length} data-world-operations-mode={presentation?.mode ?? 'none'} aria-hidden="true">
    {operations.map((operation) => {
      if (operation.type === 'data-transit') return <DataTransitOperation operation={operation} key={operation.id} />
      if (operation.type === 'citadel-distribution') return <CitadelOperation operation={operation} point={points.citadel} key={operation.id} />
      if (operation.type === 'forge-production') return <ForgeOperation operation={operation} point={points.forge} key={operation.id} />
      if (operation.type === 'watcher-sweep') return <WatcherOperation operation={operation} point={points.watcher} key={operation.id} />
      if (operation.type === 'archive-ingestion') return <ArchiveOperation operation={operation} point={points.archive} key={operation.id} />
      return null
    })}
  </div>
}

export default memo(WorldOperationsLayer)
