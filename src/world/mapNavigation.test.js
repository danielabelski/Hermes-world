import test from 'node:test'
import assert from 'node:assert/strict'

import { DESKTOP_MAP_NODES, MOBILE_MAP_NODES, MAP_ROUTE_DEFINITIONS, getMapNodes } from './data/mapNavigation.js'
import { getWorldLifeJourney } from './data/roadGraph.js'

test('semantic navigation nodes match the locked desktop and mobile map calibrations', () => {
  assert.deepEqual(
    { x: DESKTOP_MAP_NODES.forge_entrance.xPercent, y: DESKTOP_MAP_NODES.forge_entrance.yPercent },
    { x: 84, y: 49 },
  )
  assert.deepEqual(
    { x: DESKTOP_MAP_NODES.library_entrance.xPercent, y: DESKTOP_MAP_NODES.library_entrance.yPercent },
    { x: 28.5, y: 36.5 },
  )
  assert.deepEqual(
    { x: MOBILE_MAP_NODES.mobile_forge_entrance.xPercent, y: MOBILE_MAP_NODES.mobile_forge_entrance.yPercent },
    { x: 30.5, y: 49.2 },
  )
  assert.deepEqual(
    { x: MOBILE_MAP_NODES.mobile_east_observation_point.xPercent, y: MOBILE_MAP_NODES.mobile_east_observation_point.yPercent },
    { x: 65.5, y: 71.2 },
  )
})

test('every reference route uses named nodes from its current layout and returns continuously', () => {
  for (const layout of ['desktop', 'mobile']) {
    const nodes = getMapNodes(layout)
    for (const profile of ['coder', 'researcher', 'prospecting']) {
      const definition = MAP_ROUTE_DEFINITIONS[layout][profile]
      const journey = getWorldLifeJourney(profile, layout)
      for (const nodeId of [...definition.outboundNodeIds, definition.workNodeId, definition.safeBlockedNodeId]) {
        assert.ok(nodes[nodeId], `${layout}/${profile}: unknown ${nodeId}`)
      }
      assert.deepEqual(journey.outboundWaypoints.at(-1), journey.entrancePoint)
      assert.deepEqual(journey.returnWaypoints[0], journey.entrancePoint)
      assert.deepEqual(journey.returnWaypoints.at(-1), journey.homePoint)
      assert.ok(definition.outboundNodeIds.includes(definition.safeBlockedNodeId))
    }
  }
})
