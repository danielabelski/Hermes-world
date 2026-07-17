import { memo } from 'react'
import { assertMapAgentManifestSeparation } from '../../world/data/mapAgentManifest.js'
import MapAgentSprite from './MapAgentSprite.jsx'
import { getMapAgentLod, selectMapAgentRenderSet } from '../../world/mapAgentRenderPolicy.js'
import { resolveMapAgentCrowdLaneOffset } from '../../world/mapAgentCrowdLanes.js'

assertMapAgentManifestSeparation()

function getWalkFrameIndex(elapsedMs, cycleMs) {
  const phase = ((elapsedMs % cycleMs) + cycleMs) % cycleMs / cycleMs
  if (phase < 0.28) return 0
  if (phase < 0.5) return 1
  if (phase < 0.78) return 2
  return 3
}

function MapAgentLayer({
  presentations = [],
  selectedId = null,
  onSelect,
  shouldSuppressSelection,
  animationNow = 0,
  animationEnabled = true,
  layer = 'ground',
}) {
  const sorted = selectMapAgentRenderSet(
    presentations.filter((model) => !model.isInside && Number.isFinite(Number(model?.worldX)) && Number.isFinite(Number(model?.worldY))),
    selectedId,
  )

  return <div
    className={`map-agent-layer map-agent-layer--${layer}`}
    data-map-agent-count={sorted.length}
    data-culled-count={Math.max(0, presentations.length - sorted.length)}
    data-inside-count={presentations.filter((model) => model.isInside).length}
    aria-label="Agenci na mapie"
  >
    {sorted.map((model, index) => {
      const crowdLaneOffset = resolveMapAgentCrowdLaneOffset(model, sorted)
      const cycleMs = model.walkCycleMs ?? (model.profileId === 'coder' ? 720 : model.profileId === 'prospecting' ? 520 : 620)
      const stagger = index * 43
      const frameIndex = animationEnabled
        ? model.frameIndex ?? (model.isMoving
          ? getWalkFrameIndex(animationNow + stagger, Math.max(480, cycleMs))
          : Math.floor((animationNow + stagger) / Math.max(120, cycleMs / 4)) % 4)
        : 0
      const animationPhase = animationEnabled
        ? ((animationNow + stagger) % Math.max(900, model.idleCycleMs ?? 3_600)) / Math.max(900, model.idleCycleMs ?? 3_600)
        : 0
      return <MapAgentSprite
        key={model.profileId}
        profileId={model.profileId}
        visualState={model.visualState}
        direction={model.direction}
        worldX={model.worldX}
        worldY={model.worldY}
        crowdLaneOffset={crowdLaneOffset}
        baseScale={model.baseScale}
        selected={selectedId === model.profileId}
        severity={model.severity}
        signalState={model.signalState}
        isMoving={model.isMoving}
        frameIndex={frameIndex}
        animationPhase={animationPhase}
        carryPackage={model.carryPackage}
        hidden={model.isInside}
        label={model.label}
        presentationSource={model.presentationSource}
        choreographyState={model.choreographyState}
        ambientState={model.ambientState}
        evidenceEventId={model.evidenceEventId}
        lod={getMapAgentLod(model, selectedId)}
        fetchPriority={index < 12 ? 'high' : 'auto'}
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
