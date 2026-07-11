/**
 * Renderer-neutral gesture interpreter for the Living World.
 *
 * Pixi, a future DOM fallback, and automated tests can all report pointers in
 * the same small shape. This module deliberately does not import Pixi, React,
 * Zustand, or CameraSystem; callers decide how to apply the emitted intents.
 */

export const DEFAULT_DRAG_THRESHOLD_PX = 8
export const DEFAULT_TAP_MAX_DURATION_MS = 360
export const DEFAULT_TAP_SUPPRESSION_MS = 180

const SELECTABLE_ENTITY_TYPES = new Set(['agent', 'building', 'task', 'cron', 'model', 'alert'])

function finite(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function normalizedPoint(point = {}) {
  return { x: finite(point.x), y: finite(point.y) }
}

function distanceBetween(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

/**
 * Normalizes hit-test output from any renderer. `null` means an intentional
 * background tap, while malformed or unknown targets are ignored rather than
 * opening a misleading detail sheet.
 */
export function normalizeHitTarget(target) {
  if (target == null || target.type === 'background') return null

  const type = target.entityType ?? target.type
  const id = target.entityId ?? target.id
  if (!SELECTABLE_ENTITY_TYPES.has(type) || id == null || id === '') return undefined

  return { type, id: String(id) }
}

/**
 * Converts a resolved visual hit into a store-friendly selection intent.
 * Callers may dispatch `selectEntity(intent.entityType, intent.entityId)` or
 * `clearSelection()` without exposing renderer events to application state.
 */
export function selectionIntentForTarget(target) {
  const normalized = normalizeHitTarget(target)
  if (normalized === undefined) return { type: 'none', reason: 'unselectable-target' }
  if (normalized === null) return { type: 'clear-selection', reason: 'background-tap' }

  return {
    type: 'select-entity',
    entityType: normalized.type,
    entityId: normalized.id,
    reason: 'entity-tap',
  }
}

/**
 * Interprets one-or-more active pointers. It does not move a camera itself;
 * `pan`, `pinch`, and `tap` intents retain enough data for a renderer adapter
 * to do so. Pointer IDs should be stable for the duration of a gesture.
 */
export class InteractionSystem {
  constructor({
    dragThresholdPx = DEFAULT_DRAG_THRESHOLD_PX,
    tapMaxDurationMs = DEFAULT_TAP_MAX_DURATION_MS,
    tapSuppressionMs = DEFAULT_TAP_SUPPRESSION_MS,
    now = () => performance.now(),
  } = {}) {
    this.dragThresholdPx = Math.max(0, finite(dragThresholdPx, DEFAULT_DRAG_THRESHOLD_PX))
    this.tapMaxDurationMs = Math.max(0, finite(tapMaxDurationMs, DEFAULT_TAP_MAX_DURATION_MS))
    this.tapSuppressionMs = Math.max(0, finite(tapSuppressionMs, DEFAULT_TAP_SUPPRESSION_MS))
    this.now = now
    this.pointers = new Map()
    this.gesture = null
    this.suppressTapUntil = 0
  }

  reset() {
    this.pointers.clear()
    this.gesture = null
    this.suppressTapUntil = 0
  }

  pointerDown({ pointerId, point, time = this.now() } = {}) {
    if (pointerId == null) return { type: 'none', reason: 'missing-pointer-id' }

    const normalized = normalizedPoint(point)
    this.pointers.set(pointerId, { point: normalized, startedAt: time })

    if (this.pointers.size === 1) {
      this.gesture = { kind: 'pending-tap', pointerId, origin: normalized, startedAt: time }
      return { type: 'pointer-start', point: normalized }
    }

    if (this.pointers.size === 2) {
      const [first, second] = [...this.pointers.values()]
      this.gesture = {
        kind: 'pinch',
        initialDistance: Math.max(1, distanceBetween(first.point, second.point)),
        initialMidpoint: midpoint(first.point, second.point),
      }
      this.#suppressTaps(time)
      return { type: 'pinch-start', ...this.#pinchSnapshot() }
    }

    return { type: 'none', reason: 'extra-pointer' }
  }

  pointerMove({ pointerId, point, time = this.now() } = {}) {
    const current = this.pointers.get(pointerId)
    if (!current) return { type: 'none', reason: 'unknown-pointer' }

    const normalized = normalizedPoint(point)
    current.point = normalized

    if (this.pointers.size >= 2 && this.gesture?.kind === 'pinch') {
      this.#suppressTaps(time)
      return { type: 'pinch', ...this.#pinchSnapshot() }
    }

    if (this.gesture?.kind === 'pan' && this.gesture.pointerId === pointerId) {
      const delta = {
        x: normalized.x - this.gesture.previous.x,
        y: normalized.y - this.gesture.previous.y,
      }
      this.gesture.previous = normalized
      this.#suppressTaps(time)
      return { type: 'pan', point: normalized, delta }
    }

    if (this.gesture?.kind !== 'pending-tap' || this.gesture.pointerId !== pointerId) return { type: 'none' }

    const delta = {
      x: normalized.x - this.gesture.origin.x,
      y: normalized.y - this.gesture.origin.y,
    }
    if (Math.hypot(delta.x, delta.y) < this.dragThresholdPx) return { type: 'none' }

    this.gesture = {
      kind: 'pan',
      pointerId,
      origin: this.gesture.origin,
      previous: normalized,
      startedAt: this.gesture.startedAt,
    }
    this.#suppressTaps(time)
    return { type: 'pan-start', point: normalized, delta }
  }

  pointerUp({ pointerId, point, target, time = this.now() } = {}) {
    const current = this.pointers.get(pointerId)
    if (!current) return { type: 'none', reason: 'unknown-pointer' }

    if (point) current.point = normalizedPoint(point)
    const wasGesture = this.gesture
    const pointerCountBeforeRelease = this.pointers.size
    this.pointers.delete(pointerId)

    if (pointerCountBeforeRelease >= 2 || wasGesture?.kind === 'pinch') {
      this.#suppressTaps(time)
      if (this.pointers.size === 1) {
        const [remainingId, remaining] = this.pointers.entries().next().value
        this.gesture = { kind: 'pending-tap', pointerId: remainingId, origin: remaining.point, startedAt: time }
      } else this.gesture = null
      return { type: 'pinch-end' }
    }

    if (wasGesture?.kind === 'pan') {
      this.#suppressTaps(time)
      this.gesture = null
      return { type: 'pan-end', point: current.point }
    }

    this.gesture = null
    const duration = Math.max(0, time - current.startedAt)
    if (duration > this.tapMaxDurationMs || time < this.suppressTapUntil) return { type: 'none', reason: 'tap-suppressed' }
    return selectionIntentForTarget(target)
  }

  pointerCancel({ pointerId, time = this.now() } = {}) {
    if (pointerId != null) this.pointers.delete(pointerId)
    this.#suppressTaps(time)
    this.gesture = null
    return { type: 'gesture-cancelled' }
  }

  #suppressTaps(time) {
    this.suppressTapUntil = Math.max(this.suppressTapUntil, time + this.tapSuppressionMs)
  }

  #pinchSnapshot() {
    const values = [...this.pointers.values()]
    if (values.length < 2) return { scaleFactor: 1, midpoint: values[0]?.point ?? { x: 0, y: 0 } }
    const [first, second] = values
    const distance = Math.max(1, distanceBetween(first.point, second.point))
    return {
      scaleFactor: distance / this.gesture.initialDistance,
      midpoint: midpoint(first.point, second.point),
      origin: this.gesture.initialMidpoint,
    }
  }
}

function midpoint(first, second) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}
