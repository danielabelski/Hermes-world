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
    renderHeight: 52,
  })
  assert.equal(assertMapAgentManifestSeparation(), true)

  for (const [profile, set] of Object.entries(MAP_AGENT_MANIFEST)) {
    for (const state of ['idle', 'walk', 'work', 'thinking', 'waiting', 'observe', 'alert', 'blocked', 'stuck', 'success', 'offline']) {
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

test('role visibility survives working state while offline remains an explicit override', () => {
  const css = readFileSync(path.join(PROJECT_ROOT, 'src/components/map-agents/MapAgentSprite.css'), 'utf8')
  assert.doesNotMatch(css, /\.map-agent-sprite\.is-work\s+\.map-agent-sprite__image\s*\{[^}]*filter:/s)
  assert.match(css, /\.map-agent-sprite\.is-offline\s+\.map-agent-sprite__image\s*\{[^}]*filter:/s)
})

test('cold start reveals the layer with the map and lets each sprite settle independently', () => {
  const sprite = readFileSync(path.join(PROJECT_ROOT, 'src/components/map-agents/MapAgentSprite.jsx'), 'utf8')
  const spriteCss = readFileSync(path.join(PROJECT_ROOT, 'src/components/map-agents/MapAgentSprite.css'), 'utf8')
  const fallback = readFileSync(path.join(PROJECT_ROOT, 'src/world/WorldFallback.jsx'), 'utf8')
  assert.match(sprite, /is-asset-pending/)
  assert.match(sprite, /map-agent-sprite__image--base/)
  assert.match(sprite, /map-agent-sprite__image--target/)
  assert.match(sprite, /loadedTargetSrc === src/)
  assert.match(sprite, /onLoad=\{\(\) => setAssetReady\(true\)\}/)
  assert.match(sprite, /onLoad=\{\(\) => setLoadedTargetSrc\(src\)\}/)
  assert.match(spriteCss, /\.map-agent-sprite\.is-asset-pending\s*\{[^}]*pointer-events:\s*none/s)
  assert.match(spriteCss, /\.map-agent-sprite\.is-asset-pending\s+\.map-agent-sprite__shadow[\s\S]*?visibility:\s*hidden/s)
  assert.doesNotMatch(spriteCss, /\.map-agent-sprite\.is-asset-pending\s*\{[^}]*opacity:\s*0/s)
  assert.match(spriteCss, /\.map-agent-sprite__image--target\s*\{[^}]*opacity:\s*0/s)
  assert.match(spriteCss, /\.map-agent-sprite__image--target\.is-frame-ready\s*\{[^}]*opacity:\s*1/s)
  assert.match(fallback, /data-map-ready=/)
  assert.match(fallback, /data-agents-ready=/)
  assert.match(fallback, /mapLoaded \? <WorldEnvironmentalLife/)
  assert.doesNotMatch(fallback, /Promise\.all\(waits\)/)
  assert.doesNotMatch(fallback, /setTimeout\(\(\) => \{[\s\S]*?3_000\)/)
})
