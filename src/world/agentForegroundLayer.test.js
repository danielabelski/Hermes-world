import test from 'node:test'
import assert from 'node:assert/strict'
import { shouldRenderAgentAboveForeground } from './agentForegroundLayer.js'

test('mobile agents at facade thresholds render above the foreground crop', () => {
  assert.equal(shouldRenderAgentAboveForeground({ worldX: 50, worldY: 43, isInside: false, occupancyMode: 'world' }, 'mobile'), true)
  assert.equal(shouldRenderAgentAboveForeground({ worldX: 65.5, worldY: 71.2, isInside: false, occupancyMode: 'world' }, 'mobile'), true)
})

test('agents outside thresholds remain below foreground architecture', () => {
  assert.equal(shouldRenderAgentAboveForeground({ worldX: 41, worldY: 84, isInside: false, occupancyMode: 'world' }, 'mobile'), false)
  assert.equal(shouldRenderAgentAboveForeground({ worldX: 65, worldY: 74, isInside: false, occupancyMode: 'world' }, 'mobile'), false)
})

test('inside agents remain exclusively owned by the interior renderer', () => {
  assert.equal(shouldRenderAgentAboveForeground({ worldX: 50, worldY: 43, isInside: true, occupancyMode: 'facade-front' }, 'mobile'), false)
})
