import { memo } from 'react'
import { WORLD_OPERATION_POINTS } from '../../world/directors/worldOperationsDirector.js'
import forgeSparksStrip from '../../assets/world-effects/forge-sparks-strip.png'
import archiveDataRunesStrip from '../../assets/world-effects/archive-data-runes-strip.png'
import citadelEnergyWaveStrip from '../../assets/world-effects/citadel-energy-wave-strip.png'
import citadelRuneRingStrip from '../../assets/world-effects/citadel-rune-ring-strip.png'
import watcherScanBeamStrip from '../../assets/world-effects/watcher-scan-beam-strip.png'
import './WorldOperationsLayer.css'

const pathData = (points = []) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
const styleAt = (point, operation) => ({ '--operation-x': `${point.x}%`, '--operation-y': `${point.y}%`, '--operation-lifetime': `${operation.durationMs ?? 6_000}ms` })

function SpriteStrip({ src, className = '', staticFrame = false }) {
  return <span className={`operation-sprite ${className}${staticFrame ? ' is-static-frame' : ''}`}><img src={src} alt="" /></span>
}

function DataTransitOperation({ operation }) {
  const path = pathData(operation.route)
  const baseDuration = Math.max(4, Math.min(8, operation.durationMs / 1_000))
  const duration = operation.mode === 'event' ? Math.max(4, baseDuration * 0.78) : baseDuration
  return <svg className={`world-operation world-operation--data-transit mode-${operation.mode}`} style={{ '--transit-duration': `${duration}s`, '--operation-lifetime': `${operation.durationMs ?? 6_000}ms` }} viewBox="0 0 100 100" preserveAspectRatio="none" data-world-operation={operation.type} data-operation-mode={operation.mode} data-evidence-event-id={operation.evidenceEventId ?? ''}>
    <path className="operation-artery__wake" d={path} pathLength="100" vectorEffect="non-scaling-stroke" />
    <path className="operation-artery__segments" d={path} pathLength="100" vectorEffect="non-scaling-stroke" />
    <circle className="operation-artery__halo" r={operation.mode === 'event' ? 1.5 : 1.05}><animateMotion path={path} dur={`${duration}s`} repeatCount="indefinite" /></circle>
    <circle className="operation-artery__core" r={operation.mode === 'event' ? 0.82 : 0.58}><animateMotion path={path} dur={`${duration}s`} repeatCount="indefinite" /></circle>
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

function SanctumOperation({ operation, point }) {
  return <div className={`world-operation operation-sanctum mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point, operation)} />
}

function GateOperation({ operation, point }) {
  return <div className={`world-operation operation-gate mode-${operation.mode}`} data-world-operation={operation.type} style={styleAt(point, operation)} />
}

function WaterMachineryOperation({ operation, point }) {
  return <div className={`world-operation operation-water-machinery mode-${operation.mode}`} data-world-operation={operation.type} style={styleAt(point, operation)} />
}

function WorldOperationsLayer({ presentation }) {
  const operations = presentation?.operations ?? []
  const points = WORLD_OPERATION_POINTS[presentation?.layout === 'mobile' ? 'mobile' : 'desktop']
  return <div className={`world-operations-layer mode-${presentation?.mode ?? 'ambient'}${presentation?.running ? '' : ' is-paused'}`} data-world-operations-count={operations.length} data-world-operations-mode={presentation?.mode ?? 'none'} aria-hidden="true">
    {operations.map((operation) => {
      if (operation.type === 'data-transit') return <DataTransitOperation operation={operation} key={operation.id} />
      if (operation.type === 'citadel-distribution') return <CitadelOperation operation={operation} point={points.citadel} key={operation.id} />
      if (operation.type === 'forge-production') return <ForgeOperation operation={operation} point={points.forge} key={operation.id} />
      if (operation.type === 'watcher-sweep') return <WatcherOperation operation={operation} point={points.watcher} key={operation.id} />
      if (operation.type === 'archive-ingestion') return <ArchiveOperation operation={operation} point={points.archive} key={operation.id} />
      if (operation.type === 'sanctum-circulation') return <SanctumOperation operation={operation} point={points.sanctum} key={operation.id} />
      if (operation.type === 'gate-cycle') return <GateOperation operation={operation} point={points.gate} key={operation.id} />
      if (operation.type === 'water-machinery') return <WaterMachineryOperation operation={operation} point={points.water} key={operation.id} />
      return null
    })}
  </div>
}

export default memo(WorldOperationsLayer)
