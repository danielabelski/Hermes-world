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
import waterReflectionStrip from '../../assets/world-effects/water-reflection-strip.runtime.png'

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
  const mobile = layout === 'mobile'
  return <svg className={`persistent-water-flow${active ? ' is-operation-active' : ''}`} viewBox={mobile ? '0 0 980 1680' : '0 0 1536 1024'} preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <filter id={`water-soft-${layout}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={mobile ? '3.2' : '2.6'} />
      </filter>
    </defs>
    <g className="persistent-water-flow__soft" filter={`url(#water-soft-${layout})`}>
      {(mobile ? [
        'M 8 118 C 64 132, 75 218, 54 310 C 32 410, 28 548, 86 665 C 119 733, 127 818, 82 905 C 40 985, 38 1113, 86 1208',
        'M 972 112 C 918 146, 903 224, 924 317 C 949 422, 950 547, 892 661 C 856 730, 849 815, 898 909 C 938 987, 942 1114, 895 1208',
        'M 32 1456 C 87 1485, 122 1543, 131 1668',
        'M 948 1456 C 893 1485, 858 1543, 849 1668',
      ] : [
        'M 505 1018 C 552 949, 626 917, 705 922 C 768 926, 817 958, 865 1018',
        'M 883 1018 C 928 959, 1014 930, 1098 939 C 1170 946, 1222 978, 1255 1018',
        'M 583 469 C 635 441, 694 430, 750 443 C 806 456, 839 493, 822 532 C 804 572, 735 584, 674 566 C 617 550, 576 511, 583 469',
      ]).map((path, index) => <path d={path} pathLength="100" key={`soft-${index}`} />)}
    </g>
    <g className="persistent-water-flow__highlights">
      {(mobile ? [
        'M 8 118 C 64 132, 75 218, 54 310 C 32 410, 28 548, 86 665 C 119 733, 127 818, 82 905 C 40 985, 38 1113, 86 1208',
        'M 972 112 C 918 146, 903 224, 924 317 C 949 422, 950 547, 892 661 C 856 730, 849 815, 898 909 C 938 987, 942 1114, 895 1208',
        'M 32 1456 C 87 1485, 122 1543, 131 1668',
        'M 948 1456 C 893 1485, 858 1543, 849 1668',
      ] : [
        'M 505 1018 C 552 949, 626 917, 705 922 C 768 926, 817 958, 865 1018',
        'M 883 1018 C 928 959, 1014 930, 1098 939 C 1170 946, 1222 978, 1255 1018',
        'M 583 469 C 635 441, 694 430, 750 443 C 806 456, 839 493, 822 532 C 804 572, 735 584, 674 566 C 617 550, 576 511, 583 469',
      ]).map((path, index) => <path d={path} pathLength="100" style={{ '--water-path-index': index }} key={`highlight-${index}`} />)}
    </g>
  </svg>
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
    <div className={`persistent-life persistent-life--water${activeClass('water-machinery')}`} style={styleAt(points.water)}>
      <LifeSprite src={waterReflectionStrip} className="persistent-life__water-reflection" delay="-2.6s" fetchPriority="high" />
      <LifeSprite src={waterReflectionStrip} className="persistent-life__water-reflection persistent-life__water-reflection--secondary" delay="-5.1s" />
    </div>
    <div className="persistent-window-lights">
      {windowAnchors.map((anchor) => <AmbientWindowLight anchor={anchor} key={anchor.id} />)}
    </div>
  </div>
}

export default memo(PersistentWorldLifeLayer)
