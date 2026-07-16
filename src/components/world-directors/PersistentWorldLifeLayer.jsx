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

const WATER_REFLECTIONS = Object.freeze({
  mobile: Object.freeze([
    { id: 'left-upper', x: 2.4, y: 10.2, size: 12, dx: -1, dy: 7, angle: -18, delay: -0.7 },
    { id: 'left-fall', x: 2.8, y: 23.8, size: 10, dx: 2, dy: 8, angle: 22, delay: -3.4 },
    { id: 'left-mid', x: 2.1, y: 38.6, size: 14, dx: -2, dy: 7, angle: -24, delay: -5.8 },
    { id: 'left-lower', x: 2.7, y: 54.2, size: 11, dx: 1, dy: 8, angle: 16, delay: -2.1 },
    { id: 'right-upper', x: 97.2, y: 11.5, size: 12, dx: 1, dy: 7, angle: 18, delay: -4.5 },
    { id: 'right-mid', x: 97.6, y: 28.7, size: 10, dx: -1, dy: 8, angle: -20, delay: -1.6 },
    { id: 'right-lower', x: 97.1, y: 47.4, size: 13, dx: 2, dy: 7, angle: 24, delay: -6.3 },
  ]),
  desktop: Object.freeze([
    { id: 'harbor-left', x: 30.5, y: 88.2, size: 18, dx: 10, dy: 1, angle: -8, delay: -1.2 },
    { id: 'harbor-center', x: 47.5, y: 91.4, size: 16, dx: 11, dy: -1, angle: 6, delay: -4.1 },
    { id: 'harbor-right', x: 65.5, y: 87.1, size: 20, dx: 9, dy: 1, angle: -5, delay: -6.7 },
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

function PersistentWaterReflections({ layout, active = false }) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const reflections = WATER_REFLECTIONS[normalizedLayout]
  return <div
    className={`persistent-water-flow persistent-water-flow--${normalizedLayout}${active ? ' is-operation-active' : ''}`}
    data-water-renderer="water-reflection-vfx"
    data-water-layout={normalizedLayout}
    aria-hidden="true"
  >
    {reflections.map((reflection) => <i
      className="persistent-water-reflection"
      data-water-region={reflection.id}
      key={reflection.id}
      style={{
        '--water-x': `${reflection.x}%`, '--water-y': `${reflection.y}%`, '--water-size': `${reflection.size}px`,
        '--water-dx': `${reflection.dx}px`, '--water-dy': `${reflection.dy}px`, '--water-angle': `${reflection.angle}deg`,
        '--water-delay': `${reflection.delay}s`,
      }}
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
    <PersistentWaterReflections layout={layout} active={activeOperations.has('water-machinery')} />
    <div className="persistent-window-lights">
      {windowAnchors.map((anchor) => <AmbientWindowLight anchor={anchor} key={anchor.id} />)}
    </div>
  </div>
}

export default memo(PersistentWorldLifeLayer)
