const UNTRUSTED_CONNECTIONS = new Set(['offline', 'stale'])
const UNTRUSTED_TASK_DOMAINS = new Set(['stale', 'offline', 'error'])

/**
 * One shared truth gate for transferring sprite ownership from the map to an
 * interior. Both renderers must agree before the map is allowed to hide the
 * agent. A stale task domain can still prove location through a fresh event.
 */
export function hasInteriorOwnershipEvidence({ task, lifecycle = {}, evidenceEventId = null }) {
  if (!task?.id) return false
  if (UNTRUSTED_CONNECTIONS.has(String(lifecycle.connection ?? '').toLowerCase())) return false
  const taskDomain = String(lifecycle.domains?.tasks?.state ?? '').toLowerCase()
  if (UNTRUSTED_TASK_DOMAINS.has(taskDomain) && !evidenceEventId && !task.evidenceEventId) return false
  return true
}
