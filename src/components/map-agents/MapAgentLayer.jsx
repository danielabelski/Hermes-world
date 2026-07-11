import { memo } from 'react'
import { assertMapAgentManifestSeparation } from '../../world/data/mapAgentManifest.js'
import MapAgentSprite from './MapAgentSprite.jsx'
import { getMapAgentLod, selectMapAgentRenderSet } from '../../world/mapAgentRenderPolicy.js'

assertMapAgentManifestSeparation()

function MapAgentLayer({
  presentations = [],
  selectedId = null,
  onSelect,
  shouldSuppressSelection,
  animationNow = 0,
}) {
  const sorted = selectMapAgentRenderSet(
    presentations.filter((model) => Number.isFinite(Number(model?.worldX)) && Number.isFinite(Number(model?.worldY))),
    selectedId,
  )

  return <div
    className="map-agent-layer"
    data-map-agent-count={sorted.length}
    data-culled-count={Math.max(0, presentations.length - sorted.length)}
    data-inside-count={sorted.filter((model) => model.isInside).length}
    aria-label="Agenci na mapie"
  >
    {sorted.map((model, index) => {
      const cycleMs = model.walkCycleMs ?? (model.profileId === 'coder' ? 720 : model.profileId === 'prospecting' ? 520 : 620)
      const stagger = index * 43
      const frameIndex = model.frameIndex ?? Math.floor((animationNow + stagger) / Math.max(120, cycleMs / 4)) % 4
      const animationPhase = ((animationNow + stagger) % Math.max(900, model.idleCycleMs ?? 3_600)) / Math.max(900, model.idleCycleMs ?? 3_600)
      return <MapAgentSprite
        key={model.profileId}
        profileId={model.profileId}
        visualState={model.visualState}
        direction={model.direction}
        worldX={model.worldX}
        worldY={model.worldY}
        baseScale={model.baseScale}
        selected={selectedId === model.profileId}
        severity={model.severity}
        signalState={model.signalState}
        frameIndex={frameIndex}
        animationPhase={animationPhase}
        carryPackage={model.carryPackage}
        hidden={model.isInside}
        label={model.label}
        lod={getMapAgentLod(model, selectedId)}
        onSelect={(event) => {
          if (shouldSuppressSelection?.()) {
            event.preventDefault()
            return
          }
          onSelect?.(model.profileId, event)
        }}
      />
    })}
  </div>
}

export default memo(MapAgentLayer)
