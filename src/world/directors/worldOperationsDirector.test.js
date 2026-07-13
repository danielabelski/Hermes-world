import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { deriveWorldOperations, WORLD_OPERATION_POINTS, WORLD_OPERATIONS_TIMING } from './worldOperationsDirector.js'
import { MAP_NATIVE_MOTION_REGIONS, getMapNativeRegions } from '../data/mapNativeMotionConfig.js'

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

test('Citadel and Forge visual contracts contain no editor handles or rectangular placeholders', () => {
  const css = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.css', import.meta.url), 'utf8')
  assert.match(css, /operation-citadel__outer[^}]*conic-gradient/)
  assert.match(css, /operation-citadel__runes b[^}]*width:8px;height:2px;border:0/)
  assert.match(css, /operation-forge__furnace[^}]*clip-path:polygon/)
  assert.match(css, /operation-forge__gear[^}]*repeating-conic-gradient/)
  assert.match(css, /operation-forge__piston::after[^}]*clip-path:polygon/)
  assert.match(css, /operation-forge__chimney-lip/)
})

test('map-native motion uses bounded crops of the locked map for four system buildings', () => {
  assert.deepEqual(MAP_NATIVE_MOTION_REGIONS.map((region) => region.id), [
    'citadel-core', 'citadel-threshold', 'forge-furnace', 'watcher-lens', 'archive-facade',
  ])
  assert.ok(MAP_NATIVE_MOTION_REGIONS.every((region) => ['mobile', 'desktop'].every((layout) => {
    const geometry = region.geometry[layout]
    return geometry.x > 0 && geometry.x < 100 && geometry.y > 0 && geometry.y < 100 && geometry.width > 0 && geometry.width <= 14 && geometry.height > 0 && geometry.height <= 12
  })))
  const active = getMapNativeRegions('mobile', [
    { id: 'forge-1', type: 'forge-production', mode: 'ambient', phase: 'process' },
    { id: 'water-1', type: 'water-machinery', mode: 'ambient', phase: 'process' },
  ])
  assert.deepEqual(active.map((region) => region.id), ['forge-furnace'])
  assert.equal(JSON.stringify(active).includes('operationalState'), false)
})

test('map-native crops reuse the current map assets and remain below operations, agents and foreground', () => {
  const fallback = readFileSync(new URL('../WorldFallback.jsx', import.meta.url), 'utf8')
  const layer = readFileSync(new URL('../../components/world-directors/MapNativeMotionLayer.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../../components/world-directors/MapNativeMotionLayer.css', import.meta.url), 'utf8')
  const nativeIndex = fallback.indexOf('<MapNativeMotionLayer')
  const operationsIndex = fallback.indexOf('<WorldOperationsLayer')
  const agentsIndex = fallback.indexOf('<MapAgentLayer')
  assert.ok(nativeIndex > 0 && nativeIndex < operationsIndex && operationsIndex < agentsIndex)
  assert.match(layer, /hermes-citadel-hd-v2\.webp/)
  assert.match(layer, /hermes-citadel-mobile-v2\.webp/)
  assert.match(css, /map-native-motion-layer\{[^}]*z-index:7/)
  assert.match(css, /overflow:hidden/)
  assert.match(css, /clip-path:/)
})

test('atmosphere shares one bounded wind vector and disables macro motion for reduced motion', () => {
  const jsx = readFileSync(new URL('../../components/world-directors/AtmosphereLayer.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../../components/world-directors/WorldEnvironmentalLife.css', import.meta.url), 'utf8')
  assert.match(jsx, /atmosphere-cloud-shadow/)
  assert.match(jsx, /atmosphere-wind-thread/)
  assert.match(css, /--world-wind-x:26px;--world-wind-y:-10px;--world-wind-duration:18s/)
  assert.match(css, /forge-smoke var\(--world-wind-duration\)/)
  assert.match(css, /fog-drift var\(--world-wind-duration\)/)
  assert.match(css, /prefers-reduced-motion:reduce[^}]*[\s\S]*atmosphere-cloud-shadow,[^}]*atmosphere-wind-thread\{display:none/)
})

test('map-native and entry atmosphere exceed the minimum mobile visibility floor', () => {
  const nativeCss = readFileSync(new URL('../../components/world-directors/MapNativeMotionLayer.css', import.meta.url), 'utf8')
  const atmosphereCss = readFileSync(new URL('../../components/world-directors/WorldEnvironmentalLife.css', import.meta.url), 'utf8')
  assert.match(nativeCss, /map-native-region\{[^}]*opacity:calc\(var\(--native-intensity\)\*1\.16\)/)
  assert.match(nativeCss, /brightness\(1\.2\) saturate\(1\.14\)/)
  assert.match(nativeCss, /38%,62%\{opacity:\.94/)
  assert.match(nativeCss, /26%,72%\{opacity:\.9/)
  assert.match(atmosphereCss, /atmosphere-cloud-shadow\{[^}]*left:-8%[^}]*opacity:\.24/)
  assert.match(atmosphereCss, /is-entry-active \.atmosphere-cloud-shadow\{animation:world-cloud-entry 5s/)
})
