export const DEFAULT_WORLD_BOUNDS = Object.freeze({ left: -590, right: 590, top: -390, bottom: 440 })

export const ZOOM_PREFERENCES = Object.freeze({
  overview: 0.56,
  standard: 0.78,
  detail: 1.18,
})

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value))
}

/**
 * A Pixi-independent camera model. Its coordinates are screen translation
 * values, which keeps it easy to unit-test without a canvas or renderer.
 */
export class CameraSystem {
  constructor({ bounds = DEFAULT_WORLD_BOUNDS, minScale = 0.38, maxScale = 1.48 } = {}) {
    this.bounds = { ...bounds }
    this.minScale = minScale
    this.maxScale = maxScale
    this.viewport = { width: 0, height: 0 }
    this.transform = { x: 0, y: 0, scale: minScale }
  }

  setViewport(width, height) {
    this.viewport.width = Math.max(0, width)
    this.viewport.height = Math.max(0, height)
    return this.clampTransform()
  }

  setMinScale(scale) {
    this.minScale = Math.min(Math.max(0.01, scale), this.maxScale)
    return this.clampTransform()
  }

  setTransform({ x = this.transform.x, y = this.transform.y, scale = this.transform.scale }) {
    this.transform = { x, y, scale: clamp(scale, this.minScale, this.maxScale) }
    return this.clampTransform()
  }

  getTransform() {
    return { ...this.transform }
  }

  getPreferredScale(preference = 'standard') {
    return clamp(ZOOM_PREFERENCES[preference] ?? ZOOM_PREFERENCES.standard, this.minScale, this.maxScale)
  }

  clampTransform() {
    const { left, right, top, bottom } = this.bounds
    const { width, height } = this.viewport
    const { scale } = this.transform
    const minX = width - right * scale
    const maxX = -left * scale
    const minY = height - bottom * scale
    const maxY = -top * scale

    this.transform.x = minX > maxX ? (minX + maxX) / 2 : clamp(this.transform.x, minX, maxX)
    this.transform.y = minY > maxY ? (minY + maxY) / 2 : clamp(this.transform.y, minY, maxY)
    return this.getTransform()
  }

  panBy(deltaX, deltaY) {
    this.transform.x += deltaX
    this.transform.y += deltaY
    return this.clampTransform()
  }

  zoomAt(nextScale, focus) {
    const boundedScale = clamp(nextScale, this.minScale, this.maxScale)
    const worldX = (focus.x - this.transform.x) / this.transform.scale
    const worldY = (focus.y - this.transform.y) / this.transform.scale
    this.transform.scale = boundedScale
    this.transform.x = focus.x - worldX * boundedScale
    this.transform.y = focus.y - worldY * boundedScale
    return this.clampTransform()
  }

  focusWorldPoint(point, { zoomPreference = 'detail', scale } = {}) {
    const targetScale = clamp(scale ?? this.getPreferredScale(zoomPreference), this.minScale, this.maxScale)
    this.transform.scale = targetScale
    this.transform.x = this.viewport.width / 2 - point.x * targetScale
    this.transform.y = this.viewport.height / 2 - point.y * targetScale
    return this.clampTransform()
  }

  focusEntity(entityType, entityId, anchors, options) {
    const target = anchors?.[`${entityType}:${entityId}`]
    return target ? this.focusWorldPoint(target, options) : null
  }
}

