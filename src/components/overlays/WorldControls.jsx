import { useWorldStore } from '../../world/store/worldStore.js'

function mostUrgent(alerts) {
  return alerts.find((alert) => alert.severity === 'critical')
    ?? alerts.find((alert) => alert.severity === 'error')
    ?? alerts.find((alert) => alert.severity === 'warning')
}

/** Explicit alternatives to pinch/drag gestures. The canvas owns camera movement. */
export function WorldControls() {
  const camera = useWorldStore((state) => state.camera)
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const setZoomPreference = useWorldStore((state) => state.setZoomPreference)
  const requestCameraFocus = useWorldStore((state) => state.requestCameraFocus)
  const clearSelection = useWorldStore((state) => state.clearSelection)
  const cycleScenario = useWorldStore((state) => state.cycleScenario)
  const activeZoom = camera?.zoomPreference ?? 'standard'
  const alert = mostUrgent(alerts)

  const focusUrgent = () => {
    if (alert?.entityType && alert?.entityId) requestCameraFocus?.(alert.entityType, alert.entityId)
    else if (setZoomPreference) setZoomPreference('overview')
    else cycleScenario?.()
  }

  return (
    <nav className="world-controls" aria-label="Sterowanie widokiem świata">
      <button className="world-controls__button" data-active={activeZoom === 'overview'} type="button" onClick={() => { clearSelection?.(); setZoomPreference?.('overview') }} aria-label="Pokaż całą Cytadelę"><span aria-hidden="true">⌂</span></button>
      <button className="world-controls__button" data-active={activeZoom === 'standard'} type="button" onClick={() => setZoomPreference?.('standard')} aria-label="Przywróć standardowy widok świata"><span aria-hidden="true">◎</span></button>
      <button className="world-controls__button world-controls__button--alert" data-has-alert={Boolean(alert)} type="button" onClick={focusUrgent} aria-label={alert ? 'Pokaż najważniejszy problem' : 'Pokaż przegląd Cytadeli'}><span aria-hidden="true">!</span></button>
    </nav>
  )
}

export default WorldControls
