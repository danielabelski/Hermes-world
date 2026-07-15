// Pure domain → scene contract. It contains no renderer calls, so Pixi and
// the reliable DOM renderer show exactly the same living-world behaviour.
import { getWorldLifeJourney } from './data/roadGraph.js'

export const LIVING_AGENT_PHASES = Object.freeze([
  'resting', 'walking-to-work', 'arriving', 'working', 'observing', 'carrying',
  'walking-home', 'success', 'thinking', 'waiting', 'warning', 'stuck', 'blocked', 'incident', 'unknown',
])

const TRANSITION_WINDOW_MS = 4_200
const SUCCESS_WINDOW_MS = 3_400
const RETURN_WINDOW_MS = 7_400

const asTime = (value, fallback) => {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : fallback
}

const TASK_STATUS_RANK = Object.freeze({
  error: 0,
  blocked: 1,
  running: 2,
  review: 3,
  waiting: 4,
  pending: 4,
  scheduled: 4,
  ready: 4,
  done: 6,
})

const taskFor = (agent, tasks) => tasks
  .filter((task) => task.assignee === agent.profile || task.ownerAgentId === agent.id || task.agentId === agent.profile)
  .sort((left, right) => {
    const rank = (TASK_STATUS_RANK[String(left.status).toLowerCase()] ?? 99) - (TASK_STATUS_RANK[String(right.status).toLowerCase()] ?? 99)
    if (rank) return rank
    return asTime(right.visualCompletedAt ?? right.startedAt ?? right.createdAt, 0) - asTime(left.visualCompletedAt ?? left.startedAt ?? left.createdAt, 0)
  })[0]

const alertFor = (agent, alerts) => alerts.find((alert) =>
  alert.entityId === agent.profile || alert.agentId === agent.profile || alert.profile === agent.profile,
)

/**
 * One stable state descriptor for each visible agent.
 *
 * This state machine never invents a repeating work cycle.  Backend/task time
 * stamps may trigger one short transition; a stable snapshot stays stable.
 */
export function resolveLivingAgentState({ agent, tasks = [], alerts = [], now = Date.now() }) {
  const task = taskFor(agent, tasks)
  const alert = alertFor(agent, alerts)
  const journey = getWorldLifeJourney(agent.profile)
  const level = String(alert?.severity ?? alert?.level ?? '').toLowerCase()

  if (['critical', 'error', 'fatal'].includes(level) || task?.status === 'error') {
    return Object.freeze({ phase: 'incident', task, alert, visible: true, location: 'incident', buildingEffect: 'alarm', carryPackage: false })
  }
  if (task?.status === 'blocked' || ['stuck', 'blocked'].includes(String(agent.state ?? '').toLowerCase())) {
    return Object.freeze({ phase: 'stuck', task, alert, visible: true, location: 'route', buildingEffect: 'stuck', carryPackage: true })
  }
  if (level === 'warning') {
    return Object.freeze({ phase: 'warning', task, alert, visible: true, location: 'route', buildingEffect: 'attention', carryPackage: Boolean(task) })
  }
  if (['scheduled', 'ready', 'waiting', 'pending'].includes(String(task?.status ?? '').toLowerCase())) {
    return Object.freeze({ phase: 'waiting', task, alert, visible: true, location: 'home', buildingEffect: 'waiting', carryPackage: false })
  }
  if (String(agent.state ?? '').toLowerCase() === 'thinking' || String(task?.status ?? '').toLowerCase() === 'thinking') {
    return Object.freeze({ phase: 'thinking', task, alert, visible: true, location: 'home', buildingEffect: 'thinking', carryPackage: false })
  }
  // Scripted demo beats and live domain events can explicitly request a
  // pedestrian transition. Resolve it before a long-running task settles at
  // its work anchor, otherwise the agent appears to teleport into a building.
  if (['walking', 'walking-to-work'].includes(agent.state)) {
    return Object.freeze({ phase: 'walking-to-work', task, alert, visible: true, location: 'work-route', buildingEffect: 'active', carryPackage: Boolean(task) })
  }
  if (agent.state === 'walking-home') {
    return Object.freeze({ phase: 'walking-home', task, alert, visible: true, location: 'return-route', buildingEffect: 'quiet', carryPackage: false })
  }
  if (['observe', 'observing'].includes(agent.state)) {
    return Object.freeze({ phase: 'observing', task, alert, visible: true, location: 'observation-point', buildingEffect: journey?.workEffect ?? 'scout-signal', carryPackage: false })
  }
  if (task?.status === 'done') {
    const completionEvidence = task.visualCompletedAt ?? task.completedAt ?? task.completed_at
    // A historical done item without a trustworthy timestamp is resting.
    // Falling back to now would fabricate a fresh Success on first ingest.
    if (!completionEvidence) {
      return Object.freeze({ phase: 'resting', task, visible: true, location: 'home', buildingEffect: 'idle', carryPackage: false })
    }
    const completedAt = asTime(completionEvidence, now)
    const successWindow = journey?.successDurationMs ?? SUCCESS_WINDOW_MS
    const returnUntil = asTime(task.returnUntil, completedAt + (journey?.walkDurationMs ?? RETURN_WINDOW_MS))
    if (now - completedAt < successWindow) {
      return Object.freeze({ phase: 'success', task, visible: true, location: 'entrance', buildingEffect: 'success', carryPackage: Boolean(journey) })
    }
    if (now < returnUntil) {
      return Object.freeze({ phase: 'walking-home', task, visible: true, location: 'return-route', buildingEffect: 'quiet', carryPackage: Boolean(journey) })
    }
    return Object.freeze({ phase: 'resting', task, visible: true, location: 'home', buildingEffect: 'idle', carryPackage: false })
  }
  if (task?.status === 'running') {
    const startedAt = asTime(task.transitionStartedAt ?? task.startedAt ?? task.started_at, 0)
    const walkDuration = journey?.walkDurationMs ?? TRANSITION_WINDOW_MS
    const arriveDuration = journey?.arriveDurationMs ?? 700
    const transitionUntil = asTime(task.transitionUntil, startedAt + walkDuration + arriveDuration)
    if (startedAt > 0 && now >= startedAt && now < Math.min(transitionUntil, startedAt + walkDuration)) {
      return Object.freeze({ phase: 'walking-to-work', task, visible: true, location: 'work-route', buildingEffect: 'active', carryPackage: true })
    }
    if (startedAt > 0 && now < transitionUntil) {
      return Object.freeze({ phase: 'arriving', task, visible: true, location: 'entrance', buildingEffect: 'active', carryPackage: true })
    }
    return Object.freeze({ phase: 'carrying', task, visible: true, location: 'work', buildingEffect: journey?.workEffect ?? 'working', carryPackage: true })
  }
  if (agent.active || agent.isActive) {
    return Object.freeze({ phase: 'working', task: null, visible: true, location: 'work', buildingEffect: 'working', carryPackage: false })
  }
  return Object.freeze({ phase: 'resting', task: null, visible: true, location: 'home', buildingEffect: 'idle', carryPackage: false })
}

export function resolveLivingWorld({ agents = [], tasks = [], alerts = [], now = Date.now() }) {
  return Object.freeze(agents.map((agent) => Object.freeze({
    profile: agent.profile,
    buildingId: agent.buildingId,
    ...resolveLivingAgentState({ agent, tasks, alerts, now }),
  })))
}
