const ERROR_STATUSES = new Set(['error', 'failed', 'fail'])
const SUCCESS_STATUSES = new Set(['ok', 'success', 'completed', 'done'])

const AGENT_LABELS = Object.freeze({
  assigned: 'ZADANIE',
  thinking: 'ANALIZA',
  working: 'PRACA',
  waiting: 'OCZEKIWANIE',
  stuck: 'BRAK POSTĘPU',
  warning: 'UWAGA',
  critical: 'BŁĄD',
  success: 'UKOŃCZONE',
  idle: 'GOTOWY',
})

const clean = (value) => String(value ?? '').trim()

function cronPresentation(item) {
  const name = clean(item.cronName ?? item.title ?? item.name ?? item.entityId) || 'Cron bez nazwy'
  const status = clean(item.cronStatus ?? item.status).toLowerCase()
  const failed = ERROR_STATUSES.has(status) || ['error', 'critical'].includes(clean(item.severity).toLowerCase())
  const succeeded = SUCCESS_STATUSES.has(status)
  return {
    label: failed ? 'CRON · BŁĄD' : succeeded ? 'CRON · SUKCES' : `CRON · ${status ? status.toUpperCase() : 'WYNIK'}`,
    message: failed
      ? `${name} — wykonanie zakończone błędem.`
      : succeeded
        ? `${name} — wykonany pomyślnie.`
        : `${name} — status: ${status || 'nieznany'}.`,
  }
}

/** A cron is never attributed to an agent without real evidence. */
export function presentWorldActivity(item = {}) {
  const type = clean(item.type).toLowerCase()
  if (type === 'cron') return cronPresentation(item)

  if (type === 'agent') {
    const state = clean(item.operationalState ?? item.state ?? item.status).toLowerCase()
    return {
      label: AGENT_LABELS[state] ?? 'AGENT',
      message: clean(item.message ?? item.title ?? item.name) || 'Zmiana stanu agenta.',
    }
  }

  if (type === 'task') {
    const title = clean(item.taskTitle ?? item.title)
    return {
      label: 'ZADANIE',
      message: clean(item.message) || (title ? `${title} — aktualizacja zadania.` : 'Aktualizacja zadania.'),
    }
  }

  const severity = clean(item.severity ?? item.level).toLowerCase()
  return {
    label: ['critical', 'error'].includes(severity) ? 'BŁĄD' : severity === 'warning' ? 'UWAGA' : 'ZDARZENIE',
    message: clean(item.message ?? item.title ?? item.name) || 'Zdarzenie systemowe.',
  }
}

/** Surface type diversity without dropping or inventing any event. */
export function orderWorldActivityRotation(items = []) {
  const source = Array.isArray(items) ? items.filter(Boolean) : []
  const urgent = source.filter((item) => ['warning', 'error', 'critical', 'fatal'].includes(clean(item?.severity ?? item?.level).toLowerCase()))
  const ordinary = source.filter((item) => !urgent.includes(item))
  const representatives = []
  for (const type of ['cron', 'task', 'agent']) {
    const item = ordinary.find((candidate) => clean(candidate?.type).toLowerCase() === type)
    if (item) representatives.push(item)
  }
  const selected = new Set([...urgent, ...representatives])
  return [...urgent, ...representatives, ...source.filter((item) => !selected.has(item))]
}

/** Keep the audit trail intact while showing only the newest stage per run in the sheet. */
export function collapseWorldActivityTimeline(items = []) {
  const source = Array.isArray(items) ? items.filter(Boolean) : []
  const seenRuns = new Set()
  return source.filter((item) => {
    if (clean(item?.type).toLowerCase() !== 'agent') return true
    const runKey = clean(item.runId ?? item.taskId)
    const taskTitle = clean(item.taskTitle ?? item.payload?.task_title)
    // Legacy gateway records were persisted before the adapter carried a safe
    // task title. They remain available in the raw/audit channel, but are not
    // useful enough to displace named crons and operations in the semantic UI.
    if (runKey.startsWith('gateway-') && !taskTitle) return false
    if (!runKey) return true
    if (seenRuns.has(runKey)) return false
    seenRuns.add(runKey)
    return true
  })
}
