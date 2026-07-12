import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveWorldOperations, WORLD_OPERATIONS_TIMING } from './worldOperationsDirector.js'

const START = Date.parse('2026-07-13T01:00:00.000Z')
const idle = (profileId) => Object.freeze({ profileId, phase: 'resting', visualState: 'idle', severity: 'none', active: false, isActive: false })

test('opening three seconds contain a map-crossing transit and Citadel machine', () => {
  const result = deriveWorldOperations({ now: START + 2_500, startedAt: START, layout: 'mobile', operationalPresentations: [idle('coder')] })
  assert.equal(result.mode, 'ambient')
  assert.deepEqual(result.operations.map((item) => item.type), ['data-transit', 'citadel-distribution'])
  assert.equal(result.operations[0].route[0].y, 94)
  assert.equal(result.operations[0].route.some((point) => point.y <= 43), true)
  assert.equal(result.majorCount, 2)
})

test('forty-eight second ambient schedule has no dead window and never exceeds two major operations', () => {
  const expected = new Set(['data-transit', 'citadel-distribution', 'forge-production', 'watcher-sweep', 'archive-ingestion', 'sanctum-circulation', 'gate-cycle', 'water-machinery'])
  const seen = new Set()
  for (let elapsed = 0; elapsed < WORLD_OPERATIONS_TIMING.AMBIENT_CYCLE_MS; elapsed += 500) {
    const result = deriveWorldOperations({ now: START + elapsed, startedAt: START, layout: 'mobile' })
    assert.ok(result.operations.length >= 1 && result.operations.length <= 2)
    assert.ok(result.operations.every((item) => item.mode === 'ambient' && !item.evidenceEventId))
    result.operations.forEach((item) => seen.add(item.type))
  }
  assert.deepEqual(seen, expected)
})

test('ten simulated minutes remain bounded and cannot fabricate operational fields', () => {
  for (let elapsed = 0; elapsed <= 600_000; elapsed += 5_000) {
    const result = deriveWorldOperations({ now: START + elapsed, startedAt: START, layout: 'desktop' })
    assert.ok(result.operations.length <= 2)
    const json = JSON.stringify(result)
    assert.equal(json.includes('activeAgentCount'), false)
    assert.equal(json.includes('"tasks"'), false)
    assert.equal(json.includes('"success"'), false)
  }
})

test('real message and delegation replace ambient with evidence-backed transit and Citadel distribution', () => {
  const choreography = { activeRunId: 'run-1', signals: [
    { kind: 'message-pulse', evidenceEventId: 'run-1:1', buildingId: 'citadel' },
    { kind: 'command-core', evidenceEventId: 'run-1:2', buildingId: 'citadel' },
    { kind: 'delegation', evidenceEventId: 'run-1:2', targetAgentId: 'coder', buildingId: 'forge' },
  ] }
  const result = deriveWorldOperations({ now: START, startedAt: START, layout: 'mobile', choreography })
  assert.equal(result.mode, 'event')
  assert.deepEqual(result.operations.map((item) => item.type), ['data-transit', 'citadel-distribution'])
  assert.ok(result.operations.every((item) => item.evidenceEventId))
  assert.equal(result.operations.some((item) => item.type === 'forge-production'), false)
})

test('Forge production and Watcher sweep require their real operational presentation', () => {
  const forge = deriveWorldOperations({ now: START, startedAt: START, operationalPresentations: [{ ...idle('coder'), phase: 'working', active: true, isActive: true }] })
  assert.equal(forge.mode, 'operational')
  assert.equal(forge.operations[0].type, 'forge-production')
  const watcher = deriveWorldOperations({ now: START, startedAt: START, operationalPresentations: [{ ...idle('prospecting'), phase: 'observing', active: true, isActive: true }] })
  assert.equal(watcher.operations[0].type, 'watcher-sweep')
  assert.equal(deriveWorldOperations({ now: START, startedAt: START, operationalPresentations: [idle('prospecting')] }).mode, 'ambient')
  const carrying = deriveWorldOperations({ now: START, startedAt: START, operationalPresentations: [{ ...idle('coder'), phase: 'carrying', visualState: 'work' }] })
  assert.equal(carrying.operations[0].type, 'forge-production')
})

test('Archive event ingestion requires a real archive-record evidence signal', () => {
  const result = deriveWorldOperations({ now: START, startedAt: START, choreography: { activeRunId: 'run-2', signals: [{ kind: 'archive-record', evidenceEventId: 'run-2:4', buildingId: 'archive' }] } })
  assert.deepEqual(result.operations.map((item) => item.type), ['data-transit', 'archive-ingestion'])
  assert.ok(result.operations.every((item) => item.evidenceEventId === 'run-2:4'))
})

test('hidden mode stops operations and reduced motion keeps static substitutes only', () => {
  assert.equal(deriveWorldOperations({ now: START, startedAt: START, visible: false }).operations.length, 0)
  const reduced = deriveWorldOperations({ now: START, startedAt: START, reducedMotion: true })
  assert.ok(reduced.operations.every((item) => item.phase === 'static'))
})
