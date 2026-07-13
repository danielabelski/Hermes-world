import { getWorldLifeJourney } from '../data/roadGraph.js'
import { sampleMapAgentRoute } from '../mapAgentPresentation.js'

const freeze = Object.freeze
const OUTBOUND_MS = 2_200
const SUCCESS_HOLD_MS = 1_300
const ARCHIVE_DELAY_MS = 420
const RETURN_DELAY_MS = 1_650
const RETURN_MS = 2_400
const COMPLETE_MS = RETURN_DELAY_MS + RETURN_MS
const COMMAND_SIGNAL_MS = 4_800
const DELEGATION_SIGNAL_MS = 5_600
const MAX_SEQUENCES = 12

const asMs = (value, fallback = Date.now()) => {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : fallback
}
const clamp = (value) => Math.max(0, Math.min(1, value))
const percentPoints = (points = []) => points.map((point) => ({ x: point.x * 10, y: point.y * 10 }))

export function createChoreographyState() {
  return freeze({ sequences: freeze([]), lastEventId: null })
}

function sequenceKind(agentId) {
  return ['default', 'orchestrator'].includes(agentId) ? 'chat' : 'delegation'
}

function baseSequence(event, receivedAt, existingSequences = []) {
  const previous = existingSequences.at(-1)
  const desktopOrigin = previous ? actorMotion(previous, receivedAt, 'desktop') : null
  const mobileOrigin = previous ? actorMotion(previous, receivedAt, 'mobile') : null
  return {
    runId: event.runId,
    kind: sequenceKind(event.agentId),
    actorId: 'orchestrator',
    targetAgentId: sequenceKind(event.agentId) === 'delegation' ? event.agentId : null,
    evidenceEventIds: [event.eventId],
    receivedAt,
    occurredAt: asMs(event.occurredAt, receivedAt),
    latestState: event.state,
    maxSeq: Number.isInteger(event.seq) ? event.seq : -1,
    latestAt: receivedAt,
    thinkingAt: event.state === 'thinking' ? receivedAt : null,
    workingAt: event.state === 'working' ? receivedAt : null,
    terminalAt: ['success', 'critical', 'idle'].includes(event.state) ? receivedAt : null,
    terminalState: ['success', 'critical', 'idle'].includes(event.state) ? event.state : null,
    buildingId: event.buildingId ?? null,
    originByLayout: {
      desktop: desktopOrigin ? { x: desktopOrigin.worldX, y: desktopOrigin.worldY } : null,
      mobile: mobileOrigin ? { x: mobileOrigin.worldX, y: mobileOrigin.worldY } : null,
    },
  }
}

export function reduceChoreographyEvent(state = createChoreographyState(), event, receivedAt = Date.now()) {
  if (!event?.eventId || !event?.runId || !event?.agentId) return state
  if (state.lastEventId === event.eventId || state.sequences.some((sequence) => sequence.evidenceEventIds.includes(event.eventId))) return state
  const sequences = [...state.sequences]
  const index = sequences.findIndex((sequence) => sequence.runId === event.runId)
  const previous = index >= 0 ? sequences[index] : baseSequence(event, receivedAt, sequences)
  if (index >= 0 && Number.isInteger(event.seq) && event.seq <= previous.maxSeq) return state
  const terminal = ['success', 'critical', 'idle'].includes(event.state)
  const next = {
    ...previous,
    kind: previous.kind === 'delegation' || sequenceKind(event.agentId) === 'delegation' ? 'delegation' : 'chat',
    targetAgentId: previous.targetAgentId ?? (sequenceKind(event.agentId) === 'delegation' ? event.agentId : null),
    evidenceEventIds: [...previous.evidenceEventIds, event.eventId],
    latestState: event.state ?? previous.latestState,
    maxSeq: Number.isInteger(event.seq) ? event.seq : previous.maxSeq,
    latestAt: receivedAt,
    thinkingAt: event.state === 'thinking' ? receivedAt : previous.thinkingAt,
    workingAt: event.state === 'working' ? receivedAt : previous.workingAt,
    terminalAt: terminal ? receivedAt : previous.terminalAt,
    terminalState: terminal ? event.state : previous.terminalState,
    buildingId: event.buildingId ?? previous.buildingId,
  }
  if (index >= 0) sequences[index] = next
  else sequences.push(next)
  return freeze({ sequences: freeze(sequences.slice(-MAX_SEQUENCES).map((sequence) => freeze(sequence))), lastEventId: event.eventId })
}

function sequenceExpired(sequence, now) {
  if (sequence.terminalAt) return now - sequence.terminalAt > COMPLETE_MS + 800
  return now - sequence.latestAt > 10 * 60_000
}

export function pruneChoreographyState(state, now = Date.now()) {
  const sequences = state.sequences.filter((sequence) => !sequenceExpired(sequence, now))
  return sequences.length === state.sequences.length ? state : freeze({ ...state, sequences: freeze(sequences) })
}

function actorMotion(sequence, now, layout) {
  const journey = getWorldLifeJourney('orchestrator', layout)
  if (!journey) return null
  const outbound = percentPoints(journey.outboundWaypoints)
  const origin = sequence.originByLayout?.[layout]
  if (origin && outbound.length) outbound[0] = origin
  const returning = percentPoints(journey.returnWaypoints)
  const elapsed = Math.max(0, now - sequence.receivedAt)
  const sinceTerminal = sequence.terminalAt === null ? null : Math.max(0, now - sequence.terminalAt)
  let sampled
  let visualState = 'idle'
  let phase
  let isMoving = false

  if (elapsed < OUTBOUND_MS) {
    sampled = sampleMapAgentRoute(outbound, clamp(elapsed / OUTBOUND_MS))
    visualState = 'walk'
    phase = elapsed < 320 ? 'message-received' : 'to-command'
    isMoving = true
  } else if (sinceTerminal !== null && sinceTerminal >= RETURN_DELAY_MS) {
    sampled = sampleMapAgentRoute(returning, clamp((sinceTerminal - RETURN_DELAY_MS) / RETURN_MS))
    visualState = 'walk'
    phase = 'return'
    isMoving = true
  } else {
    sampled = sampleMapAgentRoute(outbound, 1)
    if (sequence.terminalState === 'success' && sinceTerminal !== null && sinceTerminal < SUCCESS_HOLD_MS) visualState = 'success'
    else if (sequence.latestState === 'thinking') visualState = 'thinking'
    phase = sequence.terminalState === 'success' ? 'success' : sequence.latestState === 'thinking' ? 'thinking' : 'command'
  }
  return freeze({
    profileId: 'orchestrator',
    worldX: sampled.worldX,
    worldY: sampled.worldY,
    sortY: sampled.worldY,
    direction: sampled.direction,
    visualState,
    phase,
    isMoving,
    runId: sequence.runId,
    evidenceEventId: sequence.evidenceEventIds.at(-1),
  })
}

export function deriveChoreographyPresentation(state, { now = Date.now(), layout = 'desktop' } = {}) {
  const active = state.sequences.filter((sequence) => !sequenceExpired(sequence, now))
  const sequence = active.at(-1) ?? null
  if (!sequence) return freeze({ motionByAgent: freeze({}), signals: freeze([]), activeRunId: null })
  const elapsed = Math.max(0, now - sequence.receivedAt)
  const sinceTerminal = sequence.terminalAt === null ? null : Math.max(0, now - sequence.terminalAt)
  const signals = []
  const lifecycleEvidenceId = sequence.evidenceEventIds[0]
  const triggerEventId = sequence.evidenceEventIds.at(-1)
  if (elapsed < 950) signals.push(freeze({ kind: 'message-pulse', runId: sequence.runId, targetAgentId: null, buildingId: 'citadel', evidenceEventId: lifecycleEvidenceId, triggerEventId: lifecycleEvidenceId }))
  if (elapsed >= 180 && elapsed < COMMAND_SIGNAL_MS && sinceTerminal === null) signals.push(freeze({ kind: 'command-core', runId: sequence.runId, targetAgentId: null, buildingId: 'citadel', evidenceEventId: lifecycleEvidenceId, triggerEventId }))
  if (sequence.kind === 'delegation' && sequence.targetAgentId && elapsed < DELEGATION_SIGNAL_MS && sinceTerminal === null) {
    signals.push(freeze({ kind: 'delegation', runId: sequence.runId, targetAgentId: sequence.targetAgentId, buildingId: sequence.buildingId, evidenceEventId: lifecycleEvidenceId, triggerEventId }))
  }
  if (sequence.terminalState === 'success' && sinceTerminal >= ARCHIVE_DELAY_MS && sinceTerminal < RETURN_DELAY_MS + 1_600) {
    signals.push(freeze({ kind: 'archive-record', runId: sequence.runId, targetAgentId: 'researcher', buildingId: 'archive', sourceAgentId: sequence.targetAgentId, sourceBuildingId: sequence.buildingId, evidenceEventId: lifecycleEvidenceId, triggerEventId }))
  }
  const motion = actorMotion(sequence, now, layout)
  return freeze({
    motionByAgent: freeze(motion ? { orchestrator: motion } : {}),
    signals: freeze(signals),
    activeRunId: sequence.runId,
    kind: sequence.kind,
    targetAgentId: sequence.targetAgentId,
    elapsedMs: elapsed,
    terminalState: sequence.terminalState,
    lifecycleEvidenceId,
    triggerEventId,
    responseLatencyMs: Math.max(0, sequence.latestAt - sequence.occurredAt),
  })
}

export const CHOREOGRAPHY_TIMING = freeze({ OUTBOUND_MS, SUCCESS_HOLD_MS, ARCHIVE_DELAY_MS, RETURN_DELAY_MS, RETURN_MS, COMPLETE_MS, COMMAND_SIGNAL_MS, DELEGATION_SIGNAL_MS })
