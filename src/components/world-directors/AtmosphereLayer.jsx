import { memo } from 'react'

function AtmosphereLayer({ presentation }) {
  return <div className="atmosphere-life-layer" aria-hidden="true" data-particle-budget={presentation.particleCount}>
    <i className="atmosphere-cloud-shadow"><b /><b /></i>
    <i className="atmosphere-water"><b /><b /></i>
    <i className="atmosphere-forge-smoke"><b /><b /></i>
    <i className="atmosphere-fog" />
    <i className="atmosphere-wind-thread"><b /><b /><b /></i>
    <i className="atmosphere-road-reflection"><b /><b /></i>
  </div>
}

export default memo(AtmosphereLayer)
