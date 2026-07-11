import { useMemo } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'
import ActivityFeed from './ActivityFeed.jsx'
import '../../desktop.css'

const STATUS = {
  healthy: 'Stabilny',
  attention: 'Uwaga',
  warning: 'Ostrzeżenie',
  critical: 'Krytyczny',
}

function selectedAgent(agents, selection) {
  return agents.find((agent) => agent.profile === selection?.id || agent.id === selection?.id)
}

function selectionSummary(selection, agents, buildings, tasks) {
  if (!selection) return null
  if (selection.type === 'agent') {
    const agent = selectedAgent(agents, selection)
    if (!agent) return { title: 'Agent', description: 'Dane agenta będą dostępne po synchronizacji.' }
    const active = agent.active ?? agent.isActive
    return { title: agent.displayName ?? agent.role ?? agent.profile, description: active ? 'Pracuje w Cytadeli.' : 'Odpoczywa i czeka na zadanie.', entity: agent }
  }
  if (selection.type === 'building') {
    const building = buildings[selection.id]
    return { title: building?.label ?? selection.id, description: building?.state ?? 'Stan budynku jest prawidłowy.', entity: building }
  }
  if (selection.type === 'task') {
    const task = tasks[selection.id]
    return { title: task?.title ?? 'Zadanie', description: `Stan: ${task?.status ?? 'oczekuje'}.`, entity: task }
  }
  return null
}

/**
 * Desktop adds control and textual depth without replacing the living map.
 * Its command buttons intentionally remain disabled until mutation endpoints
 * are explicitly added to the Hermes API contract.
 */
export default function DesktopCommandPanel() {
  const system = useWorldStore((state) => state.system ?? {})
  const agents = useWorldStore((state) => state.agents ?? [])
  const scenario = useWorldStore((state) => state.scenario)
  const selection = useWorldStore((state) => state.selection)
  const buildings = useWorldStore((state) => state.buildingsById ?? state.buildings ?? {})
  const tasks = useWorldStore((state) => state.tasksById ?? state.tasks ?? {})
  const selectEntity = useWorldStore((state) => state.selectEntity)
  const requestCameraFocus = useWorldStore((state) => state.requestCameraFocus)
  const openSheet = useWorldStore((state) => state.openSheet)
  const cycleScenario = useWorldStore((state) => state.cycleScenario)

  const detail = useMemo(() => selectionSummary(selection, agents, buildings, tasks), [agents, buildings, selection, tasks])
  const activeAgents = system.activeAgentCount ?? agents.filter((agent) => agent.active ?? agent.isActive).length
  const totalAgents = system.totalAgentCount ?? agents.length
  const severity = system.severity ?? (scenario === 'critical' ? 'critical' : scenario === 'warning' ? 'warning' : 'healthy')

  return (
    <aside className="desktop-command-panel" aria-label="Panel dowodzenia Cytadeli Hermesa">
      <header className="desktop-command-panel__header">
        <p>COMMAND PANEL</p>
        <h2>Cytadela Hermesa</h2>
        <span data-severity={severity}>{STATUS[severity] ?? STATUS.healthy}</span>
      </header>

      <section className="desktop-command-panel__summary" aria-label="Podsumowanie systemu">
        <div><small>CPU</small><strong>{system.cpuPercent ?? '—'}%</strong></div>
        <div><small>AGENTY</small><strong>{activeAgents}/{totalAgents}</strong></div>
        <div><small>POŁĄCZENIE</small><strong>{system.connection ?? 'online'}</strong></div>
      </section>

      <section className="desktop-command-panel__agents" aria-labelledby="desktop-agents-title">
        <div className="desktop-command-panel__section-heading"><h3 id="desktop-agents-title">Załoga</h3><span>{activeAgents} pracuje</span></div>
        <ul>
          {agents.map((agent) => {
            const active = agent.active ?? agent.isActive
            const selected = selection?.type === 'agent' && selection.id === (agent.profile ?? agent.id)
            return (
              <li key={agent.profile ?? agent.id}>
                <button data-selected={selected} type="button" onClick={() => selectEntity?.('agent', agent.profile ?? agent.id)}>
                  <span className="desktop-command-panel__agent-dot" data-active={active} aria-hidden="true" />
                  <span>{agent.displayName ?? agent.role ?? agent.profile}</span>
                  <small>{active ? 'pracuje' : 'idle'}</small>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {detail && (
        <section className="desktop-command-panel__detail" aria-label="Szczegóły zaznaczenia">
          <p>WYBRANO</p><h3>{detail.title}</h3><span>{detail.description}</span>
          <div className="desktop-command-panel__actions">
            <button type="button" onClick={() => requestCameraFocus?.(selection.type, selection.id)}>Pokaż na mapie</button>
            {selection.type === 'agent' && <button type="button" onClick={() => openSheet?.('chat')}>Otwórz chat</button>}
            <button type="button" disabled title="Wymaga przyszłego, jawnie zatwierdzonego endpointu Hermes API">Przypisz zadanie · wkrótce</button>
            <button type="button" disabled title="Wymaga przyszłego, jawnie zatwierdzonego endpointu Hermes API">Wstrzymaj agenta · wkrótce</button>
          </div>
        </section>
      )}

      <section className="desktop-command-panel__timeline" aria-labelledby="desktop-timeline-title">
        <div className="desktop-command-panel__section-heading"><h3 id="desktop-timeline-title">Oś aktywności</h3><button type="button" onClick={() => openSheet?.('activity')}>Pełna historia</button></div>
        <ActivityFeed limit={5} />
      </section>

      {import.meta.env.DEV && <button className="desktop-command-panel__debug" type="button" onClick={() => cycleScenario?.()}>Symuluj stan: {scenario ?? 'healthy'}</button>}
    </aside>
  )
}
