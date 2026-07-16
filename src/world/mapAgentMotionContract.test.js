import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const layer = readFileSync(new URL('../components/map-agents/MapAgentLayer.jsx', import.meta.url), 'utf8')
const sprite = readFileSync(new URL('../components/map-agents/MapAgentSprite.jsx', import.meta.url), 'utf8')
const styles = readFileSync(new URL('../components/map-agents/MapAgentSprite.css', import.meta.url), 'utf8')

test('map walkers expose an explicit footstep pose instead of a floating-only bob', () => {
  assert.match(layer, /isMoving=\{model\.isMoving\}/)
  assert.match(sprite, /getAgentMotionPose/)
  assert.match(sprite, /--map-agent-step-x/)
  assert.match(sprite, /--map-agent-step-lean/)
  assert.match(sprite, /--map-agent-shadow-step/)
  assert.match(styles, /translate3d\(var\(--map-agent-step-x/)
  assert.match(styles, /scaleX\(calc\(var\(--map-agent-shadow-scale/)
})
