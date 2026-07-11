/**
 * Art-direction contract for character sprites. This is deliberately asset
 * neutral: a 48px pixel sheet, HD skeletal rig, or procedural Pixi character
 * can all consume the same silhouette, palette and layer ordering.
 */

const freeze = Object.freeze;

const layers = (...items) => freeze(items.map((item, order) => freeze({ order, ...item })));

const character = ({
  id, role, cloak, tunic, metal, skin, tool, stance, silhouette, ornament,
  walkStyle = 'grounded', workGesture = 'craft', idleGesture = 'breathe',
}) => freeze({
  id,
  role,
  palette: freeze({ cloak, tunic, metal, skin, outline: '#1C2631', highlight: '#F4E7BF' }),
  tool: freeze(tool),
  stance,
  silhouette: freeze(silhouette),
  ornament: freeze(ornament),
  animation: freeze({ walkStyle, workGesture, idleGesture }),
  // Back-to-front keeps each role legible at tiny mobile sizes. Renderers may
  // omit low-priority layers in LOD, but never cloak, headwear or tool.
  layers: layers(
    { id: 'shadow', essential: false, lod: 'full' },
    { id: 'legs', essential: true, lod: 'simplified' },
    { id: 'body', essential: true, lod: 'simplified' },
    { id: 'cloak', essential: true, lod: 'simplified' },
    { id: 'headwear', essential: true, lod: 'simplified' },
    { id: 'face', essential: false, lod: 'full' },
    { id: 'tool', essential: true, lod: 'simplified' },
    { id: 'ornament', essential: false, lod: 'full' },
    { id: 'state-effect', essential: false, lod: 'full' },
  ),
  sprite: freeze({
    atlasKey: `agents/${id}`,
    baseFrame: `${id}/idle/0`,
    logicalFrame: freeze({ width: 48, height: 64, anchorX: 0.5, anchorY: 0.84 }),
    hdFrame: freeze({ width: 192, height: 256, anchorX: 0.5, anchorY: 0.84 }),
    states: freeze(['idle', 'walking', 'working', 'thinking', 'success', 'error', 'sleeping']),
  }),
});

export const AGENT_ART_DEFINITIONS = freeze({
  default: character({
    id: 'default', role: 'page', cloak: '#567A5B', tunic: '#D3B45E', metal: '#9DA9AA', skin: '#D9A56F',
    tool: { id: 'tool-bag', carry: 'side', silhouette: 'satchel-square', accent: '#C58446' },
    stance: 'forward-leaning-runner', silhouette: { body: 'small', headwear: 'soft-cap', profile: 'bag-forward' }, ornament: { id: 'package-seal', placement: 'belt' }, walkStyle: 'quick-step', workGesture: 'handoff',
  }),
  coder: character({
    id: 'coder', role: 'blacksmith', cloak: '#8A3630', tunic: '#4D3430', metal: '#D5D8D5', skin: '#C88E5B',
    tool: { id: 'hammer', carry: 'shoulder', silhouette: 'hammer-wide', accent: '#F2A957' },
    stance: 'broad-shouldered', silhouette: { body: 'wide', headwear: 'leather-apron', profile: 'hammer-up' }, ornament: { id: 'anvil-charm', placement: 'belt' }, workGesture: 'hammer-strike', idleGesture: 'wipe-brow',
  }),
  developer: character({
    id: 'developer', role: 'master-builder', cloak: '#B78339', tunic: '#735236', metal: '#C5D4D2', skin: '#D59F6A',
    tool: { id: 'plans-and-square', carry: 'front', silhouette: 'blueprint-wide', accent: '#E8DCA1' },
    stance: 'upright-surveyor', silhouette: { body: 'medium', headwear: 'yellow-hood', profile: 'plans-forward' }, ornament: { id: 'measuring-cord', placement: 'shoulder' }, workGesture: 'measure-point',
  }),
  devops: character({
    id: 'devops', role: 'siege-engineer', cloak: '#567B91', tunic: '#374B5B', metal: '#A9C3C7', skin: '#BF895C',
    tool: { id: 'wrench-and-oilcan', carry: 'low', silhouette: 'wrench-hook', accent: '#84C2C1' },
    stance: 'mechanical-hunch', silhouette: { body: 'medium', headwear: 'goggle-cap', profile: 'wrench-side' }, ornament: { id: 'gear-pack', placement: 'back' }, workGesture: 'turn-crank', idleGesture: 'adjust-goggles',
  }),
  komandos: character({
    id: 'komandos', role: 'champion', cloak: '#305F4B', tunic: '#6C7E66', metal: '#D9E1DC', skin: '#B88355',
    tool: { id: 'sword-and-shield', carry: 'ready', silhouette: 'shield-triangle', accent: '#C5D77C' },
    stance: 'heroic-wide', silhouette: { body: 'wide', headwear: 'closed-helmet', profile: 'shield-left' }, ornament: { id: 'rank-plume', placement: 'helmet' }, walkStyle: 'march', workGesture: 'sprint-guard',
  }),
  orchestrator: character({
    id: 'orchestrator', role: 'castellan', cloak: '#7B3147', tunic: '#4B3142', metal: '#D7B75D', skin: '#D4A16A',
    tool: { id: 'staff-and-seal', carry: 'upright', silhouette: 'staff-tall', accent: '#F0D27A' },
    stance: 'commanding', silhouette: { body: 'tall', headwear: 'circlet', profile: 'staff-vertical' }, ornament: { id: 'wax-seal', placement: 'staff-top' }, walkStyle: 'measured', workGesture: 'map-command', idleGesture: 'staff-rest',
  }),
  outreach: character({
    id: 'outreach', role: 'herald', cloak: '#A64F6C', tunic: '#57354F', metal: '#D7B774', skin: '#D39A63',
    tool: { id: 'trumpet-and-scroll', carry: 'shoulder', silhouette: 'trumpet-long', accent: '#E8A4A7' },
    stance: 'open-chested', silhouette: { body: 'medium', headwear: 'feathered-cap', profile: 'trumpet-forward' }, ornament: { id: 'scroll-ribbon', placement: 'belt' }, workGesture: 'announce', idleGesture: 'scroll-check',
  }),
  prospecting: character({
    id: 'prospecting', role: 'scout', cloak: '#416E56', tunic: '#4F6041', metal: '#AFC0A3', skin: '#C68F5B',
    tool: { id: 'spyglass-and-map', carry: 'front', silhouette: 'spyglass-long', accent: '#B8D879' },
    stance: 'light-footed', silhouette: { body: 'slim', headwear: 'hood', profile: 'spyglass-up' }, ornament: { id: 'map-case', placement: 'back' }, walkStyle: 'scout-run', workGesture: 'scan-horizon',
  }),
  researcher: character({
    id: 'researcher', role: 'scholar', cloak: '#526EB3', tunic: '#414D77', metal: '#BFCBEC', skin: '#D1A06D',
    tool: { id: 'quill-and-book', carry: 'front', silhouette: 'book-square', accent: '#9FAFEF' },
    stance: 'bookish-hunch', silhouette: { body: 'medium', headwear: 'scholar-hat', profile: 'book-open' }, ornament: { id: 'ink-flask', placement: 'belt' }, walkStyle: 'careful-step', workGesture: 'write-flip', idleGesture: 'read',
  }),
  reviewer: character({
    id: 'reviewer', role: 'inspector', cloak: '#926347', tunic: '#5D453C', metal: '#D2B783', skin: '#D19C6B',
    tool: { id: 'magnifier-and-seal', carry: 'front', silhouette: 'magnifier-circle', accent: '#E4C474' },
    stance: 'precise-lean', silhouette: { body: 'medium', headwear: 'brimmed-cap', profile: 'lens-forward' }, ornament: { id: 'seal-stamp', placement: 'belt' }, workGesture: 'inspect-stamp',
  }),
  synthesizer: character({
    id: 'synthesizer', role: 'alchemist', cloak: '#7C4B9E', tunic: '#41334F', metal: '#D2B8E6', skin: '#C99066',
    tool: { id: 'retort-and-vial', carry: 'front', silhouette: 'vial-round', accent: '#D974E1' },
    stance: 'flowing-robes', silhouette: { body: 'tall', headwear: 'alchemist-hood', profile: 'vial-raised' }, ornament: { id: 'potion-belt', placement: 'waist' }, walkStyle: 'glide', workGesture: 'mix-pour', idleGesture: 'vial-check',
  }),
  verifier: character({
    id: 'verifier', role: 'assayer', cloak: '#377F80', tunic: '#315255', metal: '#B8DDD3', skin: '#C89462',
    tool: { id: 'scale-and-monocle', carry: 'front', silhouette: 'scale-wide', accent: '#74D1C1' },
    stance: 'balanced', silhouette: { body: 'medium', headwear: 'monocle-cap', profile: 'scales-forward' }, ornament: { id: 'weight-pouch', placement: 'belt' }, workGesture: 'weigh-inspect',
  }),
});

export const AGENT_ART_IDS = freeze(Object.keys(AGENT_ART_DEFINITIONS));

export function getAgentArtDefinition(profile) {
  return AGENT_ART_DEFINITIONS[profile] ?? AGENT_ART_DEFINITIONS.default;
}

