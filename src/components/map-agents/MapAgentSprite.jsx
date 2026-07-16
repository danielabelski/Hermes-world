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

function getAgentMotionPose(visualState, frameIndex, animationPhase, isMoving) {
  if (visualState === 'walk' && isMoving) {
    const index = Math.abs(Number(frameIndex) || 0) % 4
    return {
      bob: [0, -1.15, 0, -0.92][index],
      sway: [-0.42, -0.08, 0.42, 0.08][index],
      lean: [-0.72, -0.18, 0.72, 0.18][index],
      shadowCompression: [1.04, 0.9, 1.04, 0.92][index],
      shadowShift: [-0.34, -0.08, 0.34, 0.08][index],
    }
  }
  const phase = clamp(Number(animationPhase) || 0, 0, 1) * Math.PI * 2
  if (visualState === 'idle') return { bob: Math.sin(phase) * 0.16, sway: 0, lean: 0, shadowCompression: 1, shadowShift: 0 }
  if (visualState === 'work') return { bob: Math.sin(phase) * 0.2, sway: 0, lean: 0, shadowCompression: 1, shadowShift: 0 }
  return { bob: 0, sway: 0, lean: 0, shadowCompression: 1, shadowShift: 0 }
}

function MapAgentSprite({
  profileId,
  visualState = 'idle',
  direction = 'se',
  worldX = 50,
  worldY = 50,
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
  const motionPose = getAgentMotionPose(normalizedState, frameIndex, animationPhase, isMoving)
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
      '--map-agent-facing': facingScale,
      '--map-agent-bob': `${motionPose.bob}px`,
      '--map-agent-step-x': `${motionPose.sway}px`,
      '--map-agent-step-lean': `${motionPose.lean}deg`,
      '--map-agent-shadow-step': motionPose.shadowCompression,
      '--map-agent-shadow-shift': `${motionPose.shadowShift}px`,
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
