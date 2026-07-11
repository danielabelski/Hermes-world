/**
 * Contract-level smoke checks for the illustrated vertical slice.
 *
 * These checks run against renderer-neutral definitions and demo data. They
 * catch a broken profile/building/route relationship before a Pixi scene is
 * even mounted, and remain useful when the project grows past 12 agents.
 */

import { AGENT_DEFINITIONS } from './data/agentDefinitions.js'
import { BUILDING_DEFINITIONS } from './data/buildingDefinitions.js'
import { DEMO_AGENT_ROSTER, DEMO_TASKS } from './data/demoWorldData.js'

export const VERTICAL_SLICE_INVARIANTS = Object.freeze({
  expectedAgentCount: 12,
  minimumBuildingCount: 10,
  minimumDemoTaskCount: 3,
  requiredSelectionTypes: Object.freeze(['agent', 'building', 'task']),
})

const asArray = (value) => Array.isArray(value) ? value : Object.values(value ?? {})
const hasPoint = (point) => Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y))
const unique = (values) => new Set(values).size === values.length

/**
 * Returns an immutable report rather than throwing, so a development HUD or
 * CI script can show every missing world contract in one pass.
 */
export function validateWorldVerticalSlice({
  agentDefinitions = AGENT_DEFINITIONS,
  buildingDefinitions = BUILDING_DEFINITIONS,
  demoAgents = DEMO_AGENT_ROSTER,
  demoTasks = DEMO_TASKS,
  invariants = VERTICAL_SLICE_INVARIANTS,
} = {}) {
  const agents = asArray(agentDefinitions)
  const buildings = asArray(buildingDefinitions)
  const roster = asArray(demoAgents)
  const tasks = asArray(demoTasks)
  const issues = []
  const checks = {}
  const buildingIds = new Set(buildings.map((building) => building.id))
  const agentIds = agents.map((agent) => String(agent.profile ?? agent.id ?? ''))
  const demoAgentIds = new Set(roster.map((agent) => String(agent.profile ?? agent.id ?? '')))

  checks.agentCount = agents.length === invariants.expectedAgentCount
  if (!checks.agentCount) issues.push(`expected-${invariants.expectedAgentCount}-agents-found-${agents.length}`)

  checks.buildingCount = buildings.length >= invariants.minimumBuildingCount
  if (!checks.buildingCount) issues.push(`expected-at-least-${invariants.minimumBuildingCount}-buildings-found-${buildings.length}`)

  checks.uniqueAgentProfiles = agentIds.every(Boolean) && unique(agentIds)
  if (!checks.uniqueAgentProfiles) issues.push('agent-profiles-must-be-unique-and-nonempty')

  checks.uniqueBuildingIds = unique(buildings.map((building) => building.id))
  if (!checks.uniqueBuildingIds) issues.push('building-ids-must-be-unique')

  const routeFailures = []
  const buildingFailures = []
  for (const agent of agents) {
    const id = String(agent.profile ?? agent.id ?? 'unknown')
    if (!buildingIds.has(agent.buildingId)) buildingFailures.push(id)
    const path = Array.isArray(agent.idlePath) ? agent.idlePath : []
    if (!hasPoint(agent.spawnAnchor) || !hasPoint(agent.workAnchor) || path.length < 2 || !path.every(hasPoint)) routeFailures.push(id)
  }
  checks.agentBuildingsExist = buildingFailures.length === 0
  if (!checks.agentBuildingsExist) issues.push(`agents-with-missing-buildings:${buildingFailures.join(',')}`)
  checks.agentRoutesAreComplete = routeFailures.length === 0
  if (!checks.agentRoutesAreComplete) issues.push(`agents-with-incomplete-routes:${routeFailures.join(',')}`)

  const demoMissing = agentIds.filter((profile) => !demoAgentIds.has(profile))
  checks.demoRosterMatchesWorld = demoMissing.length === 0 && roster.length >= invariants.expectedAgentCount
  if (!checks.demoRosterMatchesWorld) issues.push(`demo-roster-missing:${demoMissing.join(',') || 'agents'}`)

  checks.demoTasksAvailable = tasks.length >= invariants.minimumDemoTaskCount && tasks.every((task) => task.id && task.status)
  if (!checks.demoTasksAvailable) issues.push('demo-tasks-must-have-id-and-status')

  const taskAssigneeFailures = tasks.filter((task) => task.assignee && !agentIds.includes(String(task.assignee))).map((task) => task.id)
  checks.taskAssignmentsAreKnown = taskAssigneeFailures.length === 0
  if (!checks.taskAssignmentsAreKnown) issues.push(`tasks-with-unknown-assignee:${taskAssigneeFailures.join(',')}`)

  const selectable = {
    agent: agentIds.filter(Boolean),
    building: buildings.map((building) => String(building.id ?? '')).filter(Boolean),
    task: tasks.map((task) => String(task.id ?? '')).filter(Boolean),
  }
  checks.selectionTargetsAvailable = invariants.requiredSelectionTypes.every((type) => selectable[type]?.length)
  if (!checks.selectionTargetsAvailable) issues.push('selection-targets-missing')

  return Object.freeze({
    ok: issues.length === 0,
    checks: Object.freeze(checks),
    issues: Object.freeze(issues),
    counts: Object.freeze({ agents: agents.length, buildings: buildings.length, demoAgents: roster.length, demoTasks: tasks.length }),
    selectable: Object.freeze({
      agent: Object.freeze(selectable.agent),
      building: Object.freeze(selectable.building),
      task: Object.freeze(selectable.task),
    }),
  })
}

/** Throws a concise error for a command-line or CI smoke run. */
export function assertWorldVerticalSlice(options) {
  const report = validateWorldVerticalSlice(options)
  if (!report.ok) throw new Error(`Living World vertical-slice invariant failed: ${report.issues.join('; ')}`)
  return report
}

/**
 * Validates a normalized runtime snapshot's selection surface. This is useful
 * after WorldBridge receives partial real API data, without requiring the
 * renderer to exist.
 */
export function validateSnapshotSelectionReadiness(snapshot = {}) {
  const agents = asArray(snapshot.agents ?? snapshot.agentsById)
  const buildings = asArray(snapshot.buildings ?? snapshot.buildingsById)
  const tasks = asArray(snapshot.tasks ?? snapshot.tasksById)
  const missing = []
  if (!agents.some((agent) => agent.profile ?? agent.id)) missing.push('agent')
  if (!buildings.some((building) => building.id)) missing.push('building')
  if (!tasks.some((task) => task.id)) missing.push('task')
  return Object.freeze({ ready: missing.length === 0, missing: Object.freeze(missing) })
}
