import { memo, useEffect, useRef } from 'react'
import AtmosphereLayer from './AtmosphereLayer.jsx'
import EnvironmentalDebugPanel from './EnvironmentalDebugPanel.jsx'
import EnvironmentalVisualVerification from './EnvironmentalVisualVerification.jsx'
import PersistentWorldLifeLayer from './PersistentWorldLifeLayer.jsx'
import './WorldEnvironmentalLife.css'

const MOTION_SAMPLE_MS = 2_000
const MOTION_RECOVERY_SAMPLES = 3
const MOTION_TIER_RANK = Object.freeze({ full: 0, reduced: 1, minimal: 2 })

function resolveMotionTier(fps) {
  if (fps < 42) return 'minimal'
  if (fps < 52) return 'reduced'
  return 'full'
}

function WorldEnvironmentalLife({ presentation, debug = 'off', preset }) {
  const telemetry = presentation.infrastructureTelemetry ?? {}
  const weather = presentation.telemetryWeather ?? {}
  const lifeRootRef = useRef(null)

  useEffect(() => {
    const root = lifeRootRef.current
    if (!root) return undefined
    if (presentation.reducedMotion) {
      root.dataset.motionQuality = 'minimal'
      root.dataset.measuredFps = 'reduced-motion'
      return undefined
    }
    if (!presentation.visible || typeof window.requestAnimationFrame !== 'function') {
      root.dataset.motionQuality = presentation.visible ? 'full' : 'paused'
      root.dataset.measuredFps = presentation.visible ? 'unavailable' : 'paused'
      return undefined
    }

    let animationFrame = 0
    let frames = 0
    let sampleStartedAt = 0
    let currentTier = 'full'
    let recoverySamples = 0

    const measureFrame = (timestamp) => {
      if (!sampleStartedAt) sampleStartedAt = timestamp
      frames += 1
      const elapsed = timestamp - sampleStartedAt
      if (elapsed >= MOTION_SAMPLE_MS) {
        const fps = Math.round((frames * 1_000 / elapsed) * 10) / 10
        const targetTier = resolveMotionTier(fps)
        if (MOTION_TIER_RANK[targetTier] > MOTION_TIER_RANK[currentTier]) {
          currentTier = targetTier
          recoverySamples = 0
        } else if (MOTION_TIER_RANK[targetTier] < MOTION_TIER_RANK[currentTier]) {
          recoverySamples += 1
          if (recoverySamples >= MOTION_RECOVERY_SAMPLES) {
            currentTier = targetTier
            recoverySamples = 0
          }
        } else {
          recoverySamples = 0
        }
        root.dataset.motionQuality = currentTier
        root.dataset.measuredFps = String(fps)
        frames = 0
        sampleStartedAt = timestamp
      }
      animationFrame = window.requestAnimationFrame(measureFrame)
    }

    root.dataset.motionQuality = currentTier
    root.dataset.measuredFps = 'warming-up'
    animationFrame = window.requestAnimationFrame(measureFrame)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [presentation.reducedMotion, presentation.visible])

  return <>
    <div
      ref={lifeRootRef}
      className={`world-environmental-life layout-${presentation.layout} life-${preset?.id ?? 'balanced'}${presentation.entryActive ? ' is-entry-active' : ''}${presentation.visible ? '' : ' is-paused'}`}
      data-environment-director={presentation.running ? 'running' : 'stopped'}
      data-environment-response={presentation.response?.cue ?? 'none'}
      data-environment-intensity={presentation.ambientIntensity}
      data-infrastructure-connected={telemetry.connected ? 'true' : 'false'}
      data-world-life-role={preset?.role ?? 'default'}
      data-weather-tier={weather.tier ?? 'unknown'}
      data-weather-source={weather.source ?? 'unknown'}
      data-visual-effect={presentation.visualVerification?.id ?? 'none'}
      style={{
        '--environment-intensity': presentation.infrastructureIntensity,
        '--atmosphere-intensity': presentation.atmosphereIntensity,
        '--infrastructure-intensity': presentation.infrastructureIntensity,
        '--event-intensity': presentation.eventIntensity,
        '--alert-suppression': presentation.alertSuppression,
        '--citadel-heartbeat': telemetry.heartbeat ?? 0,
        '--forge-load': telemetry.forgeLoad ?? 0,
        '--archive-rate': telemetry.archiveRate ?? 0,
        '--sanctum-flow': telemetry.sanctumFlow ?? 0,
        '--watcher-sweep': telemetry.watcherSweep ?? 0,
        '--distribution-density': telemetry.distributionDensity ?? 0,
        '--weather-pressure': weather.smoothedPressure ?? 0,
        '--weather-wind': weather.wind ?? 0.12,
        '--weather-cloud-cover': weather.cloudCover ?? 0.12,
        '--weather-precipitation': weather.precipitation ?? 0,
        '--weather-quick-pulse': weather.quickPulse ?? 0,
        '--citadel-life-opacity': 0.58 + (telemetry.heartbeat ?? 0) * 0.42,
        '--forge-life-opacity': 0.58 + (telemetry.forgeLoad ?? 0) * 0.42,
        '--archive-life-opacity': 0.52 + (telemetry.archiveRate ?? 0) * 0.48,
        '--sanctum-life-opacity': 0.52 + (telemetry.sanctumFlow ?? 0) * 0.48,
        '--watcher-life-opacity': 0.52 + (telemetry.watcherSweep ?? 0) * 0.48,
        '--citadel-cycle-duration': `${5.8 - (telemetry.distributionDensity ?? 0) * 2.2}s`,
        '--forge-cycle-duration': `${7 - (telemetry.forgeLoad ?? 0) * 3.5}s`,
        '--archive-cycle-duration': `${8 - (telemetry.archiveRate ?? 0) * 3.4}s`,
        '--sanctum-cycle-duration': `${10 - (telemetry.sanctumFlow ?? 0) * 3}s`,
        '--watcher-cycle-duration': `${7 - (telemetry.watcherSweep ?? 0) * 2.6}s`,
      }}
      aria-hidden="true"
    >
      <AtmosphereLayer presentation={presentation} />
      <PersistentWorldLifeLayer presentation={presentation} />
      <EnvironmentalVisualVerification verification={presentation.visualVerification} />
    </div>
    {debug === 'panel' ? <EnvironmentalDebugPanel presentation={presentation} /> : null}
  </>
}

export default memo(WorldEnvironmentalLife)
