const freeze = Object.freeze

const region = (id, operationType, geometry, options = {}) => freeze({
  id,
  operationType,
  geometry: freeze(geometry),
  motion: options.motion ?? 'breathe',
  shape: options.shape ?? 'ellipse',
  intensity: options.intensity ?? 0.42,
  timingOffset: options.timingOffset ?? 0,
})

export const MAP_NATIVE_MOTION_REGIONS = freeze([
  region('citadel-core', 'citadel-distribution', {
    mobile: freeze({ x: 50, y: 54.7, width: 11.5, height: 6.4 }),
    desktop: freeze({ x: 46, y: 46.2, width: 10.5, height: 7.2 }),
  }, { motion: 'turn', intensity: 0.5, timingOffset: 0 }),
  region('citadel-threshold', 'citadel-distribution', {
    mobile: freeze({ x: 50, y: 42.8, width: 8.2, height: 5.2 }),
    desktop: freeze({ x: 46, y: 36.5, width: 8, height: 5.8 }),
  }, { motion: 'charge', shape: 'facade', intensity: 0.38, timingOffset: 0.35 }),
  region('forge-furnace', 'forge-production', {
    mobile: freeze({ x: 30.5, y: 49.2, width: 13.5, height: 9.8 }),
    desktop: freeze({ x: 84, y: 49, width: 12.8, height: 11 }),
  }, { motion: 'work', shape: 'forge', intensity: 0.48, timingOffset: 0.2 }),
  region('watcher-lens', 'watcher-sweep', {
    mobile: freeze({ x: 65.5, y: 71.2, width: 10.5, height: 7.6 }),
    desktop: freeze({ x: 67, y: 31.5, width: 10.5, height: 8.8 }),
  }, { motion: 'scan', shape: 'dome', intensity: 0.46, timingOffset: 0.55 }),
  region('archive-facade', 'archive-ingestion', {
    mobile: freeze({ x: 35.5, y: 70.5, width: 12.5, height: 9.2 }),
    desktop: freeze({ x: 28.5, y: 36.5, width: 11.5, height: 10 }),
  }, { motion: 'windows', shape: 'facade', intensity: 0.42, timingOffset: 0.85 }),
])

export function getMapNativeRegions(layout = 'desktop', operations = []) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const operationByType = new Map(operations.map((operation) => [operation.type, operation]))
  return freeze(MAP_NATIVE_MOTION_REGIONS.flatMap((config) => {
    const operation = operationByType.get(config.operationType)
    if (!operation) return []
    return [freeze({ ...config, geometry: config.geometry[normalizedLayout], operation })]
  }))
}
