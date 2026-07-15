const WORLD_CHAT_EVENT_ENDPOINT = '/api/world/events/panel'

const EVENT_MESSAGES = Object.freeze({
  stream_start: 'Hermes przyjął wiadomość.',
  reasoning: 'Hermes analizuje wiadomość.',
  tool: 'Hermes wykonuje operację.',
  approval: 'Hermes oczekuje na decyzję.',
  done: 'Hermes zakończył odpowiedź.',
  apperror: 'Hermes zakończył odpowiedź błędem.',
})

async function publishThroughPanel(event) {
  try {
    const response = await fetch(WORLD_CHAT_EVENT_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json',
        'x-hermes-world-source': 'panel-chat',
      },
      body: JSON.stringify(event),
    })
    return response.ok
  } catch {
    // The world visualization must never interrupt a real Hermes chat.
    return false
  }
}

/**
 * Converts confirmed Hermes chat/SSE lifecycle edges into evidence-backed
 * world events. It deliberately emits no event for a button click or token:
 * stream_start is published only after Hermes returns a real stream_id and
 * all later edges originate from the corresponding upstream SSE stream.
 */
export function createChatWorldEventPublisher({
  runId,
  sessionId = null,
  profile = 'default',
  publish = publishThroughPanel,
  now = () => new Date().toISOString(),
} = {}) {
  let seq = 0
  let terminal = false
  const emitted = new Set()

  const emitOnce = async (key, eventType, payload = {}) => {
    if (!runId || emitted.has(key) || (terminal && key !== 'critical')) return false
    emitted.add(key)
    if (key === 'success' || key === 'critical') terminal = true
    const eventSeq = seq++
    return publish({
      event_id: `${runId}:${eventSeq}`,
      run_id: runId,
      seq: eventSeq,
      event: eventType,
      created_at: now(),
      session_id: sessionId,
      task_id: runId,
      profile,
      message: EVENT_MESSAGES[eventType] ?? 'Hermes zaktualizował stan.',
      source: 'hermes-chat-sse',
      payload,
    })
  }

  return Object.freeze({
    started: () => emitOnce('started', 'stream_start'),
    thinking: () => emitOnce('thinking', 'reasoning'),
    working: (toolName = null) => emitOnce('working', 'tool', toolName ? { tool_name: String(toolName).slice(0, 120) } : {}),
    waiting: () => emitOnce('waiting', 'approval'),
    success: () => emitOnce('success', 'done'),
    critical: () => emitOnce('critical', 'apperror'),
  })
}

export { WORLD_CHAT_EVENT_ENDPOINT }
