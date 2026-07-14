import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveBuildingEntry } from './buildingEntryConfig.js'

describe('building entry config', () => {
  it('anchors Forge interaction to the frozen semantic entrance nodes', () => {
    const desktop = resolveBuildingEntry('forge', 'desktop')
    const mobile = resolveBuildingEntry('forge', 'mobile')
    assert.deepEqual({ nodeId: desktop.nodeId, x: desktop.xPercent, y: desktop.yPercent }, { nodeId: 'forge_entrance', x: 84, y: 49 })
    assert.deepEqual({ nodeId: mobile.nodeId, x: mobile.xPercent, y: mobile.yPercent }, { nodeId: 'mobile_forge_entrance', x: 30.5, y: 49.2 })
    assert.ok(mobile.hitWidth >= 44)
    assert.ok(mobile.hitHeight >= 44)
  })

  it('does not silently enable unfinished interiors', () => {
    assert.equal(resolveBuildingEntry('library', 'mobile'), null)
  })
})
