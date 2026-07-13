import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { ARCHIVE_RETURN_ROUTES, deriveWorldOperations, INGRESS_ROUTES, WORLD_OPERATION_POINTS, WORLD_OPERATIONS_TIMING } from './worldOperationsDirector.js'
import { PROFILE_SUBSYSTEMS, resolveWorldSubsystem } from './profileSubsystemMap.js'
import { computeConduitGeometry, INFRASTRUCTURE_STAGE_ASPECT } from '../infrastructureGeometry.js'

const START = Date.parse('2026-07-13T01:00:00.000Z')
const idle = (profileId) => Object.freeze({ profileId, phase: 'resting', visualState: 'idle', severity: 'none', active: false, isActive: false })

test('opening three seconds contain Citadel activity while persistent water remains outside the operation budget', () => {
  const result = deriveWorldOperations({ now: START + 2_500, startedAt: START, layout: 'mobile', operationalPresentations: [idle('coder')] })
  assert.equal(result.mode, 'ambient')
  assert.deepEqual(result.operations.map((item) => item.type), ['citadel-distribution'])
  assert.equal(result.operations.some((item) => item.type === 'data-transit'), false)
  assert.equal(result.majorCount, 1)
})

test('water is anchored to the visible fountain basin in both layouts', () => {
  assert.deepEqual(WORLD_OPERATION_POINTS.mobile.water, { x: 50, y: 59.5 })
  assert.deepEqual(WORLD_OPERATION_POINTS.desktop.water, { x: 50, y: 47 })
  assert.notDeepEqual(WORLD_OPERATION_POINTS.mobile.water, WORLD_OPERATION_POINTS.mobile.citadel)
})

test('thirty-six second ambient schedule has no dead window and never exceeds two major operations', () => {
  const expected = new Set(['citadel-distribution', 'forge-production', 'watcher-sweep', 'archive-ingestion', 'sanctum-circulation', 'gate-cycle'])
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

test('fresh evidence-backed choreography outranks two ordinary working presentations', () => {
  const choreography = { activeRunId: 'run-priority', signals: [
    { kind: 'message-pulse', evidenceEventId: 'run-priority:1', buildingId: 'citadel' },
    { kind: 'command-core', evidenceEventId: 'run-priority:2', buildingId: 'citadel' },
  ] }
  const result = deriveWorldOperations({
    now: START, startedAt: START, layout: 'mobile', choreography,
    operationalPresentations: [
      { ...idle('coder'), phase: 'working', active: true, isActive: true },
      { ...idle('researcher'), phase: 'working', active: true, isActive: true },
    ],
  })
  assert.equal(result.mode, 'event')
  assert.deepEqual(result.operations.map((item) => item.type), ['data-transit', 'citadel-distribution'])
  assert.ok(result.operations.every((item) => item.evidenceEventId))
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
  assert.match(jsx, /repeatCount="1"/)
  assert.doesNotMatch(jsx, /repeatCount="indefinite"/)
  assert.match(css, /stroke-dasharray:16 84/)
  assert.match(css, /stroke-dasharray:2 1\.5 2 1\.5 2 1\.5 3 86\.5/)
  assert.match(css, /operation-local-transit var\(--transit-duration\) linear 1 both/)
  assert.doesNotMatch(css, /operation-local-transit[^;}]*infinite/)
})

test('delegation ingress ends in the selected subsystem and only real success returns to Archive', () => {
  for (const layout of ['mobile', 'desktop']) {
    for (const target of ['forge', 'watcher', 'sanctum', 'citadel']) {
      const ingress = INGRESS_ROUTES[layout][target]
      assert.notDeepEqual(ingress.at(-1), WORLD_OPERATION_POINTS[layout].archive, `${layout}/${target} must not pre-emptively reach Archive`)
      const archiveReturn = ARCHIVE_RETURN_ROUTES[layout][target]
      assert.deepEqual(archiveReturn.at(-1), WORLD_OPERATION_POINTS[layout].archive)
    }
  }
  const result = deriveWorldOperations({
    now: START, startedAt: START, layout: 'mobile',
    choreography: { activeRunId: 'run-success', targetAgentId: 'coder', signals: [{ kind: 'archive-record', evidenceEventId: 'run-success:4', sourceAgentId: 'coder', sourceBuildingId: 'forge', buildingId: 'archive' }] },
  })
  assert.equal(result.operations[0].type, 'data-transit')
  assert.deepEqual(result.operations[0].route.at(0), WORLD_OPERATION_POINTS.mobile.forge)
  assert.deepEqual(result.operations[0].route.at(-1), WORLD_OPERATION_POINTS.mobile.archive)
})

test('all twelve accepted roles map to an existing environmental subsystem', () => {
  const expectedProfiles = ['default', 'orchestrator', 'coder', 'developer', 'devops', 'komandos', 'outreach', 'prospecting', 'researcher', 'reviewer', 'synthesizer', 'verifier']
  assert.deepEqual(Object.keys(PROFILE_SUBSYSTEMS).sort(), expectedProfiles.sort())
  for (const profileId of expectedProfiles) assert.ok(['citadel', 'forge', 'watcher', 'archive', 'sanctum', 'gate'].includes(resolveWorldSubsystem(profileId)))
})

test('offline or stale telemetry cannot keep an old Working operation alive', () => {
  const working = [{ ...idle('coder'), phase: 'working', active: true, isActive: true }]
  for (const connection of ['offline', 'stale']) {
    const result = deriveWorldOperations({ now: START, startedAt: START, lifecycle: { connection }, operationalPresentations: working })
    assert.equal(result.mode, 'ambient')
    assert.equal(result.operations.some((item) => item.mode === 'operational'), false)
  }
})

test('conduit geometry reaches semantic endpoints on non-square mobile and desktop stages', () => {
  for (const [layout, from, to] of [
    ['mobile', [50, 43], [23.5, 44.5]],
    ['desktop', [46, 34], [84, 46.5]],
  ]) {
    const aspect = INFRASTRUCTURE_STAGE_ASPECT[layout]
    const geometry = computeConduitGeometry(from, to, aspect)
    const radians = geometry.angle * Math.PI / 180
    const endX = geometry.x + Math.cos(radians) * geometry.length
    const endY = geometry.y + Math.sin(radians) * geometry.length * aspect
    assert.ok(Math.abs(endX - to[0]) < 0.0001)
    assert.ok(Math.abs(endY - to[1]) < 0.0001)
  }
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

test('world buildings use transparent sprite strips without geometric placeholders', () => {
  const operationsJsx = readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.jsx', import.meta.url), 'utf8')
  const persistentJsx = readFileSync(new URL('../../components/world-directors/PersistentWorldLifeLayer.jsx', import.meta.url), 'utf8')
  const jsx = `${operationsJsx}\n${persistentJsx}`
  const css = `${readFileSync(new URL('../../components/world-directors/WorldOperationsLayer.css', import.meta.url), 'utf8')}\n${readFileSync(new URL('../../components/world-directors/WorldEnvironmentalLife.css', import.meta.url), 'utf8')}`
  for (const rejected of [
    'operation-citadel__outer', 'operation-citadel__inner', 'operation-citadel__input', 'operation-citadel__output',
    'operation-forge__backplate', 'operation-forge__furnace', 'operation-forge__door', 'operation-forge__gear', 'operation-forge__piston', 'operation-forge__crane', 'operation-forge__chimney-lip',
    'operation-watcher__dome', 'operation-watcher__arc', 'operation-archive__backplate', 'operation-archive__tape', 'operation-archive__seal',
    'operation-sanctum__spiral', 'operation-sanctum__channel', 'gate-panel-left', 'water-turbine-turn',
  ]) {
    assert.equal(jsx.includes(rejected), false)
    assert.equal(css.includes(rejected), false)
  }
  for (const asset of ['forge-fire', 'forge-smoke', 'forge-sparks', 'citadel-rune-ring', 'citadel-core-pulse', 'citadel-energy-wave', 'watcher-lens-pulse', 'watcher-scan-beam', 'archive-window-glow', 'archive-data-runes', 'sanctum-energy-orbit', 'gate-energy-lock', 'water-reflection']) {
    assert.match(jsx, new RegExp(`${asset}-strip\\.runtime\\.png`))
  }
  assert.match(css, /forge-sprite-frames/)
  assert.match(css, /world-effect-sprite/)
  assert.match(css, /steps\(7,end\)/)
})

test('persistent world life keeps fire and water mounted while transit remains event-only', () => {
  const persistent = readFileSync(new URL('../../components/world-directors/PersistentWorldLifeLayer.jsx', import.meta.url), 'utf8')
  const director = readFileSync(new URL('./worldOperationsDirector.js', import.meta.url), 'utf8')
  assert.match(persistent, /persistent-life__forge-fire/)
  assert.match(persistent, /persistent-life__water-reflection/)
  assert.match(persistent, /data-persistent-world-life="active"/)
  assert.equal((persistent.match(/fetchPriority="high"/g) ?? []).length, 3)
  const ambientSource = director.slice(director.indexOf('function ambientOperations'), director.indexOf('function choreographyOperations'))
  assert.equal(ambientSource.includes("windowOperation('data-transit'"), false)
  assert.match(director.slice(director.indexOf('function choreographyOperations')), /evidenceEventId: evidence/)
})

test('runtime sprite strips retain RGBA alpha at mobile-sized resolution and stay under the startup budget', () => {
  const assets = [
    ['forge-fire-strip.runtime.png', 1024, 160],
    ['forge-smoke-strip.runtime.png', 1024, 160],
    ['forge-sparks-strip.runtime.png', 768, 96],
    ['archive-data-runes-strip.runtime.png', 768, 128],
    ['water-reflection-strip.runtime.png', 1024, 64],
    ['sanctum-energy-orbit-strip.runtime.png', 1024, 128],
    ['citadel-energy-wave-strip.runtime.png', 1024, 96],
    ['citadel-core-pulse-strip.runtime.png', 768, 128],
    ['archive-window-glow-strip.runtime.png', 512, 96],
    ['gate-energy-lock-strip.runtime.png', 768, 96],
    ['citadel-rune-ring-strip.runtime.png', 1024, 128],
    ['watcher-lens-pulse-strip.runtime.png', 512, 64],
    ['watcher-scan-beam-strip.runtime.png', 1024, 160],
  ]
  let totalBytes = 0
  for (const [name, width, height] of assets) {
    const url = new URL(`../../assets/world-effects/${name}`, import.meta.url)
    const png = readFileSync(url)
    totalBytes += statSync(url).size
    assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG')
    assert.equal(png.readUInt32BE(16), width)
    assert.equal(png.readUInt32BE(20), height)
    assert.equal(width % 8, 0)
    assert.equal(png[25], 6, `${name} must retain RGBA alpha`)
  }
  assert.ok(totalBytes < 800_000, `runtime sprites must stay below 800 KB, received ${totalBytes}`)
})

test('world effect source strips are real RGBA PNGs with eight equal frames', () => {
  const assets = [
    ['forge-fire-strip.png', 2048, 320],
    ['forge-smoke-strip.png', 2048, 320],
    ['forge-sparks-strip.png', 1536, 192],
    ['archive-data-runes-strip.png', 1536, 256],
    ['water-reflection-strip.png', 2048, 128],
    ['sanctum-energy-orbit-strip.png', 2048, 256],
    ['citadel-energy-wave-strip.png', 2048, 192],
    ['citadel-core-pulse-strip.png', 1536, 256],
    ['archive-window-glow-strip.png', 1024, 192],
    ['gate-energy-lock-strip.png', 1536, 192],
    ['citadel-rune-ring-strip.png', 2048, 256],
    ['watcher-lens-pulse-strip.png', 1024, 128],
    ['watcher-scan-beam-strip.png', 2048, 320],
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
