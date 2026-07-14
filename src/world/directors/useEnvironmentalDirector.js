import { useEffect, useMemo, useState } from 'react'
import { deriveEnvironmentalPresentation } from './environmentalDirector.js'
import { deriveWorldOperations } from './worldOperationsDirector.js'
import { updateTelemetryWeather } from './telemetryWeatherDirector.js'

export function useEnvironmentalDirector({ now, layout, choreography, operationalPresentations, lifecycle, telemetry, visualDebug = false }) {
  const [startedAt] = useState(now)
  const [telemetryWeather, setTelemetryWeather] = useState(() => updateTelemetryWeather(null, {}, now))
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
    elapsedMs: choreography?.elapsedMs ?? null,
    terminalState: choreography?.terminalState ?? null,
    lifecycleEvidenceId: choreography?.lifecycleEvidenceId ?? null,
    triggerEventId: choreography?.triggerEventId ?? null,
    signals: (choreography?.signals ?? []).map((signal) => ({
      kind: signal.kind, evidenceEventId: signal.evidenceEventId ?? null, buildingId: signal.buildingId ?? null,
      targetAgentId: signal.targetAgentId ?? null, sourceAgentId: signal.sourceAgentId ?? null,
      sourceBuildingId: signal.sourceBuildingId ?? null, runId: signal.runId ?? null,
      triggerEventId: signal.triggerEventId ?? null,
    })),
  })
  const operationalSnapshot = JSON.stringify((operationalPresentations ?? []).map((model) => ({
    profileId: model.profileId, phase: model.phase ?? null, visualState: model.visualState ?? null,
    severity: model.severity ?? null, evidenceEventId: model.evidenceEventId ?? null,
    active: Boolean(model.active), isActive: Boolean(model.isActive),
  })))
  const lifecycleConnection = lifecycle?.connection ?? 'unknown'
  const telemetrySnapshot = JSON.stringify({
    system: telemetry?.system ?? {},
    activityItems: (telemetry?.activityItems ?? []).slice(0, 16),
    tokenRiver: telemetry?.tokenRiver ?? {},
    tasks: (telemetry?.tasks ?? []).map((task) => ({ id: task.id, status: task.status })),
    crons: (telemetry?.crons ?? []).map((cron) => ({ id: cron.id, lastCompletionStatus: cron.lastCompletionStatus })),
  })
  useEffect(() => {
    const stableTelemetry = JSON.parse(telemetrySnapshot)
    const timer = window.setTimeout(() => {
      setTelemetryWeather((previous) => updateTelemetryWeather(previous, {
        cpuPercent: stableTelemetry.system?.cpuPercent,
        temperatureC: stableTelemetry.system?.temperatureC,
        connected: !['offline', 'stale'].includes(lifecycleConnection),
      }, Date.now()))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [lifecycleConnection, telemetrySnapshot])
  return useMemo(() => {
    const stableChoreography = JSON.parse(choreographySnapshot)
    const stableOperational = JSON.parse(operationalSnapshot)
    const stableTelemetry = JSON.parse(telemetrySnapshot)
    const environment = deriveEnvironmentalPresentation({ now: controlNow, startedAt, visible, reducedMotion, visualDebug, layout, choreography: stableChoreography, operationalPresentations: stableOperational, lifecycle: { connection: lifecycleConnection }, telemetry: stableTelemetry })
    const worldOperations = deriveWorldOperations({ now: controlNow, startedAt, visible, reducedMotion, layout, choreography: stableChoreography, operationalPresentations: stableOperational, lifecycle: { connection: lifecycleConnection } })
    return { ...environment, telemetryWeather, worldOperations }
  }, [choreographySnapshot, controlNow, layout, lifecycleConnection, operationalSnapshot, reducedMotion, startedAt, telemetrySnapshot, telemetryWeather, visible, visualDebug])
}
