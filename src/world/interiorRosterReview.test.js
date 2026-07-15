import test from 'node:test'
import assert from 'node:assert/strict'
import { AGENT_DEFINITIONS } from './data/agentDefinitions.js'
import { BUILDING_INTERIOR_IDS } from './buildingEntryConfig.js'
import { getInteriorReviewEntry, INTERIOR_ROSTER_REVIEW, stepInteriorReviewProfile } from './interiorRosterReview.js'

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
    assert.ok(entry.scale >= 1.1 && entry.scale <= 1.3, entry.profileId)
    assert.equal(getInteriorReviewEntry(entry.profileId), entry)
  }
})

test('review stepping wraps without changing operational state', () => {
  assert.equal(stepInteriorReviewProfile('coder', -1), 'synthesizer')
  assert.equal(stepInteriorReviewProfile('synthesizer', 1), 'coder')
})
