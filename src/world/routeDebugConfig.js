const VALID_LAYERS = Object.freeze(['route', 'nodes', 'labels', 'entrances', 'depth'])
const DEFAULT_LAYERS = Object.freeze(['route', 'nodes', 'entrances'])

export function resolveRouteDebugConfig(search = '', { forceEnabled = false, availableProfiles = [] } = {}) {
  const params = new URLSearchParams(search)
  const enabled = forceEnabled || params.get('debugRoutes') === '1'
  const requestedProfile = params.get('debugAgent') ?? 'coder'
  const fallbackProfile = availableProfiles.includes('coder') ? 'coder' : availableProfiles[0] ?? 'coder'
  const profile = requestedProfile === 'all' || availableProfiles.includes(requestedProfile) ? requestedProfile : fallbackProfile
  const requestedLayers = params.has('debugLayers')
    ? params.get('debugLayers').split(',').map((value) => value.trim()).filter((value) => VALID_LAYERS.includes(value))
    : [...DEFAULT_LAYERS]
  const layers = Object.freeze([...new Set(requestedLayers)])
  return Object.freeze({ enabled, profile, layers })
}

