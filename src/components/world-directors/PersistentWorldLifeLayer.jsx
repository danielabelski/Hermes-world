import { memo } from 'react'
import { ENVIRONMENT_BUILDINGS, getEnvironmentalBuildingState } from '../../world/directors/environmentalDirector.js'
import { WORLD_OPERATION_POINTS } from '../../world/directors/worldOperationsDirector.js'
import archiveWindowGlowStrip from '../../assets/world-effects/archive-window-glow-strip.png'
import citadelCorePulseStrip from '../../assets/world-effects/citadel-core-pulse-strip.png'
import forgeFireStrip from '../../assets/world-effects/forge-fire-strip.png'
import forgeSmokeStrip from '../../assets/world-effects/forge-smoke-strip.png'
import gateEnergyLockStrip from '../../assets/world-effects/gate-energy-lock-strip.png'
import sanctumEnergyOrbitStrip from '../../assets/world-effects/sanctum-energy-orbit-strip.png'
import watcherLensPulseStrip from '../../assets/world-effects/watcher-lens-pulse-strip.png'
import waterReflectionStrip from '../../assets/world-effects/water-reflection-strip.png'

const styleAt = (point) => ({ '--life-x': `${point.x}%`, '--life-y': `${point.y}%` })

function LifeSprite({ src, className = '', delay = '0s' }) {
  return <span className={`persistent-life__sprite ${className}`} style={{ '--life-delay': delay }}><img src={src} alt="" /></span>
}

function responseClass(buildingId, presentation) {
  const state = getEnvironmentalBuildingState(buildingId, presentation)
  return `${state.response ? ' has-response' : ''} cue-${state.response?.cue ?? 'none'}`
}

function PersistentWorldLifeLayer({ presentation }) {
  const layout = presentation.layout === 'mobile' ? 'mobile' : 'desktop'
  const points = WORLD_OPERATION_POINTS[layout]
  const activeOperations = new Set((presentation.worldOperations?.operations ?? []).map((operation) => operation.type))
  const activeClass = (type) => activeOperations.has(type) ? ' is-operation-active' : ''
  return <div className="persistent-world-life" data-persistent-world-life="active" aria-hidden="true">
    <div className={`persistent-life persistent-life--citadel${responseClass(ENVIRONMENT_BUILDINGS.citadel.buildingId, presentation)}${activeClass('citadel-distribution')}`} style={styleAt(points.citadel)}>
      <LifeSprite src={citadelCorePulseStrip} className="persistent-life__citadel-core" />
    </div>
    <div className={`persistent-life persistent-life--forge${responseClass(ENVIRONMENT_BUILDINGS.forge.buildingId, presentation)}${activeClass('forge-production')}`} style={styleAt(points.forge)}>
      <LifeSprite src={forgeFireStrip} className="persistent-life__forge-fire" />
      <LifeSprite src={forgeSmokeStrip} className="persistent-life__forge-smoke" delay="-1.8s" />
    </div>
    <div className={`persistent-life persistent-life--watcher${responseClass(ENVIRONMENT_BUILDINGS.watcher.buildingId, presentation)}${activeClass('watcher-sweep')}`} style={styleAt(points.watcher)}>
      <LifeSprite src={watcherLensPulseStrip} className="persistent-life__watcher-lens" delay="-2.2s" />
    </div>
    <div className={`persistent-life persistent-life--archive${responseClass(ENVIRONMENT_BUILDINGS.archive.buildingId, presentation)}${activeClass('archive-ingestion')}`} style={styleAt(points.archive)}>
      <span className="persistent-life__archive-windows">
        {['0s', '-1.4s', '-2.8s', '-4.2s'].map((delay) => <LifeSprite src={archiveWindowGlowStrip} className="persistent-life__archive-window" delay={delay} key={delay} />)}
      </span>
    </div>
    <div className={`persistent-life persistent-life--sanctum${responseClass(ENVIRONMENT_BUILDINGS.sanctum.buildingId, presentation)}${activeClass('sanctum-circulation')}`} style={styleAt(points.sanctum)}>
      <LifeSprite src={sanctumEnergyOrbitStrip} className="persistent-life__sanctum-orbit" delay="-3.1s" />
    </div>
    <div className={`persistent-life persistent-life--gate${activeClass('gate-cycle')}`} style={styleAt(points.gate)}>
      <LifeSprite src={gateEnergyLockStrip} className="persistent-life__gate-lock" delay="-4.4s" />
    </div>
    <div className={`persistent-life persistent-life--water${activeClass('water-machinery')}`} style={styleAt(points.water)}>
      <LifeSprite src={waterReflectionStrip} className="persistent-life__water-reflection" delay="-2.6s" />
      <LifeSprite src={waterReflectionStrip} className="persistent-life__water-reflection persistent-life__water-reflection--secondary" delay="-5.1s" />
    </div>
  </div>
}

export default memo(PersistentWorldLifeLayer)
