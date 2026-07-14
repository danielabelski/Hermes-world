import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { BUILDING_INTERIOR_IDS, resolveBuildingEntry } from './buildingEntryConfig.js'

describe('building entry config', () => {
  it('anchors Forge interaction to the frozen semantic entrance nodes', () => {
    const desktop = resolveBuildingEntry('forge', 'desktop')
    const mobile = resolveBuildingEntry('forge', 'mobile')
    assert.deepEqual({ nodeId: desktop.nodeId, x: desktop.xPercent, y: desktop.yPercent }, { nodeId: 'forge_entrance', x: 84, y: 49 })
    assert.deepEqual({ nodeId: mobile.nodeId, x: mobile.xPercent, y: mobile.yPercent }, { nodeId: 'mobile_forge_entrance', x: 30.5, y: 49.2 })
    assert.ok(mobile.hitWidth >= 44)
    assert.ok(mobile.hitHeight >= 44)
  })

  it('uses frozen semantic nodes for Archive, Citadel and Watcher', () => {
    assert.deepEqual(
      BUILDING_INTERIOR_IDS.filter((id) => id !== 'sanctum'),
      ['forge', 'archive', 'citadel', 'watcher'],
    )
    assert.equal(resolveBuildingEntry('archive', 'desktop').nodeId, 'library_entrance')
    assert.equal(resolveBuildingEntry('archive', 'mobile').nodeId, 'mobile_library_entrance')
    assert.equal(resolveBuildingEntry('citadel', 'desktop').nodeId, 'citadel_main_gate')
    assert.equal(resolveBuildingEntry('citadel', 'mobile').nodeId, 'orchestrator_mobile_work')
    assert.equal(resolveBuildingEntry('watcher', 'desktop').nodeId, 'north_wall_observation')
    assert.equal(resolveBuildingEntry('watcher', 'mobile').nodeId, 'mobile_east_observation_point')
  })

  it('marks the already-rendered Sanctum environmental landmark explicitly', () => {
    const desktop = resolveBuildingEntry('sanctum', 'desktop')
    const mobile = resolveBuildingEntry('sanctum', 'mobile')
    assert.equal(desktop.anchorKind, 'verified-landmark')
    assert.deepEqual([desktop.xPercent, desktop.yPercent], [39, 76])
    assert.deepEqual([mobile.xPercent, mobile.yPercent], [72, 80])
    assert.equal(resolveBuildingEntry('unknown', 'mobile'), null)
  })

  it('keeps every main interior architecturally identifiable without duplicating Forge', () => {
    const scene = readFileSync(new URL('../components/building-interiors/BuildingInteriorScene.jsx', import.meta.url), 'utf8')
    const identityLandmarks = [
      'archive-chamber__shelves', 'archive-chamber__codex',
      'citadel-chamber__banner', 'citadel-chamber__war-table',
      'watcher-chamber__telescope', 'watcher-chamber__parapet',
      'sanctum-chamber__apothecary', 'sanctum-chamber__pool',
    ]
    for (const landmark of identityLandmarks) assert.match(scene, new RegExp(landmark))
    assert.equal((scene.match(/function ForgeChamber/g) ?? []).length, 1)
    assert.equal((scene.match(/function (Archive|Citadel|Watcher|Sanctum)Chamber/g) ?? []).length, 4)
  })
})
