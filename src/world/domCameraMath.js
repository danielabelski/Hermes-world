export const DOM_CAMERA_MIN_SCALE = 1
export const DOM_CAMERA_MAX_SCALE = 2.2

export const clampCameraValue = (value, min, max) => Math.max(min, Math.min(max, value))

export function boundDomCamera(camera, viewport, stage) {
  const scale = clampCameraValue(camera.scale, DOM_CAMERA_MIN_SCALE, DOM_CAMERA_MAX_SCALE)
  const maxX = Math.max(0, (stage.width * scale - viewport.width) * 0.5)
  const maxY = Math.max(0, (stage.height * scale - viewport.height) * 0.5)
  return {
    scale,
    x: clampCameraValue(camera.x, -maxX, maxX),
    y: clampCameraValue(camera.y, -maxY, maxY),
  }
}

export function zoomDomCameraAtPoint(camera, nextScale, clientPoint, viewportRect) {
  const scale = clampCameraValue(nextScale, DOM_CAMERA_MIN_SCALE, DOM_CAMERA_MAX_SCALE)
  const ratio = scale / Math.max(0.001, camera.scale)
  const offsetX = clientPoint.x - (viewportRect.left + viewportRect.width / 2)
  const offsetY = clientPoint.y - (viewportRect.top + viewportRect.height / 2)
  return {
    scale,
    x: offsetX - (offsetX - camera.x) * ratio,
    y: offsetY - (offsetY - camera.y) * ratio,
  }
}

export function worldPointUnderClient(camera, clientPoint, viewportRect) {
  const offsetX = clientPoint.x - (viewportRect.left + viewportRect.width / 2)
  const offsetY = clientPoint.y - (viewportRect.top + viewportRect.height / 2)
  return {
    x: (offsetX - camera.x) / camera.scale,
    y: (offsetY - camera.y) / camera.scale,
  }
}
