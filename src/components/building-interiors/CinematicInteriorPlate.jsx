import { memo, useState } from 'react'
import archiveCodexStrip from '../../assets/building-interior-effects/archive-interior-codex-armillary-strip.runtime.png'
import archiveShelfStrip from '../../assets/building-interior-effects/archive-interior-shelf-ingestion-strip.runtime.png'
import citadelCommandTableStrip from '../../assets/building-interior-effects/citadel-interior-command-table-strip.runtime.png'
import citadelCoreStrip from '../../assets/building-interior-effects/citadel-interior-core-charge-strip.runtime.png'
import forgeInteriorFireStrip from '../../assets/building-interior-effects/forge-interior-fire-strip.runtime.png'
import forgeImpactSparksStrip from '../../assets/building-interior-effects/forge-interior-impact-sparks-strip.runtime.png'
import forgeInteriorSmokeStrip from '../../assets/building-interior-effects/forge-interior-smoke-strip.runtime.png'
import sanctumEnergyColumnStrip from '../../assets/building-interior-effects/sanctum-interior-energy-column-strip.runtime.png'
import sanctumPoolStrip from '../../assets/building-interior-effects/sanctum-interior-pool-circulation-strip.runtime.png'
import watcherArmillaryStrip from '../../assets/building-interior-effects/watcher-interior-armillary-calibration-strip.runtime.png'
import watcherLensScanStrip from '../../assets/building-interior-effects/watcher-interior-lens-scan-strip.runtime.png'
import { CINEMATIC_INTERIOR_PLATES } from './interiorPlateManifest.js'
import InteriorAgentPresence from './InteriorAgentPresence.jsx'
import InteriorRosterReviewPresence from './InteriorRosterReviewPresence.jsx'

const freeze = Object.freeze

const EFFECTS = freeze({
  citadel: freeze([
    freeze({ id: 'core', strip: citadelCoreStrip }),
    freeze({ id: 'table', strip: citadelCommandTableStrip }),
  ]),
  archive: freeze([
    freeze({ id: 'codex', strip: archiveCodexStrip }),
    freeze({ id: 'shelf-ingestion', strip: archiveShelfStrip }),
  ]),
  watcher: freeze([
    freeze({ id: 'lens-scan', strip: watcherLensScanStrip }),
    freeze({ id: 'armillary', strip: watcherArmillaryStrip }),
  ]),
  sanctum: freeze([
    freeze({ id: 'pool', strip: sanctumPoolStrip }),
    freeze({ id: 'energy-column', strip: sanctumEnergyColumnStrip }),
  ]),
  forge: freeze([
    freeze({ id: 'fire', strip: forgeInteriorFireStrip }),
    freeze({ id: 'smoke', strip: forgeInteriorSmokeStrip }),
    freeze({ id: 'impact', strip: forgeImpactSparksStrip }),
  ]),
})

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value) || 0))

function SpriteStrip({ src }) {
  return <span className="cinematic-effect__sprite"><img src={src} alt="" draggable="false" loading="eager" decoding="async" fetchPriority="high" /></span>
}

function CinematicInteriorPlate({ buildingId, phase = 'standby', metrics = [], evidenceEventId = null, agent, tasks, alerts, lifecycle, layout, onAgentDrillDown, rosterReview = null }) {
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

  return <div className={`cinematic-interior cinematic-interior--${buildingId}${plateReady ? ' is-plate-ready' : ''}`} data-phase={phase} data-evidence-event={evidenceEventId ? 'true' : 'false'} style={style}>
    <div className="cinematic-interior__backdrop" />
    <div className="cinematic-interior__frame">
      <img className="cinematic-interior__plate" src={scene.src} alt="" draggable="false" loading="eager" decoding="async" fetchPriority="high" onLoad={() => setPlateReady(true)} />
      <div className="cinematic-interior__camera" />
      <div className="cinematic-interior__effects">
        {EFFECTS[buildingId].map((effect) => <span key={effect.id} className={`cinematic-effect cinematic-effect--${buildingId}-${effect.id}${effect.strip ? ' is-sprite' : ''}`} data-effect={effect.id}>
          {effect.strip ? <SpriteStrip src={effect.strip} /> : null}
        </span>)}
      </div>
      {rosterReview?.enabled
        ? <InteriorRosterReviewPresence profileId={rosterReview.profileId} visualState={rosterReview.visualState} />
        : <InteriorAgentPresence buildingId={buildingId} agent={agent} tasks={tasks} alerts={alerts} lifecycle={lifecycle} layout={layout} onDrillDown={onAgentDrillDown} />}
      <div className="cinematic-interior__grade" />
    </div>
  </div>
}

export default memo(CinematicInteriorPlate)
