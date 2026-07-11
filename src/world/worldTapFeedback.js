/**
 * A tiny, framework-free bridge for immediate feedback after a world tap.
 *
 * It deliberately communicates via a browser event so the Pixi scene can
 * publish a selection without importing React or owning any overlay state.
 * The React `WorldTapConfirmation` component is the optional visual listener.
 */
export const WORLD_TAP_FEEDBACK_EVENT = 'hermes-world:tap-feedback'

const HAPTIC_PULSE_MS = 9

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function shouldUseHaptics() {
  return typeof navigator !== 'undefined'
    && typeof navigator.vibrate === 'function'
    && typeof document !== 'undefined'
    && document.visibilityState === 'visible'
    && !prefersReducedMotion()
}

/**
 * Publishes a tap confirmation that can be consumed by any presentation layer.
 * `point` expects viewport coordinates, keeping the feedback anchored to the
 * actual finger/cursor even when the world camera is panned or zoomed.
 */
export function publishWorldTapFeedback({
  id,
  label,
  kind = 'agent',
  state = 'idle',
  point,
  importance = 'normal',
} = {}) {
  if (typeof window === 'undefined') return

  const detail = {
    id: id ?? null,
    label: label || (kind === 'building' ? 'Budynek' : 'Agent'),
    kind: kind === 'building' ? 'building' : 'agent',
    state,
    importance: importance === 'critical' ? 'critical' : 'normal',
    point: {
      x: Number.isFinite(point?.x) ? point.x : window.innerWidth / 2,
      y: Number.isFinite(point?.y) ? point.y : window.innerHeight / 2,
    },
    occurredAt: Date.now(),
  }

  // Vibration is optional, extremely short, and disabled for reduced motion.
  // Browsers that reject the API simply retain visual and spoken confirmation.
  if (shouldUseHaptics()) navigator.vibrate(HAPTIC_PULSE_MS)

  window.dispatchEvent(new CustomEvent(WORLD_TAP_FEEDBACK_EVENT, { detail }))
}
