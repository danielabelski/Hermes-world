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
      assert.equal(snapshot.activity[0].cronName, 'Nightly health')
      assert.equal(snapshot.activity[0].cronStatus, 'success')
  })

  it('uses authoritative cron inventory last runs when recent completion history is empty', () => {
    const snapshot = createWorldSnapshot({
      profiles,
      crons: { jobs: [
        { id: 'build', name: 'build-everyday', enabled: true, last_run_at: '2026-07-18T17:30:00+02:00', last_status: 'ok' },
        { id: 'watchdog', name: 'kanban-requeue-watchdog', enabled: true, last_run_at: '2026-07-18T18:00:00+02:00' },
      ] },
      cronHistory: { completions: [] },
    }, null, () => Date.parse('2026-07-18T18:05:00+02:00'))

    assert.equal(snapshot.cronHistory.length, 2)
    assert.equal(snapshot.activity.length, 2)
    assert.equal(snapshot.activity[0].cronName, 'kanban-requeue-watchdog')
    assert.equal(snapshot.activity[0].cronStatus, 'completed')
    assert.match(snapshot.activity[0].message, /Paź odnotował wykonanie crona/)
    assert.equal(snapshot.activity[1].cronName, 'build-everyday')
    assert.equal(snapshot.activity[1].cronStatus, 'ok')
  })

  it('retains real metric updates instead of a prior cached temperature', () => {
    const first = createWorldSnapshot({ profiles, metrics: { cpuPercent: 30, memoryPercent: 50, temperatureC: 60 } })
    const second = createWorldSnapshot({ profiles, metrics: { cpuPercent: 31, memoryPercent: 51, temperatureC: 73 } }, first)
    assert.equal(second.system.temperatureC, 73)
    assert.equal(second.raw.metrics.temperatureC, 73)
  })

  it('restores real task and cron history after cold start without inventing motion', () => {
    const snapshot = createWorldSnapshot({
      profiles: { profiles: [{ name: 'coder', is_active: false }] },
      tasks: { tasks: [
        { id: 'task-running', title: 'Build release', assignee: 'coder', status: 'running', started_at: '2026-07-18T10:00:00Z' },
        { id: 'task-done', title: 'Verify release', assignee: 'verifier', status: 'done', completed_at: '2026-07-18T10:05:00Z' },
      ] },
      crons: { jobs: [{ id: 'health', name: 'Health check', enabled: true }] },
      cronHistory: { completions: [{ id: 'cron-health-1', job_id: 'health', status: 'failed', completed_at: 1784369400 }] },
    }, null, () => Date.parse('2026-07-18T11:00:00Z'))

    assert.deepEqual(snapshot.activity.map((item) => item.type), ['cron', 'task', 'task'])
    assert.equal(snapshot.activity.find((item) => item.entityId === 'task-running')?.source, 'hermes-kanban')
    assert.equal(snapshot.activity.find((item) => item.entityId === 'task-done')?.message, 'Probierz zakończył zadanie: Verify release.')
    assert.equal(snapshot.activity.find((item) => item.type === 'cron')?.severity, 'error')
    assert.equal(snapshot.tasks.find((item) => item.id === 'task-running')?.motionEvidence, 'backend-timestamp')
    assert.equal(snapshot.tasks.find((item) => item.id === 'task-running')?.transitionStartedAt, null)
  })

  it('retains prior authoritative SSE activity when a polling snapshot refreshes tasks and crons', () => {
    const previous = createWorldSnapshot({
      profiles,
      tasks: { tasks: [] },
      crons: { jobs: [] },
      cronHistory: { completions: [] },
    }, null, () => Date.parse('2026-07-18T10:00:00Z'))
    previous.activity = [{
      id: 'evt-worker-complete',
      type: 'agent',
      message: 'Paź zakończył zadanie i przekazuje rezultat.',
      createdAt: '2026-07-18T10:05:00Z',
      source: 'hermes-sse',
    }]

    const next = createWorldSnapshot({
      profiles,
      tasks: { tasks: [] },
      crons: { jobs: [{ id: 'health', name: 'Health check', enabled: true }] },
      cronHistory: { completions: [
        { id: 'cron-health-1', job_id: 'health', status: 'success', completed_at: '2026-07-18T10:06:00Z' },
      ] },
    }, previous, () => Date.parse('2026-07-18T10:07:00Z'))

    assert.deepEqual(next.activity.map((item) => item.id), ['cron-health-1', 'evt-worker-complete'])
  })
})
