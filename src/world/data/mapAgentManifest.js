import { isAgentPortraitAssetUrl } from './agentPortraitAssets.js'

export const MAP_AGENT_CANVAS = Object.freeze({
  width: 128,
  height: 128,
  footAnchorX: 0.5,
  footAnchorY: 0.96875,
  renderHeight: 56,
})

const frame = (root, name) => `${root}/${name}.webp`

const spriteSet = ({ profile, directory, renderHeight = MAP_AGENT_CANVAS.renderHeight, scale = 1 }) => {
  const root = `/map-agents/${directory}`
  const idle = frame(root, 'idle-se')
  const work = frame(root, 'work-se')
  const alert = frame(root, 'alert-se')
  return Object.freeze({
    profile,
    directory,
    canvas: MAP_AGENT_CANVAS,
    renderHeight,
    scale,
    frames: Object.freeze({
      idle: Object.freeze([idle]),
      walk: Object.freeze([
        frame(root, 'walk-se-a'),
        frame(root, 'walk-se-a-pass'),
        frame(root, 'walk-se-b'),
        frame(root, 'walk-se-b-pass'),
      ]),
      work: Object.freeze([work]),
      thinking: Object.freeze([frame(root, 'observe-se')]),
      waiting: Object.freeze([idle]),
      observe: Object.freeze([frame(root, 'observe-se')]),
      alert: Object.freeze([alert]),
      blocked: Object.freeze([alert]),
      stuck: Object.freeze([alert]),
      success: Object.freeze([frame(root, 'success-se')]),
      offline: Object.freeze([idle]),
    }),
  })
}

const FALLBACK_SPRITE_SET = spriteSet({
  profile: 'fallback',
  directory: 'fallback',
  renderHeight: 54,
  scale: 0.94,
})

export const MAP_AGENT_MANIFEST = Object.freeze({
  default: spriteSet({ profile: 'default', directory: 'default', renderHeight: 54, scale: 1 }),
  coder: spriteSet({ profile: 'coder', directory: 'coder', renderHeight: 56, scale: 1.05 }),
  developer: spriteSet({ profile: 'developer', directory: 'developer', renderHeight: 56, scale: 1 }),
  devops: spriteSet({ profile: 'devops', directory: 'devops', renderHeight: 56, scale: 1 }),
  komandos: spriteSet({ profile: 'komandos', directory: 'komandos', renderHeight: 56, scale: 1 }),
  orchestrator: spriteSet({ profile: 'orchestrator', directory: 'orchestrator', renderHeight: 56, scale: 1 }),
  outreach: spriteSet({ profile: 'outreach', directory: 'outreach', renderHeight: 56, scale: 1 }),
  prospecting: spriteSet({ profile: 'prospecting', directory: 'prospecting', renderHeight: 56, scale: 0.96 }),
  researcher: spriteSet({ profile: 'researcher', directory: 'researcher', renderHeight: 56, scale: 1 }),
  reviewer: spriteSet({ profile: 'reviewer', directory: 'reviewer', renderHeight: 56, scale: 1 }),
  synthesizer: spriteSet({ profile: 'synthesizer', directory: 'synthesizer', renderHeight: 56, scale: 1 }),
  verifier: spriteSet({ profile: 'verifier', directory: 'verifier', renderHeight: 56, scale: 1 }),
  fallback: FALLBACK_SPRITE_SET,
})

export function assertMapAgentAssetUrl(url, context = 'MapAgentLayer') {
  if (isAgentPortraitAssetUrl(url)) {
    throw new Error(`${context} rejected UI portrait asset: ${url}`)
  }
  if (!String(url ?? '').startsWith('/map-agents/')) {
    throw new Error(`${context} requires a /map-agents/ asset: ${url}`)
  }
  return url
}

export function assertMapAgentManifestSeparation(manifest = MAP_AGENT_MANIFEST) {
  Object.values(manifest).forEach((set) => {
    Object.values(set.frames).flat().forEach((url) => assertMapAgentAssetUrl(url, `mapAgentManifest.${set.profile}`))
  })
  return true
}

export function getMapAgentSpriteSet(profile) {
  return MAP_AGENT_MANIFEST[profile] ?? FALLBACK_SPRITE_SET
}

export function getMapAgentFrame(profile, visualState = 'idle', frameIndex = 0) {
  const set = getMapAgentSpriteSet(profile)
  const frames = set.frames[visualState] ?? set.frames.idle
  const index = Math.abs(Number(frameIndex) || 0) % frames.length
  return assertMapAgentAssetUrl(frames[index])
}

// Cheap, deterministic development guard. It also runs in Node validators,
// where Vite's import.meta.env is unavailable.
assertMapAgentManifestSeparation()
