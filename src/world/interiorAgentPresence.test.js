import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveInteriorAgentPresence, INTERIOR_AGENT_PLACEMENTS } from './interiorAgentPresence.js'
import { resolveMapAgentPresentation } from './mapAgentPresentation.js'
import { getWorldLifeJourney } from './data/roadGraph.js'

const task = { id: 'build-42', assignee: 'coder', status: 'running', title: 'Build Hermes World', evidenceEventId: 'event-42' }
const forgePresentation = {
  profileId: 'coder', buildingId: 'forge', taskId: task.id, isInside: true,
  journeyStage: 'work', routeProgress: 1, visualState: 'work', signalState: 'none', severity: 'none', carryPackage: true,
  evidenceEventId: task.evidenceEventId, label: 'Kowal',
}

describe('interior agent evidence contract', () => {
  it('renders the Kowal only after the same presentation has atomically entered', () => {
    assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: { ...forgePresentation, isInside: false }, tasks: [task], lifecycle: { connection: 'online' } }), null)
    const result = deriveInteriorAgentPresence({ buildingId: 'forge', presentation: forgePresentation, tasks: [task], lifecycle: { connection: 'online', source: 'live' } })
    assert.equal(result.profileId, 'coder')
    assert.equal(result.stage, 'station')
    assert.equal(result.evidenceEventId, 'event-42')
    assert.equal(result.evidenceSource, 'live-event')
  })

  it('maps the verified entrance and exit windows onto a complete local route', () => {
    const entering = deriveInteriorAgentPresence({
      buildingId: 'forge', tasks: [task], lifecycle: { connection: 'online' },
      presentation: { ...forgePresentation, journeyStage: 'enter', routeProgress: 0.62, visualState: 'walk' },
    })
    const exiting = deriveInteriorAgentPresence({
      buildingId: 'forge', tasks: [task], lifecycle: { connection: 'online' },
      presentation: { ...forgePresentation, journeyStage: 'exit', routeProgress: 0.37, visualState: 'walk' },
    })
    assert.equal(entering.stage, 'entering')
    assert.ok(entering.y > 93)
    assert.equal(exiting.stage, 'exiting')
    assert.ok(exiting.y > 92)
  })

  it('never invents evidence and rejects another task, profile or stale lifecycle', () => {
    const noEvent = deriveInteriorAgentPresence({ buildingId: 'forge', presentation: { ...forgePresentation, evidenceEventId: null }, tasks: [{ ...task, evidenceEventId: null }], lifecycle: { connection: 'online', source: 'live' } })
    assert.equal(noEvent.evidenceEventId, null)
    assert.equal(noEvent.evidenceSource, 'runtime-task')
    assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: forgePresentation, tasks: [{ ...task, id: 'other' }], lifecycle: { connection: 'online' } }), null)
    assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: { ...forgePresentation, profileId: 'researcher' }, tasks: [task], lifecycle: { connection: 'online' } }), null)
    assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: forgePresentation, tasks: [task], lifecycle: { connection: 'stale' } }), null)
    assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: { ...forgePresentation, evidenceEventId: null }, tasks: [{ ...task, evidenceEventId: null }], lifecycle: { connection: 'online', domains: { tasks: { state: 'stale' } } } }), null)
    assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: forgePresentation, tasks: [task], lifecycle: { connection: 'online', domains: { tasks: { state: 'stale' } } } }).evidenceEventId, 'event-42')
  })

  it('keeps unverified interior routes disabled instead of faking location', () => {
    for (const buildingId of ['citadel', 'watcher', 'sanctum']) {
      assert.equal(INTERIOR_AGENT_PLACEMENTS[buildingId].enabled, false)
      assert.equal(deriveInteriorAgentPresence({ buildingId, presentation: { ...forgePresentation, profileId: INTERIOR_AGENT_PLACEMENTS[buildingId].profileId, buildingId, isInside: true }, tasks: [task], lifecycle: { connection: 'online' } }), null)
    }
  })

  it('supports the researcher only through the verified Archive inside route', () => {
    const archiveTask = { id: 'research-1', assignee: 'researcher', status: 'running' }
    const result = deriveInteriorAgentPresence({
      buildingId: 'archive', tasks: [archiveTask], lifecycle: { connection: 'online', source: 'demo' },
      presentation: { ...forgePresentation, profileId: 'researcher', buildingId: 'archive', taskId: archiveTask.id, evidenceEventId: null },
    })
    assert.equal(result.profileId, 'researcher')
    assert.equal(result.evidenceSource, 'controlled-demo')
  })

  it('keeps the full Forge handoff exclusive and continuous on mobile and desktop', () => {
    const startedAt = Date.parse('2026-07-15T02:00:00.000Z')
    const agent = { id: 'coder', profile: 'coder', buildingId: 'forge', displayName: 'Kowal', state: 'working', active: true, isActive: true }
    for (const layout of ['mobile', 'desktop']) {
      const journey = getWorldLifeJourney('coder', layout)
      const running = { id: `forge-${layout}`, assignee: 'coder', status: 'running', title: 'Real build', transitionStartedAt: new Date(startedAt).toISOString(), transitionUntil: new Date(startedAt + journey.walkDurationMs + journey.arriveDurationMs).toISOString() }
      const beforeThreshold = resolveMapAgentPresentation({ agent, tasks: [running], now: startedAt + journey.walkDurationMs + journey.arriveDurationMs * 0.5, layout })
      assert.equal(beforeThreshold.isInside, false)
      assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: beforeThreshold, tasks: [running], lifecycle: { connection: 'online' } }), null)

      const enteringModel = resolveMapAgentPresentation({ agent, tasks: [running], now: startedAt + journey.walkDurationMs + journey.arriveDurationMs * 0.75, layout })
      const entering = deriveInteriorAgentPresence({ buildingId: 'forge', presentation: enteringModel, tasks: [running], lifecycle: { connection: 'online' } })
      assert.equal(enteringModel.isInside, true)
      assert.equal(entering.stage, 'entering')
      assert.ok(entering.interiorProgress > 0 && entering.interiorProgress < 1)

      const workingModel = resolveMapAgentPresentation({ agent, tasks: [running], now: startedAt + journey.walkDurationMs + journey.arriveDurationMs + 100, layout })
      const working = deriveInteriorAgentPresence({ buildingId: 'forge', presentation: workingModel, tasks: [running], lifecycle: { connection: 'online' } })
      assert.equal(working.stage, 'station')
      assert.equal(working.visualState, 'work')

      const completedAt = startedAt + journey.walkDurationMs + journey.arriveDurationMs + 1_000
      const done = { ...running, status: 'done', completedAt: new Date(completedAt).toISOString(), visualCompletedAt: new Date(completedAt).toISOString() }
      const exitingModel = resolveMapAgentPresentation({ agent: { ...agent, active: false, isActive: false }, tasks: [done], now: completedAt + 100, layout })
      assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: exitingModel, tasks: [done], lifecycle: { connection: 'online' } }).stage, 'exiting')
      const outsideModel = resolveMapAgentPresentation({ agent: { ...agent, active: false, isActive: false }, tasks: [done], now: completedAt + 700, layout })
      assert.equal(outsideModel.isInside, false)
      assert.equal(deriveInteriorAgentPresence({ buildingId: 'forge', presentation: outsideModel, tasks: [done], lifecycle: { connection: 'online' } }), null)
    }
  })

  it('keeps map ownership when the interior cannot prove the same task', () => {
    const agent = { id: 'coder', profile: 'coder', displayName: 'Kowal', buildingId: 'forge', state: 'working', active: true }
    const withoutTask = resolveMapAgentPresentation({ agent, tasks: [], lifecycle: { connection: 'online' }, now: Date.parse('2026-07-15T09:00:00Z'), layout: 'mobile' })
    assert.equal(withoutTask.isInside, false)
    assert.equal(withoutTask.interiorOwnershipEligible, false)

    const staleTask = { ...task, evidenceEventId: null }
    const stale = resolveMapAgentPresentation({ agent, tasks: [staleTask], lifecycle: { connection: 'online', domains: { tasks: { state: 'stale' } } }, now: Date.parse('2026-07-15T09:00:00Z'), layout: 'mobile' })
    assert.equal(stale.isInside, false)
    assert.equal(stale.interiorOwnershipEligible, false)

    const evidenced = resolveMapAgentPresentation({ agent, tasks: [{ ...staleTask, evidenceEventId: 'event-live-7' }], lifecycle: { connection: 'online', domains: { tasks: { state: 'stale' } } }, now: Date.parse('2026-07-15T09:00:00Z'), layout: 'mobile' })
    assert.equal(evidenced.isInside, true)
    assert.equal(evidenced.interiorOwnershipEligible, true)
  })
})
