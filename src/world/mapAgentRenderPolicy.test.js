import test from 'node:test'
import assert from 'node:assert/strict'

import { getMapAgentLod, selectMapAgentRenderSet } from './mapAgentRenderPolicy.js'

test('render policy culls out-of-world agents, caps scale and preserves critical/selected agents', () => {
  const agents = Array.from({ length: 60 }, (_, index) => ({
    profileId: `agent-${index}`,
    worldX: 20 + index % 8,
    worldY: 20 + index,
    sortY: 20 + index,
    severity: 'none',
    signalState: 'none',
    visualState: 'idle',
    isMoving: false,
  }))
  agents[55] = { ...agents[55], worldY: 45, sortY: 45, severity: 'critical' }
  agents.push({ profileId: 'outside', worldX: 400, worldY: 40, severity: 'critical' })
  const selectedId = 'agent-58'
  const selected = { ...agents[58], worldY: 46, sortY: 46 }
  agents[58] = selected

  const result = selectMapAgentRenderSet(agents, selectedId, 12)
  assert.equal(result.length, 12)
  assert.ok(result.some((agent) => agent.profileId === 'agent-55'))
  assert.ok(result.some((agent) => agent.profileId === selectedId))
  assert.ok(!result.some((agent) => agent.profileId === 'outside'))
  assert.deepEqual(result.map((agent) => agent.sortY), [...result].map((agent) => agent.sortY).sort((a, b) => a - b))
})

test('LOD keeps moving and exceptional agents detailed while resting fallback can simplify', () => {
  assert.equal(getMapAgentLod({ profileId: 'coder', severity: 'none', isMoving: true, visualState: 'walk' }, null), 'high')
  assert.equal(getMapAgentLod({ profileId: 'coder', severity: 'warning', isMoving: false, visualState: 'blocked' }, null), 'high')
  assert.equal(getMapAgentLod({ profileId: 'coder', severity: 'none', isMoving: false, visualState: 'idle' }, null), 'low')
})
