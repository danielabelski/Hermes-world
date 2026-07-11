/**
 * Renderer-neutral visual registry for the 14 service buildings in the
 * Hermes living world. Each entry owns its palette, silhouette vocabulary,
 * and four explicit runtime states. Pixi, SVG previews, Tiled, and tests can
 * consume this registry without importing a renderer or inventing colours.
 */

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

const palette = ({ stone, roof, trim, shadow, accent, window, banner }) => ({
  stone,
  roof,
  trim,
  shadow,
  accent,
  window,
  banner,
  ground: '#2B3A32',
})

const silhouette = ({ footprint, roofShape, roofSections = 1, towers = 0, chimneys = 0, height = 'medium', details = [] }) => ({
  footprint,
  roof: { shape: roofShape, sections: roofSections },
  towers,
  chimneys,
  height,
  details,
})

const stateVisuals = (colors, options = {}) => ({
  normal: {
    state: 'normal',
    bodyTint: colors.stone,
    accentTint: colors.accent,
    glow: 0,
    smoke: 0,
    pulse: false,
    shake: 0,
    badge: null,
    animation: 'ambient',
    ...options.normal,
  },
  active: {
    state: 'active',
    bodyTint: colors.stone,
    accentTint: colors.accent,
    glow: 0.34,
    smoke: 0,
    pulse: true,
    shake: 0,
    badge: null,
    animation: 'working',
    ...options.active,
  },
  warning: {
    state: 'warning',
    bodyTint: colors.stone,
    accentTint: '#D59A3A',
    glow: 0.28,
    smoke: 0.2,
    pulse: true,
    shake: 0.06,
    badge: 'warning',
    animation: 'alert',
    ...options.warning,
  },
  error: {
    state: 'error',
    bodyTint: colors.shadow,
    accentTint: '#D94F4F',
    glow: 0.5,
    smoke: 0.78,
    pulse: true,
    shake: 0.16,
    badge: 'error',
    animation: 'fault',
    ...options.error,
  },
})

const building = ({ id, title, kind, palette: colors, silhouette: shape, agentProfile = null, states }) => ({
  id,
  title,
  kind,
  agentProfile,
  palette: colors,
  silhouette: shape,
  states: stateVisuals(colors, states),
})

const paletteByBuilding = {
  scout: palette({ stone: '#657A63', roof: '#314C42', trim: '#B5C179', shadow: '#273E36', accent: '#79A76D', window: '#C9D98C', banner: '#5D8A65' }),
  keep: palette({ stone: '#8A6A45', roof: '#5B2734', trim: '#D9B35B', shadow: '#3A2A27', accent: '#E4C66E', window: '#F0D68A', banner: '#7D3348' }),
  herald: palette({ stone: '#826070', roof: '#4C314D', trim: '#D98B9A', shadow: '#322738', accent: '#D36D87', window: '#F2B5B7', banner: '#A34563' }),
  library: palette({ stone: '#586B83', roof: '#303D62', trim: '#9AA9D9', shadow: '#27334D', accent: '#8292D4', window: '#C4D5F0', banner: '#536AB0' }),
  fountain: palette({ stone: '#5F929A', roof: '#37616B', trim: '#A9E2D5', shadow: '#27464C', accent: '#79D0C1', window: '#CCF4E6', banner: '#4EA89E' }),
  alchemy: palette({ stone: '#765C8A', roof: '#432F56', trim: '#C39DDF', shadow: '#2E223D', accent: '#C276E0', window: '#E9C9F4', banner: '#8B54AC' }),
  forge: palette({ stone: '#805B47', roof: '#652B2B', trim: '#D38B55', shadow: '#3C2928', accent: '#E67E43', window: '#F6BE63', banner: '#A93D34' }),
  inspection: palette({ stone: '#876D58', roof: '#554033', trim: '#D4B579', shadow: '#3D302B', accent: '#D9A958', window: '#F2D28A', banner: '#9B6A3D' }),
  assay: palette({ stone: '#4C8583', roof: '#275A5C', trim: '#9DD2C3', shadow: '#203C43', accent: '#66C1B1', window: '#C7EEDF', banner: '#3D8C83' }),
  builders: palette({ stone: '#96734A', roof: '#62452F', trim: '#D6B267', shadow: '#3F3027', accent: '#D2A453', window: '#F3D18A', banner: '#A16D35' }),
  clock: palette({ stone: '#66728B', roof: '#39445F', trim: '#B4BED2', shadow: '#2D364E', accent: '#93A5CA', window: '#D5E4F0', banner: '#596F9E' }),
  barracks: palette({ stone: '#587A62', roof: '#2E4F3E', trim: '#A2C58C', shadow: '#263D34', accent: '#78B26D', window: '#D4E7B0', banner: '#497D58' }),
  siege: palette({ stone: '#667783', roof: '#384750', trim: '#A5B9C1', shadow: '#29383F', accent: '#82A8AE', window: '#C9E4E4', banner: '#527B83' }),
  watch: palette({ stone: '#71805D', roof: '#394D3C', trim: '#B8C47A', shadow: '#2D3E33', accent: '#83AA67', window: '#D7E49B', banner: '#5F8F5D' }),
}

export const BUILDING_VISUAL_VARIANTS = deepFreeze({
  'scout-lodge': building({
    id: 'scout-lodge', title: 'Chata Zwiadowcy', kind: 'lodge', agentProfile: 'prospecting', palette: paletteByBuilding.scout,
    silhouette: silhouette({ footprint: 'compact', roofShape: 'gabled', height: 'low', details: ['lookout-post', 'map-board'] }),
  }),
  keep: building({
    id: 'keep', title: 'Zamek Główny', kind: 'keep', agentProfile: 'orchestrator', palette: paletteByBuilding.keep,
    silhouette: silhouette({ footprint: 'wide', roofShape: 'castle', roofSections: 3, towers: 2, height: 'tall', details: ['central-keep', 'standard', 'command-balcony'] }),
    states: { active: { glow: 0.46, animation: 'command' }, error: { smoke: 0.58 } },
  }),
  'herald-tower': building({
    id: 'herald-tower', title: 'Wieża Herolda', kind: 'tower', agentProfile: 'outreach', palette: paletteByBuilding.herald,
    silhouette: silhouette({ footprint: 'slender', roofShape: 'conical', height: 'tall', details: ['trumpet-balcony', 'scroll-rack'] }),
  }),
  library: building({
    id: 'library', title: 'Biblioteka', kind: 'library', agentProfile: 'researcher', palette: paletteByBuilding.library,
    silhouette: silhouette({ footprint: 'wide', roofShape: 'gabled', roofSections: 2, height: 'medium', details: ['arched-window', 'book-wing'] }),
  }),
  fountain: building({
    id: 'fountain', title: 'Fontanna Zdrowia', kind: 'fountain', palette: paletteByBuilding.fountain,
    silhouette: silhouette({ footprint: 'round', roofShape: 'open', height: 'low', details: ['water-basin', 'health-glow'] }),
    states: { active: { glow: 0.6, animation: 'flow' }, warning: { accentTint: '#D59A3A', smoke: 0.04 }, error: { smoke: 0.12 } },
  }),
  'alchemist-lab': building({
    id: 'alchemist-lab', title: 'Laboratorium Alchemika', kind: 'lab', agentProfile: 'synthesizer', palette: paletteByBuilding.alchemy,
    silhouette: silhouette({ footprint: 'compact', roofShape: 'domed', towers: 1, chimneys: 2, height: 'medium', details: ['retort-window', 'copper-pipes'] }),
    states: { active: { glow: 0.56, animation: 'bubbling' } },
  }),
  forge: building({
    id: 'forge', title: 'Kuźnia', kind: 'forge', agentProfile: 'coder', palette: paletteByBuilding.forge,
    silhouette: silhouette({ footprint: 'wide', roofShape: 'gabled', chimneys: 2, height: 'medium', details: ['open-bay', 'anvil', 'chimney'] }),
    states: { active: { glow: 0.64, animation: 'sparks' } },
  }),
  'inspection-hall': building({
    id: 'inspection-hall', title: 'Sala Inspekcyjna', kind: 'hall', agentProfile: 'reviewer', palette: paletteByBuilding.inspection,
    silhouette: silhouette({ footprint: 'wide', roofShape: 'hipped', height: 'medium', details: ['seal-arch', 'inspection-table'] }),
  }),
  'assay-office': building({
    id: 'assay-office', title: 'Urząd Probierczy', kind: 'office', agentProfile: 'verifier', palette: paletteByBuilding.assay,
    silhouette: silhouette({ footprint: 'compact', roofShape: 'hipped', height: 'low', details: ['scale-window', 'monocle-sign'] }),
  }),
  'builders-yard': building({
    id: 'builders-yard', title: 'Plac Budowy', kind: 'yard', agentProfile: 'developer', palette: paletteByBuilding.builders,
    silhouette: silhouette({ footprint: 'open', roofShape: 'shed', height: 'low', details: ['scaffolding', 'lumber-stack', 'blueprints'] }),
    states: { active: { glow: 0.38, animation: 'building' } },
  }),
  'clock-tower': building({
    id: 'clock-tower', title: 'Wieża Zegarowa', kind: 'clock-tower', palette: paletteByBuilding.clock,
    silhouette: silhouette({ footprint: 'slender', roofShape: 'pyramidal', towers: 1, height: 'tall', details: ['clock-face', 'bell', 'cron-window'] }),
    states: { active: { glow: 0.48, animation: 'ringing' }, error: { smoke: 0.62, animation: 'alarm' } },
  }),
  barracks: building({
    id: 'barracks', title: 'Koszary', kind: 'barracks', agentProfile: 'komandos', palette: paletteByBuilding.barracks,
    silhouette: silhouette({ footprint: 'wide', roofShape: 'gabled', roofSections: 2, height: 'medium', details: ['training-yard', 'shield-rack'] }),
  }),
  'siege-workshop': building({
    id: 'siege-workshop', title: 'Warsztat Oblężniczy', kind: 'workshop', agentProfile: 'devops', palette: paletteByBuilding.siege,
    silhouette: silhouette({ footprint: 'wide', roofShape: 'shed', chimneys: 1, height: 'medium', details: ['gear-wheel', 'crane', 'oil-barrel'] }),
  }),
  watchtower: building({
    id: 'watchtower', title: 'Wieża Wartownicza', kind: 'watchtower', agentProfile: 'default', palette: paletteByBuilding.watch,
    silhouette: silhouette({ footprint: 'compact', roofShape: 'conical', towers: 1, height: 'tall', details: ['signal-fire', 'patrol-platform'] }),
  }),
})

export const BUILDING_VISUAL_REGISTRY = BUILDING_VISUAL_VARIANTS
export const BUILDING_VISUAL_STATES = deepFreeze({ normal: 'normal', active: 'active', warning: 'warning', error: 'error' })

export function getBuildingVisualVariant(buildingId, state = 'normal') {
  const variant = BUILDING_VISUAL_VARIANTS[buildingId] ?? BUILDING_VISUAL_VARIANTS.keep
  const resolvedState = BUILDING_VISUAL_STATES[state] ?? 'normal'
  return {
    ...variant,
    activeState: resolvedState,
    stateVisual: variant.states[resolvedState],
  }
}

export function getBuildingVisualState(buildingId, state = 'normal') {
  return getBuildingVisualVariant(buildingId, state).stateVisual
}

