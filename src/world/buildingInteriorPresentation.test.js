import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveBuildingInteriorPresentation, deriveForgeInteriorPresentation } from './buildingInteriorPresentation.js'

describe('Forge interior presentation', () => {
  it('stays in standby when no real Forge task exists', () => {
    const result = deriveForgeInteriorPresentation({ lifecycle: { connection: 'online' }, system: { cpuPercent: 22, temperatureC: 56 }, agent: { profile: 'coder' } })
    assert.equal(result.phase, 'standby')
    assert.equal(result.activeTaskCount, 0)
    assert.equal(result.cpuPercent, 22)
  })

  it('shows real work and preserves its evidence without inventing success', () => {
    const result = deriveForgeInteriorPresentation({
      lifecycle: { connection: 'online' },
      tasks: [{ id: 'build-1', assignee: 'coder', status: 'running', title: 'Build aplikacji', evidenceEventId: 'event-42' }],
    })
    assert.equal(result.phase, 'working')
    assert.equal(result.taskTitle, 'Build aplikacji')
    assert.equal(result.evidenceEventId, 'event-42')
    assert.equal(Object.hasOwn(result, 'success'), false)
  })

  it('prioritizes a local critical incident and reports offline honestly', () => {
    const critical = deriveForgeInteriorPresentation({
      lifecycle: { connection: 'online' },
      tasks: [{ assignee: 'coder', status: 'running' }],
      alerts: [{ entityId: 'forge', severity: 'critical', evidenceEventId: 'incident-7' }],
    })
    assert.equal(critical.phase, 'critical')
    assert.equal(critical.evidenceEventId, 'incident-7')
    assert.equal(deriveForgeInteriorPresentation({ lifecycle: { hermesStatus: 'offline', transport: 'live' } }).phase, 'offline')
    assert.equal(deriveForgeInteriorPresentation({
      lifecycle: { connection: 'offline', transport: 'reconnecting' },
      agent: { profile: 'coder', presence: 'online' },
      tasks: [{ assignee: 'coder', status: 'running' }],
    }).phase, 'working')
  })
})

describe('shared building interior presentation', () => {
  it('uses only real Archive inputs for counters and status', () => {
    const result = deriveBuildingInteriorPresentation('archive', {
      lifecycle: { connection: 'online' },
      tasks: [{ assignee: 'researcher', status: 'running', title: 'Analiza logów' }],
      activityItems: [{ title: 'Nowy wpis' }, { title: 'Heartbeat' }],
      modelSources: [{ modelId: 'gpt-5.6' }],
      memorySummary: { available: true, sectionCount: 4 },
    })
    assert.equal(result.phase, 'working')
    assert.deepEqual(result.metrics.map((item) => item.value), [4, 2, 1])
    assert.equal(result.taskTitle, 'Analiza logów')
  })

  it('exposes real Citadel, Watcher and Sanctum metrics without synthetic events', () => {
    const citadel = deriveBuildingInteriorPresentation('citadel', { lifecycle: { connection: 'online' }, system: { activeAgentCount: 3, totalAgentCount: 12 }, tokenRiver: { activeSessionCount: 2, totalEstimatedCost: 1.25 } })
    const watcher = deriveBuildingInteriorPresentation('watcher', { lifecycle: { connection: 'online' }, crons: [{ enabled: true, lastCompletionStatus: 'ok' }, { enabled: false, lastCompletionStatus: 'error' }] })
    const sanctum = deriveBuildingInteriorPresentation('sanctum', { lifecycle: { connection: 'online' }, system: { memoryPercent: 61, health: { score: 94 } } })
    assert.deepEqual(citadel.metrics.map((item) => item.value), [3, 2, 1.25])
    assert.deepEqual(watcher.metrics.map((item) => item.value), [2, 50, 0])
    assert.deepEqual(sanctum.metrics.map((item) => item.value), [61, 94, 0])
    assert.equal(Object.hasOwn(citadel, 'operationalState'), false)
    assert.equal(Object.hasOwn(watcher, 'success'), false)
  })
})
