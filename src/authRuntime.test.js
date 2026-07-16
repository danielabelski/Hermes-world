import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveAuthenticationState } from './authRuntime.js'

test('production auth requires a real logged-in session', () => {
  assert.equal(resolveAuthenticationState(true, { auth_enabled: true, logged_in: false }), 'unauthenticated')
  assert.equal(resolveAuthenticationState(true, { auth_enabled: true, logged_in: true }), 'authenticated')
  assert.equal(resolveAuthenticationState(false, null), 'unauthenticated')
})

test('explicitly disabled backend auth remains usable', () => {
  assert.equal(resolveAuthenticationState(true, { auth_enabled: false, logged_in: false }), 'authenticated')
})
