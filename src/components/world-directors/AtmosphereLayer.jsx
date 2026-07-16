import { memo } from 'react'

function AtmosphereLayer({ presentation }) {
  return <div className="atmosphere-life-layer" aria-hidden="true" data-atmosphere-bands={presentation.atmosphereBandCount}>
    <div className="telemetry-weather-layer">
      <i className="telemetry-weather-grade" />
      <i className="telemetry-cloud telemetry-cloud--primary" />
      <i className="telemetry-cloud telemetry-cloud--secondary" />
    </div>
    <i className="atmosphere-fog" />
    <i className="atmosphere-fog atmosphere-fog--lower" />
  </div>
}

export default memo(AtmosphereLayer)
