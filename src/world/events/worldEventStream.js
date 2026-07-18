const STREAM_PATH = '/api/world/events/stream'
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 45_000
const DEFAULT_BASE_RECONNECT_MS = 1_000
const DEFAULT_MAX_RECONNECT_MS = 15_000

const subscribers = new Set()
let source = null
let reconnectTimer = null
let heartbeatTimer = null
let reconnectAttempt = 0
let cursor = null
let streamState = 'disconnected'
let runtime = null
let lifecycleCleanup = null

function defaultLogger(message, detail = null) {
  if (detail) console.info(`[Hermes World SSE] ${message}`, detail)
  else console.info(`[Hermes World SSE] ${message}`)
}

function configureRuntime(options = {}) {
  if (runtime) return
  const environment = options.environment ?? globalThis
  runtime = {
    EventSourceImpl: options.EventSourceImpl ?? globalThis.EventSource,
    setTimeoutImpl: options.setTimeoutImpl ?? globalThis.setTimeout?.bind(globalThis),
    clearTimeoutImpl: options.clearTimeoutImpl ?? globalThis.clearTimeout?.bind(globalThis),
    environment,
    documentRef: environment.documentRef ?? globalThis.document ?? null,
    navigatorRef: environment.navigatorRef ?? globalThis.navigator ?? null,
    heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? DEFAULT_HEARTBEAT_TIMEOUT_MS,
    baseReconnectMs: options.baseReconnectMs ?? DEFAULT_BASE_RECONNECT_MS,
    maxReconnectMs: options.maxReconnectMs ?? DEFAULT_MAX_RECONNECT_MS,
    logger: options.logger ?? defaultLogger,
  }
}

function log(message, detail = null) {
  try { runtime?.logger?.(message, detail) } catch { /* diagnostics cannot break transport */ }
}

function notify(kind, value, payload = null) {
  subscribers.forEach((subscriber) => {
    try {
      if (kind === 'snapshot') subscriber.onSnapshot?.(value, payload)
      else if (kind === 'event') subscriber.onEvent?.(value)
      else if (kind === 'heartbeat') subscriber.onHeartbeat?.(value)
      else if (kind === 'status') subscriber.onStatus?.(value)
    } catch { /* one UI consumer must never break the shared stream */ }
  })
}

function setStreamState(state, detail = {}) {
  if (streamState === state && detail.force !== true) return
  streamState = state
  notify('status', { state, ...detail })
}

function clearReconnectTimer() {
  if (reconnectTimer === null) return
  runtime?.clearTimeoutImpl?.(reconnectTimer)
  reconnectTimer = null
}

function clearHeartbeatTimer() {
  if (heartbeatTimer === null) return
  runtime?.clearTimeoutImpl?.(heartbeatTimer)
  heartbeatTimer = null
}

function closeCurrentSource() {
  const current = source
  source = null
  current?.close?.()
}

function isHidden() {
  return runtime?.documentRef?.visibilityState === 'hidden'
}

function isOffline() {
  return runtime?.navigatorRef?.onLine === false
}

function buildStreamUrl() {
  return cursor ? `${STREAM_PATH}?after=${encodeURIComponent(cursor)}` : STREAM_PATH
}

function armHeartbeatTimeout() {
  clearHeartbeatTimer()
  if (!runtime?.setTimeoutImpl || runtime.heartbeatTimeoutMs <= 0) return
  heartbeatTimer = runtime.setTimeoutImpl(() => {
    heartbeatTimer = null
    handleConnectionLost('heartbeat_timeout')
  }, runtime.heartbeatTimeoutMs)
}

function scheduleReconnect(reason) {
  if (subscribers.size === 0 || reconnectTimer !== null) return
  if (isHidden() || isOffline()) {
    setStreamState('disconnected', { reason })
    return
  }
  const delay = Math.min(
    runtime.maxReconnectMs,
    runtime.baseReconnectMs * (2 ** reconnectAttempt),
  )
  reconnectAttempt += 1
  log('RECONNECT SCHEDULED', { delay, reason, attempt: reconnectAttempt })
  setStreamState('reconnecting', { reason, attempt: reconnectAttempt })
  reconnectTimer = runtime.setTimeoutImpl?.(() => {
    reconnectTimer = null
    openStream(true)
  }, delay) ?? null
}

function handleConnectionLost(reason) {
  if (subscribers.size === 0) return
  log('CONNECTION LOST', { reason })
  clearHeartbeatTimer()
  closeCurrentSource()
  scheduleReconnect(reason)
}

function openStream(isReconnect = false) {
  if (source || subscribers.size === 0 || typeof runtime?.EventSourceImpl !== 'function') return
  if (isHidden() || isOffline()) {
    setStreamState('disconnected', { reason: isHidden() ? 'hidden' : 'offline' })
    return
  }
  clearReconnectTimer()
  log(isReconnect ? 'RECONNECTING' : 'CONNECTING', { cursor })
  if (!isReconnect) setStreamState('connecting', { reason: 'initial' })

  let nextSource
  try {
    nextSource = new runtime.EventSourceImpl(buildStreamUrl())
  } catch {
    scheduleReconnect('event_source_constructor_failed')
    return
  }
  source = nextSource

  nextSource.addEventListener('open', () => {
    if (source !== nextSource) return
    reconnectAttempt = 0
    log('LIVE', { cursor })
    setStreamState('live', { reason: isReconnect ? 'reconnected' : 'connected' })
    armHeartbeatTimeout()
  })
  nextSource.addEventListener('snapshot', (message) => {
    if (source !== nextSource) return
    try {
      const payload = JSON.parse(message.data || '{}')
      if (typeof payload.cursor === 'string' && payload.cursor) cursor = payload.cursor
      notify('snapshot', Array.isArray(payload.events) ? payload.events : [], payload)
    } catch { /* ingestion validates payloads; malformed transport data is ignored */ }
  })
  nextSource.addEventListener('world_event', (message) => {
    if (source !== nextSource) return
    try {
      const event = JSON.parse(message.data || '{}')
      if (typeof event.eventId === 'string' && event.eventId) cursor = event.eventId
      notify('event', event)
    } catch { /* invalid transport data is ignored */ }
  })
  nextSource.addEventListener('heartbeat', (message) => {
    if (source !== nextSource) return
    let heartbeat
    try { heartbeat = JSON.parse(message.data || '{}') } catch { heartbeat = { at: null } }
    log('HEARTBEAT RECEIVED', heartbeat)
    notify('heartbeat', heartbeat)
    armHeartbeatTimeout()
  })
  nextSource.addEventListener('error', () => {
    if (source !== nextSource) return
    handleConnectionLost('event_source_error')
  })
}

function reconnectImmediately(reason) {
  if (subscribers.size === 0 || isHidden() || isOffline()) return
  if (source && streamState === 'live') return
  clearReconnectTimer()
  clearHeartbeatTimer()
  closeCurrentSource()
  log('RECONNECTING', { reason, cursor })
  setStreamState('reconnecting', { reason })
  openStream(true)
}

function installLifecycleListeners() {
  if (lifecycleCleanup || !runtime) return
  const environment = runtime.environment
  const visibilityTarget = runtime.documentRef?.addEventListener ? runtime.documentRef : environment
  if (!environment?.addEventListener || !visibilityTarget?.addEventListener) return

  const onVisibilityChange = () => {
    if (isHidden()) {
      clearReconnectTimer()
      clearHeartbeatTimer()
      closeCurrentSource()
      log('DISCONNECTED', { reason: 'hidden' })
      setStreamState('disconnected', { reason: 'hidden' })
    } else reconnectImmediately('foreground')
  }
  const onPageShow = () => reconnectImmediately('pageshow')
  const onOnline = () => reconnectImmediately('online')
  const onOffline = () => {
    clearReconnectTimer()
    clearHeartbeatTimer()
    closeCurrentSource()
    log('DISCONNECTED', { reason: 'offline' })
    setStreamState('disconnected', { reason: 'offline' })
  }

  visibilityTarget.addEventListener('visibilitychange', onVisibilityChange)
  environment.addEventListener('pageshow', onPageShow)
  environment.addEventListener('online', onOnline)
  environment.addEventListener('offline', onOffline)
  lifecycleCleanup = () => {
    visibilityTarget.removeEventListener('visibilitychange', onVisibilityChange)
    environment.removeEventListener('pageshow', onPageShow)
    environment.removeEventListener('online', onOnline)
    environment.removeEventListener('offline', onOffline)
  }
}

function cleanupTransport() {
  clearReconnectTimer()
  clearHeartbeatTimer()
  closeCurrentSource()
  lifecycleCleanup?.()
  lifecycleCleanup = null
  reconnectAttempt = 0
  cursor = null
  streamState = 'disconnected'
  log('CONNECTION CLEANUP')
  runtime = null
}

export function subscribeWorldEventStream(subscriber = {}, options = {}) {
  const isFirstSubscriber = subscribers.size === 0
  configureRuntime(options)
  subscribers.add(subscriber)
  if (isFirstSubscriber) {
    installLifecycleListeners()
    openStream(false)
  } else subscriber.onStatus?.({ state: streamState, reason: 'shared_connection' })
  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) cleanupTransport()
  }
}

export function resetWorldEventStreamForTests() {
  subscribers.clear()
  cleanupTransport()
}
