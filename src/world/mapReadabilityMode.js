export const MAP_VARIANTS = Object.freeze({
  light: Object.freeze({ id: 'light', role: 'production', label: 'Hermes Citadel' }),
  strong: Object.freeze({ id: 'strong', role: 'showcase', label: 'Hermes Citadel Showcase' }),
  baseline: Object.freeze({ id: 'baseline', role: 'fallback', label: 'Hermes Citadel Low Intensity' }),
})

export const MAP_READABILITY_MODES = Object.freeze(Object.keys(MAP_VARIANTS))

export function resolveMapReadabilityMode(search = '') {
  const params = new URLSearchParams(search)
  const requested = params.get('mapVariant') ?? params.get('mapReadability')
  return MAP_READABILITY_MODES.includes(requested) ? requested : 'light'
}

export function getMapVariant(search = '') {
  return MAP_VARIANTS[resolveMapReadabilityMode(search)]
}
