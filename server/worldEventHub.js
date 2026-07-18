export function createWorldEventHub({ maxEvents = 500 } = {}) {
  const events = []
  const eventIds = new Set()
  const lastSeqByRun = new Map()
  const clients = new Set()

  const send = (res, eventName, data, id = null) => {
    if (id) res.write(`id: ${id}\n`)
    res.write(`event: ${eventName}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    res.flush?.()
  }

  function publish(event) {
    if (eventIds.has(event.eventId)) return { accepted: false, reason: 'duplicate', event }
    const previousSeq = lastSeqByRun.get(event.runId)
    if (Number.isInteger(previousSeq) && event.seq <= previousSeq) return { accepted: false, reason: 'out_of_order', event }

    const publishedEvent = Object.freeze({ ...event, publishedAt: new Date().toISOString() })
    eventIds.add(event.eventId)
    lastSeqByRun.set(event.runId, event.seq)
    events.push(publishedEvent)
    while (events.length > maxEvents) {
      const removed = events.shift()
      eventIds.delete(removed.eventId)
    }
    for (const client of clients) send(client, 'world_event', publishedEvent, publishedEvent.eventId)
    return { accepted: true, reason: null, event: publishedEvent }
  }

  function subscribe(res, lastEventId = '') {
    clients.add(res)
    const lastIndex = lastEventId ? events.findIndex((event) => event.eventId === lastEventId) : -1
    const replay = lastIndex >= 0 ? events.slice(lastIndex + 1) : events
    send(res, 'snapshot', { events: replay, cursor: events.at(-1)?.eventId ?? null })
    const heartbeat = setInterval(() => send(res, 'heartbeat', { at: new Date().toISOString() }), 15_000)
    heartbeat.unref?.()
    return () => {
      clearInterval(heartbeat)
      clients.delete(res)
    }
  }

  return Object.freeze({ publish, subscribe, snapshot: () => [...events], clientCount: () => clients.size })
}
