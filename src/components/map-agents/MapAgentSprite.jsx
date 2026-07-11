import { memo } from 'react'
import { assertMapAgentAssetUrl, getMapAgentFrame, getMapAgentSpriteSet } from '../../world/data/mapAgentManifest.js'
import './MapAgentSprite.css'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
function getMapAgentZIndex(worldY) {
  return 2_000 + Math.round((Number(worldY) || 0) * 10)
}

function getMapAgentFacingScale(direction) {
  return ['west', 'left', 'sw', 'nw'].includes(String(direction).toLowerCase()) ? -1 : 1
}

function getAgentBob(visualState, frameIndex, animationPhase) {
  if (visualState === 'walk') return [0, -1.4, 0, -1][Math.abs(Number(frameIndex) || 0) % 4]
  if (visualState === 'idle') return Math.sin(clamp(Number(animationPhase) || 0, 0, 1) * Math.PI * 2) * 0.55
  if (visualState === 'work') return Math.sin(clamp(Number(animationPhase) || 0, 0, 1) * Math.PI * 2) * 0.8
  return 0
}

function statusSymbol(visualState, severity, signalState) {
  if (signalState === 'success') return '✦'
  if (visualState === 'blocked' || ['critical', 'error'].includes(severity)) return '!'
  if (visualState === 'alert' || severity === 'warning') return '!'
  return ''
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
  onSelect,
  frameIndex = 0,
  animationPhase = 0,
  carryPackage = false,
  hidden = false,
  label,
  lod = 'standard',
}) {
  const set = getMapAgentSpriteSet(profileId)
  const normalizedState = set.frames[visualState] ? visualState : 'idle'
  const src = assertMapAgentAssetUrl(getMapAgentFrame(profileId, normalizedState, frameIndex), `MapAgentSprite.${profileId}`)
  const renderSize = set.renderHeight * set.scale * clamp(Number(baseScale) || 1, 0.65, 1.45)
  const anchoredHeight = renderSize * set.canvas.footAnchorY
  const transparentTail = renderSize - anchoredHeight
  const facingScale = getMapAgentFacingScale(direction)
  const bob = getAgentBob(normalizedState, frameIndex, animationPhase)
  const marker = statusSymbol(normalizedState, severity, signalState)
  const className = [
    'map-agent-sprite',
    `is-${normalizedState}`,
    `severity-${severity}`,
    `signal-${signalState}`,
    `lod-${lod}`,
    selected ? 'is-selected' : '',
    hidden ? 'is-inside' : '',
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
      '--map-agent-bob': `${bob}px`,
      '--map-agent-world-x': `${clamp(Number(worldX) || 0, -10, 110)}cqw`,
      '--map-agent-world-y': `${clamp(Number(worldY) || 0, -10, 110)}cqh`,
    }}
    data-profile-id={profileId}
    data-visual-state={normalizedState}
    data-direction={direction}
    data-signal-state={signalState}
    data-world-x={Number(worldX).toFixed(3)}
    data-world-y={Number(worldY).toFixed(3)}
    data-foot-anchor={`${set.canvas.footAnchorX},${set.canvas.footAnchorY}`}
    data-lod={lod}
    data-map-agent-src={src}
    aria-label={label ?? `Agent ${profileId}`}
    aria-pressed={selected}
    onClick={onSelect}
  >
    <span className="map-agent-sprite__shadow" aria-hidden="true" />
    <span className="map-agent-sprite__motion" aria-hidden="true">
      <img className="map-agent-sprite__image" src={src} alt="" draggable={false} />
      {carryPackage ? <span className="map-agent-sprite__package" /> : null}
    </span>
    {marker ? <span className="map-agent-sprite__marker" aria-hidden="true">{marker}</span> : null}
  </button>
}

export default memo(MapAgentSprite)
