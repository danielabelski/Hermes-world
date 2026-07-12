import { useEffect, useMemo, useState } from 'react'
import { deriveEnvironmentalPresentation } from './environmentalDirector.js'
import { deriveWorldOperations } from './worldOperationsDirector.js'

export function useEnvironmentalDirector({ now, layout, choreography, operationalPresentations, lifecycle, visualDebug = false }) {
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

  return useMemo(() => {
    const environment = deriveEnvironmentalPresentation({ now, startedAt, visible, reducedMotion, visualDebug, layout, choreography, operationalPresentations })
    const worldOperations = deriveWorldOperations({ now, startedAt, visible, reducedMotion, layout, choreography, operationalPresentations, lifecycle })
    return { ...environment, worldOperations }
  }, [choreography, layout, lifecycle, now, operationalPresentations, reducedMotion, startedAt, visible, visualDebug])
}
