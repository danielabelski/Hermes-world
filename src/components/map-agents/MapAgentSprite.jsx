import { memo, useState } from 'react'
import { assertMapAgentAssetUrl, getMapAgentFrame, getMapAgentSpriteSet } from '../../world/data/mapAgentManifest.js'
import { getMapAgentProfile } from '../../world/data/mapAgentProfiles.js'
import { resolveMapAgentStatusMarker } from '../../world/mapAgentStatusGrammar.js'
import './MapAgentSprite.css'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
function getMapAgentZIndex(worldY) {
  return 2_000 + Math.round((Number(worldY) || 0) * 10)
}

function getMapAgentFacingScale(direction) {
  return ['west', 'left', 'sw', 'nw'].includes(String(direction).toLowerCase()) ? -1 : 1
}

function getTravelVector(direction) {
  const vectors = {
    ne: { x: 0.78, y: -0.42 }, nw: { x: -0.78, y: -0.42 },
    se: { x: 0.78, y: 0.42 }, sw: { x: -0.78, y: 0.42 },
    east: { x: 1, y: 0 }, right: { x: 1, y: 0 },
    west: { x: -1, y: 0 }, left: { x: -1, y: 0 },
  }
  return vectors[String(direction).toLowerCase()] ?? vectors.se
}

function getAgentMotionPose(visualState, frameIndex, animationPhase, isMoving, direction) {
  if (visualState === 'walk' && isMoving) {
    const index = Math.abs(Number(frameIndex) || 0) % 4
    const travel = getTravelVector(direction)
    const footPlant = [-0.56, 0.2, -0.56, 0.2][index]
    return {
      bob: [0.12, -1.52, 0.12, -1.25][index],
      sway: [-0.54, -0.1, 0.54, 0.1][index],
      strideX: travel.x * footPlant,
      strideY: travel.y * footPlant,
      lean: [-1.02, -0.22, 1.02, 0.22][index],
      scaleX: [1.012, 0.994, 1.012, 0.996][index],
      scaleY: [0.986, 1.012, 0.986, 1.008][index],
      shadowCompression: [1.08, 0.86, 1.08, 0.89][index],
      shadowShift: [-0.42, -0.08, 0.42, 0.08][index],
      shadowOpacity: [1, 0.72, 1, 0.76][index],
    }
  }
  const phase = clamp(Number(animationPhase) || 0, 0, 1) * Math.PI * 2
  const still = { sway: 0, strideX: 0, strideY: 0, lean: 0, scaleX: 1, scaleY: 1, shadowCompression: 1, shadowShift: 0, shadowOpacity: 1 }
  if (visualState === 'idle') return { ...still, bob: Math.sin(phase) * 0.16 }
  if (visualState === 'work') return { ...still, bob: Math.sin(phase) * 0.2 }
  return { ...still, bob: 0 }
}

function MapAgentSprite({
  profileId,
  visualState = 'idle',
  direction = 'se',
  worldX = 50,
  worldY = 50,
  crowdLaneOffset = { x: 0, y: 0 },
  baseScale = 1,
  selected = false,
  severity = 'none',
  signalState = 'none',
  isMoving = visualState === 'walk',
  onSelect,
  frameIndex = 0,
  animationPhase = 0,
  carryPackage = false,
  hidden = false,
  label,
  lod = 'standard',
  presentationSource = 'operational',
  choreographyState = null,
  ambientState = null,
  evidenceEventId = null,
  fetchPriority = 'auto',
  renderSurface = 'map',
}) {
  const [assetReady, setAssetReady] = useState(false)
  const profile = getMapAgentProfile(profileId)
  const set = getMapAgentSpriteSet(profile.spriteProfile)
  const normalizedState = set.frames[visualState] ? visualState : 'idle'
  const src = assertMapAgentAssetUrl(getMapAgentFrame(profile.spriteProfile, normalizedState, frameIndex), `MapAgentSprite.${profileId}`)
  const renderSize = set.renderHeight * set.scale * profile.renderScale * clamp(Number(baseScale) || 1, 0.65, 1.45)
  const anchoredHeight = renderSize * set.canvas.footAnchorY
  const transparentTail = renderSize - anchoredHeight
  const facingScale = getMapAgentFacingScale(direction)
  const motionPose = getAgentMotionPose(normalizedState, frameIndex, animationPhase, isMoving, direction)
  const statusMarker = resolveMapAgentStatusMarker({ visualState: normalizedState, severity, signalState })
  const mapTone = renderSurface === 'map' ? profile.mapTone : null
  const markerContentTop = renderSize * (profile.markerContentTopByState[normalizedState] ?? (12 / 128))
  const className = [
    'map-agent-sprite',
    `is-${normalizedState}`,
    `severity-${severity}`,
    `signal-${signalState}`,
    isMoving ? 'is-moving' : '',
    `lod-${lod}`,
    selected ? 'is-selected' : '',
    hidden ? 'is-inside' : '',
    assetReady ? 'is-asset-ready' : 'is-asset-pending',
    'visual-normalized',
  ].filter(Boolean).join(' ')

  return <button
    type="button"
    className={className}
    style={{
      width: `${renderSize}px`,
      height: `${anchoredHeight}px`,
      zIndex: getMapAgentZIndex(worldY),
      '--map-agent-canvas': `${renderSize}px`,
      '--map-agent-tail': `${transparentTail}px`,
      '--map-agent-foot-origin': `${set.canvas.footAnchorY * 100}%`,
      '--map-agent-facing': facingScale,
      '--map-agent-bob': `${motionPose.bob}px`,
      '--map-agent-step-x': `${motionPose.sway}px`,
      '--map-agent-stride-x': `${motionPose.strideX}px`,
      '--map-agent-stride-y': `${motionPose.strideY}px`,
      '--map-agent-step-lean': `${motionPose.lean}deg`,
      '--map-agent-step-scale-x': motionPose.scaleX,
      '--map-agent-step-scale-y': motionPose.scaleY,
      '--map-agent-shadow-step': motionPose.shadowCompression,
      '--map-agent-shadow-shift': `${motionPose.shadowShift}px`,
      '--map-agent-shadow-opacity': motionPose.shadowOpacity,
      '--map-agent-accent': profile.accent,
      '--map-agent-anchor-y-offset': `${profile.anchorCorrection.yPx}px`,
      '--map-agent-shadow-scale': profile.shadowScale,
      '--map-agent-content-top': `${markerContentTop}px`,
      '--agent-saturation': mapTone?.saturation,
      '--agent-contrast': mapTone?.contrast,
      '--agent-brightness': mapTone?.brightness,
      '--agent-edge-radius': mapTone?.edgeRadiusPx != null ? `${mapTone.edgeRadiusPx}px` : undefined,
      '--agent-edge-color': mapTone?.edgeColor,
      '--map-agent-world-x': `${clamp(Number(worldX) || 0, -10, 110)}cqw`,
      '--map-agent-world-y': `${clamp(Number(worldY) || 0, -10, 110)}cqh`,
      '--map-agent-lane-x': `${Number(crowdLaneOffset.x) || 0}px`,
      '--map-agent-lane-y': `${Number(crowdLaneOffset.y) || 0}px`,
    }}
    data-profile-id={profileId}
    data-behavior-type={profile.behaviorType}
    data-sprite-profile={profile.spriteProfile}
    data-fallback={profile.isFallback ? 'true' : 'false'}
    data-visual-state={normalizedState}
    data-direction={direction}
    data-signal-state={signalState}
    data-world-x={Number(worldX).toFixed(3)}
    data-world-y={Number(worldY).toFixed(3)}
    data-crowd-lane={`${Number(crowdLaneOffset.x) || 0},${Number(crowdLaneOffset.y) || 0}`}
    data-foot-anchor={`${set.canvas.footAnchorX},${set.canvas.footAnchorY}`}
    data-lod={lod}
    data-map-agent-src={src}
    data-visual-mode="production"
    data-render-surface={renderSurface}
    data-asset-ready={assetReady ? 'true' : 'false'}
    data-status-marker={statusMarker?.tone ?? 'none'}
    data-presentation-source={presentationSource ?? 'operational'}
    data-choreography-state={choreographyState ?? 'none'}
    data-ambient-state={ambientState ?? 'none'}
    data-evidence-event-id={evidenceEventId ?? ''}
    aria-label={label ?? `Agent ${profileId}`}
    aria-pressed={selected}
    onClick={onSelect}
  >
    <span className="map-agent-sprite__shadow" aria-hidden="true" />
    <span className="map-agent-sprite__state-ring" aria-hidden="true" />
    <span className="map-agent-sprite__motion" aria-hidden="true">
      <img className="map-agent-sprite__image" src={src} alt="" draggable={false} loading="eager" decoding="async" fetchPriority={fetchPriority} onLoad={() => setAssetReady(true)} />
      {carryPackage ? <span className="map-agent-sprite__package" /> : null}
    </span>
    {statusMarker ? <span className={`map-agent-sprite__marker marker-${statusMarker.tone}`} aria-hidden="true">{statusMarker.symbol}</span> : null}
  </button>
}

export default memo(MapAgentSprite)
