import { useEffect, useMemo, useState } from 'react'
import { deriveEnvironmentalPresentation } from './environmentalDirector.js'

export function useEnvironmentalDirector({ now, layout, choreography, operationalPresentations }) {
  const [startedAt] = useState(now)
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden')
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const syncVisibility = () => setVisible(document.visibilityState !== 'hidden')
    const syncMotion = () => setReducedMotion(Boolean(media?.matches))
    document.addEventListener('visibilitychange', syncVisibility)
    media?.addEventListener?.('change', syncMotion)
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility)
      media?.removeEventListener?.('change', syncMotion)
    }
  }, [])

  return useMemo(() => deriveEnvironmentalPresentation({
    now, startedAt, visible, reducedMotion, layout, choreography, operationalPresentations,
  }), [choreography, layout, now, operationalPresentations, reducedMotion, startedAt, visible])
}
