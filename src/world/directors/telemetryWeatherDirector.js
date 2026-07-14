const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value)))
const finiteOrNull = (value) => Number.isFinite(Number(value)) ? Number(value) : null

export const TELEMETRY_WEATHER_TIERS = Object.freeze(['clear', 'cloudy', 'rain', 'storm'])

const ENTER_THRESHOLDS = Object.freeze({ cloudy: 44, rain: 67, storm: 86 })
const EXIT_THRESHOLDS = Object.freeze({ cloudy: 36, rain: 57, storm: 76 })
const DEFAULT_DWELL_MS = 24_000

function pressureFor(cpuPercent, temperatureC) {
  const cpu = finiteOrNull(cpuPercent)
  const temperature = finiteOrNull(temperatureC)
  const thermalPressure = temperature === null ? null : clamp((temperature - 48) / 42, 0, 1) * 100
  if (cpu === null && thermalPressure === null) return null
  return Math.max(cpu ?? 0, thermalPressure ?? 0)
}
function desiredTier(currentTier, pressure) {
  if (currentTier === 'storm') return pressure < EXIT_THRESHOLDS.storm ? 'rain' : 'storm'
  if (currentTier === 'rain') {
    if (pressure >= ENTER_THRESHOLDS.storm) return 'storm'
    return pressure < EXIT_THRESHOLDS.rain ? 'cloudy' : 'rain'
  }
  if (currentTier === 'cloudy') {
    if (pressure >= ENTER_THRESHOLDS.rain) return 'rain'
    return pressure < EXIT_THRESHOLDS.cloudy ? 'clear' : 'cloudy'
  }
  if (pressure >= ENTER_THRESHOLDS.storm) return 'storm'
  if (pressure >= ENTER_THRESHOLDS.rain) return 'rain'
  return pressure >= ENTER_THRESHOLDS.cloudy ? 'cloudy' : 'clear'
}

function initialTier(pressure) {
  if (pressure >= ENTER_THRESHOLDS.storm) return 'storm'
  if (pressure >= ENTER_THRESHOLDS.rain) return 'rain'
  if (pressure >= ENTER_THRESHOLDS.cloudy) return 'cloudy'
  return 'clear'
}

export function updateTelemetryWeather(previous, { cpuPercent, temperatureC, connected = true } = {}, now = Date.now(), dwellMs = DEFAULT_DWELL_MS) {
  const rawPressure = pressureFor(cpuPercent, temperatureC)
  if (!connected || rawPressure === null) {
    return Object.freeze({
      tier: 'unknown', pressure: 0, smoothedPressure: 0, wind: 0.12, cloudCover: 0.12,
      precipitation: 0, quickPulse: 0, source: connected ? 'no-telemetry' : 'offline',
      candidateTier: null, candidateSince: null, sampledAt: now,
    })
  }

  const priorPressure = previous?.source === 'telemetry' ? previous.smoothedPressure : rawPressure
  const elapsed = Math.max(0, now - (previous?.sampledAt ?? now))
  const smoothing = elapsed <= 0 ? 0 : 1 - Math.exp(-elapsed / 18_000)
  const smoothedPressure = priorPressure + (rawPressure - priorPressure) * smoothing
  const priorTier = TELEMETRY_WEATHER_TIERS.includes(previous?.tier) ? previous.tier : initialTier(smoothedPressure)
  const nextDesired = desiredTier(priorTier, smoothedPressure)
  const emergencyStorm = rawPressure >= 94
  let tier = emergencyStorm ? 'storm' : priorTier
  let candidateTier = previous?.candidateTier ?? null
  let candidateSince = previous?.candidateSince ?? null

  if (!emergencyStorm && nextDesired !== priorTier) {
    if (candidateTier !== nextDesired) {
      candidateTier = nextDesired
      candidateSince = now
    } else if (now - candidateSince >= dwellMs) {
      tier = nextDesired
      candidateTier = null
      candidateSince = null
    }
  } else {
    candidateTier = null
    candidateSince = null
  }

  const previousPulse = previous?.source === 'telemetry' ? previous.quickPulse ?? 0 : 0
  const decayedPulse = previousPulse * Math.exp(-elapsed / 5_500)
  const spikePulse = clamp((rawPressure - smoothedPressure - 7) / 28)
  const quickPulse = Math.max(decayedPulse, spikePulse)
  const tierFloor = tier === 'storm' ? 0.88 : tier === 'rain' ? 0.62 : tier === 'cloudy' ? 0.34 : 0.12

  return Object.freeze({
    tier,
    pressure: Math.round(rawPressure * 10) / 10,
    smoothedPressure: Math.round(smoothedPressure * 10) / 10,
    wind: clamp(tierFloor * 0.7 + quickPulse * 0.3),
    cloudCover: clamp(tierFloor + quickPulse * 0.16),
    precipitation: tier === 'storm' ? 0.88 : tier === 'rain' ? 0.52 : 0,
    quickPulse,
    source: 'telemetry',
    candidateTier,
    candidateSince,
    sampledAt: now,
  })
}
