// Identity layer for the existing fortress composition. This never moves a
// building or changes a route: renderers can add these calm, readable Hermes
// signals over the approved map art.
const freeze = (value) => Object.freeze(value)

export const HERMES_BUILDING_IDENTITY = freeze({
  keep: freeze({ name: 'Hermes Core', core: 'azure-prism', effects: freeze(['core-pulse', 'command-runes']) }),
  library: freeze({ name: 'Knowledge Archive', core: 'memory-crystal', effects: freeze(['archive-window-glow', 'page-runes']) }),
  forge: freeze({ name: 'AI Forge', core: 'amber-blue-heart', effects: freeze(['forge-sparks', 'heat-smoke', 'data-coil']) }),
  'research-lab': freeze({ name: 'Model Observatory', core: 'orbital-crystal', effects: freeze(['lens-rotation', 'constellation-runes']) }),
  'memory-hall': freeze({ name: 'Vector Vault', core: 'vault-crystal', effects: freeze(['memory-lattice', 'quiet-pulse']) }),
  warehouse: freeze({ name: 'Artifact Store', core: 'sealed-cell', effects: freeze(['package-runes']) }),
  observatory: freeze({ name: 'Observability Spire', core: 'signal-crystal', effects: freeze(['telemetry-beacon', 'skyward-rune']) }),
  'api-port': freeze({ name: 'API Docks', core: 'dock-glyph', effects: freeze(['request-lanterns', 'water-energy-flow']) }),
  'webhook-post': freeze({ name: 'Webhook Relay', core: 'relay-crystal', effects: freeze(['message-sigil', 'courier-pulse']) }),
  'agent-camp': freeze({ name: 'Agent Quarters', core: 'rest-lantern', effects: freeze(['warm-windows']) }),
  clocktower: freeze({ name: 'Chronos Tower', core: 'time-dial', effects: freeze(['cron-chime', 'schedule-rune']) }),
})

export const HERMES_ENERGY_CONDUITS = freeze([
  freeze({ id: 'core-archive', from: 'keep', to: 'library', kind: 'knowledge', color: '#63D6FF', intensity: 'quiet' }),
  freeze({ id: 'core-forge', from: 'keep', to: 'forge', kind: 'execution', color: '#76BFFF', intensity: 'active' }),
  freeze({ id: 'archive-vault', from: 'library', to: 'memory-hall', kind: 'memory', color: '#9AA8FF', intensity: 'quiet' }),
  freeze({ id: 'core-observatory', from: 'keep', to: 'observatory', kind: 'telemetry', color: '#68E0F0', intensity: 'quiet' }),
  freeze({ id: 'relay-docks', from: 'webhook-post', to: 'api-port', kind: 'messages', color: '#5BC7EE', intensity: 'active' }),
])

export const HERMES_STATE_SIGNALS = freeze({
  healthy: freeze({ crystal: 'steady', runeOpacity: 0.28, conduitSpeed: 0.35 }),
  warning: freeze({ crystal: 'attention', runeOpacity: 0.5, conduitSpeed: 0.55 }),
  critical: freeze({ crystal: 'urgent', runeOpacity: 0.78, conduitSpeed: 0.82 }),
})

export function getHermesBuildingIdentity(id) {
  return HERMES_BUILDING_IDENTITY[id] ?? null
}
