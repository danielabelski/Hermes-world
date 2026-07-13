import { memo } from 'react'

function AtmosphereLayer({ presentation }) {
  return <div className="atmosphere-life-layer" aria-hidden="true" data-particle-budget={presentation.particleCount}>
    <i className="atmosphere-fog" />
    <i className="atmosphere-fog atmosphere-fog--lower" />
  </div>
}

export default memo(AtmosphereLayer)
