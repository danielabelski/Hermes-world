import test from 'node:test'
import assert from 'node:assert/strict'
import { AGENT_DEFINITIONS } from './data/agentDefinitions.js'
import { BUILDING_INTERIOR_IDS } from './buildingEntryConfig.js'
import { readFileSync } from 'node:fs'
import { getInteriorReviewEntry, getInteriorReviewProfiles, INTERIOR_ROSTER_REVIEW, stepInteriorReviewProfile } from './interiorRosterReview.js'

test('demo interior roster review covers all twelve agents exactly once', () => {
  const expected = Object.keys(AGENT_DEFINITIONS).sort()
  const actual = INTERIOR_ROSTER_REVIEW.map((entry) => entry.profileId).sort()
  assert.equal(INTERIOR_ROSTER_REVIEW.length, 12)
  assert.deepEqual(actual, expected)
  assert.equal(new Set(actual).size, 12)
})

test('every review placement uses an existing room and safe visual bounds', () => {
  for (const entry of INTERIOR_ROSTER_REVIEW) {
    assert.ok(BUILDING_INTERIOR_IDS.includes(entry.buildingId), entry.profileId)
    assert.ok(entry.x >= 25 && entry.x <= 75, entry.profileId)
    assert.ok(entry.y >= 55 && entry.y <= 88, entry.profileId)
    assert.ok(entry.scale >= 1.1 && entry.scale <= 1.45, entry.profileId)
    assert.equal(getInteriorReviewEntry(entry.profileId), entry)
  }
})

test('RL scale corrections preserve Forge and Archive as the perceptual baseline', () => {
  for (const profileId of ['coder', 'developer', 'devops', 'researcher', 'reviewer', 'verifier']) {
    assert.ok(getInteriorReviewEntry(profileId).scale >= 1.2 && getInteriorReviewEntry(profileId).scale <= 1.25, profileId)
  }
  assert.equal(getInteriorReviewEntry('orchestrator').scale, 1.34)
  assert.equal(getInteriorReviewEntry('komandos').scale, 1.45)
  for (const profileId of ['prospecting', 'outreach']) assert.ok(getInteriorReviewEntry(profileId).scale >= 1.34, profileId)
})

test('RL centering keeps the Citadel page and Watcher roles on the room focal axis', () => {
  for (const profileId of ['default', 'prospecting', 'outreach']) {
    assert.equal(getInteriorReviewEntry(profileId).x, 50, profileId)
  }
})

test('review stepping wraps without changing operational state', () => {
  assert.equal(stepInteriorReviewProfile('coder', -1), 'synthesizer')
  assert.equal(stepInteriorReviewProfile('synthesizer', 1), 'coder')
})

test('all five existing rooms have a deterministic first review profile', () => {
  for (const buildingId of BUILDING_INTERIOR_IDS) {
    const profiles = getInteriorReviewProfiles(buildingId)
    assert.ok(profiles.length > 0, buildingId)
    assert.equal(profiles[0].buildingId, buildingId)
  }
})

test('review remains demo-only and cannot replace the normal evidence renderer', () => {
  const world = readFileSync(new URL('./WorldFallback.jsx', import.meta.url), 'utf8')
  const plate = readFileSync(new URL('../components/building-interiors/CinematicInteriorPlate.jsx', import.meta.url), 'utf8')
  assert.match(world, /get\('demo'\) === '1' && initialParams\.get\('interiorReview'\) === '1'/)
  assert.match(plate, /rosterReview\?\.enabled[\s\S]*InteriorRosterReviewPresence[\s\S]*InteriorAgentPresence/)
  assert.doesNotMatch(readFileSync(new URL('./interiorRosterReview.js', import.meta.url), 'utf8'), /evidenceEventId|operationalState|setState|tasks?\s*:/)
})

test('shared renderer exposes visible role-aware work motion with reduced-motion fallback', () => {
  const renderer = readFileSync(new URL('../components/map-agents/MapAgentSprite.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../components/map-agents/MapAgentSprite.css', import.meta.url), 'utf8')
  assert.match(renderer, /data-behavior-type=\{profile\.behaviorType\}/)
  for (const behavior of ['building-worker', 'research-worker', 'monitoring', 'patrol', 'courier']) {
    assert.match(css, new RegExp(`is-work\\[data-behavior-type="${behavior}"\\]`), behavior)
  }
  assert.match(css, /prefers-reduced-motion:[\s\S]*map-agent-sprite__motion \{ animation: none !important;/)
})
