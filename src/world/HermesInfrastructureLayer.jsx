import './hermesInfrastructureLayer.css'
import { useWorldStore } from './store/worldStore.js'
import { resolveLivingWorld } from './LivingWorldStateMachine.js'
import { resolveInfrastructureFlowPresentation } from './infrastructureFlowPresentation.js'

const segment = (id, profile, from, to) => {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  return Object.freeze({ id, profile, x: from[0], y: from[1], length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) * 180 / Math.PI })
}

const LAYOUT = Object.freeze({
  desktop: Object.freeze({
    crystals: Object.freeze([
      { id: 'core', buildingId: 'keep', systemRole: 'orchestration-command', x: 46, y: 34, scale: 1.05 },
      { id: 'archive', buildingId: 'library', systemRole: 'logs-memory-records', x: 27, y: 31, scale: 0.7 },
      { id: 'forge', buildingId: 'forge', systemRole: 'build-load-throughput', x: 84, y: 46.5, scale: 0.72 },
      { id: 'observatory', buildingId: 'scout-lodge', systemRole: 'monitoring-observability', x: 67, y: 31.5, scale: 0.68 },
    ]),
    conduits: Object.freeze([
      segment('core-forge', 'coder', [46, 37], [84, 49]),
      segment('core-archive', 'researcher', [46, 37], [28.5, 36.5]),
      segment('core-observatory', 'prospecting', [46, 37], [67, 31.5]),
    ]),
  }),
  mobile: Object.freeze({
    crystals: Object.freeze([
      { id: 'core', buildingId: 'keep', systemRole: 'orchestration-command', x: 50, y: 43, scale: 1.05 },
      { id: 'archive', buildingId: 'library', systemRole: 'logs-memory-records', x: 24.5, y: 65.5, scale: 0.7 },
      { id: 'forge', buildingId: 'forge', systemRole: 'build-load-throughput', x: 23.5, y: 44.5, scale: 0.72 },
      { id: 'observatory', buildingId: 'scout-lodge', systemRole: 'monitoring-observability', x: 65.5, y: 71.2, scale: 0.68 },
    ]),
    conduits: Object.freeze([
      segment('core-forge', 'coder', [50, 43], [30.5, 49.2]),
      segment('core-archive', 'researcher', [50, 43], [35.5, 70.5]),
      segment('core-observatory', 'prospecting', [50, 43], [65.5, 71.2]),
    ]),
  }),
})

export default function HermesInfrastructureLayer({ layout = 'desktop' }) {
  const scenario = useWorldStore((state) => state.scenario)
  const agents = useWorldStore((state) => state.agents ?? [])
  const tasks = useWorldStore((state) => state.tasks ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const livingWorld = resolveLivingWorld({ agents, tasks, alerts })
  const stateByBuilding = new Map(livingWorld.map((state) => [state.buildingId, state.phase]))
  const stateByProfile = new Map(livingWorld.map((state) => [state.profile, state.phase]))
  const config = LAYOUT[layout === 'mobile' ? 'mobile' : 'desktop']

  return <div className={`hermes-infrastructure hermes-infrastructure--${scenario ?? 'healthy'}`} aria-hidden="true">
    {config.conduits.map((conduit) => {
      const phase = stateByProfile.get(conduit.profile) ?? 'resting'
      const presentation = resolveInfrastructureFlowPresentation(phase)
      return <i
        className={`hermes-conduit is-${presentation.state} flow-${presentation.tone}`}
        data-flow-type="agent-work"
        data-source-profile={conduit.profile}
        data-source-phase={phase}
        data-flow-state={presentation.state}
        data-flow-tone={presentation.tone}
        key={conduit.id}
        style={{ '--x': `${conduit.x}%`, '--y': `${conduit.y}%`, '--length': `${conduit.length}%`, '--angle': `${conduit.angle}deg` }}
      />
    })}
    {config.crystals.filter((crystal) => crystal.id !== 'core').map((crystal) => {
      const phase = stateByBuilding.get(crystal.buildingId) ?? 'resting'
      return <i className={`hermes-crystal hermes-crystal--${crystal.id} crystal--${phase}`} data-building-id={crystal.buildingId} data-building-phase={phase} data-system-role={crystal.systemRole} key={crystal.id} style={{ '--x': `${crystal.x}%`, '--y': `${crystal.y}%`, '--scale': crystal.scale }}><b /><em /><span /></i>
    })}
  </div>
}
