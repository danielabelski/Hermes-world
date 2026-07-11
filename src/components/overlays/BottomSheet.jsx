import { useEffect, useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'
import ActivityFeed from './ActivityFeed.jsx'
import './PanelAndSheetPolish.css'
import { resolveLivingAgentState } from '../../world/LivingWorldStateMachine.js'
import { getAgentPortraitAsset } from '../../world/data/agentPortraitAssets.js'
import { getPresentationTask } from '../../world/mapAgentPresentation.js'
import { usePresentationClock } from '../../world/usePresentationClock.js'

const TYPE_LABEL = {
  agent: 'Agent',
  building: 'Budynek',
  task: 'Zadanie',
  activity: 'Aktywność',
}

const PHASE_LABEL = {
  resting: 'odpoczywa',
  'walking-to-work': 'idzie do pracy',
  arriving: 'wchodzi do budynku',
  working: 'pracuje',
  carrying: 'pracuje nad zadaniem',
  observing: 'prowadzi obserwację',
  success: 'zakończył zadanie',
  'walking-home': 'wraca z rezultatem',
  blocked: 'jest zablokowany',
  incident: 'reaguje na awarię',
  unknown: 'oczekuje na dane',
}

function selectedAgent(agents, selection) {
  return agents.find((agent) => agent.profile === selection?.id || agent.id === selection?.id)
}

/**
 * Renderer-independent selection sheet. It deliberately accepts partial world
 * state, so an unavailable API response never crashes the mobile shell.
 */
export function BottomSheet() {
  const selection = useWorldStore((state) => state.selection)
  const agents = useWorldStore((state) => state.agents ?? [])
  const buildings = useWorldStore((state) => state.buildingsById ?? state.buildings ?? {})
  const tasks = useWorldStore((state) => state.tasksById ?? state.tasks ?? {})
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const activity = useWorldStore((state) => state.activity?.items ?? [])
  const closeSheet = useWorldStore((state) => state.closeSheet)
  const clearSelection = useWorldStore((state) => state.clearSelection)
  const openSheet = useWorldStore((state) => state.openSheet)
  const presentationNow = usePresentationClock()
  const [expandedFor, setExpandedFor] = useState(null)

  const normalizedSelection = selection?.entityType ? { type: selection.entityType, id: selection.entityId, sheet: selection.sheet } : selection
  const isActivity = normalizedSelection?.type === 'activity' || normalizedSelection?.sheet === 'activity'
  const agent = normalizedSelection?.type === 'agent' ? selectedAgent(agents, normalizedSelection) : null
  const building = normalizedSelection?.type === 'building' ? buildings[normalizedSelection.id] : null
  const task = normalizedSelection?.type === 'task' ? tasks[normalizedSelection.id] : null
  const taskItems = Array.isArray(tasks) ? tasks : Object.values(tasks)
  const agentTask = agent ? getPresentationTask(agent, taskItems) : null
  const livingAgent = agent ? resolveLivingAgentState({ agent, tasks: agentTask ? [agentTask] : [], alerts, now: presentationNow }) : null
  const isOpen = Boolean(selection || isActivity)
  const selectionKey = `${normalizedSelection?.type ?? 'none'}:${normalizedSelection?.id ?? normalizedSelection?.sheet ?? 'none'}`
  const expanded = expandedFor === selectionKey

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeSheet?.()
        clearSelection?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSelection, closeSheet, isOpen])

  if (!isOpen) return null

  const entity = agent ?? building ?? task
  const lastEvent = agent ? activity.find((item) => (
    (item.entityType === 'agent' && item.entityId === agent.profile)
    || (agentTask && item.entityType === 'task' && String(item.entityId) === String(agentTask.id))
  )) : null
  const title = isActivity ? 'Aktywność Cytadeli' : entity?.displayName ?? entity?.label ?? entity?.title ?? TYPE_LABEL[normalizedSelection?.type] ?? 'Szczegóły'
  const description = isActivity
    ? 'Najnowsze zdarzenia Hermes OS są dostępne w osi aktywności.'
    : agent
      ? `${agent.role ?? agent.archetype ?? 'Agent'} ${PHASE_LABEL[livingAgent?.phase] ?? 'oczekuje'}.${agentTask?.title ? ` Zadanie: ${agentTask.title}.` : ''}`
      : task
        ? `Stan: ${task.status ?? 'oczekuje'}.`
        : building
          ? `${building.state ?? 'Spokojny stan'}.`
          : 'To miejsce będzie dostępne po następnej synchronizacji świata.'

  return (
    <section className={`world-bottom-sheet ${agent ? 'is-agent-detail' : ''} ${expanded ? 'is-expanded' : 'is-compact'}`} aria-label={title} aria-live="polite">
      <button className="world-bottom-sheet__handle" type="button" onClick={() => setExpandedFor((value) => value === selectionKey ? null : selectionKey)} aria-label={expanded ? 'Zwiń szczegóły' : 'Rozwiń szczegóły'} aria-expanded={expanded} />
      <button className="world-bottom-sheet__close" type="button" onClick={() => { closeSheet?.(); clearSelection?.() }} aria-label="Zamknij szczegóły">×</button>
      <p className="world-bottom-sheet__eyebrow">{isActivity ? 'OBSERWOWALNOŚĆ' : TYPE_LABEL[normalizedSelection?.type]?.toUpperCase()}</p>
      <h2>{title}</h2>
      {agent ? <div className="world-agent-detail">
        <figure className="world-agent-detail__portrait">
          <img src={getAgentPortraitAsset(agent.profile)} alt={`Portret: ${title}`} draggable={false} />
          <figcaption data-phase={livingAgent?.phase ?? 'unknown'}>{PHASE_LABEL[livingAgent?.phase] ?? 'oczekuje'}</figcaption>
        </figure>
        <div className="world-agent-detail__body">
          <p className="world-agent-detail__summary">{description}</p>
          <dl>
            <div><dt>Rola</dt><dd>{agent.archetype ?? agent.role ?? 'Agent Hermes'}</dd></div>
            <div><dt>Zadanie</dt><dd>{agentTask?.title ?? 'Brak aktywnego zadania'}</dd></div>
            <div className="world-agent-detail__event"><dt>Ostatnie zdarzenie</dt><dd>{lastEvent?.message ?? 'Brak nowych zdarzeń'}</dd></div>
          </dl>
        </div>
      </div> : <p>{description}</p>}
      {isActivity && <ActivityFeed />}
      {normalizedSelection?.type === 'agent' && <button className="world-bottom-sheet__action" type="button" onClick={() => openSheet?.('chat')}>Otwórz chat</button>}
    </section>
  )
}

export default BottomSheet
