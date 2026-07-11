import { publishWorldTapFeedback } from './worldTapFeedback'

/**
 * Extracts viewport coordinates from a Pixi FederatedPointerEvent, a native
 * PointerEvent, or a simple `{ x, y }` value. This keeps the renderer API
 * small and makes the overlay independent from Pixi version details.
 */
export function getWorldTapViewportPoint(pointerEvent) {
  const original = pointerEvent?.originalEvent ?? pointerEvent
  const x = original?.clientX ?? pointerEvent?.global?.x ?? pointerEvent?.x
  const y = original?.clientY ?? pointerEvent?.global?.y ?? pointerEvent?.y

  return {
    x: Number.isFinite(x) ? x : undefined,
    y: Number.isFinite(y) ? y : undefined,
  }
}

/**
 * Sends a normalized agent/building selection to the presentation layer.
 *
 * Minimal renderer usage:
 *
 *   displayObject.on('pointertap', event => {
 *     presentWorldSelection(agent, event)
 *     openSheet('agent', agent.id)
 *   })
 *
 * `entity` can use either the canonical `displayName` / `isActive` fields or
 * the existing `name` / `state` shape. No state is mutated here.
 */
export function presentWorldSelection(entity, pointerEvent, options = {}) {
  if (!entity) return false

  const kind = options.kind ?? entity.kind ?? entity.type ?? 'agent'
  const normalizedKind = kind === 'building' ? 'building' : 'agent'
  const state = options.state
    ?? entity.visualState
    ?? entity.state
    ?? (entity.isActive || entity.active ? 'working' : 'idle')

  publishWorldTapFeedback({
    id: options.id ?? entity.id,
    label: options.label ?? entity.displayName ?? entity.name ?? entity.label,
    kind: normalizedKind,
    state,
    importance: options.importance ?? (state === 'error' || state === 'blocked' ? 'critical' : 'normal'),
    point: getWorldTapViewportPoint(pointerEvent),
  })

  return true
}
