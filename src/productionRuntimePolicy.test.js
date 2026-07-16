import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('production root strips a historical demo launch URL', () => {
  const server = readFileSync(new URL('../server.js', import.meta.url), 'utf8')
  assert.match(server, /Number\(PORT\) === 4175 && req\.query\.demo === '1'/)
  assert.match(server, /res\.redirect\(302, '\/'\)/)
})

test('live bridge waits for authentication and demo does not open SSE', () => {
  const app = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8')
  const bridge = readFileSync(new URL('./hooks/useWorldBridge.js', import.meta.url), 'utf8')
  const stream = readFileSync(new URL('./world/events/worldEventStream.js', import.meta.url), 'utf8')
  assert.match(app, /bridgeEnabled = BYPASS_AUTH \|\| authState === 'authenticated'/)
  assert.match(bridge, /if \(!enabled \|\| demoMode\) return undefined/)
  assert.match(bridge, /subscribeWorldEventStream/)
  assert.doesNotMatch(bridge, /new EventSource/)
  assert.match(stream, /new EventSourceImpl\('\/api\/world\/events\/stream'\)/)
})

test('service worker refreshes caches without forcibly navigating clients', () => {
  const worker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
  assert.match(worker, /hermes-citadel-v5-live-runtime/)
  assert.doesNotMatch(worker, /client\.navigate|clients\.openWindow\(productionRoot\)/)
})

test('mobile lifecycle pauses hidden work, resumes immediately and cleans up every listener', () => {
  const bridge = readFileSync(new URL('./hooks/useWorldBridge.js', import.meta.url), 'utf8')
  const stream = readFileSync(new URL('./world/events/worldEventStream.js', import.meta.url), 'utf8')
  const worldCss = readFileSync(new URL('./world/worldFallback.css', import.meta.url), 'utf8')
  const environment = readFileSync(new URL('./components/world-directors/WorldEnvironmentalLife.jsx', import.meta.url), 'utf8')

  assert.match(bridge, /document\.visibilityState !== 'hidden'\) await refresh\(\)/)
  assert.match(bridge, /addEventListener\('pageshow', resume\)/)
  assert.match(bridge, /addEventListener\('online', resume\)/)
  assert.match(bridge, /removeEventListener\('pageshow', resume\)/)
  assert.match(bridge, /removeEventListener\('online', resume\)/)
  assert.match(stream, /if \(subscribers\.size === 0\) closeStream\(\)/)
  assert.match(worldCss, /has-open-interior \.fallback-map-stage\*?[^\n]*animation-play-state:paused!important/)
  assert.match(environment, /cancelAnimationFrame\(animationFrame\)/)
  assert.match(environment, /clearTimeout\(resampleTimer\)/)
})

test('raw log ticker uses a stable empty selector before the first live snapshot', () => {
  const ticker = readFileSync(new URL('./components/overlays/WorldEventTicker.jsx', import.meta.url), 'utf8')
  assert.match(ticker, /const EMPTY_RAW_LOGS = Object\.freeze\(\[\]\)/)
  assert.match(ticker, /state\.raw\?\.logs \?\? EMPTY_RAW_LOGS/)
  assert.doesNotMatch(ticker, /state\.raw\?\.logs \?\? \[\]/)
})
