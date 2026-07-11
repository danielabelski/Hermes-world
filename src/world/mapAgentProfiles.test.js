import test from 'node:test'
import assert from 'node:assert/strict'
import { AGENT_DEFINITIONS } from './data/agentDefinitions.js'
import { getMapAgentSpriteSet } from './data/mapAgentManifest.js'
import { MAP_AGENT_FALLBACK_IDS, MAP_AGENT_PROFILE_IDS, MAP_AGENT_PROFILES, getMapAgentProfile } from './data/mapAgentProfiles.js'

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
    assert.ok(profile.shadowScale >= 0.7 && profile.shadowScale <= 1)
    assert.ok(profile.movementSpeed > 0.7 && profile.movementSpeed <= 1.1)
    assert.ok(profile.homeNode.desktop && profile.homeNode.mobile)
    assert.ok(profile.workNode.desktop && profile.workNode.mobile)
    assert.ok(profile.routeId)
    const spriteSet = getMapAgentSpriteSet(profile.spriteProfile)
    assert.ok(spriteSet)
    const normalizedHeight = spriteSet.renderHeight * spriteSet.scale * profile.renderScale
    assert.ok(normalizedHeight >= 40 && normalizedHeight <= 46, `${profile.id}: normalized height ${normalizedHeight}`)
    assert.ok(profile.beforeNormalizationScale >= 1 && profile.beforeNormalizationScale <= 1.37)
    assert.deepEqual(profile.anchorCorrection, { x: 0, yPx: 0 })
    assert.equal(profile.statusMapping.error, 'alert')
  }
})
