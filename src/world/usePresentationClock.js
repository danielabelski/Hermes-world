import { useSyncExternalStore } from 'react'

const CLOCK_INTERVAL_MS = 120
const subscribers = new Set()
let currentNow = Date.now()
let timer = null
let visibilityBound = false

function emit() {
  currentNow = Date.now()
  subscribers.forEach((subscriber) => subscriber())
}

function stopClock() {
  if (timer !== null) window.clearInterval(timer)
  timer = null
}

function startClock() {
  if (timer !== null || subscribers.size === 0 || document.hidden) return
  timer = window.setInterval(emit, CLOCK_INTERVAL_MS)
}

function onVisibilityChange() {
  if (document.hidden) stopClock()
  else {
    emit()
    startClock()
  }
}

function subscribe(subscriber) {
  subscribers.add(subscriber)
  if (!visibilityBound) {
    document.addEventListener('visibilitychange', onVisibilityChange)
    visibilityBound = true
  }
  startClock()
  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size > 0) return
    stopClock()
    if (visibilityBound) document.removeEventListener('visibilitychange', onVisibilityChange)
    visibilityBound = false
  }
}

const getSnapshot = () => currentNow
const getServerSnapshot = () => currentNow
const subscribePaused = () => () => undefined

/** One presentation-only scheduler shared by every map/UI subscriber. */
export function usePresentationClock(enabled = true) {
  return useSyncExternalStore(enabled ? subscribe : subscribePaused, getSnapshot, getServerSnapshot)
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopClock()
    subscribers.clear()
    if (visibilityBound) document.removeEventListener('visibilitychange', onVisibilityChange)
    visibilityBound = false
  })
}
