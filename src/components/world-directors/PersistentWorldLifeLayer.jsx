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

const WATER_SURFACES = Object.freeze({
  mobile: Object.freeze([
    Object.freeze({ id: 'left-upper', direction: 'vertical', x: 0, y: 5.5, width: 8, height: 28, clip: 'polygon(0 0,70% 5%,94% 20%,73% 43%,53% 63%,86% 82%,58% 100%,0 100%)' }),
    Object.freeze({ id: 'left-middle', direction: 'vertical', x: 0, y: 34, width: 8.5, height: 27, clip: 'polygon(0 0,62% 8%,90% 28%,65% 51%,88% 74%,54% 100%,0 100%)' }),
    Object.freeze({ id: 'left-lower', direction: 'vertical', x: 0, y: 86, width: 8, height: 14, clip: 'polygon(0 0,60% 8%,92% 38%,68% 72%,45% 100%,0 100%)' }),
    Object.freeze({ id: 'right-upper', direction: 'vertical-reverse', x: 92, y: 5, width: 8, height: 29, clip: 'polygon(30% 0,100% 0,100% 100%,42% 100%,14% 80%,45% 58%,20% 33%)' }),
    Object.freeze({ id: 'right-middle', direction: 'vertical-reverse', x: 91.5, y: 34, width: 8.5, height: 27, clip: 'polygon(38% 0,100% 0,100% 100%,46% 100%,12% 75%,36% 51%,10% 27%)' }),
    Object.freeze({ id: 'right-lower', direction: 'vertical-reverse', x: 92, y: 86, width: 8, height: 14, clip: 'polygon(40% 0,100% 0,100% 100%,55% 100%,30% 72%,8% 38%)' }),
    Object.freeze({ id: 'upper-left-channel', direction: 'horizontal', x: 15, y: 13, width: 8, height: 9, clip: 'ellipse(48% 44% at 50% 50%)' }),
    Object.freeze({ id: 'upper-right-channel', direction: 'horizontal', x: 77, y: 13, width: 8, height: 9, clip: 'ellipse(48% 44% at 50% 50%)' }),
  ]),
  desktop: Object.freeze([
    Object.freeze({ id: 'harbour', direction: 'horizontal', x: 21, y: 81, width: 58, height: 19, clip: 'polygon(7% 12%,22% 0,42% 14%,53% 28%,68% 10%,86% 18%,96% 48%,100% 100%,0 100%,1% 46%)' }),
    Object.freeze({ id: 'channel-nw', direction: 'diagonal', x: 25.5, y: 31.5, width: 19, height: 13, clip: 'polygon(0 0,6% 0,100% 82%,94% 100%)' }),
    Object.freeze({ id: 'channel-ne', direction: 'diagonal-reverse', x: 55, y: 29, width: 19, height: 14, clip: 'polygon(94% 0,100% 8%,6% 100%,0 84%)' }),
    Object.freeze({ id: 'channel-center', direction: 'vertical', x: 44.5, y: 48, width: 3, height: 12, clip: 'polygon(22% 0,78% 0,100% 100%,0 100%)' }),
    Object.freeze({ id: 'channel-sw', direction: 'diagonal-reverse', x: 25.5, y: 54, width: 18, height: 13, clip: 'polygon(94% 0,100% 16%,6% 100%,0 82%)' }),
    Object.freeze({ id: 'channel-se', direction: 'diagonal', x: 54, y: 54, width: 14, height: 13, clip: 'polygon(0 0,8% 0,100% 82%,94% 100%)' }),
  ]),
})

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
  const regions = WATER_SURFACES[layout === 'mobile' ? 'mobile' : 'desktop']
  return <div className={`persistent-water-flow${active ? ' is-operation-active' : ''}`} aria-hidden="true">
    {regions.map((region) => <i
      className={`persistent-water-surface persistent-water-surface--${region.direction}`}
      style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%`, clipPath: region.clip }}
      data-water-region={region.id}
      key={region.id}
    />)}
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
