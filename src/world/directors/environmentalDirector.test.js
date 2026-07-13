import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveEnvironmentalPresentation, ENVIRONMENT_BUILDINGS } from './environmentalDirector.js'
import { resolveWorldLifePreset } from './worldLifePreset.js'
import { WORLD_VISUAL_ANCHORS } from './worldVisualAnchors.js'
import { countLocalCriticalIncidents, resolveHealthSummaryLabel } from '../healthSummary.js'

const START = Date.parse('2026-07-13T00:22:00.000Z')
const idleModel = (profileId) => Object.freeze({ profileId, phase: 'resting', visualState: 'idle', severity: 'none', active: false, isActive: false })

test('idle environment becomes visibly alive within 2.5 seconds without fabricating operational state', () => {
  const operationalPresentations = Object.freeze(['orchestrator', 'coder', 'researcher', 'prospecting'].map(idleModel))
  const before = JSON.stringify(operationalPresentations)
  const environment = deriveEnvironmentalPresentation({ now: START + 2_500, startedAt: START, layout: 'mobile', operationalPresentations })
  assert.equal(environment.entryActive, true)
  assert.equal(environment.persistentEffectIds.length, 7)
  assert.equal(environment.atmosphereBandCount, 2)
  assert.equal(environment.response, null)
  assert.equal(JSON.stringify(operationalPresentations), before)
  assert.equal(JSON.stringify(environment).includes('"source":"operational"'), false)
})

test('ambient presentation remains bounded over ten simulated minutes and never emits fake evidence', () => {
  for (let elapsed = 0; elapsed <= 600_000; elapsed += 5_000) {
    const environment = deriveEnvironmentalPresentation({ now: START + elapsed, startedAt: START, layout: 'desktop', operationalPresentations: [idleModel('coder')] })
    assert.equal(environment.persistentEffectIds.length, 7)
    assert.ok(environment.atmosphereBandCount <= 2)
  }
})

test('real message and delegation create evidence-backed responses for only the correct building', () => {
  const message = deriveEnvironmentalPresentation({
    now: START + 500, startedAt: START, choreography: { signals: [{ kind: 'message-pulse', buildingId: 'citadel', evidenceEventId: 'run-1:1' }] }, operationalPresentations: [],
  })
  assert.deepEqual({ buildingId: message.response.buildingId, cue: message.response.cue, evidence: message.response.evidenceEventId }, { buildingId: 'citadel', cue: 'receive', evidence: 'run-1:1' })
  const delegation = deriveEnvironmentalPresentation({
    now: START + 600, startedAt: START, choreography: { signals: [{ kind: 'delegation', targetAgentId: 'coder', buildingId: 'forge', evidenceEventId: 'run-2:2' }] }, operationalPresentations: [],
  })
  assert.equal(delegation.response.buildingId, 'forge')
  assert.equal(delegation.response.cue, 'route')
})

test('operational warning and critical override ambient and ordinary choreography', () => {
  const warning = deriveEnvironmentalPresentation({
    now: START + 1_000, startedAt: START,
    choreography: { signals: [{ kind: 'command-core', buildingId: 'citadel', evidenceEventId: 'run-3:1' }] },
    operationalPresentations: [{ ...idleModel('coder'), severity: 'warning', phase: 'warning' }],
  })
  assert.equal(warning.response.source, 'operational')
  assert.equal(warning.response.buildingId, 'forge')
  assert.equal(warning.response.cue, 'warning')
  assert.equal(warning.ambientIntensity, 0.28)
  const critical = deriveEnvironmentalPresentation({ now: START + 1_000, startedAt: START, operationalPresentations: [{ ...idleModel('prospecting'), severity: 'critical', phase: 'error' }] })
  assert.equal(critical.response.buildingId, 'watcher')
  assert.equal(critical.response.cue, 'critical')
})

test('success records only when backed by the real archive choreography signal', () => {
  const ambient = deriveEnvironmentalPresentation({ now: START + 4_000, startedAt: START, operationalPresentations: [] })
  assert.equal(ambient.response, null)
  const success = deriveEnvironmentalPresentation({
    now: START + 4_000, startedAt: START,
    choreography: { signals: [{ kind: 'archive-record', buildingId: 'archive', evidenceEventId: 'run-4:4' }] }, operationalPresentations: [],
  })
  assert.equal(success.response.cue, 'record')
  assert.equal(success.response.evidenceEventId, 'run-4:4')
})

test('hidden and reduced-motion modes stop atmosphere bands', () => {
  const hidden = deriveEnvironmentalPresentation({ now: START, startedAt: START, visible: false })
  assert.equal(hidden.running, false)
  assert.equal(hidden.atmosphereBandCount, 0)
  const reduced = deriveEnvironmentalPresentation({ now: START, startedAt: START, reducedMotion: true })
  assert.equal(reduced.atmosphereBandCount, 0)
})

test('building configuration is centralized, complete and individually timed', () => {
  assert.deepEqual(Object.keys(ENVIRONMENT_BUILDINGS), ['citadel', 'forge', 'watcher', 'archive', 'sanctum'])
  assert.equal(new Set(Object.values(ENVIRONMENT_BUILDINGS).map((config) => config.timingOffset)).size, 5)
  assert.ok(Object.values(ENVIRONMENT_BUILDINGS).every((config) => config.ambientEffects.length >= 2 && config.eventResponses.length >= 3))
})

test('visual verification walks all eight existing effects over exactly fifteen seconds', () => {
  const labels = []
  for (let index = 0; index < 8; index += 1) {
    const environment = deriveEnvironmentalPresentation({ now: START + index * 1_875 + 100, startedAt: START, visualDebug: true, layout: 'mobile' })
    labels.push(environment.visualVerification?.label)
  }
  assert.deepEqual(labels, ['Citadel core', 'Forge fire + smoke', 'Watcher lens', 'Archive windows', 'Sanctum orbit', 'Gate lock', 'Water reflection', 'Fog'])
  assert.equal(deriveEnvironmentalPresentation({ now: START + 15_001, startedAt: START, visualDebug: true }).visualVerification, null)
  assert.equal(deriveEnvironmentalPresentation({ now: START + 1_000, startedAt: START, visualDebug: false }).visualVerification, null)
})

test('world life presets are reversible and balanced is the demo default', () => {
  assert.equal(resolveWorldLifePreset('').id, 'balanced')
  assert.equal(resolveWorldLifePreset('?worldLife=safe').role, 'low-power')
  assert.equal(resolveWorldLifePreset('?worldLife=showcase').role, 'presentation')
  assert.equal(resolveWorldLifePreset('?worldLife=unknown').id, 'balanced')
})

test('visual landmarks use workstation and facade anchors without changing route entrances', () => {
  assert.deepEqual(WORLD_VISUAL_ANCHORS.mobile.forge, { x: 23.5, y: 44.5, offsetX: 0, offsetY: 0 })
  assert.deepEqual(WORLD_VISUAL_ANCHORS.mobile.archive, { x: 24.5, y: 65.5, offsetX: 0, offsetY: 0 })
  assert.deepEqual(WORLD_VISUAL_ANCHORS.mobile.water, { x: 50, y: 56, offsetX: 0, offsetY: 0 })
  assert.deepEqual(WORLD_VISUAL_ANCHORS.desktop.water, { x: 50, y: 47, offsetX: 0, offsetY: 0 })
})

test('healthy global state and local critical incident produce one consistent summary', () => {
  const alerts = [{ severity: 'critical' }, { severity: 'info' }]
  const criticalCount = countLocalCriticalIncidents(alerts)
  assert.equal(criticalCount, 1)
  assert.equal(resolveHealthSummaryLabel({ severity: 'healthy', baseLabel: 'Świat działa spokojnie', criticalCount }), 'System stabilny · 1 incydent lokalny')
  assert.equal(resolveHealthSummaryLabel({ severity: 'critical', baseLabel: 'Wymagana szybka reakcja', criticalCount }), 'Wymagana szybka reakcja')
})
