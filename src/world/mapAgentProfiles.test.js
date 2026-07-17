import test from 'node:test'
import assert from 'node:assert/strict'
import { AGENT_DEFINITIONS } from './data/agentDefinitions.js'
import { getMapAgentSpriteSet } from './data/mapAgentManifest.js'
import { MAP_AGENT_FALLBACK_IDS, MAP_AGENT_PROFILE_IDS, MAP_AGENT_PROFILES, getMapAgentProfile } from './data/mapAgentProfiles.js'
import { resolveMapAgentPresentations, summarizeMapAgentOccupancy } from './mapAgentPresentation.js'

test('map agent config explicitly covers the canonical twelve profiles', () => {
  assert.equal(MAP_AGENT_PROFILE_IDS.length, 12)
  assert.deepEqual([...MAP_AGENT_PROFILE_IDS].sort(), Object.keys(AGENT_DEFINITIONS).sort())
  assert.deepEqual([...MAP_AGENT_FALLBACK_IDS], [])
  assert.equal(getMapAgentProfile('missing').id, 'default')
})

test('every map agent profile has renderer, navigation and behavior contracts', () => {
  for (const profile of Object.values(MAP_AGENT_PROFILES)) {
    assert.ok(['building-worker', 'research-worker', 'patrol', 'courier', 'monitoring', 'idle-ambient'].includes(profile.behaviorType))
    assert.ok(profile.renderScale >= 0.8 && profile.renderScale <= 0.92)
    assert.ok(profile.mapVisibilityScale >= 1 && profile.mapVisibilityScale <= 1.12)
    assert.ok(profile.mapTone.saturation >= 0.9 && profile.mapTone.saturation <= 1.1)
    assert.ok(profile.mapTone.contrast >= 0.95 && profile.mapTone.contrast <= 1.1)
    assert.ok(profile.mapTone.brightness >= 0.95 && profile.mapTone.brightness <= 1.1)
    assert.ok(profile.shadowScale >= 0.7 && profile.shadowScale <= 1)
    assert.ok(Math.abs(profile.stationaryCrowdOffset.x) <= 4.5)
    assert.ok(Math.abs(profile.stationaryCrowdOffset.y) <= 2.5)
    assert.ok(profile.movementSpeed > 0.7 && profile.movementSpeed <= 1.1)
    assert.ok(profile.homeNode.desktop && profile.homeNode.mobile)
    assert.ok(profile.workNode.desktop && profile.workNode.mobile)
    assert.ok(profile.routeId)
    const spriteSet = getMapAgentSpriteSet(profile.spriteProfile)
    assert.ok(spriteSet)
    const normalizedHeight = spriteSet.renderHeight * spriteSet.scale * profile.renderScale
    assert.ok(normalizedHeight >= 40 && normalizedHeight <= 46, `${profile.id}: normalized height ${normalizedHeight}`)
    const mapHeight = normalizedHeight * profile.mapVisibilityScale
    assert.ok(mapHeight >= 40 && mapHeight <= 49, `${profile.id}: map height ${mapHeight}`)
    for (const ratio of Object.values(profile.markerContentTopByState)) {
      assert.ok(ratio >= 0.09 && ratio <= 0.35, `${profile.id}: invalid marker content top ${ratio}`)
    }
    assert.ok(profile.beforeNormalizationScale >= 1 && profile.beforeNormalizationScale <= 1.37)
    assert.deepEqual(profile.anchorCorrection, { x: 0, yPx: 0 })
    assert.equal(profile.statusMapping.error, 'alert')
  }
})

test('stationary crowd spacing separates the lower courtyard without changing logical routes', () => {
  assert.deepEqual(getMapAgentProfile('outreach').stationaryCrowdOffset, { x: 4.2, y: -2.4 })
  assert.deepEqual(getMapAgentProfile('devops').stationaryCrowdOffset, { x: -2.8, y: 2.4 })
  assert.deepEqual(getMapAgentProfile('prospecting').stationaryCrowdOffset, { x: 0, y: 0 })
})

test('map visibility correction lifts the Kowal without changing shared sprite normalization', () => {
  const coder = getMapAgentProfile('coder')
  const researcher = getMapAgentProfile('researcher')
  assert.equal(coder.renderScale, 0.84)
  assert.equal(coder.mapVisibilityScale, 1.1)
  assert.equal(researcher.mapVisibilityScale, 1.03)
})

test('all twelve agents stay at valid interaction points while interior workers hide only beyond the threshold', () => {
  const now = Date.parse('2026-07-12T18:00:00.000Z')
  const agents = Object.values(AGENT_DEFINITIONS).map((definition) => ({
    id: definition.profile,
    profile: definition.profile,
    displayName: definition.displayName,
    buildingId: definition.buildingId,
    state: definition.profile === 'prospecting' ? 'observe' : 'working',
    active: true,
    isActive: true,
  }))
  const tasks = agents.map((agent) => ({
    id: `task-${agent.profile}`,
    assignee: agent.profile,
    status: 'running',
    transitionStartedAt: new Date(now - 30_000).toISOString(),
    startedAt: new Date(now - 30_000).toISOString(),
  }))

  for (const layout of ['desktop', 'mobile']) {
    const presentations = resolveMapAgentPresentations({ agents, tasks, now, layout })
    assert.equal(presentations.length, 12)
    assert.deepEqual(summarizeMapAgentOccupancy(presentations), {
      total: 12,
      onMap: 10,
      inside: 2,
      invalid: 0,
      facadeFront: layout === 'mobile' ? 1 : 0,
    })
    const expectedInside = new Set(['coder', 'researcher'])
    for (const model of presentations) {
      assert.ok(model.worldX >= 0 && model.worldX <= 100, `${layout}/${model.profileId}: x=${model.worldX}`)
      assert.ok(model.worldY >= 0 && model.worldY <= 100, `${layout}/${model.profileId}: y=${model.worldY}`)
      assert.equal(model.isInside, expectedInside.has(model.profileId), `${layout}/${model.profileId}: interior visibility contract`)
    }
    const expectedFacadeProfiles = layout === 'mobile'
      ? ['coder', 'orchestrator', 'researcher']
      : ['coder', 'researcher']
    assert.deepEqual(
      presentations.filter((model) => model.occupancyMode === 'facade-front').map((model) => model.profileId).sort(),
      expectedFacadeProfiles,
    )
  }
})
