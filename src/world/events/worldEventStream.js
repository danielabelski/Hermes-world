const subscribers = new Set()
let source = null

function notify(kind, value, payload = null) {
  subscribers.forEach((subscriber) => {
    try {
      if (kind === 'snapshot') subscriber.onSnapshot?.(value, payload)
      else subscriber.onEvent?.(value)
    } catch { /* one UI consumer must never break the shared stream */ }
  })
}

function openStream(EventSourceImpl) {
  if (source || typeof EventSourceImpl !== 'function') return
  source = new EventSourceImpl('/api/world/events/stream')
  source.addEventListener('snapshot', (message) => {
    try {
      const payload = JSON.parse(message.data || '{}')
      notify('snapshot', Array.isArray(payload.events) ? payload.events : [], payload)
    } catch { /* ingestion validates payloads; malformed transport data is ignored */ }
  })
  source.addEventListener('world_event', (message) => {
    try { notify('event', JSON.parse(message.data || '{}')) } catch { /* invalid transport data is ignored */ }
  })
}

function closeStream() {
  source?.close?.()
  source = null
}

export function subscribeWorldEventStream(subscriber = {}, { EventSourceImpl = globalThis.EventSource } = {}) {
  subscribers.add(subscriber)
  openStream(EventSourceImpl)
  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) closeStream()
  }
}

export function resetWorldEventStreamForTests() {
  subscribers.clear()
  closeStream()
}
