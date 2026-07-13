import { memo } from 'react'

function AtmosphereLayer({ presentation }) {
  return <div className="atmosphere-life-layer" aria-hidden="true" data-atmosphere-bands={presentation.atmosphereBandCount}>
    <div className="atmosphere-cloud-shadows">
      <i className="atmosphere-cloud-shadow atmosphere-cloud-shadow--primary" />
    </div>
    <i className="atmosphere-fog" />
    <i className="atmosphere-fog atmosphere-fog--lower" />
  </div>
}

export default memo(AtmosphereLayer)
