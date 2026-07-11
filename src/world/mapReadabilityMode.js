export const MAP_READABILITY_MODES = Object.freeze(['baseline', 'light', 'strong'])

export function resolveMapReadabilityMode(search = '') {
  const requested = new URLSearchParams(search).get('mapReadability')
  return MAP_READABILITY_MODES.includes(requested) ? requested : 'light'
}

