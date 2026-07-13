import { memo } from 'react'
import { WORLD_OPERATION_POINTS } from '../../world/directors/worldOperationsDirector.js'
import forgeFireStrip from '../../assets/world-effects/forge-fire-strip.png'
import forgeSmokeStrip from '../../assets/world-effects/forge-smoke-strip.png'
import forgeSparksStrip from '../../assets/world-effects/forge-sparks-strip.png'
import archiveDataRunesStrip from '../../assets/world-effects/archive-data-runes-strip.png'
import archiveWindowGlowStrip from '../../assets/world-effects/archive-window-glow-strip.png'
import citadelCorePulseStrip from '../../assets/world-effects/citadel-core-pulse-strip.png'
import citadelEnergyWaveStrip from '../../assets/world-effects/citadel-energy-wave-strip.png'
import citadelRuneRingStrip from '../../assets/world-effects/citadel-rune-ring-strip.png'
import gateEnergyLockStrip from '../../assets/world-effects/gate-energy-lock-strip.png'
import sanctumEnergyOrbitStrip from '../../assets/world-effects/sanctum-energy-orbit-strip.png'
import watcherLensPulseStrip from '../../assets/world-effects/watcher-lens-pulse-strip.png'
import watcherScanBeamStrip from '../../assets/world-effects/watcher-scan-beam-strip.png'
import waterReflectionStrip from '../../assets/world-effects/water-reflection-strip.png'
import './WorldOperationsLayer.css'

const pathData = (points = []) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
const styleAt = (point) => ({ '--operation-x': `${point.x}%`, '--operation-y': `${point.y}%` })

function SpriteStrip({ src, className = '', staticFrame = false }) {
  return <span className={`operation-sprite ${className}${staticFrame ? ' is-static-frame' : ''}`}><img src={src} alt="" /></span>
}

function DataTransitOperation({ operation }) {
  const path = pathData(operation.route)
  const baseDuration = Math.max(4, Math.min(8, operation.durationMs / 1_000))
  const duration = operation.mode === 'event' ? Math.max(4, baseDuration * 0.78) : baseDuration
  return <svg className={`world-operation world-operation--data-transit mode-${operation.mode}`} style={{ '--transit-duration': `${duration}s` }} viewBox="0 0 100 100" preserveAspectRatio="none" data-world-operation={operation.type} data-operation-mode={operation.mode} data-evidence-event-id={operation.evidenceEventId ?? ''}>
    <path className="operation-artery__wake" d={path} pathLength="100" vectorEffect="non-scaling-stroke" />
    <path className="operation-artery__segments" d={path} pathLength="100" vectorEffect="non-scaling-stroke" />
    <circle className="operation-artery__halo" r={operation.mode === 'event' ? 1.5 : 1.05}><animateMotion path={path} dur={`${duration}s`} repeatCount="indefinite" /></circle>
    <circle className="operation-artery__core" r={operation.mode === 'event' ? 0.82 : 0.58}><animateMotion path={path} dur={`${duration}s`} repeatCount="indefinite" /></circle>
  </svg>
}

function CitadelOperation({ operation, point }) {
  return <div className={`world-operation operation-citadel mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point)}>
    <SpriteStrip src={citadelEnergyWaveStrip} className="operation-citadel__wave" />
    <SpriteStrip src={citadelRuneRingStrip} className="operation-citadel__ring" staticFrame />
    <SpriteStrip src={citadelCorePulseStrip} className="operation-citadel__core" />
  </div>
}

function ForgeOperation({ operation, point }) {
  return <div className={`world-operation operation-forge mode-${operation.mode} phase-${operation.phase}`} data-world-operation={operation.type} data-operation-phase={operation.phase} data-evidence-event-id={operation.evidenceEventId ?? ''} style={styleAt(point)}>
    <span className="operation-forge__sprite operation-forge__fire"><img src={forgeFireStrip} alt="" /></span>
    <span className="operation-forge__sprite operation-forge__smoke"><img src={forgeSmokeStrip} alt="" /></span>
    <span className="operation-forge__sprite operation-forge__sparks"><img src={forgeSparksStrip} alt="" /></span>
  </div>
}

function WatcherOperation({ operation, point }) {
  return <div className={`world-operation operation-watcher mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point)}>
    <SpriteStrip src={watcherScanBeamStrip} className="operation-watcher__beam" />
    <SpriteStrip src={watcherLensPulseStrip} className="operation-watcher__lens" />
  </div>
}

function ArchiveOperation({ operation, point }) {
  return <div className={`world-operation operation-archive mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} data-evidence-event-id={operation.evidenceEventId ?? ''} style={styleAt(point)}>
    <span className="operation-archive__windows">
      {Array.from({ length: 4 }, (_, index) => <SpriteStrip src={archiveWindowGlowStrip} className="operation-archive__window" key={index} />)}
    </span>
    <SpriteStrip src={archiveDataRunesStrip} className="operation-archive__runes" />
  </div>
}

function SanctumOperation({ operation, point }) {
  return <div className={`world-operation operation-sanctum mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point)}>
    <SpriteStrip src={sanctumEnergyOrbitStrip} className="operation-sanctum__orbit" />
  </div>
}

function GateOperation({ operation, point }) {
  return <div className={`world-operation operation-gate mode-${operation.mode}`} data-world-operation={operation.type} style={styleAt(point)}><SpriteStrip src={gateEnergyLockStrip} className="operation-gate__lock" /></div>
}

function WaterMachineryOperation({ operation, point }) {
  return <div className={`world-operation operation-water-machinery mode-${operation.mode}`} data-world-operation={operation.type} style={styleAt(point)}><SpriteStrip src={waterReflectionStrip} className="operation-water__reflection" /></div>
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
