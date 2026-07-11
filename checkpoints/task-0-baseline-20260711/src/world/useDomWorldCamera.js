import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 2.2
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const pointFor = (event) => ({ x: event.clientX, y: event.clientY })
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

function boundedCamera(camera, viewport, stage) {
  const scale = clamp(camera.scale, MIN_SCALE, MAX_SCALE)
  const maxX = Math.max(0, (stage.width * scale - viewport.width) * 0.5)
  const maxY = Math.max(0, (stage.height * scale - viewport.height) * 0.5)
  return {
    scale,
    x: clamp(camera.x, -maxX, maxX),
    y: clamp(camera.y, -maxY, maxY),
  }
}

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
  const [camera, setCameraState] = useState(cameraRef.current)

  const dimensions = useCallback(() => {
    const viewport = viewportRef.current?.getBoundingClientRect()
    const stage = stageRef.current?.getBoundingClientRect()
    const viewportSize = { width: viewport?.width || window.innerWidth, height: viewport?.height || window.innerHeight }
    return {
      viewport: viewportSize,
      stage: { width: (stage?.width || viewportSize.width) / cameraRef.current.scale, height: (stage?.height || viewportSize.height) / cameraRef.current.scale },
    }
  }, [])

  const setCamera = useCallback((next) => {
    const size = dimensions()
    const value = boundedCamera(typeof next === 'function' ? next(cameraRef.current) : next, size.viewport, size.stage)
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
    event.currentTarget.setPointerCapture?.(event.pointerId)
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
      setCamera({
        scale: pinchRef.current.scale * ratio,
        x: pinchRef.current.x + currentMidpoint.x - pinchRef.current.midpoint.x,
        y: pinchRef.current.y + currentMidpoint.y - pinchRef.current.midpoint.y,
      })
      return
    }

    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = point.x - drag.point.x
    const dy = point.y - drag.point.y
    if (Math.hypot(dx, dy) > 5) {
      drag.moved = true
      suppressSelectionUntilRef.current = Date.now() + 220
    }
    setCamera({ ...cameraRef.current, x: drag.originX + dx, y: drag.originY + dy })
  }, [setCamera])

  const onPointerEnd = useCallback((event) => {
    pointersRef.current.delete(event.pointerId)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
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
    setCamera({ ...cameraRef.current, scale: cameraRef.current.scale * factor })
  }, [setCamera])

  const resetCamera = useCallback(() => setCamera({ x: 0, y: 0, scale: 1 }), [setCamera])
  const shouldSuppressSelection = useCallback(() => Date.now() < suppressSelectionUntilRef.current, [])

  useEffect(() => {
    const preferredScale = zoomPreference === 'detail' ? 1.48 : 1
    setCamera((current) => ({ ...current, scale: preferredScale }))
  }, [setCamera, zoomPreference])

  useEffect(() => {
    const onResize = () => setCamera((current) => current)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
