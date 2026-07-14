import { getMapNodes } from './data/mapNavigation.js'

const ENTRY_CONFIG = Object.freeze({
  forge: Object.freeze({
    buildingId: 'forge', label: 'Kuźnia', ariaLabel: 'Wejdź do Kuźni Systemowej', hitWidth: 52, hitHeight: 62,
    nodes: Object.freeze({ desktop: 'forge_entrance', mobile: 'mobile_forge_entrance' }),
  }),
})

export function resolveBuildingEntry(buildingId, layout = 'desktop') {
  const config = ENTRY_CONFIG[buildingId]
  if (!config) return null
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const nodeId = config.nodes[normalizedLayout]
  const point = getMapNodes(normalizedLayout)[nodeId]
  if (!point) return null
  return Object.freeze({ ...config, layout: normalizedLayout, nodeId, xPercent: point.xPercent, yPercent: point.yPercent })
}
