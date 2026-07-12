import { memo } from 'react'
import './WorldEnvironmentalLife.css'

function WorldEnvironmentalLife({ layout = 'desktop' }) {
  return <div className={`world-environmental-life layout-${layout}`} aria-hidden="true">
    <i className="environment-runes"><b /><b /><b /></i>
    <i className="environment-lights"><b /><b /><b /><b /></i>
    <i className="environment-path-signals"><b /><b /><b /></i>
  </div>
}

export default memo(WorldEnvironmentalLife)
