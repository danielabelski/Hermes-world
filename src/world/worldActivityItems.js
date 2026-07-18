import { classifyWorldMoment, WORLD_MOMENT_PRIORITY } from './worldMomentPriority.js'

const itemKey = (item, index) => String(item?.id ?? `${item?.createdAt ?? item?.timestamp ?? 'event'}-${item?.message ?? index}`)
const timestamp = (item) => {
  const value = Date.parse(item?.createdAt ?? item?.timestamp ?? '')
  return Number.isFinite(value) ? value : 0
}

export function mergeWorldActivityItems(activity = [], alerts = [], limit = 40) {
  const combined = [...(Array.isArray(activity) ? activity : []), ...(Array.isArray(alerts) ? alerts : [])].filter(Boolean)
  const unique = new Map()
  combined.forEach((item, index) => unique.set(itemKey(item, index), item))
  return [...unique.values()]
    .sort((a, b) => {
      const aPriority = WORLD_MOMENT_PRIORITY[classifyWorldMoment(a)]
      const bPriority = WORLD_MOMENT_PRIORITY[classifyWorldMoment(b)]
      const aInterrupts = aPriority >= WORLD_MOMENT_PRIORITY.warning
      const bInterrupts = bPriority >= WORLD_MOMENT_PRIORITY.warning
      if (aInterrupts !== bInterrupts) return bInterrupts ? 1 : -1
      return (aInterrupts ? bPriority - aPriority : 0) || timestamp(b) - timestamp(a)
    })
    .slice(0, limit)
}

export function recentWorldActivityItems(items = [], now = Date.now(), maxAgeMs = 24 * 60 * 60 * 1000) {
  return (Array.isArray(items) ? items : []).filter((item) => {
    const createdAt = timestamp(item)
    return createdAt > 0 && createdAt <= now + 60_000 && now - createdAt <= maxAgeMs
  })
}
