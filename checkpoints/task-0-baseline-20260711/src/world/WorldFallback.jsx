import './worldFallback.css'
import { useWorldStore } from './store/worldStore.js'
import citadelArtUrl from '../assets/hermes-citadel-hd-v2.png'
import citadelMobileArtUrl from '../assets/hermes-citadel-mobile-v2.png'
import { getHDMapAgentPlacement } from './data/hdMapPlacement.js'
import { getAgentPortraitAsset } from './data/agentPortraitAssets.js'
import HermesInfrastructureLayer from './HermesInfrastructureLayer.jsx'
import { resolveLivingWorld } from './LivingWorldStateMachine.js'
import HeroSprite from '../components/HeroSprite.jsx'
import { getAgentRoadRoute, getWorldLifeJourney } from './data/roadGraph.js'
import { useDomWorldCamera } from './useDomWorldCamera.js'
import { usePresentationClock } from './usePresentationClock.js'

const BUILDINGS = [
  ['keep', 'Cytadela'], ['library', 'Biblioteka'], ['forge', 'Kuźnia'], ['research', 'Research Lab'],
  ['memory', 'Memory Hall'], ['warehouse', 'Magazyn'], ['watch', 'Wieża Obserwacji'], ['api', 'Port API'],
  ['post', 'Poczta'], ['camp', 'Obozowisko'], ['clock', 'Wieża Zegarowa'],
]

// Deliberately long, visible demo journeys. The short work anchors are still
// used by the real bridge; these routes make the mobile world legible before
// live tasks arrive: leave home, take a lane, enter the destination, return.
const DEMO_JOURNEYS = {
  default: { waypoint: [5, 8.65], target: [5, 6.7] },
  coder: { waypoint: [3.5, 6.95], target: [5.15, 6.2] },
  developer: { waypoint: [3.45, 8.9], target: [5, 8.65] },
  devops: { waypoint: [5, 8.65], target: [5.2, 7.8] },
  komandos: { waypoint: [6.65, 8.15], target: [5, 8.65] },
  orchestrator: { waypoint: [5, 4.75], target: [5, 6.7] },
  outreach: { waypoint: [6.45, 3.35], target: [8.65, 2.7] },
  prospecting: { waypoint: [3.65, 3.35], target: [1.4, 2.65] },
  researcher: { waypoint: [3.4, 4.9], target: [5, 4.75] },
  reviewer: { waypoint: [5, 6.7], target: [2.35, 6.65] },
  synthesizer: { waypoint: [6.65, 4.9], target: [5, 4.75] },
  verifier: { waypoint: [6.5, 6.95], target: [5, 6.7] },
}

const HERO_AURAS = Object.freeze({
  orchestrator: '224 188 104',
  prospecting: '102 190 130',
  developer: '91 196 232',
  coder: '238 155 78',
  devops: '93 156 232',
  reviewer: '111 218 184',
  synthesizer: '132 205 91',
  researcher: '119 142 238',
  default: '165 118 230',
  outreach: '230 145 103',
  komandos: '91 170 238',
  verifier: '72 202 226',
})

export default function WorldFallback() {
  const agents = useWorldStore((state) => state.agents ?? [])
  const tasks = useWorldStore((state) => state.tasks ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const zoomPreference = useWorldStore((state) => state.camera?.zoomPreference ?? 'standard')
  const selection = useWorldStore((state) => state.selection)
  const selectEntity = useWorldStore((state) => state.selectEntity)
  const worldCamera = useDomWorldCamera({ zoomPreference })
  const presentationNow = usePresentationClock()
  const livingByProfile = new Map(resolveLivingWorld({ agents, tasks, alerts, now: presentationNow }).map((state) => [state.profile, state]))
  return <div ref={worldCamera.viewportRef} className="fallback-world" aria-label="Żywy świat agentów Hermes OS" {...worldCamera.handlers}>
    <div ref={worldCamera.stageRef} className="fallback-map-stage" style={worldCamera.stageStyle}>
      <picture className="fallback-world__art"><source media="(max-width: 700px)" srcSet={citadelMobileArtUrl} /><img src={citadelArtUrl} alt="" /></picture>
      <HermesInfrastructureLayer />
      <div className="fallback-roads" />
      <div className="fallback-buildings">{BUILDINGS.map(([id, label], index) => <div className={`fallback-building fallback-building--${id}`} key={id} style={{ '--i': index }}><i /><b>{label}</b></div>)}</div>
      <div className="fallback-agents">{agents.slice(0, 12).map((agent, index) => {
        const placement = getHDMapAgentPlacement(agent.profile)
        const living = livingByProfile.get(agent.profile) ?? { phase: 'resting', visible: true }
        const journeyContract = getWorldLifeJourney(agent.profile)
        const journey = DEMO_JOURNEYS[agent.profile]
        const idle = [journeyContract?.homePoint.x ?? placement?.idleAnchor?.x ?? 5, journeyContract?.homePoint.y ?? placement?.idleAnchor?.y ?? 5]
        const work = [journeyContract?.workPoint.x ?? placement?.workAnchor?.x ?? journey?.target?.[0] ?? 5, journeyContract?.workPoint.y ?? placement?.workAnchor?.y ?? journey?.target?.[1] ?? 5]
        const entrance = [journeyContract?.entrancePoint.x ?? work[0], journeyContract?.entrancePoint.y ?? work[1]]
        const movingToWork = living.phase === 'walking-to-work'
        const movingHome = living.phase === 'walking-home'
        const arriving = living.phase === 'arriving'
        const success = living.phase === 'success'
        const atWork = ['working', 'observing', 'carrying', 'incident'].includes(living.phase)
        const blocked = living.phase === 'blocked'
        const rawRoute = arriving
          ? [{ x: entrance[0], y: entrance[1] }, { x: work[0], y: work[1] }]
          : getAgentRoadRoute(agent.profile, movingHome)
        const laneOffset = journeyContract?.laneOffset ?? 0
        const routePoints = rawRoute.map((point, routeIndex) => {
          const isEndpoint = routeIndex === 0 || routeIndex === rawRoute.length - 1
          return { x: (point.x + (isEndpoint ? 0 : laneOffset)) * 10, y: (point.y - (isEndpoint ? 0 : laneOffset * 0.45)) * 10 }
        })
        const routeStart = routePoints[0] ?? { x: idle[0] * 10, y: idle[1] * 10 }
        const routeEnd = routePoints.at(-1) ?? { x: work[0] * 10, y: work[1] * 10 }
        const routeFacing = routeEnd.x < routeStart.x ? 'west' : 'east'
        const isMovementPhase = movingToWork || movingHome || arriving
        const start = isMovementPhase
          ? [routeStart.x / 10, routeStart.y / 10]
          : success || blocked ? entrance : atWork ? work : idle
        const x = start[0] * 10
        const y = start[1] * 10
        const isFeatured = ['coder', 'researcher', 'prospecting'].includes(agent.profile)
        const scale = (isFeatured ? 0.67 : 0.75) + Math.min(0.1, Math.max(0, y / 1_000))
        const motion = isMovementPhase ? {
          points: routePoints,
          targetX: routeEnd.x,
          targetY: routeEnd.y,
          durationSeconds: (arriving ? journeyContract?.arriveDurationMs ?? 700 : journeyContract?.walkDurationMs ?? 5_400) / 1_000,
          delaySeconds: index * 0.035,
          repeat: false,
        } : null
        return <HeroSprite
          key={agent.profile ?? index}
          src={getAgentPortraitAsset(agent.profile)}
          x={x}
          y={y}
          scale={scale}
          status={living.visible ? living.phase : 'inside-working'}
          direction={isMovementPhase ? routeFacing : placement?.facing}
          isMoving={isMovementPhase}
          motion={motion}
          profile={agent.profile}
          isSelected={selection?.type === 'agent' && selection?.id === agent.profile}
          carryPackage={living.carryPackage}
          priority={living.task?.priority ?? 'normal'}
          auraRgb={HERO_AURAS[agent.profile]}
          onSelect={(event) => {
            event.stopPropagation()
            if (worldCamera.shouldSuppressSelection()) return
            selectEntity('agent', agent.profile)
          }}
        />
      })}</div>
      <div className="fallback-fountain"><i /><i /><i /></div>
    </div>
  </div>
}
