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
  assert.match(sprite, /--map-agent-stride-x/)
  assert.match(sprite, /--map-agent-step-scale-y/)
  assert.match(sprite, /--map-agent-foot-origin/)
  assert.match(sprite, /--map-agent-shadow-step/)
  assert.match(sprite, /--map-agent-crowd-x/)
  assert.match(layer, /phase < 0\.28/)
  assert.match(styles, /var\(--map-agent-stride-x/)
  assert.match(styles, /var\(--map-agent-step-scale-y/)
  assert.match(styles, /transform-origin: 50% var\(--map-agent-foot-origin/)
  assert.match(styles, /map-agent-sprite\.is-moving[\s\S]*transform 116ms linear/)
  assert.match(styles, /var\(--map-agent-crowd-x/)
  assert.match(styles, /scaleX\(calc\(var\(--map-agent-shadow-scale/)
})
