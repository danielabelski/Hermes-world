import assert from 'node:assert/strict'
import { WORLD_LIFE_JOURNEYS, getAgentRoadRoute } from '../src/world/data/roadGraph.js'
import { createWorldSnapshot } from '../src/world/WorldBridge.js'
import { resolveLivingAgentState } from '../src/world/LivingWorldStateMachine.js'

for (const profile of ['coder', 'researcher', 'prospecting']) {
  const journey = WORLD_LIFE_JOURNEYS[profile]
  assert.ok(journey, `${profile}: missing journey`)
  assert.ok(journey.outboundWaypoints.length >= 4, `${profile}: outbound route is too short`)
  assert.ok(journey.returnWaypoints.length >= 3, `${profile}: return route is too short`)
  assert.deepEqual(journey.outboundWaypoints.at(-1), journey.entrancePoint, `${profile}: outbound route does not end at entrance`)
  assert.deepEqual(journey.returnWaypoints[0], journey.entrancePoint, `${profile}: return route does not begin at entrance`)
  assert.deepEqual(getAgentRoadRoute(profile, true), [...journey.returnWaypoints], `${profile}: return route contract was not used`)
  for (const point of journey.outboundWaypoints) {
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), `${profile}: invalid waypoint`)
  }
}

const origin = Date.parse('2026-07-11T08:00:00.000Z')
const payload = (status, completedAt = null) => ({
  profiles: { profiles: [{ name: 'coder', is_active: true, model: 'gpt-5-codex' }] },
  tasks: { tasks: [{ id: 'forge-1', title: 'Forge artifact', assignee: 'coder', status, priority: 'high', completed_at: completedAt }] },
  metrics: { cpuPercent: 22, memoryPercent: 44, temperatureC: 58 },
  logs: { lines: [] }, crons: { jobs: [] }, cronHistory: { completions: [] },
  sessions: { sessions: [] }, skills: { skills: [] }, models: { groups: [] },
})
const provenance = { source: 'live', connection: 'online', domains: {} }

const first = createWorldSnapshot(payload('running'), null, () => origin, provenance)
const firstTask = first.tasks[0]
const coder = first.agents[0]
const journey = WORLD_LIFE_JOURNEYS.coder
assert.equal(resolveLivingAgentState({ agent: coder, tasks: first.tasks, now: origin + 100 }).phase, 'walking-to-work')
assert.equal(resolveLivingAgentState({ agent: coder, tasks: first.tasks, now: origin + journey.walkDurationMs + 100 }).phase, 'arriving')
assert.equal(resolveLivingAgentState({ agent: coder, tasks: first.tasks, now: origin + journey.walkDurationMs + journey.arriveDurationMs + 100 }).phase, 'carrying')

const repeated = createWorldSnapshot(payload('running'), first, () => origin + 3_000, provenance)
assert.equal(repeated.tasks[0].transitionStartedAt, firstTask.transitionStartedAt, 'stable running snapshot restarted the journey')
assert.equal(repeated.tasks[0].transitionUntil, firstTask.transitionUntil, 'stable running snapshot changed transition end')

const doneAt = origin + 9_000
const done = createWorldSnapshot(payload('done', new Date(doneAt).toISOString()), repeated, () => doneAt, provenance)
assert.equal(resolveLivingAgentState({ agent: done.agents[0], tasks: done.tasks, now: doneAt + 100 }).phase, 'success')
assert.equal(resolveLivingAgentState({ agent: done.agents[0], tasks: done.tasks, now: doneAt + journey.successDurationMs + 100 }).phase, 'walking-home')
assert.equal(resolveLivingAgentState({ agent: done.agents[0], tasks: done.tasks, now: Date.parse(done.tasks[0].returnUntil) + 1 }).phase, 'resting')

const blocked = createWorldSnapshot(payload('blocked'), first, () => origin + 1_000, provenance)
assert.equal(resolveLivingAgentState({ agent: blocked.agents[0], tasks: blocked.tasks, now: origin + 1_000 }).phase, 'blocked')

console.log('World Life validation passed: journeys, polling persistence, FSM cycle and blocked state.')
