const SHORT_NAMES = Object.freeze({
  citadel: 'Cytadela', forge: 'Kuźnia', library: 'Biblioteka', archive: 'Archiwum',
  entrance: 'wejście', threshold: 'próg', plaza: 'plac', courtyard: 'dziedziniec',
  road: 'droga', bridge: 'most', gate: 'brama', watch: 'wieża', observation: 'punkt',
  home: 'dom', safe: 'safe', work: 'praca', camp: 'obóz', central: 'centrum',
})

export function shortRouteNodeLabel(nodeId, index) {
  const parts = String(nodeId ?? `punkt-${index + 1}`).split(/[_-]+/).filter(Boolean)
  const meaningful = parts.filter((part) => !['main', 'node', 'point', 'path'].includes(part))
  const translated = meaningful.slice(-2).map((part) => SHORT_NAMES[part] ?? part)
  return translated.join(' · ') || `punkt ${index + 1}`
}

export function getNumberedRouteNodes(journey = {}) {
  return (journey.outboundWaypoints ?? []).map((point, index) => Object.freeze({
    number: index + 1,
    point,
    fullLabel: journey.outboundNodeIds?.[index] ?? `waypoint-${index + 1}`,
    shortLabel: shortRouteNodeLabel(journey.outboundNodeIds?.[index], index),
  }))
}
