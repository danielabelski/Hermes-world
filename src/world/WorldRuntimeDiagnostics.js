/**
 * Development-facing diagnostics for a Living World renderer lifecycle.
 *
 * It deliberately does not import Pixi or mutate a renderer. Canvas, a future
 * WebGPU renderer, and a test fixture can all pass a small capability object
 * here to make startup failures observable without coupling diagnostics to UI.
 */

const freeze = Object.freeze
const VALID_PHASES = freeze(['idle', 'initializing', 'ready', 'degraded', 'failed', 'destroyed'])

const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback

function asErrorSummary(error) {
  if (!error) return null
  if (typeof error === 'string') return freeze({ name: 'Error', message: error })
  return freeze({
    name: String(error.name ?? 'Error'),
    message: String(error.message ?? error),
  })
}

/**
 * Safely extracts renderer capability signals. Reading a Pixi Application
 * before `await app.init()` is valid here and returns `initialized: false`
 * rather than touching undefined ticker/renderer properties.
 */
export function inspectRendererCapabilities(application) {
  if (!application) {
    return freeze({ present: false, initialized: false, hasRenderer: false, hasTicker: false, hasCanvas: false, hasStage: false })
  }

  const renderer = application.renderer
  const ticker = application.ticker
  const canvas = renderer?.canvas ?? null
  return freeze({
    present: true,
    initialized: Boolean(renderer && application.stage),
    hasRenderer: Boolean(renderer),
    hasTicker: Boolean(ticker),
    hasCanvas: Boolean(canvas),
    hasStage: Boolean(application.stage),
    rendererType: renderer?.type ?? renderer?.constructor?.name ?? null,
    width: Math.max(0, number(renderer?.width)),
    height: Math.max(0, number(renderer?.height)),
    destroyed: Boolean(renderer?.destroyed || application.stage?.destroyed),
  })
}

/**
 * Returns a deterministic readiness report for any scene implementation.
 * `expectedAgents` and `expectedBuildings` protect the vertical slice from
 * accidentally showing a technically mounted but visually empty world.
 */
export function createWorldSceneReadinessReport({
  renderer,
  hasWorldRoot = false,
  inputBound = false,
  agentCount = 0,
  buildingCount = 0,
  expectedAgents = 0,
  expectedBuildings = 0,
  lastError = null,
} = {}) {
  const capabilities = renderer?.present === undefined ? inspectRendererCapabilities(renderer) : renderer
  const issues = []
  const warnings = []

  if (lastError) issues.push('renderer-error')
  if (!capabilities.present) issues.push('application-missing')
  else if (!capabilities.initialized) issues.push('renderer-initializing')
  else if (capabilities.destroyed) issues.push('renderer-destroyed')
  if (capabilities.initialized && !capabilities.hasCanvas) issues.push('canvas-missing')
  if (capabilities.initialized && !hasWorldRoot) issues.push('world-root-missing')
  if (capabilities.initialized && !inputBound) warnings.push('input-not-bound')
  if (expectedAgents > 0 && agentCount < expectedAgents) warnings.push('agent-roster-incomplete')
  if (expectedBuildings > 0 && buildingCount < expectedBuildings) warnings.push('building-roster-incomplete')
  if (capabilities.initialized && (capabilities.width < 1 || capabilities.height < 1)) warnings.push('viewport-empty')

  const blocking = issues.some((issue) => issue !== 'renderer-initializing')
  const phase = blocking
    ? 'failed'
    : issues.includes('renderer-initializing')
      ? 'initializing'
      : warnings.length
        ? 'degraded'
        : 'ready'

  return freeze({
    phase,
    ready: phase === 'ready' || phase === 'degraded',
    renderer: capabilities,
    hasWorldRoot: Boolean(hasWorldRoot),
    inputBound: Boolean(inputBound),
    agentCount: Math.max(0, number(agentCount)),
    buildingCount: Math.max(0, number(buildingCount)),
    expectedAgents: Math.max(0, number(expectedAgents)),
    expectedBuildings: Math.max(0, number(expectedBuildings)),
    issues: freeze(issues),
    warnings: freeze(warnings),
    lastError: asErrorSummary(lastError),
  })
}

/**
 * Bounded lifecycle recorder. Keep it in development tools or a debug HUD;
 * production callers can omit it entirely. Events are primitives, never Pixi
 * display objects, so it cannot retain a destroyed WebGL context.
 */
export class WorldRuntimeDiagnostics {
  constructor({ now = () => Date.now(), maxEvents = 40 } = {}) {
    this.now = now
    this.maxEvents = Math.max(5, Math.round(number(maxEvents, 40)))
    this.phase = 'idle'
    this.events = []
    this.lastError = null
    this.lastReadiness = null
    this.#record('phase', { phase: this.phase })
  }

  transition(phase, metadata = {}) {
    if (!VALID_PHASES.includes(phase)) throw new Error(`Unknown world runtime phase: ${phase}`)
    this.phase = phase
    this.#record('phase', { phase, ...metadata })
    return this.snapshot()
  }

  recordError(error, metadata = {}) {
    this.lastError = asErrorSummary(error)
    this.phase = 'failed'
    this.#record('error', { error: this.lastError, ...metadata })
    return this.snapshot()
  }

  assess(scene = {}) {
    this.lastReadiness = createWorldSceneReadinessReport({ ...scene, lastError: scene.lastError ?? this.lastError })
    const nextPhase = this.lastReadiness.phase
    if (nextPhase !== this.phase) this.transition(nextPhase, { source: 'readiness-check' })
    else this.#record('readiness', { phase: nextPhase })
    return this.lastReadiness
  }

  reset() {
    this.phase = 'idle'
    this.events.length = 0
    this.lastError = null
    this.lastReadiness = null
    this.#record('phase', { phase: this.phase })
  }

  snapshot() {
    return freeze({
      phase: this.phase,
      lastError: this.lastError,
      readiness: this.lastReadiness,
      events: freeze([...this.events]),
    })
  }

  #record(type, metadata = {}) {
    this.events.push(freeze({ type, at: this.now(), ...metadata }))
    if (this.events.length > this.maxEvents) this.events.splice(0, this.events.length - this.maxEvents)
  }
}
