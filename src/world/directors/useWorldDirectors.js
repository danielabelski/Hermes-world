import { useEffect, useMemo, useRef, useState } from 'react'
import { advanceAmbientDirector, createAmbientDirectorState, deriveAmbientPresentation, interruptAmbientAgent } from './ambientDirector.js'
import { createChoreographyState, deriveChoreographyPresentation, pruneChoreographyState, reduceChoreographyEvent } from './choreographyDirector.js'

const AMBIENT_TICK_MS = 1_000
const SNAPSHOT_EVENT_FRESHNESS_MS = 15_000

export function useWorldDirectors({ agents = [], now = 0, layout = 'desktop', enabled = true } = {}) {
  const agentsRef = useRef(agents)
  const layoutRef = useRef(layout)
  const seenEventIdsRef = useRef(new Set())
  const [choreographyState, setChoreographyState] = useState(createChoreographyState)
  const [ambientState, setAmbientState] = useState(() => createAmbientDirectorState({ now: Date.now() }))
  const [reactionLatencyMs, setReactionLatencyMs] = useState(null)
  useEffect(() => { agentsRef.current = agents }, [agents])
  useEffect(() => {
    layoutRef.current = layout
    const reset = window.setTimeout(() => setAmbientState((state) => ({ ...state, actions: Object.freeze([]), nextSelectionAt: Date.now() + 2_400 })), 0)
    return () => window.clearTimeout(reset)
  }, [layout])

  useEffect(() => {
    if (!enabled) return undefined
    const timer = window.setInterval(() => {
      const tickAt = Date.now()
      setAmbientState((state) => advanceAmbientDirector(state, { agents: agentsRef.current, now: tickAt, layout: layoutRef.current }))
      setChoreographyState((state) => pruneChoreographyState(state, tickAt))
    }, AMBIENT_TICK_MS)
    return () => window.clearInterval(timer)
  }, [enabled])

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return undefined
    try {
      const persisted = JSON.parse(window.sessionStorage.getItem('hermes-world-director-seen-v1') || '[]')
      seenEventIdsRef.current = new Set(Array.isArray(persisted) ? persisted.slice(-500) : [])
    } catch { /* session cursor is an optional replay guard */ }
    const source = new EventSource('/api/world/events/stream')
    const receive = (event) => {
      if (!event?.eventId || seenEventIdsRef.current.has(event.eventId)) return
      seenEventIdsRef.current.add(event.eventId)
      if (seenEventIdsRef.current.size > 1_000) seenEventIdsRef.current = new Set([...seenEventIdsRef.current].slice(-500))
      try { window.sessionStorage.setItem('hermes-world-director-seen-v1', JSON.stringify([...seenEventIdsRef.current].slice(-500))) } catch { /* optional replay guard */ }
      const receivedAt = Date.now()
      const receivedAtPerformance = window.performance.now()
      const publishedAt = Date.parse(event.publishedAt ?? event.occurredAt ?? '')
      const transportLatencyMs = Number.isFinite(publishedAt) ? Math.max(0, receivedAt - publishedAt) : 0
      setAmbientState((state) => interruptAmbientAgent(interruptAmbientAgent(state, event.agentId, receivedAt), 'orchestrator', receivedAt))
      setChoreographyState((state) => reduceChoreographyEvent(state, event, receivedAt))
      window.requestAnimationFrame(() => setReactionLatencyMs(Math.round(transportLatencyMs + window.performance.now() - receivedAtPerformance)))
    }
    const handleEvent = (message) => {
      try { receive(JSON.parse(message.data || '{}')) } catch { /* ingestion validates event payloads */ }
    }
    const handleSnapshot = (message) => {
      try {
        const payload = JSON.parse(message.data || '{}')
        const receivedAt = Date.now()
        const events = (Array.isArray(payload.events) ? payload.events : [])
          .filter((event) => Math.abs(receivedAt - Date.parse(event.occurredAt ?? '')) <= SNAPSHOT_EVENT_FRESHNESS_MS)
          .sort((left, right) => left.seq - right.seq)
        events.forEach(receive)
      } catch { /* ingestion validates event payloads */ }
    }
    source.addEventListener('snapshot', handleSnapshot)
    source.addEventListener('world_event', handleEvent)
    return () => source.close()
  }, [enabled])

  return useMemo(() => ({
    choreography: { ...deriveChoreographyPresentation(choreographyState, { now, layout }), responseLatencyMs: reactionLatencyMs },
    ambient: deriveAmbientPresentation(ambientState, { now }),
  }), [ambientState, choreographyState, layout, now, reactionLatencyMs])
}
