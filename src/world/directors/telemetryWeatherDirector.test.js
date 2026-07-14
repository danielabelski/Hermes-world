import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { updateTelemetryWeather } from './telemetryWeatherDirector.js'

describe('telemetry weather director', () => {
  it('uses real CPU and temperature without inventing an operational state', () => {
    const state = updateTelemetryWeather(null, { cpuPercent: 28, temperatureC: 57, connected: true }, 1_000)
    assert.equal(state.tier, 'clear')
    assert.equal(state.source, 'telemetry')
    assert.equal(Object.hasOwn(state, 'operationalState'), false)
  })

  it('reacts immediately to an emergency spike but keeps normal transitions behind dwell time', () => {
    const calm = updateTelemetryWeather(null, { cpuPercent: 30, temperatureC: 54 }, 0)
    const candidate = updateTelemetryWeather(calm, { cpuPercent: 78, temperatureC: 69 }, 20_000)
    assert.equal(candidate.tier, 'clear')
    assert.equal(candidate.candidateTier, 'cloudy')
    assert.ok(candidate.quickPulse > 0)
    const emergency = updateTelemetryWeather(candidate, { cpuPercent: 97, temperatureC: 82 }, 6_000)
    assert.equal(emergency.tier, 'storm')
  })

  it('uses hysteresis so a tier does not oscillate around a threshold', () => {
    const cloudy = updateTelemetryWeather(null, { cpuPercent: 52, temperatureC: 58 }, 0)
    assert.equal(cloudy.tier, 'cloudy')
    const nearBoundary = updateTelemetryWeather(cloudy, { cpuPercent: 41, temperatureC: 57 }, 10_000)
    assert.equal(nearBoundary.tier, 'cloudy')
    assert.equal(nearBoundary.candidateTier, null)
  })

  it('returns an explicit unknown tier when live telemetry is unavailable', () => {
    assert.equal(updateTelemetryWeather(null, { connected: true }, 0).tier, 'unknown')
    assert.equal(updateTelemetryWeather(null, { cpuPercent: 40, connected: false }, 0).source, 'offline')
  })
})
