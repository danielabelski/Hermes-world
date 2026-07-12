const itemKey = (item, index) => String(item?.id ?? `${item?.createdAt ?? item?.timestamp ?? 'event'}-${item?.message ?? index}`)

export function mergeWorldActivityItems(activity = [], alerts = [], limit = 5) {
  const combined = [...(Array.isArray(activity) ? activity : []), ...(Array.isArray(alerts) ? alerts : [])].filter(Boolean)
  const unique = new Map()
  combined.forEach((item, index) => unique.set(itemKey(item, index), item))
  return [...unique.values()]
    .sort((a, b) => (
      WORLD_MOMENT_PRIORITY[classifyWorldMoment(b)] - WORLD_MOMENT_PRIORITY[classifyWorldMoment(a)]
      || String(b.createdAt ?? b.timestamp ?? '').localeCompare(String(a.createdAt ?? a.timestamp ?? ''))
    ))
    .slice(0, limit)
}
import { classifyWorldMoment, WORLD_MOMENT_PRIORITY } from './worldMomentPriority.js'
