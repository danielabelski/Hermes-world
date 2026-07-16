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
  assert.match(app, /bridgeEnabled = BYPASS_AUTH \|\| authState === 'authenticated'/)
  assert.match(bridge, /!enabled \|\| demoMode \|\| typeof EventSource/)
})

test('service worker refreshes caches without forcibly navigating clients', () => {
  const worker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
  assert.match(worker, /hermes-citadel-v5-live-runtime/)
  assert.doesNotMatch(worker, /client\.navigate|clients\.openWindow\(productionRoot\)/)
})
