import './hermesInfrastructureLayer.css'
import { useWorldStore } from './store/worldStore.js'
import { resolveLivingWorld } from './LivingWorldStateMachine.js'

// Positioned only over landmarks already present on the approved mobile map.
// These are decorative data-infrastructure signals, never replacement
// buildings or a new world layout.
const CRYSTALS = [
  { id: 'core', buildingId: 'keep', x: 50, y: 35, scale: 1.2 },
  { id: 'archive', buildingId: 'library', x: 34, y: 15, scale: 0.82 },
  { id: 'observatory', buildingId: 'observatory', x: 71, y: 15, scale: 0.82 },
  { id: 'forge', buildingId: 'forge', x: 23, y: 43, scale: 0.78 },
  { id: 'vault', buildingId: 'memory-hall', x: 74, y: 44, scale: 0.75 },
  { id: 'relay', buildingId: 'webhook-post', x: 25, y: 63, scale: 0.68 },
]

const CONDUITS = [
  { id: 'archive-core', x: 38, y: 24, length: 18, angle: 54 },
  { id: 'core-vault', x: 59, y: 39, length: 21, angle: 32 },
  { id: 'forge-core', x: 31, y: 42, length: 18, angle: -15 },
  { id: 'relay-vault', x: 51, y: 57, length: 28, angle: -13 },
]

export default function HermesInfrastructureLayer() {
  const scenario = useWorldStore((state) => state.scenario)
  const agents = useWorldStore((state) => state.agents ?? [])
  const tasks = useWorldStore((state) => state.tasks ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const hasFlow = agents.some((agent) => agent.active || agent.isActive)
    || tasks.some((task) => task.status === 'running')
  const livingWorld = resolveLivingWorld({ agents, tasks, alerts })
  const stateByBuilding = new Map(livingWorld.map((state) => [state.buildingId, state.phase]))
  const stateByProfile = new Map(livingWorld.map((state) => [state.profile, state.phase]))
  const siteEffects = [
    { id: 'forge', profile: 'coder', effect: 'forge', x: 22, y: 62 },
    { id: 'archive', profile: 'researcher', effect: 'archive', x: 22, y: 42 },
    { id: 'watch', profile: 'prospecting', effect: 'watch', x: 44, y: 28 },
    { id: 'core-heartbeat', profile: 'orchestrator', effect: 'core', x: 50, y: 31 },
    { id: 'fountain-ambient', profile: null, effect: 'fountain', x: 50, y: 60 },
  ]
  return <div className={`hermes-infrastructure hermes-infrastructure--${scenario ?? 'healthy'}`} aria-hidden="true">
    {CONDUITS.map((conduit) => <i className={`hermes-conduit ${hasFlow ? 'is-flowing' : 'is-dormant'}`} key={conduit.id} style={{ '--x': `${conduit.x}%`, '--y': `${conduit.y}%`, '--length': `${conduit.length}%`, '--angle': `${conduit.angle}deg` }} />)}
    {CRYSTALS.map((crystal) => <i className={`hermes-crystal hermes-crystal--${crystal.id} crystal--${stateByBuilding.get(crystal.buildingId) ?? 'resting'}`} key={crystal.id} style={{ '--x': `${crystal.x}%`, '--y': `${crystal.y}%`, '--scale': crystal.scale }}><b /><em /><span /></i>)}
    {siteEffects.map((site) => {
      const phase = site.profile ? stateByProfile.get(site.profile) ?? 'resting' : 'ambient'
      return <i className={`hermes-site-effect hermes-site-effect--${site.effect} site-phase--${phase}`} key={site.id} style={{ '--site-x': `${site.x}%`, '--site-y': `${site.y}%` }}><b /><em /></i>
    })}
  </div>
}
