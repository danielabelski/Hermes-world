import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createWorldSnapshot } from './WorldBridge.js'

const profiles = { profiles: [{ name: 'default', is_active: false }] }

describe('real Hermes payload contracts', () => {
  it('normalizes epoch-second cron history returned by Hermes WebUI', () => {
    const snapshot = createWorldSnapshot({
      profiles,
      crons: { jobs: [{ id: 'nightly-health', name: 'Nightly health', enabled: true }] },
      cronHistory: {
        completions: [{ job_id: 'nightly-health', name: 'Nightly health', status: 'success', completed_at: 1784322000 }],
      },
    }, null, () => Date.parse('2026-07-18T00:00:00.000Z'))

    assert.equal(snapshot.raw.cronHistory.length, 1)
    assert.equal(snapshot.raw.cronHistory[0].completedAt, '2026-07-17T21:00:00.000Z')
    assert.equal(snapshot.crons[0].lastCompletionStatus, 'success')
    assert.equal(snapshot.activity[0].source, 'hermes-cron-history')
  })

  it('retains real metric updates instead of a prior cached temperature', () => {
    const first = createWorldSnapshot({ profiles, metrics: { cpuPercent: 30, memoryPercent: 50, temperatureC: 60 } })
    const second = createWorldSnapshot({ profiles, metrics: { cpuPercent: 31, memoryPercent: 51, temperatureC: 73 } }, first)
    assert.equal(second.system.temperatureC, 73)
    assert.equal(second.raw.metrics.temperatureC, 73)
  })
})
