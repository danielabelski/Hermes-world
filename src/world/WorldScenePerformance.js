/**
 * Performance policy and instrumentation for the Living World scene.
 *
 * This module is intentionally renderer-neutral. PixiJS can feed it frame and
 * scene counts today, while a future Tiled/WebGPU renderer can reuse exactly
 * the same budgets. The policy preserves meaningful signals (selected,
 * working, warning, error, and carrying agents) before it reduces ambience.
 */

const freeze = Object.freeze

export const WORLD_POPULATION_BREAKPOINTS = freeze({
  verticalSlice: 12,
  expanded: 50,
  large: 200,
})

const BASE_TIERS = freeze({
  slice: freeze({
    id: 'slice-12',
    maxAgents: WORLD_POPULATION_BREAKPOINTS.verticalSlice,
    targetFps: 60,
    resolutionScale: 1,
    maxVisibleAgents: 12,
    maxFullyAnimatedAgents: 12,
    maxAnimatedPackages: 12,
    maxParticles: 220,
    maxWorldLabels: 14,
    cullUpdateHz: 12,
    aggregation: 'none',
  }),
  expanded: freeze({
    id: 'expanded-50',
    maxAgents: WORLD_POPULATION_BREAKPOINTS.expanded,
    targetFps: 60,
    resolutionScale: 0.9,
    maxVisibleAgents: 36,
    maxFullyAnimatedAgents: 22,
    maxAnimatedPackages: 18,
    maxParticles: 140,
    maxWorldLabels: 10,
    cullUpdateHz: 10,
    aggregation: 'district',
  }),
  large: freeze({
    id: 'large-200',
    maxAgents: WORLD_POPULATION_BREAKPOINTS.large,
    targetFps: 45,
    resolutionScale: 0.75,
    maxVisibleAgents: 64,
    maxFullyAnimatedAgents: 28,
    maxAnimatedPackages: 20,
    maxParticles: 72,
    maxWorldLabels: 6,
    cullUpdateHz: 6,
    aggregation: 'district-and-cluster',
  }),
})

export const WORLD_SCENE_QUALITY_TIERS = BASE_TIERS

const TIER_KEYS = freeze(['slice', 'expanded', 'large'])

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback

/** Return the population tier without relying on a renderer or device API. */
export function getWorldSceneQualityTier(agentCount = 0) {
  const count = Math.max(0, number(agentCount))
  const key = TIER_KEYS.find((tier) => count <= BASE_TIERS[tier].maxAgents) ?? 'large'
  return BASE_TIERS[key]
}

/**
 * Produces an immutable render budget for a snapshot. `frameRate` is optional:
 * when supplied, sustained low FPS moves only visual density down one or two
 * levels, never hides critical system states.
 */
export function createWorldSceneBudget({
  agentCount = 0,
  frameRate,
  reducedMotion = false,
  devicePixelRatio = 1,
  isMobile = true,
} = {}) {
  const base = getWorldSceneQualityTier(agentCount)
  const fps = number(frameRate, base.targetFps)
  const pressure = fps < base.targetFps * 0.72 ? 2 : fps < base.targetFps * 0.88 ? 1 : 0
  const requestedDpr = clamp(number(devicePixelRatio, 1), 1, 2)
  const resolutionScale = clamp(
    base.resolutionScale - pressure * 0.12 - (reducedMotion ? 0.04 : 0),
    0.55,
    1,
  )
  const density = pressure === 2 ? 0.5 : pressure === 1 ? 0.72 : 1
  const mobileScale = isMobile ? 1 : 1.22

  return freeze({
    tierId: base.id,
    populationTier: base.id,
    population: Math.max(0, number(agentCount)),
    targetFps: base.targetFps,
    measuredFps: fps,
    pressure,
    reducedMotion: Boolean(reducedMotion),
    resolution: clamp(requestedDpr * resolutionScale, 0.55, 2),
    resolutionScale,
    maxVisibleAgents: Math.max(1, Math.round(base.maxVisibleAgents * mobileScale)),
    maxFullyAnimatedAgents: Math.max(1, Math.round(base.maxFullyAnimatedAgents * density)),
    maxAnimatedPackages: Math.max(0, Math.round(base.maxAnimatedPackages * density)),
    maxParticles: reducedMotion ? 0 : Math.max(0, Math.round(base.maxParticles * density * mobileScale)),
    maxWorldLabels: Math.max(0, Math.round(base.maxWorldLabels * density)),
    cullUpdateHz: base.cullUpdateHz,
    aggregation: base.aggregation,
    // These priorities are a contract for any future 50/200 agent renderer.
    // A worker with an error must remain an individual, even when idle agents
    // collapse into a district population marker.
    preserveIndividuals: freeze(['selected', 'error', 'warning', 'blocked', 'working', 'carrying-package']),
  })
}

/**
 * Classifies whether an agent is eligible for a district/cluster aggregate.
 * This preserves observability while allowing future deployments to avoid one
 * animated display object per idle agent.
 */
export function canAggregateAgent(agent = {}, { selectedId = null } = {}) {
  const id = String(agent.id ?? agent.profile ?? '')
  if (!id || id === String(selectedId ?? '')) return false
  const state = String(agent.state ?? '').toLowerCase()
  const severity = String(agent.warningLevel ?? agent.severity ?? '').toLowerCase()
  const hasImportantTask = Boolean(agent.carryingTaskId) || ['working', 'carrying', 'carrying-package', 'alerted', 'error'].includes(state)
  return !hasImportantTask && !['warning', 'error', 'critical'].includes(severity)
}

/**
 * Stable, small stats object suitable for a development HUD or performance
 * telemetry. It avoids retaining Pixi display objects or full snapshots.
 */
export function summarizeWorldSceneWork({
  agents = [],
  visibleAgents = 0,
  animatedAgents = 0,
  visiblePackages = 0,
  particles = 0,
  drawCalls = null,
  labels = 0,
} = {}, budget = createWorldSceneBudget({ agentCount: agents.length })) {
  const count = Array.isArray(agents) ? agents.length : Math.max(0, number(agents))
  const aggregateCandidates = Array.isArray(agents) ? agents.filter((agent) => canAggregateAgent(agent)).length : 0
  return freeze({
    agentCount: count,
    visibleAgents: Math.max(0, number(visibleAgents)),
    animatedAgents: Math.max(0, number(animatedAgents)),
    visiblePackages: Math.max(0, number(visiblePackages)),
    particles: Math.max(0, number(particles)),
    labels: Math.max(0, number(labels)),
    drawCalls: Number.isFinite(Number(drawCalls)) ? Number(drawCalls) : null,
    aggregateCandidates,
    overBudget: freeze({
      visibleAgents: number(visibleAgents) > budget.maxVisibleAgents,
      animatedAgents: number(animatedAgents) > budget.maxFullyAnimatedAgents,
      packages: number(visiblePackages) > budget.maxAnimatedPackages,
      particles: number(particles) > budget.maxParticles,
      labels: number(labels) > budget.maxWorldLabels,
    }),
  })
}

/**
 * Rolling frame-time monitor. Feed `recordFrame()` from a renderer ticker;
 * ask for `snapshot()` at a low cadence (for example once per second), rather
 * than pushing 60 updates per second into Zustand or React.
 */
export class WorldScenePerformanceMonitor {
  constructor({ windowSize = 90, now = () => performance.now() } = {}) {
    this.windowSize = clamp(Math.round(number(windowSize, 90)), 10, 600)
    this.now = now
    this.frameTimes = []
    this.lastFrameAt = null
    this.lastSceneWork = null
  }

  reset() {
    this.frameTimes.length = 0
    this.lastFrameAt = null
    this.lastSceneWork = null
  }

  recordFrame(time = this.now()) {
    const timestamp = number(time, this.now())
    if (this.lastFrameAt == null) {
      this.lastFrameAt = timestamp
      return this.snapshot()
    }

    const delta = clamp(timestamp - this.lastFrameAt, 0, 250)
    this.lastFrameAt = timestamp
    if (delta > 0) {
      this.frameTimes.push(delta)
      if (this.frameTimes.length > this.windowSize) this.frameTimes.shift()
    }
    return this.snapshot()
  }

  recordSceneWork(work, budget) {
    this.lastSceneWork = summarizeWorldSceneWork(work, budget)
    return this.lastSceneWork
  }

  snapshot() {
    if (!this.frameTimes.length) {
      return freeze({ fps: null, averageFrameMs: null, p95FrameMs: null, sampleCount: 0, scene: this.lastSceneWork })
    }

    const samples = [...this.frameTimes].sort((a, b) => a - b)
    const total = samples.reduce((sum, value) => sum + value, 0)
    const averageFrameMs = total / samples.length
    const p95Index = Math.min(samples.length - 1, Math.ceil(samples.length * 0.95) - 1)
    return freeze({
      fps: Math.round((1000 / averageFrameMs) * 10) / 10,
      averageFrameMs: Math.round(averageFrameMs * 100) / 100,
      p95FrameMs: Math.round(samples[p95Index] * 100) / 100,
      sampleCount: samples.length,
      scene: this.lastSceneWork,
    })
  }
}
