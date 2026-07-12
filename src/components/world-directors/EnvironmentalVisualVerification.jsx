import { memo } from 'react'

function EnvironmentalVisualVerification({ verification }) {
  if (!verification) return null
  return <div
    className="environment-visual-verification"
    data-visual-effect={verification.id}
    style={{ '--visual-x': `${verification.point.x}%`, '--visual-y': `${verification.point.y}%` }}
    aria-hidden="true"
  >
    <i />
    <span>{verification.label}</span>
  </div>
}

export default memo(EnvironmentalVisualVerification)
