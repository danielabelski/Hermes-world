export const INFRASTRUCTURE_STAGE_ASPECT = Object.freeze({ mobile: 941 / 1672, desktop: 1535 / 1024 })

export function computeConduitGeometry(from, to, aspect) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const screenDy = dy / aspect
  return Object.freeze({ x: from[0], y: from[1], length: Math.hypot(dx, screenDy), angle: Math.atan2(screenDy, dx) * 180 / Math.PI })
}
