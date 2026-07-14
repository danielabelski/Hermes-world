import { useState } from 'react'
import archiveRunesStrip from '../../assets/world-effects/archive-data-runes-strip.runtime.png'
import archiveWindowsStrip from '../../assets/world-effects/archive-window-glow-strip.runtime.png'
import citadelCoreStrip from '../../assets/world-effects/citadel-core-pulse-strip.runtime.png'
import citadelEnergyStrip from '../../assets/world-effects/citadel-energy-wave-strip.runtime.png'
import citadelRuneStrip from '../../assets/world-effects/citadel-rune-ring-strip.runtime.png'
import forgeFireStrip from '../../assets/world-effects/forge-fire-strip.runtime.png'
import forgeSmokeStrip from '../../assets/world-effects/forge-smoke-strip.runtime.png'
import forgeSparksStrip from '../../assets/world-effects/forge-sparks-strip.runtime.png'
import sanctumOrbitStrip from '../../assets/world-effects/sanctum-energy-orbit-strip.runtime.png'
import watcherLensStrip from '../../assets/world-effects/watcher-lens-pulse-strip.runtime.png'
import watcherScanStrip from '../../assets/world-effects/watcher-scan-beam-strip.runtime.png'
import { CINEMATIC_INTERIOR_PLATES } from './interiorPlateManifest.js'

const freeze = Object.freeze

const EFFECTS = freeze({
  citadel: freeze([
    freeze({ id: 'core', strip: citadelCoreStrip }),
    freeze({ id: 'rings', strip: citadelRuneStrip }),
    freeze({ id: 'table' }),
    freeze({ id: 'conduit', strip: citadelEnergyStrip }),
    freeze({ id: 'lamps-left' }),
    freeze({ id: 'lamps-right' }),
  ]),
  archive: freeze([
    freeze({ id: 'codex' }),
    freeze({ id: 'armillary', strip: archiveRunesStrip }),
    freeze({ id: 'beam' }),
    freeze({ id: 'shelves-left', strip: archiveWindowsStrip }),
    freeze({ id: 'shelves-right', strip: archiveWindowsStrip }),
    freeze({ id: 'floor-path' }),
  ]),
  watcher: freeze([
    freeze({ id: 'lens', strip: watcherLensStrip }),
    freeze({ id: 'scan', strip: watcherScanStrip }),
    freeze({ id: 'armillary' }),
    freeze({ id: 'base' }),
    freeze({ id: 'cron-dial' }),
  ]),
  sanctum: freeze([
    freeze({ id: 'pool' }),
    freeze({ id: 'orbit', strip: sanctumOrbitStrip }),
    freeze({ id: 'energy-column' }),
    freeze({ id: 'floor-channels' }),
    freeze({ id: 'vats-left' }),
    freeze({ id: 'vats-right' }),
    freeze({ id: 'canopy' }),
  ]),
  forge: freeze([
    freeze({ id: 'fire', strip: forgeFireStrip }),
    freeze({ id: 'smoke', strip: forgeSmokeStrip }),
    freeze({ id: 'impact-left', strip: forgeSparksStrip }),
    freeze({ id: 'impact-right', strip: forgeSparksStrip }),
    freeze({ id: 'production-line' }),
    freeze({ id: 'coolant' }),
    freeze({ id: 'machinery' }),
  ]),
})

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value) || 0))

function SpriteStrip({ src }) {
  return <span className="cinematic-effect__sprite"><img src={src} alt="" draggable="false" decoding="async" fetchPriority="low" /></span>
}

export default function CinematicInteriorPlate({ buildingId, phase = 'standby', metrics = [], evidenceEventId = null }) {
  const [plateReady, setPlateReady] = useState(false)
  const scene = CINEMATIC_INTERIOR_PLATES[buildingId]
  if (!scene) return null

  const metricValues = Object.fromEntries(metrics.map((item) => [item.label, item.value]))
  const cpu = buildingId === 'forge' ? metricValues.CPU : null
  const temperature = buildingId === 'forge' ? metricValues['TEMP.'] : null
  const telemetryLoad = clamp(cpu === null || cpu === undefined ? 0.35 : cpu / 100, 0.18, 1)
  const telemetryHeat = clamp(temperature === null || temperature === undefined ? 0.42 : temperature / 100, 0.2, 1)
  const style = {
    '--plate-image': `url("${scene.src}")`,
    '--plate-focus-x': `${scene.focusX}%`,
    '--plate-focus-y': `${scene.focusY}%`,
    '--telemetry-load': telemetryLoad,
    '--telemetry-heat': telemetryHeat,
    '--forge-fire-opacity': 0.58 + telemetryHeat * 0.2,
    '--forge-smoke-opacity': 0.28 + telemetryLoad * 0.18,
  }

  return <div className={`cinematic-interior cinematic-interior--${buildingId}${plateReady ? ' is-plate-ready' : ''}`} data-phase={phase} data-evidence-event={evidenceEventId ? 'true' : 'false'} style={style} aria-hidden="true">
    <div className="cinematic-interior__backdrop" />
    <div className="cinematic-interior__frame">
      <img className="cinematic-interior__plate" src={scene.src} alt="" draggable="false" loading="eager" decoding="async" fetchPriority="high" onLoad={() => setPlateReady(true)} />
      <div className="cinematic-interior__camera" />
      <div className="cinematic-interior__effects">
        {plateReady ? EFFECTS[buildingId].map((effect) => <span key={effect.id} className={`cinematic-effect cinematic-effect--${buildingId}-${effect.id}${effect.strip ? ' is-sprite' : ''}`} data-effect={effect.id}>
          {effect.strip ? <SpriteStrip src={effect.strip} /> : null}
        </span>) : null}
      </div>
      <div className="cinematic-interior__grade" />
    </div>
  </div>
}
