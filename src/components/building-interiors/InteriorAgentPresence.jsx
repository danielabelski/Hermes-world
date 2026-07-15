import { memo, useMemo, useState } from 'react'
import MapAgentSprite from '../map-agents/MapAgentSprite.jsx'
import { usePresentationClock } from '../../world/usePresentationClock.js'
import { resolveMapAgentPresentation } from '../../world/mapAgentPresentation.js'
import { deriveInteriorAgentPresence, INTERIOR_AGENT_PLACEMENTS } from '../../world/interiorAgentPresence.js'

function InteriorAgentPresence({ buildingId, agent, tasks = [], alerts = [], lifecycle = {}, layout = 'desktop', onDrillDown }) {
  const eligible = Boolean(agent && INTERIOR_AGENT_PLACEMENTS[buildingId]?.enabled)
  const now = usePresentationClock(eligible)
  const [expanded, setExpanded] = useState(false)
  const presentation = useMemo(() => eligible
    ? resolveMapAgentPresentation({ agent, tasks, alerts, lifecycle, now, layout })
    : null, [agent, alerts, eligible, layout, lifecycle, now, tasks])
  const presence = useMemo(() => deriveInteriorAgentPresence({ buildingId, presentation, tasks, lifecycle }), [buildingId, lifecycle, presentation, tasks])

  if (!presence) return null
  const cycleMs = presentation.walkCycleMs ?? 720
  const frameIndex = Math.floor(now / Math.max(120, cycleMs / 4)) % 4
  const animationPhase = (now % 3_600) / 3_600
  const sourceLabel = presence.evidenceSource === 'controlled-demo' ? 'kontrolowane dane demo' : presence.evidenceSource === 'live-event' ? 'zdarzenie Hermes' : 'bieżący task runtime'

  return <div className="cinematic-interior__agent-layer" data-interior-agent={presence.profileId} data-interior-stage={presence.stage} data-evidence-source={presence.evidenceSource}>
    <MapAgentSprite
      profileId={presence.profileId}
      visualState={presence.visualState}
      direction={presence.direction}
      worldX={presence.x}
      worldY={presence.y}
      baseScale={presence.scale}
      selected={expanded}
      severity={presence.severity}
      signalState={presence.signalState}
      frameIndex={frameIndex}
      animationPhase={animationPhase}
      carryPackage={presence.carryPackage}
      label={`${presence.label ?? presence.profileId} wewnątrz: ${presence.taskTitle ?? 'aktywne zadanie'}`}
      presentationSource="operational-interior"
      evidenceEventId={presence.evidenceEventId}
      onSelect={() => setExpanded((value) => !value)}
    />
    {expanded ? <aside className="interior-agent-card" style={{ '--agent-card-x': `${presence.x}cqw`, '--agent-card-y': `${presence.y}cqh` }} aria-live="polite">
      <span>{presence.stage === 'station' ? 'PRZY STANOWISKU' : presence.stage === 'entering' ? 'WEJŚCIE POTWIERDZONE' : 'WYJŚCIE POTWIERDZONE'}</span>
      <strong>{presence.label ?? presence.profileId}</strong>
      <p>{presence.taskTitle ?? 'Aktywny task bez opisu'}</p>
      <small>Źródło: {sourceLabel}{presence.evidenceEventId ? ` · ${presence.evidenceEventId}` : ''}</small>
      <button type="button" onClick={() => onDrillDown?.(presence.profileId)}>OTWÓRZ PROFIL</button>
    </aside> : null}
  </div>
}

export default memo(InteriorAgentPresence)
