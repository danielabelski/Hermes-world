import { useEffect, useState } from 'react'
import { WORLD_TAP_FEEDBACK_EVENT } from '../world/worldTapFeedback'
import './WorldTapConfirmation.css'

const STATE_COPY = {
  idle: 'odpoczywa',
  walking: 'jest w drodze',
  working: 'pracuje',
  thinking: 'analizuje',
  success: 'właśnie ukończył zadanie',
  error: 'wymaga uwagi',
  sleeping: 'odpoczywa',
}

/**
 * Visual, haptic-safe and screen-reader-safe acknowledgement for canvas taps.
 * Mount it once beside the world overlays, then call `publishWorldTapFeedback`
 * from the canvas selection handler. It owns no world state.
 */
export default function WorldTapConfirmation() {
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let dismissTimer
    const onFeedback = ({ detail }) => {
      window.clearTimeout(dismissTimer)
      setFeedback(detail)
      dismissTimer = window.setTimeout(() => setFeedback(null), 1450)
    }

    window.addEventListener(WORLD_TAP_FEEDBACK_EVENT, onFeedback)
    return () => {
      window.removeEventListener(WORLD_TAP_FEEDBACK_EVENT, onFeedback)
      window.clearTimeout(dismissTimer)
    }
  }, [])

  if (!feedback) return null

  const isBuilding = feedback.kind === 'building'
  const stateCopy = STATE_COPY[feedback.state] || 'jest gotowy'
  const sentence = isBuilding
    ? `${feedback.label}: otwieram szczegóły budynku.`
    : `${feedback.label}: ${stateCopy}.`

  return (
    <>
      <div
        className={`world-tap-confirmation world-tap-confirmation--${feedback.kind} world-tap-confirmation--${feedback.importance}`}
        style={{ '--tap-x': `${feedback.point.x}px`, '--tap-y': `${feedback.point.y}px` }}
        aria-hidden="true"
      >
        <span className="world-tap-confirmation__pulse" />
        <span className="world-tap-confirmation__icon">{isBuilding ? '⌂' : '✦'}</span>
        <span className="world-tap-confirmation__label">{feedback.label}</span>
      </div>
      <p className="world-tap-confirmation__sr" role="status" aria-live="polite">
        {sentence}
      </p>
    </>
  )
}
