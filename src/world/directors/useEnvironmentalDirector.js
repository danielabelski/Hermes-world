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

  const controlNow = Math.floor(now / 500) * 500
  const choreographySnapshot = JSON.stringify({
    activeRunId: choreography?.activeRunId ?? null,
    kind: choreography?.kind ?? null,
    signals: (choreography?.signals ?? []).map((signal) => ({
      kind: signal.kind, evidenceEventId: signal.evidenceEventId ?? null, buildingId: signal.buildingId ?? null,
      targetAgentId: signal.targetAgentId ?? null, runId: signal.runId ?? null,
    })),
  })
  const operationalSnapshot = JSON.stringify((operationalPresentations ?? []).map((model) => ({
    profileId: model.profileId, phase: model.phase ?? null, visualState: model.visualState ?? null,
    severity: model.severity ?? null, evidenceEventId: model.evidenceEventId ?? null,
    active: Boolean(model.active), isActive: Boolean(model.isActive),
  })))
  const lifecycleConnection = lifecycle?.connection ?? 'unknown'
  return useMemo(() => {
    const stableChoreography = JSON.parse(choreographySnapshot)
    const stableOperational = JSON.parse(operationalSnapshot)
    const environment = deriveEnvironmentalPresentation({ now: controlNow, startedAt, visible, reducedMotion, visualDebug, layout, choreography: stableChoreography, operationalPresentations: stableOperational })
    const worldOperations = deriveWorldOperations({ now: controlNow, startedAt, visible, reducedMotion, layout, choreography: stableChoreography, operationalPresentations: stableOperational, lifecycle: { connection: lifecycleConnection } })
    return { ...environment, worldOperations }
  }, [choreographySnapshot, controlNow, layout, lifecycleConnection, operationalSnapshot, reducedMotion, startedAt, visible, visualDebug])
}
