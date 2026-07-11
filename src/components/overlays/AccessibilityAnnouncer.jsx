import { useEffect, useMemo, useRef, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'

const LABELS = {
  healthy: 'stabilny',
  attention: 'wymaga uwagi',
  warning: 'ostrzeżenie',
  critical: 'krytyczny',
  offline: 'offline',
}

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

function severityFor(system, lifecycle, scenario) {
  if (lifecycle?.connection === 'offline') return 'offline'
  return system?.severity ?? system?.healthStatus ?? (scenario === 'critical' ? 'critical' : scenario === 'warning' ? 'warning' : 'healthy')
}

/**
 * Provides a text alternative for the canvas' high-level visual language.
 * It announces only meaningful state transitions, not animation frames.
 */
export function AccessibilityAnnouncer() {
  const system = useWorldStore((state) => state.system ?? {})
  const lifecycle = useWorldStore((state) => state.lifecycle ?? {})
  const scenario = useWorldStore((state) => state.scenario)
  const agents = useWorldStore((state) => state.agents ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const [announcement, setAnnouncement] = useState('')
  const previous = useRef(null)

  const summary = useMemo(() => {
    const severity = severityFor(system, lifecycle, scenario)
    const activeAgents = system.activeAgentCount ?? agents.filter((agent) => agent.active ?? agent.isActive).length
    const totalAgents = system.totalAgentCount ?? agents.length
    const urgentAlerts = alerts.filter((alert) => ['critical', 'error', 'warning'].includes(alert.severity)).length
    return { severity, activeAgents, totalAgents, urgentAlerts, connection: lifecycle.connection ?? 'online' }
  }, [agents, alerts, lifecycle, scenario, system])

  useEffect(() => {
    const before = previous.current
    previous.current = summary
    if (!before) {
      setAnnouncement(`Hermes OS gotowy. Stan systemu: ${LABELS[summary.severity] ?? summary.severity}. Aktywnych agentów: ${summary.activeAgents} z ${summary.totalAgents}.`)
      return
    }

    if (before.connection !== summary.connection) {
      setAnnouncement(summary.connection === 'offline' ? 'Hermes OS utracił bieżące połączenie. Pokazywany jest ostatni znany stan świata.' : 'Połączenie z Hermes OS zostało przywrócone.')
      return
    }
    if (before.severity !== summary.severity) {
      setAnnouncement(`Stan systemu zmienił się: ${LABELS[summary.severity] ?? summary.severity}.`)
      return
    }
    if (before.urgentAlerts !== summary.urgentAlerts) {
      setAnnouncement(summary.urgentAlerts ? `W Cytadeli są ${summary.urgentAlerts} ważne alerty.` : 'Ważne alerty zostały rozwiązane.')
      return
    }
    if (before.activeAgents !== summary.activeAgents || before.totalAgents !== summary.totalAgents) {
      setAnnouncement(`Aktywnych agentów: ${summary.activeAgents} z ${summary.totalAgents}.`)
    }
  }, [summary])

  const urgent = ['critical', 'offline'].includes(summary.severity)
  return <div style={visuallyHidden} role={urgent ? 'alert' : 'status'} aria-live={urgent ? 'assertive' : 'polite'} aria-atomic="true">{announcement}</div>
}

export default AccessibilityAnnouncer
