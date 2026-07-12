import { memo } from 'react'
import AtmosphereLayer from './AtmosphereLayer.jsx'
import BuildingLifeLayer from './BuildingLifeLayer.jsx'
import DataPulseLayer from './DataPulseLayer.jsx'
import EnvironmentalDebugPanel from './EnvironmentalDebugPanel.jsx'
import EnvironmentalVisualVerification from './EnvironmentalVisualVerification.jsx'
import './WorldEnvironmentalLife.css'

function WorldEnvironmentalLife({ presentation, debug = 'off' }) {
  return <>
    <div
      className={`world-environmental-life layout-${presentation.layout}${presentation.entryActive ? ' is-entry-active' : ''}${presentation.visible ? '' : ' is-paused'}`}
      data-environment-director={presentation.running ? 'running' : 'stopped'}
      data-environment-response={presentation.response?.cue ?? 'none'}
      data-environment-intensity={presentation.ambientIntensity}
      data-visual-effect={presentation.visualVerification?.id ?? 'none'}
      style={{ '--environment-intensity': presentation.ambientIntensity }}
      aria-hidden="true"
    >
      <AtmosphereLayer presentation={presentation} />
      <BuildingLifeLayer presentation={presentation} />
      <DataPulseLayer presentation={presentation} />
      <EnvironmentalVisualVerification verification={presentation.visualVerification} />
    </div>
    {debug === 'panel' ? <EnvironmentalDebugPanel presentation={presentation} /> : null}
  </>
}

export default memo(WorldEnvironmentalLife)
