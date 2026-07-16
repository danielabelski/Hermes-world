import { getAgentDefinition } from './data/agentDefinitions.js'

const OPERATIONAL_COPY = Object.freeze({
  assigned: (name, place) => `${name} otrzymał zadanie i zmierza do ${place.destination}.`,
  thinking: (name) => `${name} analizuje zadanie i przygotowuje plan działania.`,
  working: (name, place) => `${name} wykonuje zadanie w ${place.location}.`,
  waiting: (name) => `${name} czeka na dane lub decyzję potrzebną do dalszej pracy.`,
  stuck: (name) => `${name} nie może kontynuować zadania i wymaga odblokowania.`,
  warning: (name, place) => `${name} zgłasza ostrzeżenie w ${place.location}.`,
  critical: (name, place) => `${name} napotkał krytyczny problem w ${place.location}.`,
  success: (name) => `${name} zakończył zadanie i przekazuje rezultat.`,
  idle: (name) => `${name} wrócił do swojego stanowiska.`,
})

const TASK_COPY = Object.freeze({
  running: (name, title) => `${name} rozpoczął zadanie: ${title}.`,
  thinking: (name, title) => `${name} analizuje zadanie: ${title}.`,
  waiting: (name, title) => `${name} oczekuje na dalsze dane do zadania: ${title}.`,
  review: (_name, title) => `Zadanie „${title}” czeka na weryfikację.`,
  blocked: (name, title) => `${name} został zablokowany podczas zadania: ${title}.`,
  error: (name, title) => `${name} napotkał błąd podczas zadania: ${title}.`,
  done: (name, title) => `${name} zakończył zadanie: ${title}.`,
  completed: (name, title) => `${name} zakończył zadanie: ${title}.`,
})

const BUILDING_CASES = Object.freeze({
  forge: { destination: 'Kuźni', location: 'Kuźni' },
  keep: { destination: 'Komnaty Dowodzenia', location: 'Komnacie Dowodzenia' },
  library: { destination: 'Archiwum Wiedzy', location: 'Archiwum Wiedzy' },
  'scout-lodge': { destination: 'punktu obserwacyjnego', location: 'punkcie obserwacyjnym' },
  'herald-tower': { destination: 'Wieży Herolda', location: 'Wieży Herolda' },
  'alchemist-lab': { destination: 'Laboratorium', location: 'Laboratorium' },
  'inspection-hall': { destination: 'Sali Inspekcyjnej', location: 'Sali Inspekcyjnej' },
  'assay-office': { destination: 'Urzędu Probierczego', location: 'Urzędzie Probierczym' },
  'builders-yard': { destination: 'Placu Budowy', location: 'Placu Budowy' },
  barracks: { destination: 'Koszar', location: 'Koszarach' },
  'siege-workshop': { destination: 'Warsztatu Oblężniczego', location: 'Warsztacie Oblężniczym' },
  watchtower: { destination: 'Wieży Wartowniczej', location: 'Wieży Wartowniczej' },
})

function agentCopy(profile) {
  const definition = getAgentDefinition(profile)
  return {
    name: definition?.displayName ?? 'Agent',
    place: BUILDING_CASES[definition?.buildingId] ?? { destination: 'swojego stanowiska', location: 'swoim subsystemie' },
  }
}

export function describeOperationalEvent(event = {}, definition = null) {
  const resolved = definition ?? getAgentDefinition(event.agentId)
  const name = resolved?.displayName ?? 'Agent'
  const place = BUILDING_CASES[resolved?.buildingId] ?? { destination: 'swojego stanowiska', location: 'swoim subsystemie' }
  const render = OPERATIONAL_COPY[event.state]
  return render ? render(name, place) : `${name} zmienił stan operacyjny.`
}

export function describeTaskTransition(task = {}) {
  const { name } = agentCopy(task.assignee)
  const title = String(task.title ?? 'zadanie').trim() || 'zadanie'
  const render = TASK_COPY[String(task.status ?? '').toLowerCase()]
  return render ? render(name, title) : `Zaktualizowano zadanie „${title}”.`
}

export function describeCronResult(cron = {}) {
  const name = String(cron.name ?? 'Automatyzacja').trim() || 'Automatyzacja'
  return cron.lastCompletionStatus === 'error'
    ? `Automatyzacja „${name}” zakończyła się błędem.`
    : `Automatyzacja „${name}” zakończyła cykl poprawnie.`
}

export function describeLogAlert(entry = {}, profile = null) {
  const severity = String(entry.level ?? '').toLowerCase()
  if (profile) {
    const { name, place } = agentCopy(profile)
    return severity === 'warning'
      ? `${name} zgłasza ostrzeżenie w ${place.location}.`
      : `${name} zgłasza błąd w ${place.location}.`
  }
  return severity === 'warning'
    ? 'Cytadela wykryła ostrzeżenie systemowe.'
    : 'Cytadela wykryła błąd systemowy wymagający sprawdzenia.'
}
