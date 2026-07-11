/**
 * Renderer-neutral ambient schedule for the Hermes world.
 *
 * The local clock controls atmosphere only. It must never be used as a
 * proxy for CPU, memory, health, or agent activity; those signals still come
 * from Hermes API data. A renderer may consume this file for light, ambience,
 * and gentle timing without importing PixiJS or React.
 */

const freeze = Object.freeze

const lighting = ({ sky, horizon, ground, shadow, sun, lantern, stars, cloudOpacity }) => freeze({
  sky,
  horizon,
  ground,
  shadow,
  sun,
  lantern,
  stars,
  cloudOpacity,
})

const phase = ({ id, startHour, endHour, lighting: light, effects }) => freeze({
  id,
  startHour,
  endHour,
  lighting: light,
  effects: freeze(effects),
})

/** Six gently transitioning periods, expressed in local-clock hours. */
export const LIGHTING_CYCLE = freeze([
  phase({
    id: 'night',
    startHour: 0,
    endHour: 5.5,
    lighting: lighting({ sky: '#111B2D', horizon: '#263752', ground: '#1D2D2B', shadow: '#0B141A', sun: 0.04, lantern: 0.94, stars: 0.9, cloudOpacity: 0.12 }),
    effects: ['stars', 'lantern-breath', 'fireflies', 'quiet-crickets'],
  }),
  phase({
    id: 'dawn',
    startHour: 5.5,
    endHour: 8,
    lighting: lighting({ sky: '#394965', horizon: '#CC896C', ground: '#3B5045', shadow: '#26342F', sun: 0.46, lantern: 0.72, stars: 0.16, cloudOpacity: 0.2 }),
    effects: ['dawn-motes', 'bird-call', 'banner-wave', 'lantern-fade'],
  }),
  phase({
    id: 'morning',
    startHour: 8,
    endHour: 11,
    lighting: lighting({ sky: '#6B8DA0', horizon: '#D6B277', ground: '#52644C', shadow: '#35423A', sun: 0.78, lantern: 0.2, stars: 0, cloudOpacity: 0.24 }),
    effects: ['bird-flight', 'banner-wave', 'fountain-glint', 'dust-motes'],
  }),
  phase({
    id: 'day',
    startHour: 11,
    endHour: 16,
    lighting: lighting({ sky: '#7EA6B0', horizon: '#E2C686', ground: '#5D6C4D', shadow: '#3E4A3B', sun: 1, lantern: 0.08, stars: 0, cloudOpacity: 0.3 }),
    effects: ['banner-wave', 'fountain-glint', 'dust-motes', 'distant-bell'],
  }),
  phase({
    id: 'afternoon',
    startHour: 16,
    endHour: 18.5,
    lighting: lighting({ sky: '#6E8995', horizon: '#D39A6C', ground: '#536048', shadow: '#3B4437', sun: 0.73, lantern: 0.26, stars: 0, cloudOpacity: 0.27 }),
    effects: ['long-shadows', 'banner-wave', 'fountain-glint', 'dust-motes'],
  }),
  phase({
    id: 'dusk',
    startHour: 18.5,
    endHour: 21,
    lighting: lighting({ sky: '#343D61', horizon: '#A56061', ground: '#35443D', shadow: '#222B2B', sun: 0.28, lantern: 0.78, stars: 0.42, cloudOpacity: 0.22 }),
    effects: ['fireflies', 'lantern-light', 'bird-return', 'banner-wave'],
  }),
  phase({
    id: 'late-night',
    startHour: 21,
    endHour: 24,
    lighting: lighting({ sky: '#111B2D', horizon: '#263752', ground: '#1D2D2B', shadow: '#0B141A', sun: 0.04, lantern: 0.94, stars: 0.9, cloudOpacity: 0.12 }),
    effects: ['stars', 'lantern-breath', 'fireflies', 'quiet-crickets'],
  }),
])

// Public alias with a name that reads naturally at call sites.
export const AMBIENT_SCHEDULE = LIGHTING_CYCLE

/** Ambient effects describe what may be rendered, not what the system is doing. */
export const AMBIENT_EFFECTS = freeze({
  stars: freeze({ id: 'stars', kind: 'particles', cadenceMs: 18000, maxInstances: 28, motion: 'drift', intensity: 0.82 }),
  'dawn-motes': freeze({ id: 'dawn-motes', kind: 'particles', cadenceMs: 9200, maxInstances: 20, motion: 'rise', intensity: 0.28 }),
  'dust-motes': freeze({ id: 'dust-motes', kind: 'particles', cadenceMs: 7800, maxInstances: 14, motion: 'float', intensity: 0.16 }),
  'bird-call': freeze({ id: 'bird-call', kind: 'sound-cue', cadenceMs: 26000, maxInstances: 1, motion: 'none', intensity: 0.16 }),
  'bird-flight': freeze({ id: 'bird-flight', kind: 'sprite-loop', cadenceMs: 24000, maxInstances: 2, motion: 'arc', intensity: 0.3 }),
  'bird-return': freeze({ id: 'bird-return', kind: 'sprite-loop', cadenceMs: 30000, maxInstances: 2, motion: 'arc', intensity: 0.22 }),
  'banner-wave': freeze({ id: 'banner-wave', kind: 'animation', cadenceMs: 3400, maxInstances: 12, motion: 'sway', intensity: 0.36 }),
  'fountain-glint': freeze({ id: 'fountain-glint', kind: 'particles', cadenceMs: 4600, maxInstances: 8, motion: 'sparkle', intensity: 0.42 }),
  'lantern-fade': freeze({ id: 'lantern-fade', kind: 'animation', cadenceMs: 5200, maxInstances: 12, motion: 'breathe', intensity: 0.54 }),
  'lantern-light': freeze({ id: 'lantern-light', kind: 'animation', cadenceMs: 3200, maxInstances: 12, motion: 'breathe', intensity: 0.86 }),
  'lantern-breath': freeze({ id: 'lantern-breath', kind: 'animation', cadenceMs: 3900, maxInstances: 12, motion: 'breathe', intensity: 0.68 }),
  fireflies: freeze({ id: 'fireflies', kind: 'particles', cadenceMs: 12600, maxInstances: 18, motion: 'wander', intensity: 0.34 }),
  'quiet-crickets': freeze({ id: 'quiet-crickets', kind: 'sound-cue', cadenceMs: 28000, maxInstances: 1, motion: 'none', intensity: 0.12 }),
  'distant-bell': freeze({ id: 'distant-bell', kind: 'sound-cue', cadenceMs: 42000, maxInstances: 1, motion: 'none', intensity: 0.14 }),
  'long-shadows': freeze({ id: 'long-shadows', kind: 'lighting', cadenceMs: 7600, maxInstances: 1, motion: 'rotate', intensity: 0.3 }),
})

/**
 * Deliberately slow timings keep the interface alive without turning it into
 * a noisy game loop. Operational alerts and real API changes have their own
 * urgency and must not be delayed by this ambience policy.
 */
export const CALM_TECH_TIMINGS = freeze({
  phaseTransitionMs: 2400,
  ambientCrossfadeMs: 1800,
  bannerWaveMs: 3400,
  lanternBreathMs: 3900,
  fountainGlintMs: 4600,
  smokeLoopMs: 5200,
  idleCharacterBreathMs: 4100,
  decorationCullingMs: 100,
  ambientEventJitterMs: 1100,
  alertVisualHoldMs: 4600,
  weatherTransitionMs: 1800,
  minimumEffectGapMs: 900,
})

const normalizeHour = (value) => {
  const hour = Number(value)
  if (!Number.isFinite(hour)) return 12
  return ((hour % 24) + 24) % 24
}

export function getAmbientHour(input = new Date()) {
  if (input instanceof Date) return normalizeHour(input.getHours() + input.getMinutes() / 60 + input.getSeconds() / 3600)
  return normalizeHour(input)
}

export function getAmbientPhase(input = new Date()) {
  const hour = getAmbientHour(input)
  return LIGHTING_CYCLE.find(({ startHour, endHour }) => hour >= startHour && hour < endHour) ?? LIGHTING_CYCLE[0]
}

export function getAmbientEffects(input = new Date(), { reducedMotion = false } = {}) {
  const currentPhase = getAmbientPhase(input)
  return currentPhase.effects
    .map((effectId) => AMBIENT_EFFECTS[effectId])
    .filter(Boolean)
    .map((effect) => (reducedMotion ? { ...effect, maxInstances: 0, intensity: 0, enabled: false } : { ...effect, enabled: true }))
}

export function getNextPhaseBoundary(input = new Date()) {
  const hour = getAmbientHour(input)
  const current = getAmbientPhase(hour)
  const hoursUntilBoundary = current.endHour > hour ? current.endHour - hour : 24 - hour + current.endHour
  return { phase: current.id, hoursUntilBoundary, millisecondsUntilBoundary: Math.round(hoursUntilBoundary * 60 * 60 * 1000) }
}

