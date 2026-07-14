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
    const styles = readFileSync(new URL('../components/building-interiors/BuildingInteriorScene.css', import.meta.url), 'utf8')
    const identityLandmarks = [
      'archive-chamber__shelves', 'archive-chamber__codex', 'archive-chamber__lamp', 'archive-chamber__aisle',
      'citadel-chamber__banner', 'citadel-chamber__war-table', 'citadel-chamber__oculus', 'citadel-chamber__aisle',
      'watcher-chamber__telescope', 'watcher-chamber__parapet', 'watcher-chamber__shutter',
      'sanctum-chamber__apothecary', 'sanctum-chamber__pool', 'sanctum-chamber__canopy', 'sanctum-chamber__altar',
    ]
    for (const landmark of identityLandmarks) assert.match(scene, new RegExp(landmark))
    assert.equal((scene.match(/function ForgeChamber/g) ?? []).length, 1)
    assert.equal((scene.match(/function (Archive|Citadel|Watcher|Sanctum)Chamber/g) ?? []).length, 4)
    assert.equal((scene.match(/<RoomDepth kind=/g) ?? []).length, 4)
    for (const depthLayer of ['interior-depth__ceiling', 'interior-depth__back-arch', 'interior-depth__rib', 'interior-depth__wall', 'interior-depth__floor', 'interior-depth__light', 'interior-depth__light-pool', 'interior-depth__threshold']) {
      assert.match(scene, new RegExp(depthLayer))
      assert.match(styles, new RegExp(`\\.${depthLayer}`))
    }
    const depthContract = styles.slice(styles.indexOf('.interior-depth{'), styles.indexOf('.building-interior--citadel{'))
    assert.doesNotMatch(depthContract, /animation\s*:/)
    const premiumContract = styles.slice(styles.indexOf('/* Premium spatial integration'), styles.indexOf('.building-interior__readout'))
    assert.doesNotMatch(premiumContract, /@keyframes|animation\s*:/)
  })
})
