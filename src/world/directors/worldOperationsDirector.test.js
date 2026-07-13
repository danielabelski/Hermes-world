import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { deriveWorldOperations, WORLD_OPERATION_POINTS, WORLD_OPERATIONS_TIMING } from './worldOperationsDirector.js'

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

test('mobile water machinery is anchored to the central water core, never the dry south road', () => {
  const result = deriveWorldOperations({ now: START + 10_000, startedAt: START, layout: 'mobile' })
  assert.equal(result.operations.some((item) => item.type === 'water-machinery'), true)
  const water = result.operations.find((item) => item.type === 'water-machinery')
  assert.equal(water.type, 'water-machinery')
  assert.deepEqual(WORLD_OPERATION_POINTS.mobile.water, WORLD_OPERATION_POINTS.mobile.citadel)
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

test('data transit renders only a local wake and segments, never a full GPS route', () => {
  const jsx = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.css', import.meta.url), 'utf8')
  assert.equal(jsx.includes('operation-artery__bed'), false)
  assert.equal(jsx.includes('operation-artery__trail'), false)
  assert.match(jsx, /operation-artery__wake/)
  assert.match(jsx, /operation-artery__segments/)
  assert.match(jsx, /pathLength="100"/)
  assert.match(css, /stroke-dasharray:16 84/)
  assert.match(css, /stroke-dasharray:2 1\.5 2 1\.5 2 1\.5 3 86\.5/)
})

test('operations render below agents and existing architectural foreground masks', () => {
  const fallback = readFileSync(new URL('../WorldFallback.jsx', import.meta.url), 'utf8')
  const operationsIndex = fallback.indexOf('<WorldOperationsLayer')
  const agentsIndex = fallback.indexOf('<MapAgentLayer')
  const foregroundIndex = fallback.indexOf('<MapForegroundOcclusion')
  assert.ok(operationsIndex > 0 && operationsIndex < agentsIndex && agentsIndex < foregroundIndex)
  const operationCss = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.css', import.meta.url), 'utf8')
  const foregroundCss = readFileSync(new URL('../../components/map-agents/MapForegroundOcclusion.css', import.meta.url), 'utf8')
  assert.match(operationCss, /world-operations-layer\{[^}]*z-index:8/)
  assert.match(foregroundCss, /map-foreground[^{]*\{[^}]*z-index:\s*21/)
})

test('Citadel contains no editor handles and Forge uses transparent sprite strips only', () => {
  const jsx = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.css', import.meta.url), 'utf8')
  assert.match(css, /operation-citadel__outer[^}]*conic-gradient/)
  assert.match(css, /operation-citadel__runes b[^}]*width:8px;height:2px;border:0/)
  for (const rejected of ['operation-forge__backplate', 'operation-forge__furnace', 'operation-forge__door', 'operation-forge__gear', 'operation-forge__piston', 'operation-forge__crane', 'operation-forge__chimney-lip']) {
    assert.equal(jsx.includes(rejected), false)
    assert.equal(css.includes(rejected), false)
  }
  assert.match(jsx, /forge-fire-strip\.png/)
  assert.match(jsx, /forge-smoke-strip\.png/)
  assert.match(jsx, /forge-sparks-strip\.png/)
  assert.match(css, /forge-sprite-frames/)
  assert.match(css, /steps\(7,end\)/)
})

test('Forge source strips are real RGBA PNGs with eight equal frames', () => {
  const assets = [
    ['forge-fire-strip.png', 2048, 320],
    ['forge-smoke-strip.png', 2048, 320],
    ['forge-sparks-strip.png', 1536, 192],
  ]
  for (const [name, width, height] of assets) {
    const png = readFileSync(new URL(`../../assets/world-effects/${name}`, import.meta.url))
    assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG')
    assert.equal(png.readUInt32BE(16), width)
    assert.equal(png.readUInt32BE(20), height)
    assert.equal(width % 8, 0)
    assert.equal(png[25], 6, `${name} must retain RGBA alpha`)
  }
})
