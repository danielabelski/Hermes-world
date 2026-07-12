const freeze = Object.freeze

export const WORLD_EVENT_VERSION = 1
export const WORLD_OPERATIONAL_STATES = freeze([
  'assigned', 'thinking', 'working', 'waiting', 'stuck', 'warning', 'critical', 'success', 'idle',
])
export const WORLD_PRESENCE_STATES = freeze(['online', 'offline'])

const AGENT_ALIASES = freeze({
  default: 'default', page: 'default', watcher: 'prospecting', scout: 'prospecting', zwiadowca: 'prospecting',
  coder: 'coder', blacksmith: 'coder', kowal: 'coder', developer: 'developer', devops: 'devops',
  orchestrator: 'orchestrator', outreach: 'outreach', prospecting: 'prospecting', researcher: 'researcher',
  reviewer: 'reviewer', synthesizer: 'synthesizer', verifier: 'verifier', komandos: 'komandos',
  moa: 'komandos', 'komandos-moa': 'komandos', 'komandos moa': 'komandos',
})

const EVENT_STATE = freeze({
  assigned: 'assigned', run_started: 'assigned', run_start: 'assigned', stream_start: 'assigned',
  reasoning: 'thinking', thinking: 'thinking', trace: 'thinking', planning: 'thinking',
  tool: 'working', tool_started: 'working', 'tool.started': 'working', working: 'working',
  approval: 'waiting', approval_required: 'waiting', pending: 'waiting', waiting: 'waiting',
  stuck: 'stuck', timeout: 'stuck', no_progress: 'stuck',
  warning: 'warning', tool_warning: 'warning',
  apperror: 'critical', error: 'critical', fatal: 'critical', tool_error: 'critical',
  done: 'success', completed: 'success', stream_end: 'success', success: 'success',
  cancel: 'idle', cancelled: 'idle', interrupted: 'idle', idle: 'idle',
})

const clean = (value) => String(value ?? '').trim()
const key = (value) => clean(value).toLowerCase().replace(/_/g, '-')

export class WorldEventValidationError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'WorldEventValidationError'
    this.code = code
  }
}
export function resolveWorldAgentId(value) {
  const normalized = key(value)
  return AGENT_ALIASES[normalized] ?? null
}

function rawEventType(input) {
  return clean(input.eventType ?? input.event_type ?? input.event ?? input.type ?? input.payload?.event_type).toLowerCase()
}

function resolveState(input, eventType) {
  const explicit = clean(input.state ?? input.operationalState ?? input.operational_state).toLowerCase()
  if (WORLD_OPERATIONAL_STATES.includes(explicit)) return explicit
  const eventKey = eventType.replace(/-/g, '_')
  if (input.payload?.is_error === true && ['tool_complete', 'tool.completed'].includes(eventKey)) return 'critical'
  if (eventKey === 'tool_complete' || eventKey === 'tool.completed') return 'working'
  return EVENT_STATE[eventType] ?? EVENT_STATE[eventKey] ?? null
}

function resolvePresence(input) {
  const value = clean(input.presence ?? input.presenceState ?? input.presence_state).toLowerCase()
  return WORLD_PRESENCE_STATES.includes(value) ? value : null
}

export function normalizeHermesWorldEvent(input, { receivedAt = new Date().toISOString() } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new WorldEventValidationError('invalid_payload', 'World event must be a JSON object.')
  }

  const payload = input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload) ? input.payload : {}
  const runId = clean(input.runId ?? input.run_id ?? payload.run_id)
  const seq = Number(input.seq ?? payload.seq)
  const eventType = rawEventType(input)
  const state = resolveState(input, eventType)
  const presence = resolvePresence(input)
  const rawAgent = input.agentId ?? input.agent_id ?? input.profile ?? input.worker ?? payload.agent_id ?? payload.profile ?? payload.worker
  const agentId = resolveWorldAgentId(rawAgent)
  const eventId = clean(input.eventId ?? input.event_id) || (runId && Number.isInteger(seq) ? `${runId}:${seq}` : '')

  if (!eventId || eventId.length > 180) throw new WorldEventValidationError('invalid_event_id', 'event_id is required and must be at most 180 characters.')
  if (!runId || runId.length > 140) throw new WorldEventValidationError('invalid_run_id', 'run_id is required and must be at most 140 characters.')
  if (!Number.isInteger(seq) || seq < 0) throw new WorldEventValidationError('invalid_seq', 'seq must be a non-negative integer.')
  if (!eventType || eventType.length > 80) throw new WorldEventValidationError('invalid_event_type', 'event/type is required and must be at most 80 characters.')
  if (!agentId) throw new WorldEventValidationError('unknown_agent', `Unknown Hermes worker/profile: ${clean(rawAgent) || '(missing)'}.`)
  if (!state && !presence) throw new WorldEventValidationError('unsupported_event', `Unsupported Hermes event: ${eventType}.`)

  const sourceWorker = key(rawAgent)
  const isMoa = ['moa', 'komandos-moa', 'komandos moa'].includes(sourceWorker)
  if (isMoa && !['warning', 'critical'].includes(state)) {
    throw new WorldEventValidationError('moa_non_incident', 'Komandos MoA is reserved for warning and critical incidents.')
  }

  const occurredAt = clean(input.occurredAt ?? input.occurred_at ?? input.createdAt ?? input.created_at) || receivedAt
  if (!Number.isFinite(Date.parse(occurredAt))) throw new WorldEventValidationError('invalid_timestamp', 'occurred_at must be an ISO-compatible timestamp.')

  return freeze({
    version: WORLD_EVENT_VERSION,
    eventId,
    runId,
    seq,
    sessionId: clean(input.sessionId ?? input.session_id ?? payload.session_id) || null,
    agentId,
    state,
    presence,
    eventType,
    occurredAt: new Date(occurredAt).toISOString(),
    taskId: clean(input.taskId ?? input.task_id ?? payload.task_id) || runId,
    buildingId: clean(input.buildingId ?? input.building_id ?? payload.building_id) || null,
    severity: state === 'critical' ? 'critical' : ['warning', 'stuck'].includes(state) ? 'warning' : 'none',
    message: clean(input.message ?? payload.message ?? payload.text).slice(0, 320) || null,
    source: clean(input.source) || 'hermes-run-journal',
    payload,
  })
}
