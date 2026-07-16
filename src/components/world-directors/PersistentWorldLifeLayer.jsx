import { memo } from 'react'
import { ENVIRONMENT_BUILDINGS, getEnvironmentalBuildingState } from '../../world/directors/environmentalDirector.js'
import { getAmbientWindowAnchors, getWorldVisualAnchors } from '../../world/directors/worldVisualAnchors.js'
import archiveWindowGlowStrip from '../../assets/world-effects/archive-window-glow-strip.runtime.png'
import citadelCorePulseStrip from '../../assets/world-effects/citadel-core-pulse-strip.runtime.png'
import forgeFireStrip from '../../assets/world-effects/forge-fire-strip.runtime.png'
import forgeSmokeStrip from '../../assets/world-effects/forge-smoke-strip.runtime.png'
import gateEnergyLockStrip from '../../assets/world-effects/gate-energy-lock-strip.runtime.png'
import sanctumEnergyOrbitStrip from '../../assets/world-effects/sanctum-energy-orbit-strip.runtime.png'
import watcherLensPulseStrip from '../../assets/world-effects/watcher-lens-pulse-strip.runtime.png'
import waterCurrentRibbon from '../../assets/world-effects/hermes-water-current-ribbon.user-v2.png'
import waterCurrentRibbonVertical from '../../assets/world-effects/hermes-water-current-ribbon-vertical.runtime.png'
import waterMaskDesktop from '../../assets/world-effects/hermes-water-mask-desktop.runtime.png'
import waterMaskMobile from '../../assets/world-effects/hermes-water-mask-mobile.runtime.png'

const styleAt = (point) => ({ '--life-x': `${point.x}%`, '--life-y': `${point.y}%`, '--life-offset-x': `${point.offsetX ?? 0}px`, '--life-offset-y': `${point.offsetY ?? 0}px` })

function LifeSprite({ src, className = '', delay = '0s', fetchPriority = 'low' }) {
  return <span className={`persistent-life__sprite ${className}`} style={{ '--life-delay': delay }}><img src={src} alt="" decoding="async" fetchPriority={fetchPriority} /></span>
}

function responseClass(buildingId, presentation) {
  const state = getEnvironmentalBuildingState(buildingId, presentation)
  return `${state.response ? ' has-response' : ''} cue-${state.response?.cue ?? 'none'}`
}

function AmbientWindowLight({ anchor }) {
  return <span className="persistent-window-light" style={{ '--window-x': `${anchor.x}%`, '--window-y': `${anchor.y}%`, '--life-delay': anchor.delay }} data-window-anchor={anchor.id}>
    <img src={archiveWindowGlowStrip} alt="" decoding="async" fetchPriority="low" />
  </span>
}

function PersistentWaterFlow({ layout, active = false }) {
  const isMobile = layout === 'mobile'
  const maskUrl = isMobile ? waterMaskMobile : waterMaskDesktop
  const textureUrl = isMobile ? waterCurrentRibbonVertical : waterCurrentRibbon
  return <div
    className={`persistent-water-flow persistent-water-flow--${isMobile ? 'mobile' : 'desktop'}${active ? ' is-operation-active' : ''}`}
    style={{ '--water-mask-image': `url(${maskUrl})`, '--water-current-image': `url(${textureUrl})` }}
    data-water-mask="pixel-derived"
    data-water-layout={isMobile ? 'mobile' : 'desktop'}
    aria-hidden="true"
  >
    <i className="persistent-water-current persistent-water-current--depth" />
    <i className="persistent-water-current persistent-water-current--highlight" />
  </div>
}

function PersistentWorldLifeLayer({ presentation }) {
  const layout = presentation.layout === 'mobile' ? 'mobile' : 'desktop'
  const points = getWorldVisualAnchors(layout)
  const windowAnchors = getAmbientWindowAnchors(layout)
  const activeOperations = new Set((presentation.worldOperations?.operations ?? []).map((operation) => operation.type))
  const activeClass = (type) => activeOperations.has(type) ? ' is-operation-active' : ''
  return <div className="persistent-world-life" data-persistent-world-life="active" aria-hidden="true">
    <div className={`persistent-life persistent-life--citadel${responseClass(ENVIRONMENT_BUILDINGS.citadel.buildingId, presentation)}${activeClass('citadel-distribution')}`} style={styleAt(points.citadel)}>
      <LifeSprite src={citadelCorePulseStrip} className="persistent-life__citadel-core" fetchPriority="high" />
    </div>
    <div className={`persistent-life persistent-life--forge${responseClass(ENVIRONMENT_BUILDINGS.forge.buildingId, presentation)}${activeClass('forge-production')}`} style={styleAt(points.forge)}>
      <LifeSprite src={forgeFireStrip} className="persistent-life__forge-fire" fetchPriority="high" />
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
    <div className={`persistent-life persistent-life--gate${responseClass(ENVIRONMENT_BUILDINGS.gate.buildingId, presentation)}${activeClass('gate-cycle')}`} style={styleAt(points.gate)}>
      <LifeSprite src={gateEnergyLockStrip} className="persistent-life__gate-lock" delay="-4.4s" />
    </div>
    <PersistentWaterFlow layout={layout} active={activeOperations.has('water-machinery')} />
    <div className="persistent-window-lights">
      {windowAnchors.map((anchor) => <AmbientWindowLight anchor={anchor} key={anchor.id} />)}
    </div>
  </div>
}

export default memo(PersistentWorldLifeLayer)
