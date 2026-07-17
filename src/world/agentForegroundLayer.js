import { MAP_FOREGROUND_MASKS } from './data/mapForegroundMasks.js'

export function shouldRenderAgentAboveForeground(model, layout = 'desktop') {
  if (!model || model.isInside) return false
  if (model.occupancyMode === 'facade-front') return true

  const x = Number(model.worldX)
  const y = Number(model.worldY)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false

  return (MAP_FOREGROUND_MASKS[layout] ?? MAP_FOREGROUND_MASKS.desktop).some((mask) => (
    x >= mask.x
    && x <= mask.x + mask.width
    && y >= mask.y
    && y <= mask.y + mask.height
  ))
}
