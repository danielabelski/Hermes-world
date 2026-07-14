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

  it('renders every main interior through one cinematic plate contract', () => {
    const scene = readFileSync(new URL('../components/building-interiors/BuildingInteriorScene.jsx', import.meta.url), 'utf8')
    const plates = readFileSync(new URL('../components/building-interiors/CinematicInteriorPlate.jsx', import.meta.url), 'utf8')
    const styles = readFileSync(new URL('../components/building-interiors/BuildingInteriorScene.css', import.meta.url), 'utf8')
    assert.equal((scene.match(/<CinematicInteriorPlate/g) ?? []).length, 1)
    assert.doesNotMatch(scene, /RoomDepth|ForgeChamber|archive-chamber|citadel-chamber|watcher-chamber|sanctum-chamber/)
    const plateAssets = {
      forge: 'forge-execution-hall.jpg',
      archive: 'archive-memory-hall.jpg',
      citadel: 'citadel-command-hall.jpg',
      watcher: 'watcher-observatory.jpg',
      sanctum: 'sanctum-recovery-hall.jpg',
    }
    for (const [buildingId, asset] of Object.entries(plateAssets)) {
      assert.match(plates, new RegExp(`${buildingId}: freeze`))
      assert.match(plates, new RegExp(asset.replace('.', '\\.')))
      assert.match(styles, new RegExp(`cinematic-effect--${buildingId}-`))
    }
    assert.match(styles, /aspect-ratio:4\/5/)
    assert.match(styles, /prefers-reduced-motion:reduce/)
    assert.doesNotMatch(styles, /filter\s*:|backdrop-filter\s*:|blur\s*\(/)
    assert.doesNotMatch(styles, /interior-depth|forge-chamber|archive-chamber|citadel-chamber|watcher-chamber|sanctum-chamber/)
  })
})
