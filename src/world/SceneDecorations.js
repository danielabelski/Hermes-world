/**
 * Renderer-neutral decoration catalogue for the Hermes Citadel.
 *
 * It deliberately contains no Pixi imports: a Canvas renderer, a future Tiled
 * renderer, and test fixtures can all consume the same visual language. Every
 * descriptor uses world coordinates, an explicit depth, and a quality floor.
 */

export const DECORATION_QUALITY = Object.freeze({
  low: 0,
  medium: 1,
  high: 2,
})

export const CITADEL_PALETTE = Object.freeze({
  wallStone: '#717365',
  wallShadow: '#3A443D',
  warmWood: '#7B5637',
  bannerBurgundy: '#743448',
  bannerGold: '#D7AE5A',
  evergreen: '#315943',
  evergreenLight: '#4F7A54',
  lanternGlow: '#F3C766',
  iron: '#263730',
})

const depthAt = (y, offset = 0) => 1000 + Math.round(y * 10) + offset

const point = (x, y) => Object.freeze({ x, y })

const freezeRoute = (route) => Object.freeze(route.map(([x, y]) => point(x, y)))

const decoration = (id, type, x, y, options = {}) => Object.freeze({
  id,
  type,
  position: point(x, y),
  zIndex: options.zIndex ?? depthAt(y),
  quality: options.quality ?? 'low',
  variant: options.variant ?? 'default',
  palette: options.palette ?? CITADEL_PALETTE,
  scale: options.scale ?? 1,
  animated: Boolean(options.animated),
  interaction: 'none',
  ...(options.route ? { route: freezeRoute(options.route) } : {}),
  ...(options.from ? { from: point(...options.from) } : {}),
  ...(options.to ? { to: point(...options.to) } : {}),
  ...(options.rotation == null ? {} : { rotation: options.rotation }),
  ...(options.width == null ? {} : { width: options.width }),
  ...(options.length == null ? {} : { length: options.length }),
  ...(options.routeId ? { routeId: options.routeId } : {}),
  ...(options.buildingId ? { buildingId: options.buildingId } : {}),
  ...(options.role ? { role: options.role } : {}),
})

/**
 * A road is a renderer-neutral strip. The endpoints and the derived midpoint
 * are kept so a Canvas renderer can draw a line today and a Tiled renderer can
 * consume the route tomorrow. Keeping roads as descriptors (instead of Pixi
 * Graphics) also makes them easy to test and to cull on mobile.
 */
export const road = (id, from, to, options = {}) => {
  const midpointX = (from[0] + to[0]) / 2
  const midpointY = (from[1] + to[1]) / 2
  const length = Math.hypot(to[0] - from[0], to[1] - from[1])
  const rotation = Math.atan2(to[1] - from[1], to[0] - from[0])
  return decoration(id, 'road', midpointX, midpointY, {
    ...options,
    from,
    to,
    length,
    rotation,
    width: options.width ?? 28,
    zIndex: options.zIndex ?? depthAt(midpointY, -220),
  })
}

function wallRun(prefix, from, to, count, variant = 'straight') {
  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0 : index / (count - 1)
    const x = from.x + (to.x - from.x) * progress
    const y = from.y + (to.y - from.y) * progress
    return decoration(`${prefix}-${index + 1}`, 'wall-segment', x, y, {
      variant,
      zIndex: depthAt(y, -260),
      scale: 1,
    })
  })
}

export const OUTER_WALLS = Object.freeze([
  ...wallRun('north-wall', { x: -500, y: -318 }, { x: 500, y: -318 }, 9),
  ...wallRun('west-wall', { x: -526, y: -265 }, { x: -526, y: 315 }, 6, 'angled-left'),
  ...wallRun('east-wall', { x: 526, y: -265 }, { x: 526, y: 315 }, 6, 'angled-right'),
  ...wallRun('south-wall-left', { x: -500, y: 344 }, { x: -128, y: 344 }, 4),
  ...wallRun('south-wall-right', { x: 128, y: 344 }, { x: 500, y: 344 }, 4),
  decoration('main-gate', 'gate', 0, 344, { zIndex: depthAt(344, -250), variant: 'double-door', scale: 1.15 }),
  decoration('northwest-tower', 'wall-tower', -520, -314, { zIndex: depthAt(-314, -240), variant: 'round' }),
  decoration('northeast-tower', 'wall-tower', 520, -314, { zIndex: depthAt(-314, -240), variant: 'round' }),
  decoration('southwest-tower', 'wall-tower', -520, 336, { zIndex: depthAt(336, -240), variant: 'round' }),
  decoration('southeast-tower', 'wall-tower', 520, 336, { zIndex: depthAt(336, -240), variant: 'round' }),
])

export const CITADEL_FLAGS = Object.freeze([
  decoration('keep-standard', 'flag', 0, -247, { zIndex: depthAt(-247, 30), variant: 'hermes-standard', scale: 1.2, animated: true, quality: 'medium' }),
  decoration('forge-pennant', 'flag', 224, -48, { zIndex: depthAt(-48, 30), variant: 'forge', animated: true, quality: 'high' }),
  decoration('library-pennant', 'flag', -224, -48, { zIndex: depthAt(-48, 30), variant: 'library', animated: true, quality: 'high' }),
  decoration('gate-standard-left', 'flag', -112, 301, { zIndex: depthAt(301, 30), variant: 'gate', animated: true, quality: 'medium' }),
  decoration('gate-standard-right', 'flag', 112, 301, { zIndex: depthAt(301, 30), variant: 'gate', animated: true, quality: 'medium' }),
])

// Backward-compatible aliases for the first vertical-slice renderer.
export const FLAGS = CITADEL_FLAGS

export const CITADEL_TREES = Object.freeze([
  [-438, -208, 'tall'], [-370, -166, 'round'], [-326, 221, 'tall'], [-425, 254, 'round'],
  [427, -209, 'round'], [348, -158, 'tall'], [403, 238, 'tall'], [322, 265, 'round'],
  [-266, 291, 'small'], [273, 290, 'small'], [-322, -248, 'small'], [337, -250, 'small'],
].map(([x, y, variant], index) => decoration(`tree-${index + 1}`, 'tree', x, y, {
  zIndex: depthAt(y, -20),
  variant,
  scale: variant === 'small' ? 0.72 : 1,
  quality: index < 8 ? 'low' : 'medium',
})))

export const TREES = CITADEL_TREES

export const CITADEL_LANTERNS = Object.freeze([
  [-92, 92], [92, 92], [-168, 175], [168, 175], [-67, 286], [67, 286],
].map(([x, y], index) => decoration(`lantern-${index + 1}`, 'lantern', x, y, {
  zIndex: depthAt(y, 80),
  variant: index < 2 ? 'plaza' : 'roadside',
  animated: true,
  quality: 'medium',
})))

export const LANTERNS = CITADEL_LANTERNS

const DETAILS = Object.freeze([
  decoration('forge-woodpile', 'prop', 264, 56, { zIndex: depthAt(56, 10), variant: 'woodpile', quality: 'high' }),
  decoration('library-books', 'prop', -262, 46, { zIndex: depthAt(46, 10), variant: 'book-crate', quality: 'high' }),
  decoration('plaza-bench-left', 'prop', -91, 65, { zIndex: depthAt(65, 10), variant: 'bench', quality: 'high' }),
  decoration('plaza-bench-right', 'prop', 91, 65, { zIndex: depthAt(65, 10), variant: 'bench', quality: 'high' }),
])

/**
 * Main circulation routes for the complete world. Coordinates are in the
 * same pixel-like world space as the map anchors, not screen coordinates.
 * Every road has a stable routeId so agents can use it for deterministic
 * patrols and future pathfinding without coupling this data to PixiJS.
 */
export const CITADEL_ROADS = Object.freeze([
  road('road-processional-gate-plaza', [0, 302], [0, 112], { routeId: 'processional', variant: 'flagstone', width: 42 }),
  road('road-processional-plaza-keep', [0, 112], [0, -182], { routeId: 'processional', variant: 'flagstone', width: 42 }),
  road('road-plaza-west', [-355, 76], [0, 76], { routeId: 'plaza-crossing', variant: 'flagstone', width: 34 }),
  road('road-plaza-east', [0, 76], [355, 76], { routeId: 'plaza-crossing', variant: 'flagstone', width: 34 }),
  road('road-west-upper', [-355, 76], [-350, -178], { routeId: 'west-avenue', variant: 'cobble', width: 30 }),
  road('road-west-lower', [-355, 76], [-350, 288], { routeId: 'west-avenue', variant: 'cobble', width: 30 }),
  road('road-east-upper', [355, 76], [350, -178], { routeId: 'east-avenue', variant: 'cobble', width: 30 }),
  road('road-east-lower', [355, 76], [350, 278], { routeId: 'east-avenue', variant: 'cobble', width: 30 }),
  road('road-library-keep', [-222, -34], [0, -182], { routeId: 'library-keep', variant: 'cobble', width: 26 }),
  road('road-keep-forge', [0, -182], [222, -34], { routeId: 'keep-forge', variant: 'cobble', width: 26 }),
  road('road-forge-inspection', [222, -34], [0, 146], { routeId: 'forge-inspection', variant: 'cobble', width: 24 }),
  road('road-inspection-assay', [0, 146], [270, 146], { routeId: 'inspection-assay', variant: 'cobble', width: 24 }),
  road('road-builders-clock', [-265, 284], [0, 284], { routeId: 'builders-clock', variant: 'gravel', width: 28 }),
  road('road-clock-barracks', [0, 284], [274, 262], { routeId: 'clock-barracks', variant: 'gravel', width: 28 }),
  road('road-clock-siege', [0, 284], [0, 330], { routeId: 'clock-siege', variant: 'gravel', width: 26 }),
  road('road-watchtower-yard', [-402, 272], [-265, 284], { routeId: 'watchtower-yard', variant: 'gravel', width: 22 }),
  road('road-scout-keep', [-365, -210], [0, -182], { routeId: 'scout-keep', variant: 'cobble', width: 22 }),
  road('road-keep-herald', [0, -182], [365, -210], { routeId: 'keep-herald', variant: 'cobble', width: 22 }),
])

/**
 * Canonical landmark anchors for every service building in the world. These
 * are intentionally separate from building sprites: a renderer can place a
 * placeholder now and swap in authored art later without changing gameplay
 * coordinates or agent routes.
 */
export const CITADEL_LANDMARKS = Object.freeze([
  decoration('landmark-scout-lodge', 'landmark', -365, -210, { buildingId: 'scout-lodge', role: 'building-anchor', variant: 'scout-lodge', quality: 'low' }),
  decoration('landmark-keep', 'landmark', 0, -210, { buildingId: 'keep', role: 'building-anchor', variant: 'keep', quality: 'low' }),
  decoration('landmark-herald-tower', 'landmark', 365, -210, { buildingId: 'herald-tower', role: 'building-anchor', variant: 'herald-tower', quality: 'low' }),
  decoration('landmark-library', 'landmark', -222, -34, { buildingId: 'library', role: 'building-anchor', variant: 'library', quality: 'low' }),
  decoration('landmark-fountain', 'landmark', 0, 34, { buildingId: 'fountain', role: 'health-source', variant: 'fountain', quality: 'low', animated: true }),
  decoration('landmark-alchemist-lab', 'landmark', 222, -34, { buildingId: 'alchemist-lab', role: 'building-anchor', variant: 'alchemist-lab', quality: 'low' }),
  decoration('landmark-forge', 'landmark', -270, 146, { buildingId: 'forge', role: 'building-anchor', variant: 'forge', quality: 'low' }),
  decoration('landmark-inspection-hall', 'landmark', 0, 146, { buildingId: 'inspection-hall', role: 'building-anchor', variant: 'inspection-hall', quality: 'low' }),
  decoration('landmark-assay-office', 'landmark', 270, 146, { buildingId: 'assay-office', role: 'building-anchor', variant: 'assay-office', quality: 'low' }),
  decoration('landmark-builders-yard', 'landmark', -265, 284, { buildingId: 'builders-yard', role: 'building-anchor', variant: 'builders-yard', quality: 'low' }),
  decoration('landmark-clock-tower', 'landmark', 0, 284, { buildingId: 'clock-tower', role: 'cron-source', variant: 'clock-tower', quality: 'low', animated: true }),
  decoration('landmark-barracks', 'landmark', 274, 262, { buildingId: 'barracks', role: 'building-anchor', variant: 'barracks', quality: 'low' }),
  decoration('landmark-siege-workshop', 'landmark', 0, 330, { buildingId: 'siege-workshop', role: 'building-anchor', variant: 'siege-workshop', quality: 'low' }),
  decoration('landmark-watchtower', 'landmark', -402, 272, { buildingId: 'watchtower', role: 'building-anchor', variant: 'watchtower', quality: 'low' }),
  decoration('landmark-main-gate', 'landmark', 0, 302, { role: 'entry-point', variant: 'main-gate', quality: 'low' }),
  decoration('landmark-token-river', 'landmark', 120, 105, { role: 'token-flow', variant: 'token-river', quality: 'medium', animated: true }),
  decoration('landmark-model-crystals', 'landmark', 170, -146, { role: 'model-sources', variant: 'crystal-garden', quality: 'medium', animated: true }),
  decoration('landmark-health-garden', 'landmark', -110, 35, { role: 'health-signal', variant: 'health-garden', quality: 'medium', animated: true }),
])

export const SCENE_DECORATIONS = Object.freeze([
  ...OUTER_WALLS,
  ...CITADEL_ROADS,
  ...CITADEL_LANDMARKS,
  ...CITADEL_FLAGS,
  ...CITADEL_TREES,
  ...CITADEL_LANTERNS,
  ...DETAILS,
])

/**
 * Returns an ordered, immutable list for the selected device budget.
 * A low tier retains walls and trees for spatial legibility; higher tiers add
 * animation and small props, never core system information.
 */
export function getSceneDecorations(quality = 'high') {
  const ceiling = DECORATION_QUALITY[quality] ?? DECORATION_QUALITY.high
  return SCENE_DECORATIONS
    .filter((item) => DECORATION_QUALITY[item.quality] <= ceiling)
    .slice()
    .sort((first, second) => first.zIndex - second.zIndex)
}
