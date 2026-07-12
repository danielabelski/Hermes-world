import { memo } from 'react'
import { WORLD_OPERATION_POINTS } from '../../world/directors/worldOperationsDirector.js'
import './WorldOperationsLayer.css'

const pathData = (points = []) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
const styleAt = (point) => ({ '--operation-x': `${point.x}%`, '--operation-y': `${point.y}%` })

function DataTransitOperation({ operation }) {
  const path = pathData(operation.route)
  const duration = Math.max(4, Math.min(8, operation.durationMs / 1_000))
  return <svg className={`world-operation world-operation--data-transit mode-${operation.mode}`} viewBox="0 0 100 100" preserveAspectRatio="none" data-world-operation={operation.type} data-operation-mode={operation.mode} data-evidence-event-id={operation.evidenceEventId ?? ''}>
    <path className="operation-artery__bed" d={path} vectorEffect="non-scaling-stroke" />
    <path className="operation-artery__wake" d={path} vectorEffect="non-scaling-stroke" />
    <path className="operation-artery__trail" d={path} vectorEffect="non-scaling-stroke" />
    <circle className="operation-artery__halo" r={operation.mode === 'event' ? 1.5 : 1.05}><animateMotion path={path} dur={`${duration}s`} repeatCount="indefinite" /></circle>
    <circle className="operation-artery__core" r={operation.mode === 'event' ? 0.82 : 0.58}><animateMotion path={path} dur={`${duration}s`} repeatCount="indefinite" /></circle>
  </svg>
}

function CitadelOperation({ operation, point }) {
  return <div className={`world-operation operation-citadel mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point)}>
    <i className="operation-citadel__outer" /><i className="operation-citadel__inner" /><i className="operation-citadel__core" />
    <span className="operation-citadel__runes">{Array.from({ length: 8 }, (_, index) => <b style={{ '--rune-index': index }} key={index} />)}</span>
    <i className="operation-citadel__output" />
  </div>
}

function ForgeOperation({ operation, point }) {
  return <div className={`world-operation operation-forge mode-${operation.mode} phase-${operation.phase}`} data-world-operation={operation.type} data-operation-phase={operation.phase} data-evidence-event-id={operation.evidenceEventId ?? ''} style={styleAt(point)}>
    <i className="operation-forge__backplate" /><i className="operation-forge__furnace" /><i className="operation-forge__door" />
    <i className="operation-forge__gear" /><i className="operation-forge__piston" /><i className="operation-forge__crane" />
    <span className="operation-forge__sparks"><b /><b /></span><span className="operation-forge__smoke"><b /></span>
  </div>
}

function WatcherOperation({ operation, point }) {
  return <div className={`world-operation operation-watcher mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point)}>
    <i className="operation-watcher__dome" /><i className="operation-watcher__lens" /><i className="operation-watcher__beam" /><i className="operation-watcher__arc" />
  </div>
}

function ArchiveOperation({ operation, point }) {
  return <div className={`world-operation operation-archive mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} data-evidence-event-id={operation.evidenceEventId ?? ''} style={styleAt(point)}>
    <i className="operation-archive__backplate" /><span className="operation-archive__windows"><b /><b /><b /><b /></span><i className="operation-archive__tape" /><i className="operation-archive__seal" />
  </div>
}

function SanctumOperation({ operation, point }) {
  return <div className={`world-operation operation-sanctum mode-${operation.mode}`} data-world-operation={operation.type} data-operation-phase={operation.phase} style={styleAt(point)}>
    <i className="operation-sanctum__orbit"><b /><b /></i><i className="operation-sanctum__spiral" /><i className="operation-sanctum__core" /><i className="operation-sanctum__channel" />
  </div>
}

function GateOperation({ operation, point }) {
  return <div className={`world-operation operation-gate mode-${operation.mode}`} data-world-operation={operation.type} style={styleAt(point)}><i /><i /><b /></div>
}

function WaterMachineryOperation({ operation, point }) {
  return <div className={`world-operation operation-water-machinery mode-${operation.mode}`} data-world-operation={operation.type} style={styleAt(point)}><i /><i /><b /></div>
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
