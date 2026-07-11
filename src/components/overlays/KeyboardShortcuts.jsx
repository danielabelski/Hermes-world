import { useEffect } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

function isTextInput(target) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function mostUrgent(alerts) {
  return alerts.find((alert) => ['critical', 'error'].includes(alert.severity))
    ?? alerts.find((alert) => alert.severity === 'warning')
}

/**
 * Desktop-only keyboard parity for camera and contextual world navigation.
 * This renders nothing: it is mounted by the app shell alongside the canvas.
 */
export function KeyboardShortcuts() {
  const setZoomPreference = useWorldStore((state) => state.setZoomPreference)
  const requestCameraFocus = useWorldStore((state) => state.requestCameraFocus)
  const openSheet = useWorldStore((state) => state.openSheet)
  const closeSheet = useWorldStore((state) => state.closeSheet)
  const clearSelection = useWorldStore((state) => state.clearSelection)
  const agents = useWorldStore((state) => state.agents ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1100px)')
    const onKeyDown = (event) => {
      if (!desktopQuery.matches || event.metaKey || event.ctrlKey || event.altKey || isTextInput(event.target)) return

      const urgent = mostUrgent(alerts)
      const firstActiveAgent = agents.find((agent) => agent.active ?? agent.isActive)

      if (event.key === 'Escape') {
        event.preventDefault()
        closeSheet?.()
        clearSelection?.()
        return
      }

      if (event.key === ' ' || event.key === '1') {
        event.preventDefault()
        clearSelection?.()
        setZoomPreference?.('overview')
        return
      }

      if (event.key === '2') {
        event.preventDefault()
        setZoomPreference?.('standard')
        return
      }

      if (event.key === '3') {
        event.preventDefault()
        setZoomPreference?.('detail')
        return
      }

      if (event.key.toLowerCase() === 'e') {
        event.preventDefault()
        if (urgent?.entityType && urgent?.entityId) requestCameraFocus?.(urgent.entityType, urgent.entityId)
        else setZoomPreference?.('overview')
        return
      }

      if (event.key.toLowerCase() === 'a' && firstActiveAgent) {
        event.preventDefault()
        requestCameraFocus?.('agent', firstActiveAgent.profile ?? firstActiveAgent.id)
        return
      }

      if (event.key.toLowerCase() === 't') {
        event.preventDefault()
        openSheet?.('activity')
        return
      }

      if (event.key.toLowerCase() === 'c') {
        event.preventDefault()
        openSheet?.('chat')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [agents, alerts, clearSelection, closeSheet, openSheet, requestCameraFocus, setZoomPreference])

  return null
}

export default KeyboardShortcuts
