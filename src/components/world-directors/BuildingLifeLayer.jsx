import { memo } from 'react'
import { ENVIRONMENT_BUILDINGS, getEnvironmentalBuildingState } from '../../world/directors/environmentalDirector.js'

function BuildingLifeLayer({ presentation }) {
  return <div className="building-life-layer" aria-hidden="true">
    {Object.values(ENVIRONMENT_BUILDINGS).filter((config) => config.enabled).map((config) => {
      const point = config.points[presentation.layout]
      const state = getEnvironmentalBuildingState(config.buildingId, presentation)
      const responseCue = state.response?.cue ?? 'none'
      return <div
        className={`building-life building-life--${config.buildingId}${state.ambientActive ? ' is-ambient-active' : ''}${state.response ? ' has-event-response' : ''}`}
        data-environment-building={config.buildingId}
        data-environment-mode={state.response ? 'event' : state.ambientActive ? 'ambient' : 'rest'}
        data-response-cue={responseCue}
        data-evidence-event-id={state.response?.evidenceEventId ?? ''}
        key={config.buildingId}
        style={{ '--building-x': `${point.x}%`, '--building-y': `${point.y}%`, '--building-intensity': config.intensity, '--building-offset': `${config.timingOffset}s` }}
      >
        <i className="building-life__core" />
        <i className="building-life__wave" />
        <i className="building-life__mechanism" />
        <span className="building-life__particles"><b /><b /><b /></span>
      </div>
    })}
  </div>
}

export default memo(BuildingLifeLayer)
