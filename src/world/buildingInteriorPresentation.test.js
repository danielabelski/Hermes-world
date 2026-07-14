import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveForgeInteriorPresentation } from './buildingInteriorPresentation.js'

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
    assert.equal(deriveForgeInteriorPresentation({ lifecycle: { connection: 'offline' } }).phase, 'offline')
  })
})
