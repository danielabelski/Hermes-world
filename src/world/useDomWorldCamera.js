import { useCallback, useEffect, useRef, useState } from 'react'
import { boundDomCamera, zoomDomCameraAtPoint } from './domCameraMath.js'

const pointFor = (event) => ({ x: event.clientX, y: event.clientY })
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/**
 * Lightweight camera for the reliable DOM renderer. Pixi owns an equivalent
 * camera when enabled, but the default mobile world must remain pannable on
 * devices where WebGL is unavailable or intentionally disabled.
 */
export function useDomWorldCamera({ zoomPreference = 'standard' } = {}) {
  const viewportRef = useRef(null)
  const stageRef = useRef(null)
  const pointersRef = useRef(new Map())
  const dragRef = useRef(null)
  const pinchRef = useRef(null)
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 })
  const suppressSelectionUntilRef = useRef(0)
  const [camera, setCameraState] = useState({ x: 0, y: 0, scale: 1 })

  const dimensions = useCallback(() => {
    const viewport = viewportRef.current?.getBoundingClientRect()
    const stage = stageRef.current?.getBoundingClientRect()
    const viewportSize = { width: viewport?.width || window.innerWidth, height: viewport?.height || window.innerHeight }
    return {
      viewport: viewportSize,
      stage: { width: (stage?.width || viewportSize.width) / cameraRef.current.scale, height: (stage?.height || viewportSize.height) / cameraRef.current.scale },
    }
  }, [])

  const viewportRect = useCallback(() => viewportRef.current?.getBoundingClientRect() ?? {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  }, [])

  const setCamera = useCallback((next) => {
    const size = dimensions()
    const value = boundDomCamera(typeof next === 'function' ? next(cameraRef.current) : next, size.viewport, size.stage)
    cameraRef.current = value
    setCameraState(value)
  }, [dimensions])

  const startSinglePointer = useCallback((pointerId, point) => {
    const current = cameraRef.current
    dragRef.current = { pointerId, point, originX: current.x, originY: current.y, moved: false }
    pinchRef.current = null
  }, [])

  const onPointerDown = useCallback((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const point = pointFor(event)
    pointersRef.current.set(event.pointerId, point)
    event.target.setPointerCapture?.(event.pointerId)
    if (pointersRef.current.size === 1) startSinglePointer(event.pointerId, point)
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()]
      pinchRef.current = { distance: Math.max(1, distance(first, second)), midpoint: midpoint(first, second), ...cameraRef.current }
      dragRef.current = null
    }
  }, [startSinglePointer])

  const onPointerMove = useCallback((event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    const point = pointFor(event)
    pointersRef.current.set(event.pointerId, point)

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()]
      const currentMidpoint = midpoint(first, second)
      const ratio = distance(first, second) / pinchRef.current.distance
      suppressSelectionUntilRef.current = Date.now() + 220
      const anchored = zoomDomCameraAtPoint(
        pinchRef.current,
        pinchRef.current.scale * ratio,
        pinchRef.current.midpoint,
        viewportRect(),
      )
      setCamera({
        ...anchored,
        x: anchored.x + currentMidpoint.x - pinchRef.current.midpoint.x,
        y: anchored.y + currentMidpoint.y - pinchRef.current.midpoint.y,
      })
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = point.x - drag.point.x
    const dy = point.y - drag.point.y
    if (!drag.moved && Math.hypot(dx, dy) <= 5) return
    if (!drag.moved) {
      drag.moved = true
      suppressSelectionUntilRef.current = Date.now() + 220
    }
    setCamera({ ...cameraRef.current, x: drag.originX + dx, y: drag.originY + dy })
  }, [setCamera, viewportRect])

  const onPointerEnd = useCallback((event) => {
    pointersRef.current.delete(event.pointerId)
    if (event.target.hasPointerCapture?.(event.pointerId)) event.target.releasePointerCapture?.(event.pointerId)
    if (pointersRef.current.size === 1) {
      const [pointerId, point] = pointersRef.current.entries().next().value
      startSinglePointer(pointerId, point)
    } else if (pointersRef.current.size === 0) {
      dragRef.current = null
      pinchRef.current = null
    }
  }, [startSinglePointer])

  const onWheel = useCallback((event) => {
    event.preventDefault()
    suppressSelectionUntilRef.current = Date.now() + 120
    const factor = Math.exp(-event.deltaY * 0.0012)
    setCamera(zoomDomCameraAtPoint(cameraRef.current, cameraRef.current.scale * factor, pointFor(event), viewportRect()))
  }, [setCamera, viewportRect])

  const resetCamera = useCallback(() => setCamera({ x: 0, y: 0, scale: 1 }), [setCamera])
  const shouldSuppressSelection = useCallback(() => Date.now() < suppressSelectionUntilRef.current, [])

  useEffect(() => {
    const preferredScale = zoomPreference === 'detail' ? 1.48 : 1
    setCamera((current) => ({ ...current, scale: preferredScale }))
  }, [setCamera, zoomPreference])

  useEffect(() => {
    const pointers = pointersRef.current
    const onResize = () => setCamera((current) => current)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      pointers.clear()
      dragRef.current = null
      pinchRef.current = null
      suppressSelectionUntilRef.current = 0
    }
  }, [setCamera])

  return {
    viewportRef,
    stageRef,
    camera,
    stageStyle: {
      '--camera-x': `${camera.x}px`,
      '--camera-y': `${camera.y}px`,
      '--camera-scale': camera.scale,
    },
    handlers: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd, onWheel, onDoubleClick: resetCamera },
    shouldSuppressSelection,
    resetCamera,
  }
}
