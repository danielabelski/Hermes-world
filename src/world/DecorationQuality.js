/**
 * Renderer-neutral quality policy for the living-world decoration layer.
 *
 * This file intentionally does not change the number of agents, create a
 * simulation, or touch the Pixi renderer. It is a data contract that lets a
 * renderer choose an appropriate visual budget as the world grows from the
 * 12-agent demo to a 50- or 200-agent deployment.
 */

const freeze = Object.freeze

export const POPULATION_TIERS = freeze({
  demo: 12,
  expanded: 50,
  large: 200,
})

export const DECORATION_LOD = freeze({
  near: freeze({
    id: 'near',
    distance: 260,
    scale: 1,
    showSprite: true,
    showShadow: true,
    showAnimation: true,
    showLabel: true,
  }),
  mid: freeze({
    id: 'mid',
    distance: 620,
    scale: 0.82,
    showSprite: true,
    showShadow: true,
    showAnimation: false,
    showLabel: false,
  }),
  far: freeze({
    id: 'far',
    distance: 1100,
    scale: 0.62,
    showSprite: true,
    showShadow: false,
    showAnimation: false,
    showLabel: false,
  }),
  culled: freeze({
    id: 'culled',
    distance: Infinity,
    scale: 0,
    showSprite: false,
    showShadow: false,
    showAnimation: false,
    showLabel: false,
  }),
})

const baseCulling = freeze({
  enabled: true,
  viewportMargin: 128,
  updateHz: 10,
  useSpatialIndex: false,
  hideOffscreen: true,
})

const baseBudgets = freeze({
  maxVisibleDecorations: 220,
  maxAnimatedDecorations: 80,
  maxParticles: 180,
  maxLabelCount: 12,
})

const makeTier = ({
  id,
  maxAgents,
  targetFps,
  resolutionScale,
  decorationDensity,
  maxVisibleDecorations,
  maxAnimatedDecorations,
  maxParticles,
  maxLabelCount,
  viewportMargin,
  cullingHz,
  lodDistanceScale,
}) => freeze({
  id,
  maxAgents,
  targetFps,
  resolutionScale,
  decorationDensity,
  budgets: freeze({
    ...baseBudgets,
    maxVisibleDecorations,
    maxAnimatedDecorations,
    maxParticles,
    maxLabelCount,
  }),
  culling: freeze({
    ...baseCulling,
    viewportMargin,
    updateHz: cullingHz,
  }),
  lod: freeze({
    near: freeze({ ...DECORATION_LOD.near, distance: DECORATION_LOD.near.distance * lodDistanceScale }),
    mid: freeze({ ...DECORATION_LOD.mid, distance: DECORATION_LOD.mid.distance * lodDistanceScale }),
    far: freeze({ ...DECORATION_LOD.far, distance: DECORATION_LOD.far.distance * lodDistanceScale }),
    culled: DECORATION_LOD.culled,
  }),
})

/**
 * Budgets are deliberately conservative on mobile. A larger population does
 * not make core system signals disappear; it only lowers decoration density,
 * particle count and animation frequency around those signals.
 */
export const DECORATION_QUALITY_TIERS = freeze({
  demo: makeTier({
    id: 'demo-12',
    maxAgents: POPULATION_TIERS.demo,
    targetFps: 60,
    resolutionScale: 1,
    decorationDensity: 1,
    maxVisibleDecorations: 260,
    maxAnimatedDecorations: 96,
    maxParticles: 220,
    maxLabelCount: 16,
    viewportMargin: 160,
    cullingHz: 12,
    lodDistanceScale: 1,
  }),
  expanded: makeTier({
    id: 'expanded-50',
    maxAgents: POPULATION_TIERS.expanded,
    targetFps: 60,
    resolutionScale: 0.9,
    decorationDensity: 0.78,
    maxVisibleDecorations: 190,
    maxAnimatedDecorations: 64,
    maxParticles: 140,
    maxLabelCount: 10,
    viewportMargin: 128,
    cullingHz: 10,
    lodDistanceScale: 0.9,
  }),
  large: makeTier({
    id: 'large-200',
    maxAgents: POPULATION_TIERS.large,
    targetFps: 45,
    resolutionScale: 0.75,
    decorationDensity: 0.52,
    maxVisibleDecorations: 120,
    maxAnimatedDecorations: 32,
    maxParticles: 72,
    maxLabelCount: 6,
    viewportMargin: 96,
    cullingHz: 6,
    lodDistanceScale: 0.76,
  }),
})

// Alternative names make the contract easy to discover without coupling
// callers to the population terminology used by the product documents.
export const QUALITY_TIERS = DECORATION_QUALITY_TIERS

export const DECORATION_RENDER_METADATA = freeze({
  wall: freeze({ lod: 'far', cull: 'viewport', animated: false, critical: true }),
  'wall-segment': freeze({ lod: 'far', cull: 'viewport', animated: false, critical: true }),
  'wall-tower': freeze({ lod: 'mid', cull: 'viewport', animated: false, critical: true }),
  gate: freeze({ lod: 'mid', cull: 'viewport', animated: false, critical: true }),
  road: freeze({ lod: 'far', cull: 'viewport', animated: false, critical: true }),
  landmark: freeze({ lod: 'near', cull: 'viewport', animated: false, critical: true }),
  tree: freeze({ lod: 'mid', cull: 'viewport', animated: false, critical: false }),
  flag: freeze({ lod: 'mid', cull: 'viewport', animated: true, critical: false }),
  lantern: freeze({ lod: 'mid', cull: 'viewport', animated: true, critical: false }),
  prop: freeze({ lod: 'near', cull: 'viewport', animated: false, critical: false }),
  agent: freeze({ lod: 'near', cull: 'viewport', animated: true, critical: true }),
  package: freeze({ lod: 'near', cull: 'viewport', animated: true, critical: true }),
  weather: freeze({ lod: 'far', cull: 'screen', animated: true, critical: true }),
})

const TIER_ORDER = freeze(['demo', 'expanded', 'large'])

/** Resolve a population to the appropriate future-ready visual budget. */
export function getDecorationQualityTier(agentCount = 0) {
  const count = Number.isFinite(Number(agentCount)) ? Math.max(0, Number(agentCount)) : 0
  const key = TIER_ORDER.find((tier) => count <= DECORATION_QUALITY_TIERS[tier].maxAgents) ?? 'large'
  return DECORATION_QUALITY_TIERS[key]
}

/** Return metadata for a descriptor type, with a safe non-animated fallback. */
export function getDecorationRenderMetadata(type = 'prop') {
  return DECORATION_RENDER_METADATA[type] ?? DECORATION_RENDER_METADATA.prop
}

/**
 * Pure culling predicate for a future renderer. `distance` is world-space
 * distance from the camera focus and `viewport` is optional; no Pixi object is
 * required, so this remains usable in tests and a Tiled renderer.
 */
export function shouldCullDecoration({ distance = 0, type = 'prop', critical = false } = {}, tier = DECORATION_QUALITY_TIERS.demo) {
  if (critical || getDecorationRenderMetadata(type).critical) return false
  const boundedDistance = Math.max(0, Number(distance) || 0)
  return boundedDistance > tier.lod.far.distance
}

