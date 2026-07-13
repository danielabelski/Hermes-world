import { memo } from 'react'
import AtmosphereLayer from './AtmosphereLayer.jsx'
import EnvironmentalDebugPanel from './EnvironmentalDebugPanel.jsx'
import EnvironmentalVisualVerification from './EnvironmentalVisualVerification.jsx'
import PersistentWorldLifeLayer from './PersistentWorldLifeLayer.jsx'
import './WorldEnvironmentalLife.css'

function WorldEnvironmentalLife({ presentation, debug = 'off', preset }) {
  const telemetry = presentation.infrastructureTelemetry ?? {}
  return <>
    <div
      className={`world-environmental-life layout-${presentation.layout} life-${preset?.id ?? 'balanced'}${presentation.entryActive ? ' is-entry-active' : ''}${presentation.visible ? '' : ' is-paused'}`}
      data-environment-director={presentation.running ? 'running' : 'stopped'}
      data-environment-response={presentation.response?.cue ?? 'none'}
      data-environment-intensity={presentation.ambientIntensity}
      data-infrastructure-connected={telemetry.connected ? 'true' : 'false'}
      data-world-life-role={preset?.role ?? 'default'}
      data-visual-effect={presentation.visualVerification?.id ?? 'none'}
      style={{
        '--environment-intensity': presentation.infrastructureIntensity,
        '--atmosphere-intensity': presentation.atmosphereIntensity,
        '--infrastructure-intensity': presentation.infrastructureIntensity,
        '--event-intensity': presentation.eventIntensity,
        '--alert-suppression': presentation.alertSuppression,
        '--citadel-heartbeat': telemetry.heartbeat ?? 0,
        '--forge-load': telemetry.forgeLoad ?? 0,
        '--archive-rate': telemetry.archiveRate ?? 0,
        '--sanctum-flow': telemetry.sanctumFlow ?? 0,
        '--watcher-sweep': telemetry.watcherSweep ?? 0,
        '--distribution-density': telemetry.distributionDensity ?? 0,
        '--citadel-life-opacity': 0.58 + (telemetry.heartbeat ?? 0) * 0.42,
        '--forge-life-opacity': 0.58 + (telemetry.forgeLoad ?? 0) * 0.42,
        '--archive-life-opacity': 0.52 + (telemetry.archiveRate ?? 0) * 0.48,
        '--sanctum-life-opacity': 0.52 + (telemetry.sanctumFlow ?? 0) * 0.48,
        '--watcher-life-opacity': 0.52 + (telemetry.watcherSweep ?? 0) * 0.48,
        '--citadel-cycle-duration': `${5.8 - (telemetry.distributionDensity ?? 0) * 2.2}s`,
        '--forge-cycle-duration': `${7 - (telemetry.forgeLoad ?? 0) * 3.5}s`,
        '--archive-cycle-duration': `${8 - (telemetry.archiveRate ?? 0) * 3.4}s`,
        '--sanctum-cycle-duration': `${10 - (telemetry.sanctumFlow ?? 0) * 3}s`,
        '--watcher-cycle-duration': `${7 - (telemetry.watcherSweep ?? 0) * 2.6}s`,
      }}
      aria-hidden="true"
    >
      <AtmosphereLayer presentation={presentation} />
      <PersistentWorldLifeLayer presentation={presentation} />
      <EnvironmentalVisualVerification verification={presentation.visualVerification} />
    </div>
    {debug === 'panel' ? <EnvironmentalDebugPanel presentation={presentation} /> : null}
  </>
}

export default memo(WorldEnvironmentalLife)
