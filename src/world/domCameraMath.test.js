import test from 'node:test'
import assert from 'node:assert/strict'

import {
  boundDomCamera,
  worldPointUnderClient,
  zoomDomCameraAtPoint,
} from './domCameraMath.js'

const viewportRect = { left: 100, top: 50, width: 800, height: 600 }
const closeTo = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`)

test('wheel zoom preserves the world point under the cursor', () => {
  const camera = { x: 42, y: -31, scale: 1.2 }
  const cursor = { x: 690, y: 210 }
  const before = worldPointUnderClient(camera, cursor, viewportRect)
  const zoomed = zoomDomCameraAtPoint(camera, 1.82, cursor, viewportRect)
  const after = worldPointUnderClient(zoomed, cursor, viewportRect)
  closeTo(after.x, before.x)
  closeTo(after.y, before.y)
})

test('pinch anchor can zoom and pan from its initial midpoint', () => {
  const camera = { x: -20, y: 15, scale: 1.1 }
  const start = { x: 420, y: 360 }
  const current = { x: 452, y: 339 }
  const before = worldPointUnderClient(camera, start, viewportRect)
  const zoomed = zoomDomCameraAtPoint(camera, 1.65, start, viewportRect)
  const moved = { ...zoomed, x: zoomed.x + current.x - start.x, y: zoomed.y + current.y - start.y }
  const after = worldPointUnderClient(moved, current, viewportRect)
  closeTo(after.x, before.x)
  closeTo(after.y, before.y)
})

test('camera bounds enforce usable min/max zoom and courtyard edges', () => {
  const maximum = boundDomCamera({ x: 999, y: -999, scale: 9 }, { width: 400, height: 300 }, { width: 800, height: 600 })
  closeTo(maximum.x, 680)
  closeTo(maximum.y, -510)
  closeTo(maximum.scale, 2.2)
  assert.deepEqual(
    boundDomCamera({ x: 100, y: 100, scale: 0.1 }, { width: 800, height: 600 }, { width: 800, height: 600 }),
    { x: 0, y: 0, scale: 1 },
  )
})
