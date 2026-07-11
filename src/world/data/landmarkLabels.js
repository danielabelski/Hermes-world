/**
 * Short, human-readable labels for the world map.
 *
 * Labels are deliberately kept outside the renderer and outside the API
 * normalizer. A Canvas, React tooltip, accessibility announcer, or future
 * Tiled editor can all use the same role vocabulary. They describe what an
 * object means; they never claim a runtime state that the API did not supply.
 */

const freeze = Object.freeze

const entry = ({ id, title, short, role, tooltip, agentProfile = null, entityType = 'building' }) => freeze({
  id,
  title,
  short,
  role,
  tooltip,
  agentProfile,
  entityType,
})

export const BUILDING_LABELS = freeze({
  'scout-lodge': entry({
    id: 'scout-lodge',
    title: 'Chata Zwiadowcy',
    short: 'Zwiad',
    role: 'Rozpoznanie i prospecting',
    tooltip: 'Zwiadowca rusza stąd po nowe informacje i wraca z notatkami.',
    agentProfile: 'prospecting',
  }),
  keep: entry({
    id: 'keep',
    title: 'Zamek Główny',
    short: 'Orkiestracja',
    role: 'Koordynacja systemu',
    tooltip: 'Kasztelan widzi cały świat i kieruje pracą agentów.',
    agentProfile: 'orchestrator',
  }),
  'herald-tower': entry({
    id: 'herald-tower',
    title: 'Wieża Herolda',
    short: 'Komunikacja',
    role: 'Outreach i wiadomości',
    tooltip: 'Herold przenosi wiadomości na zewnątrz i odbiera odpowiedzi.',
    agentProfile: 'outreach',
  }),
  library: entry({
    id: 'library',
    title: 'Biblioteka',
    short: 'Research',
    role: 'Badania i wiedza',
    tooltip: 'Uczony przeszukuje źródła, porządkuje wiedzę i zapisuje odkrycia.',
    agentProfile: 'researcher',
  }),
  fountain: entry({
    id: 'fountain',
    title: 'Fontanna Zdrowia',
    short: 'Zdrowie',
    role: 'Kondycja systemu',
    tooltip: 'Fontanna i jej światło pokazują ogólną kondycję systemu.',
    entityType: 'landmark',
  }),
  'alchemist-lab': entry({
    id: 'alchemist-lab',
    title: 'Laboratorium Alchemika',
    short: 'Synteza',
    role: 'Łączenie wyników',
    tooltip: 'Alchemik łączy składniki z wielu agentów w jeden rezultat.',
    agentProfile: 'synthesizer',
  }),
  forge: entry({
    id: 'forge',
    title: 'Kuźnia',
    short: 'Coding',
    role: 'Tworzenie i naprawa kodu',
    tooltip: 'Kowal pracuje nad kodem, a iskry oznaczają aktywne wykonanie.',
    agentProfile: 'coder',
  }),
  'inspection-hall': entry({
    id: 'inspection-hall',
    title: 'Sala Inspekcyjna',
    short: 'Review',
    role: 'Kontrola jakości',
    tooltip: 'Inspektor sprawdza rezultat i stawia pieczęć po przeglądzie.',
    agentProfile: 'reviewer',
  }),
  'assay-office': entry({
    id: 'assay-office',
    title: 'Urząd Probierczy',
    short: 'Weryfikacja',
    role: 'Sprawdzanie wyników',
    tooltip: 'Probierz waży wynik, porównuje go z oczekiwaniem i potwierdza jakość.',
    agentProfile: 'verifier',
  }),
  'builders-yard': entry({
    id: 'builders-yard',
    title: 'Plac Budowy',
    short: 'Budowa',
    role: 'Rozwój i wdrażanie',
    tooltip: 'Budowniczy planuje zmiany i zamienia je w działające elementy systemu.',
    agentProfile: 'developer',
  }),
  'clock-tower': entry({
    id: 'clock-tower',
    title: 'Wieża Zegarowa',
    short: 'Cron',
    role: 'Harmonogramy',
    tooltip: 'Dzwon wieży oznacza uruchomienie lub zakończenie zaplanowanego zadania.',
    entityType: 'landmark',
  }),
  barracks: entry({
    id: 'barracks',
    title: 'Koszary',
    short: 'Interwencje',
    role: 'Reakcja na problemy',
    tooltip: 'Champion rusza stąd do pilnych problemów i zablokowanych zadań.',
    agentProfile: 'komandos',
  }),
  'siege-workshop': entry({
    id: 'siege-workshop',
    title: 'Warsztat Oblężniczy',
    short: 'DevOps',
    role: 'Infrastruktura i operacje',
    tooltip: 'Inżynier utrzymuje mechanizmy, które pozwalają systemowi działać.',
    agentProfile: 'devops',
  }),
  watchtower: entry({
    id: 'watchtower',
    title: 'Wieża Wartownicza',
    short: 'Dispatcher',
    role: 'Przekazywanie zadań',
    tooltip: 'Paź pilnuje dróg i przenosi paczki między budynkami.',
    agentProfile: 'default',
  }),
})

export const LANDMARK_LABELS = freeze({
  'main-gate': entry({
    id: 'main-gate',
    title: 'Brama Główna',
    short: 'Wejście',
    role: 'Granica świata',
    tooltip: 'Przez tę bramę przechodzą webhooki, API i komunikacja ze światem zewnętrznym.',
    entityType: 'landmark',
  }),
  'landmark-main-gate': entry({
    id: 'landmark-main-gate',
    title: 'Brama Główna',
    short: 'Wejście',
    role: 'Granica świata',
    tooltip: 'Przez tę bramę przechodzą webhooki, API i komunikacja ze światem zewnętrznym.',
    entityType: 'landmark',
  }),
  'token-river': entry({
    id: 'token-river',
    title: 'Rzeka Tokenów',
    short: 'Przepływ',
    role: 'Aktywne sesje i koszt',
    tooltip: 'Szerokość i blask rzeki pokazują przepływ aktywnych sesji oraz koszt modeli.',
    entityType: 'landmark',
  }),
  'landmark-token-river': entry({
    id: 'landmark-token-river',
    title: 'Rzeka Tokenów',
    short: 'Przepływ',
    role: 'Aktywne sesje i koszt',
    tooltip: 'Szerokość i blask rzeki pokazują przepływ aktywnych sesji oraz koszt modeli.',
    entityType: 'landmark',
  }),
  'model-crystals': entry({
    id: 'model-crystals',
    title: 'Kryształy Modeli',
    short: 'Modele',
    role: 'Źródła mocy AI',
    tooltip: 'Każdy kryształ reprezentuje dostępnego providera i model AI.',
    entityType: 'landmark',
  }),
  'landmark-model-crystals': entry({
    id: 'landmark-model-crystals',
    title: 'Kryształy Modeli',
    short: 'Modele',
    role: 'Źródła mocy AI',
    tooltip: 'Każdy kryształ reprezentuje dostępnego providera i model AI.',
    entityType: 'landmark',
  }),
  'health-garden': entry({
    id: 'health-garden',
    title: 'Ogród Zdrowia',
    short: 'Kondycja',
    role: 'Sygnał zdrowia systemu',
    tooltip: 'Roślinność, światło i fontanna tworzą czytelny sygnał kondycji systemu.',
    entityType: 'landmark',
  }),
  'landmark-health-garden': entry({
    id: 'landmark-health-garden',
    title: 'Ogród Zdrowia',
    short: 'Kondycja',
    role: 'Sygnał zdrowia systemu',
    tooltip: 'Roślinność, światło i fontanna tworzą czytelny sygnał kondycji systemu.',
    entityType: 'landmark',
  }),
  'northwest-tower': entry({
    id: 'northwest-tower',
    title: 'Wieża Północno-Zachodnia',
    short: 'Straż',
    role: 'Obrona murów',
    tooltip: 'Wieża wyznacza granicę mapy i pomaga zachować orientację w świecie.',
    entityType: 'landmark',
  }),
  'northeast-tower': entry({
    id: 'northeast-tower',
    title: 'Wieża Północno-Wschodnia',
    short: 'Straż',
    role: 'Obrona murów',
    tooltip: 'Wieża wyznacza granicę mapy i pomaga zachować orientację w świecie.',
    entityType: 'landmark',
  }),
  'southwest-tower': entry({
    id: 'southwest-tower',
    title: 'Wieża Południowo-Zachodnia',
    short: 'Straż',
    role: 'Obrona murów',
    tooltip: 'Wieża wyznacza granicę mapy i pomaga zachować orientację w świecie.',
    entityType: 'landmark',
  }),
  'southeast-tower': entry({
    id: 'southeast-tower',
    title: 'Wieża Południowo-Wschodnia',
    short: 'Straż',
    role: 'Obrona murów',
    tooltip: 'Wieża wyznacza granicę mapy i pomaga zachować orientację w świecie.',
    entityType: 'landmark',
  }),
})

// The renderer receives either a building id or a `landmark-*` id depending
// on which layer was tapped. Make both forms resolve to the same copy-ready
// label without duplicating the product vocabulary above.
const buildingLandmarkAliases = Object.fromEntries(
  Object.entries(BUILDING_LABELS).map(([id, value]) => [
    `landmark-${id}`,
    freeze({ ...value, id: `landmark-${id}`, entityType: 'landmark' }),
  ]),
)

export const WORLD_LABELS = freeze({
  ...BUILDING_LABELS,
  ...buildingLandmarkAliases,
  ...LANDMARK_LABELS,
})

export function getLandmarkLabel(id) {
  if (!id) return null
  const value = WORLD_LABELS[id]
  if (value) return value
  return WORLD_LABELS[String(id).replace(/^landmark-/, '')] ?? null
}

