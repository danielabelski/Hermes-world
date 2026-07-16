import { useEffect, useMemo, useRef, useState } from 'react'
import { advanceAmbientDirector, createAmbientDirectorState, createAmbientRouteHandoff, deriveAmbientHandoffPresentation, deriveAmbientPresentation, interruptAmbientAgent } from './ambientDirector.js'
import { createChoreographyState, deriveChoreographyPresentation, pruneChoreographyState, reduceChoreographyEvent } from './choreographyDirector.js'
import { subscribeWorldEventStream } from '../events/worldEventStream.js'

const AMBIENT_TICK_MS = 1_000
const SNAPSHOT_EVENT_FRESHNESS_MS = 15_000

export function useWorldDirectors({ agents = [], now = 0, layout = 'desktop', enabled = true, ambientEnabled = enabled } = {}) {
  const agentsRef = useRef(agents)
  const layoutRef = useRef(layout)
  const ambientStateRef = useRef(null)
  const seenEventIdsRef = useRef(new Set())
  const [choreographyState, setChoreographyState] = useState(createChoreographyState)
  const [ambientState, setAmbientState] = useState(() => createAmbientDirectorState({ now: Date.now() }))
  const [handoffs, setHandoffs] = useState([])
  const [reactionLatencyMs, setReactionLatencyMs] = useState(null)
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden')
  useEffect(() => { agentsRef.current = agents }, [agents])
  useEffect(() => { ambientStateRef.current = ambientState }, [ambientState])
  useEffect(() => {
    layoutRef.current = layout
    const reset = window.setTimeout(() => {
      setAmbientState((state) => ({ ...state, actions: Object.freeze([]), nextSelectionAt: Date.now() + 2_400 }))
      setHandoffs([])
    }, 0)
    return () => window.clearTimeout(reset)
  }, [layout])

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])

  useEffect(() => {
    if (!ambientEnabled || !pageVisible) return undefined
    const timer = window.setInterval(() => {
      const tickAt = Date.now()
      setAmbientState((state) => advanceAmbientDirector(state, { agents: agentsRef.current, now: tickAt, layout: layoutRef.current }))
      setChoreographyState((state) => pruneChoreographyState(state, tickAt))
    }, AMBIENT_TICK_MS)
    return () => window.clearInterval(timer)
  }, [ambientEnabled, pageVisible])

  useEffect(() => {
    if (!enabled) return undefined
    try {
      const persisted = JSON.parse(window.sessionStorage.getItem('hermes-world-director-seen-v1') || '[]')
      seenEventIdsRef.current = new Set(Array.isArray(persisted) ? persisted.slice(-500) : [])
    } catch { /* session cursor is an optional replay guard */ }
    const receive = (event) => {
      if (!event?.eventId || seenEventIdsRef.current.has(event.eventId)) return
      seenEventIdsRef.current.add(event.eventId)
      if (seenEventIdsRef.current.size > 1_000) seenEventIdsRef.current = new Set([...seenEventIdsRef.current].slice(-500))
      try { window.sessionStorage.setItem('hermes-world-director-seen-v1', JSON.stringify([...seenEventIdsRef.current].slice(-500))) } catch { /* optional replay guard */ }
      const receivedAt = Date.now()
      const receivedAtPerformance = window.performance.now()
      const publishedAt = Date.parse(event.publishedAt ?? event.occurredAt ?? '')
      const transportLatencyMs = Number.isFinite(publishedAt) ? Math.max(0, receivedAt - publishedAt) : 0
      const interruptedAction = ambientStateRef.current?.actions?.find((action) => action.profileId === event.agentId)
      const handoff = createAmbientRouteHandoff(interruptedAction, {
        now: receivedAt,
        layout: layoutRef.current,
        runId: event.runId,
        evidenceEventId: event.eventId,
      })
      if (handoff) setHandoffs((current) => [...current.filter((candidate) => candidate.profileId !== handoff.profileId && candidate.endsAt >= receivedAt), handoff])
      setAmbientState((state) => interruptAmbientAgent(interruptAmbientAgent(state, event.agentId, receivedAt), 'orchestrator', receivedAt))
      setChoreographyState((state) => reduceChoreographyEvent(state, event, receivedAt))
      window.requestAnimationFrame(() => setReactionLatencyMs(Math.round(transportLatencyMs + window.performance.now() - receivedAtPerformance)))
    }
    const handleSnapshot = (snapshotEvents) => {
      const receivedAt = Date.now()
      const events = snapshotEvents
        .filter((event) => Math.abs(receivedAt - Date.parse(event.occurredAt ?? '')) <= SNAPSHOT_EVENT_FRESHNESS_MS)
        .sort((left, right) => left.seq - right.seq)
      events.forEach(receive)
    }
    return subscribeWorldEventStream({ onSnapshot: handleSnapshot, onEvent: receive })
  }, [enabled])

  return useMemo(() => ({
    choreography: { ...deriveChoreographyPresentation(choreographyState, { now, layout }), responseLatencyMs: reactionLatencyMs },
    ambient: deriveAmbientPresentation(ambientState, { now }),
    handoff: deriveAmbientHandoffPresentation(handoffs, { now }),
  }), [ambientState, choreographyState, handoffs, layout, now, reactionLatencyMs])
}
