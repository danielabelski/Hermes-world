import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import {
  MAP_AGENT_CANVAS,
  MAP_AGENT_MANIFEST,
  assertMapAgentAssetUrl,
  assertMapAgentManifestSeparation,
} from './data/mapAgentManifest.js'

const PROJECT_ROOT = process.cwd()

test('map sprites have the shared canvas, foot anchor and complete runtime frame contract', () => {
  assert.deepEqual(MAP_AGENT_CANVAS, {
    width: 128,
    height: 128,
    footAnchorX: 0.5,
    footAnchorY: 0.96875,
    renderHeight: 56,
  })
  assert.equal(assertMapAgentManifestSeparation(), true)

  for (const [profile, set] of Object.entries(MAP_AGENT_MANIFEST)) {
    for (const state of ['idle', 'walk', 'work', 'thinking', 'observe', 'alert', 'blocked', 'success', 'offline']) {
      assert.ok(set.frames[state]?.length, `${profile}: missing ${state}`)
      for (const url of set.frames[state]) {
        assert.equal(assertMapAgentAssetUrl(url), url)
        const file = path.join(PROJECT_ROOT, 'public', url.replace(/^\//, ''))
        assert.ok(existsSync(file), `${profile}: missing ${file}`)
        const bytes = readFileSync(file)
        assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${file}: not WebP RIFF`)
        assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${file}: not WebP payload`)
        assert.ok(statSync(file).size < 50_000, `${file}: exceeds the 50 KB frame budget`)
      }
    }
  }
})

test('portrait assets are rejected from the map contract and absent from active map sources', () => {
  assert.throws(() => assertMapAgentAssetUrl('/heroes/hero-04.webp'), /rejected UI portrait asset/)
  const activeMapSources = [
    'src/world/WorldFallback.jsx',
    'src/world/WorldCanvas.jsx',
    'src/components/map-agents/MapAgentLayer.jsx',
    'src/components/map-agents/MapAgentSprite.jsx',
  ]
  for (const relativePath of activeMapSources) {
    const source = readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8')
    assert.ok(!source.includes('getAgentPortraitAsset'), `${relativePath}: imports a UI portrait`)
    assert.ok(!source.includes('/heroes/'), `${relativePath}: contains a portrait URL`)
  }
})
