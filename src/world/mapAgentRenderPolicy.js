export const MAX_MAP_AGENT_SPRITES = 48

const isInWorldBounds = (model) => (
  Number(model?.worldX) >= -8
  && Number(model?.worldX) <= 108
  && Number(model?.worldY) >= -8
  && Number(model?.worldY) <= 108
)

const importance = (model, selectedId) => {
  if (model.profileId === selectedId) return 1_000
  if (['critical', 'error'].includes(model.severity)) return 900
  if (model.signalState === 'warning' || model.visualState === 'alert') return 850
  if (model.signalState === 'stuck' || model.visualState === 'stuck') return 825
  if (model.severity === 'warning') return 850
  if (model.signalState === 'success') return 750
  if (model.isMoving || model.visualState === 'work' || model.visualState === 'observe') return 600
  return 100
}

const sortByY = (left, right) => Number(left.sortY ?? left.worldY) - Number(right.sortY ?? right.worldY) || String(left.profileId).localeCompare(String(right.profileId))

export function getMapAgentLod(model, selectedId) {
  if (model.profileId === selectedId || model.severity !== 'none' || model.isMoving) return 'high'
  if (['work', 'observe', 'success'].includes(model.visualState)) return 'standard'
  return 'low'
}

export function selectMapAgentRenderSet(presentations = [], selectedId = null, limit = MAX_MAP_AGENT_SPRITES) {
  const candidates = presentations.filter((model) => model?.profileId && isInWorldBounds(model) && model.culled !== true)
  if (candidates.length <= limit) return [...candidates].sort(sortByY)
  return candidates
    .sort((left, right) => importance(right, selectedId) - importance(left, selectedId) || sortByY(left, right))
    .slice(0, limit)
    .sort(sortByY)
}
