/**
 * Renderer-neutral WebGL capability and DOM fallback policy.
 *
 * A caller may probe the browser before booting Pixi, then render the returned
 * placeholder model in ordinary React/HTML if a GPU context is unavailable.
 * This file never imports Pixi, React, or touches application state.
 */

const freeze = Object.freeze

const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback

function defaultDocument() {
  return typeof document === 'undefined' ? null : document
}

function normalizeProbeFailure(error, reason = 'context-unavailable') {
  return freeze({
    supported: false,
    status: 'unavailable',
    reason,
    context: null,
    error: error ? freeze({ name: String(error.name ?? 'Error'), message: String(error.message ?? error) }) : null,
  })
}

/**
 * Probes WebGL without requiring PixiJS. Inject `documentRef` or
 * `createCanvas` in tests; no browser globals are accessed during SSR.
 */
export function probeWorldWebglCapability({ documentRef = defaultDocument(), createCanvas } = {}) {
  if (!documentRef && !createCanvas) {
    return freeze({ supported: false, status: 'unknown', reason: 'dom-unavailable', context: null, error: null })
  }

  let canvas
  try {
    canvas = createCanvas ? createCanvas() : documentRef.createElement?.('canvas')
  } catch (error) {
    return normalizeProbeFailure(error, 'canvas-creation-failed')
  }
  if (!canvas?.getContext) return normalizeProbeFailure(null, 'canvas-unavailable')

  const candidates = ['webgl2', 'webgl', 'experimental-webgl']
  for (const contextName of candidates) {
    try {
      const context = canvas.getContext(contextName, { failIfMajorPerformanceCaveat: false })
      if (context) {
        return freeze({ supported: true, status: 'supported', reason: null, context: contextName, error: null })
      }
    } catch (error) {
      // A browser can throw for an individual context type. Continue to the
      // compatible fallback, then preserve the final failure if none succeeds.
      if (contextName === candidates[candidates.length - 1]) return normalizeProbeFailure(error)
    }
  }
  return normalizeProbeFailure(null)
}

/**
 * Restricts fallback activation to a renderer failure. An API, auth, or world
 * data error should remain visible as its own state rather than hiding behind
 * a misleading "GPU unavailable" message.
 */
export function isWorldRendererFailure(error) {
  if (!error) return false
  const name = String(error.name ?? '')
  const message = String(error.message ?? error)
  return /webgl|webgpu|canvas|renderer|context|ticker|pixi/i.test(`${name} ${message}`)
}

/**
 * Chooses whether to boot the renderer, wait, or render the canvas-free DOM
 * fallback. `runtimePhase` can be sourced from WorldRuntimeDiagnostics.
 */
export function decideWorldRendererMode({ capability, runtimePhase = 'idle', error = null } = {}) {
  const probe = capability ?? probeWorldWebglCapability()
  const phase = String(runtimePhase)

  if (phase === 'initializing' || probe.status === 'unknown') {
    return freeze({ mode: 'loading', useCanvas: false, retryable: false, reason: 'renderer-initializing', capability: probe })
  }
  if (!probe.supported) {
    return freeze({ mode: 'dom-placeholder', useCanvas: false, retryable: true, reason: probe.reason ?? 'webgl-unavailable', capability: probe })
  }
  if (phase === 'failed' && isWorldRendererFailure(error)) {
    return freeze({ mode: 'dom-placeholder', useCanvas: false, retryable: true, reason: 'renderer-failed', capability: probe })
  }
  if (phase === 'destroyed') {
    return freeze({ mode: 'loading', useCanvas: false, retryable: false, reason: 'renderer-destroyed', capability: probe })
  }
  return freeze({ mode: 'canvas', useCanvas: true, retryable: false, reason: null, capability: probe })
}

/**
 * Serializes the minimum truthful system information for a DOM fallback. It is
 * a status surface, not a fake version of the illustrated world: all values
 * come directly from the same normalized snapshot used by the renderer.
 */
export function createWorldDomPlaceholderModel(snapshot = {}, { reason = 'webgl-unavailable' } = {}) {
  const agents = Array.isArray(snapshot.agents) ? snapshot.agents : []
  const activeAgents = agents.filter((agent) => Boolean(agent.active ?? agent.isActive)).length
  const system = snapshot.system ?? {}
  const health = system.health ?? {}
  const alerts = Array.isArray(snapshot.alerts) ? snapshot.alerts : []
  const weather = snapshot.weather ?? system.weather ?? {}
  const severity = health.severity ?? system.severity ?? snapshot.scenario ?? 'unknown'

  return freeze({
    kind: 'world-dom-placeholder',
    reason,
    title: 'Cytadela Hermesa jest chwilowo w trybie uproszczonym',
    description: 'Stan systemu pozostaje dostępny, ale ten przeglądarka nie uruchomiła świata WebGL.',
    ariaLive: 'polite',
    retryLabel: 'Spróbuj uruchomić świat ponownie',
    system: freeze({
      severity: String(severity),
      healthScore: Number.isFinite(Number(health.score)) ? Number(health.score) : null,
      activeAgents,
      totalAgents: Math.max(agents.length, number(system.totalAgentCount)),
      weather: String(weather.kind ?? 'unknown'),
      criticalAlertCount: alerts.filter((alert) => ['critical', 'error'].includes(String(alert.severity).toLowerCase())).length,
    }),
    alerts: freeze(alerts.slice(0, 3).map((alert) => freeze({
      id: String(alert.id ?? alert.message ?? 'alert'),
      severity: String(alert.severity ?? 'warning'),
      message: String(alert.message ?? 'Wymaga uwagi'),
      entityType: alert.entityType ?? null,
      entityId: alert.entityId ?? null,
    }))),
  })
}
