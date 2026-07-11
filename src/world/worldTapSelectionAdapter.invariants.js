import {
  getWorldTapViewportPoint,
  presentWorldSelection,
} from './worldTapSelectionAdapter'
import { WORLD_TAP_FEEDBACK_EVENT } from './worldTapFeedback'

/**
 * Testable accessibility contract for the selection confirmation overlay.
 * The mounted component must expose its sentence through `role="status"` and
 * `aria-live="polite"`; this adapter must always supply a human-readable label.
 */
export const WORLD_TAP_A11Y_CONTRACT = Object.freeze({
  liveRegionRole: 'status',
  liveMode: 'polite',
  requiredFeedbackFields: ['label', 'kind', 'state'],
  reducedMotion: 'pulse animation and haptic feedback are suppressed when requested',
})

function check(name, assertion, details = '') {
  return { name, pass: Boolean(assertion), details }
}

/**
 * Lightweight, dependency-free invariant suite.
 *
 * Run manually in a dev console after importing this module:
 * `runWorldTapSelectionAdapterInvariants()`
 *
 * It has no side effects other than a short-lived listener in browsers. It is
 * intentionally not tied to a test runner so it remains valid in the current
 * standalone Vite project.
 */
export function runWorldTapSelectionAdapterInvariants() {
  const results = []
  const nativePoint = getWorldTapViewportPoint({ clientX: 24, clientY: 48 })
  results.push(check('native PointerEvent coordinates', nativePoint.x === 24 && nativePoint.y === 48))

  const pixiPoint = getWorldTapViewportPoint({
    originalEvent: { clientX: 85, clientY: 120 },
    global: { x: 1, y: 2 },
  })
  results.push(check('Pixi FederatedPointerEvent coordinates', pixiPoint.x === 85 && pixiPoint.y === 120))

  const fallbackPoint = getWorldTapViewportPoint(null)
  results.push(check('null event is non-throwing', fallbackPoint.x === undefined && fallbackPoint.y === undefined))

  let nullSelection
  try {
    nullSelection = presentWorldSelection(null, null)
    results.push(check('null entity is non-throwing', nullSelection === false))
  } catch (error) {
    results.push(check('null entity is non-throwing', false, error?.message))
  }

  const hasWindow = typeof window !== 'undefined'
  let receivedDetail = null
  const receive = event => { receivedDetail = event.detail }
  if (hasWindow) window.addEventListener(WORLD_TAP_FEEDBACK_EVENT, receive, { once: true })

  let selected
  try {
    selected = presentWorldSelection(
      { id: 'reviewer', type: 'agent', name: 'Inspektor', state: 'thinking' },
      { clientX: 64, clientY: 96 },
    )
    results.push(check('valid selection reports success', selected === true))
  } catch (error) {
    results.push(check('valid selection reports success', false, error?.message))
  }

  if (hasWindow) {
    const fields = WORLD_TAP_A11Y_CONTRACT.requiredFeedbackFields
    results.push(check(
      'feedback contains a11y-readable entity data',
      fields.every(field => Boolean(receivedDetail?.[field])),
      'Overlay announces this data in its polite status live region.',
    ))
  }

  return {
    passed: results.every(result => result.pass),
    environment: hasWindow ? 'browser' : 'non-browser',
    results,
    a11y: WORLD_TAP_A11Y_CONTRACT,
  }
}
