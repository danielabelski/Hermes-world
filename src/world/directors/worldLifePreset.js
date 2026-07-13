export const WORLD_LIFE_PRESETS = Object.freeze({
  safe: Object.freeze({ id: 'safe', role: 'low-power', label: 'Quiet infrastructure' }),
  balanced: Object.freeze({ id: 'balanced', role: 'default', label: 'Living infrastructure' }),
  showcase: Object.freeze({ id: 'showcase', role: 'presentation', label: 'Showcase infrastructure' }),
})

export function resolveWorldLifePreset(search = '') {
  const requested = new URLSearchParams(search).get('worldLife')
  return WORLD_LIFE_PRESETS[requested] ?? WORLD_LIFE_PRESETS.balanced
}
