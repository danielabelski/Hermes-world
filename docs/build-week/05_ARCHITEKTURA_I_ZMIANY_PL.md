# 05 — Architektura i zmiany

## Aktualny rzeczywisty przepływ

### Istniejący przepływ odczytu

```text
Hermes runtime
→ same-origin server.js / endpointy API
→ src/api.js (jawne odczyty i obsługa błędów)
→ WorldBridge (cache + provenance)
→ useWorldBridge
→ worldStore
→ resolvery stanu i prezentacji
→ mapa, agenci, budynki i mobile UI
```

### Izolowany przepływ realnych eventów w pre-submission demo

```text
Hermes run journal / SSE
→ demo sidecar adapter / ingestion
→ POST /api/world/events
→ walidacja + kolejność + deduplikacja
→ SSE /api/world/events/stream
→ event reducer
→ WorldBridge snapshot
→ istniejący FSM, routing, building reactions i renderer
→ widoczna zmiana na telefonie
```

## Rozdzielenie stanów

- `operationalState`: prawdziwy stan agenta/systemu z eventu; nie może być generowany przez ambient.
- `choreographyState`: wizualizacja przebiegu prawdziwego eventu.
- `environmentState`: stałe życie infrastruktury, które nie emituje Working/Success i nie wpływa na licznik aktywnych agentów.
- presence `online/offline`: atrybut dostępności, oddzielny od pracy.

## Stan komponentów na baseline

| Obszar | Status | Okres | Uwagi |
|---|---|---|---|
| Mapa BASELINE, wariant LIGHT | działa | przed | geometria zamrożona |
| 12 agentów, role, sprite’y, anchory i depth | działa | przed | wspólny renderer i konfiguracja |
| Waypointy, routing, wejścia | działa | przed | debug route overlay dev-only |
| FSM i statusy observability | działa | przed | stable/working/thinking/waiting/stuck/warning/critical/success/offline |
| Odczyty odziedziczone z Hermes OS CAT | działa/częściowo zależne od runtime | przed | własny pre-existing shell; nie dowodzi finalnego live pipeline Hermes World |
| Real event pipeline demo | prototyp działający w demo | przed | adapter/journal/SSE i test harness; nie przedstawiać jako post-start extension ani ukończone wdrożenie produkcyjne |
| Choreography i Ambient Director | działa | przed | ambient nie fałszuje operational state |
| Environmental life / visible operations | działa | przed | assety i procesy mapy |
| Demo/focus harness | mock kontrolowany | przed | tylko jawne `demo=1`/focus, nie fallback produkcji |
| Dokumentacja Build Week i snapshoty | działa | podczas | append-only workflow, snapshoty i etapowe commity |
| Living infrastructure z realnej telemetrii | działa w demo | podczas | heartbeat/CPU/activity/tasks/sessions/crons sterują wyłącznie prezentacją infrastruktury |
| Evidence-backed real event → mobile world flow | działa w demo | podczas | jeden lifecycle ID; brama → Cytadela → subsystem; Archiwum tylko po realnym success |

## Skalowanie do wielu agentów

Centralna konfiguracja ról, semantic nodes, wspólny renderer i normalizacja eventów pozwalają dopisywać agentów bez osobnego renderera i bez rozrzucania anonimowych współrzędnych. Nie jest to jednak dowód pełnej produkcyjnej skali; potrzebne są testy z większą liczbą prawdziwych równoległych eventów.

## Zasada błędów i mocków

- Brak danych live nie może po cichu uruchamiać symulacji.
- Demo i focus są jawne oraz odseparowane parametrem/środowiskiem.
- Materiały konkursowe muszą wyraźnie oznaczać, czy pokazują real runtime, kontrolowany test, czy wizualny baseline.

## Zmiany po rozpoczęciu Submission Period

Pierwszy blok funkcjonalny po granicy został wykonany w commitach `08ad9aa`, `4d5870e`, `3f03073` i `fdb75f4`. Dodaje stale widoczną, map-aligned wodę i atmosferę, oddzielone kanały intensywności, sterowanie rytmem budynków prawdziwą telemetrią oraz audytowalną choreografię realnego runu. Produkcyjny `main` pozostaje nietknięty; funkcje wymagają jeszcze GL przed jakimkolwiek przeniesieniem z demo.

## Audyt gotowej telemetrii Hermes OS CAT — 2026-07-14

Audyt wykonano read-only na aktualnych plikach Hermes OS CAT. Hermes World korzysta już z tego samego backendu Hermes pod `127.0.0.1:8787` i z równoważnych endpointów same-origin. Nie jest potrzebne kopiowanie kodu CAT ani tworzenie równoległego API; potrzebna jest wyłącznie normalizacja i przypisanie istniejących payloadów do metafor budynków.

| Sygnał | Źródło rzeczywiste | Stan w CAT | Stan w Hermes World | Uczciwa interpretacja |
|---|---|---|---|---|
| koszt API | `/api/sessions/search`, pole `estimated_cost` | suma w Dashboard | już normalizowany jako `system.totalEstimatedCost` i `tokenRiver.totalEstimatedCost` | koszt sesji zwróconych przez endpoint; przy limicie 50 nie nazywać go bezwarunkowo kosztem lifetime |
| health score | profile agentów + świeże logi + metryki + crony | heurystyka UI | własna, jawna heurystyka `deriveHealth()` już działa | realne wejścia, ale score wyliczony przez produkt, nie natywny score backendu |
| last error | `/api/logs?tail=500` | filtrowany ostatni error/warning | logi są w `activity` i `alerts`, brak osobnego pola summary | można wyprowadzić bez nowego endpointu, zachowując timestamp, źródło i wiadomość |
| cron engine | `/api/crons` + `/api/crons/recent` | lista, enablement, historia, success/fail | crony i ostatni status są już normalizowane | gotowe do Watchera; procent sukcesu jest agregatem prezentacyjnym |
| benchmark modeli | historia sesji | usage, koszt, tokeny, cache hit, heurystyczna skuteczność | sesje i modele są już odczytywane; `modelSources` zawiera provider/model i liczbę sesji | usage/koszt/tokeny są realne; `output_tokens > 5` z CAT nie jest miarą jakości odpowiedzi i wymaga lepszej nazwy lub definicji |
| provider usage | sesje + modele + logi + routing history | requests, latency estimate, błędy, 429, fallbacki | provider/model są dostępne, lecz pełny agregat provider health nie jest jeszcze w snapshot | można policzyć lokalnie bez API; latency i health pozostają heurystykami |
| pamięć Hermesa | `/api/memory` | surowa zawartość pamięci | metoda API istnieje, ale WorldBridge jej nie odczytuje | zawartość pamięci to nie RAG health |
| RAG / Obsidian health | brak potwierdzonego endpointu w CAT | brak | brak; słownik metafor oznacza `new-api-required` | nie wolno udawać health score; potrzebny osobny pomiar indeksu, świeżości i probe query |

Docelowe przypisanie bez zmian endpointów:

- Cytadela: global health, aktywni agenci i sesje, realny koszt sesji.
- Kuźnia: CPU, temperatura, RAM i realne zadania build/execution.
- Watcher: harmonogramy, ostatnie wykonania, fail/success i najnowszy błąd operacyjny.
- Archiwum: historia sesji, użycie modeli/providerów, koszt, tokeny, cache i fallback routing.
- Sanctum: global health i obciążenie pamięci systemowej; RAG health dopiero po dodaniu prawdziwego źródła pomiarowego.

Minimalny kontrakt przyszłego realnego RAG health powinien zawierać co najmniej: dostępność źródła Obsidian, liczbę dokumentów źródłowych, liczbę dokumentów zindeksowanych, liczbę elementów nieaktualnych/failed, czas ostatniego udanego indeksowania oraz latency i wynik kontrolnego retrieval probe. Do czasu istnienia tych danych Sanctum nie może nazywać RAM lub samej zawartości `/memory` zdrowiem RAG.

## Wnętrza subsystemów — stan po cinematic integration

Przepływ renderowania:

`WorldFallback` → hotspot budynku → lazy `BuildingInteriorScene` → wspólny `CinematicInteriorPlate` → płyta 4:5 + lokalne hotspoty efektów → telemetryczny readout.

- **Działa podczas Submission Period:** pięć wejść, jeden portal i renderer, focus trap, Escape, powrót focusu, pełne progi sylwetek agentów, responsywne 4:5, lazy loading oraz mapa pauzowana pod sceną.
- **Działa podczas Submission Period:** faza wnętrza i metryki pochodzą z istniejącego stanu świata; `evidenceEventId` zachowuje powiązanie z realnym eventem.
- **Warstwa wizualna:** ilustracja jest nieruchomą bazą; małe efekty są zakotwiczone do fizycznych elementów i nie zmieniają `operationalState`.
- **Niezaimplementowane:** agent widoczny we wnętrzu, interior waypoints i klikany drill-down agenta. Funkcja może zostać dodana po GL bez tworzenia nowego stanu operacyjnego.

## Agenci we wnętrzach — stan po evidence-backed integration

Przepływ prawdy i renderowania:

`task/event + lifecycle + route` → `resolveMapAgentPresentation` → `presentation.isInside` → dokładnie jeden właściciel sprite’u (`MapAgentLayer` albo `InteriorAgentPresence`) → lokalna trasa cinematic interior → istniejący drill-down profilu.

- **Działa podczas Submission Period:** jeden wspólny renderer używa dokładnie tych samych sprite’ów, anchoru przy stopach, cienia kontaktowego, statusów i danych co mapa.
- **Działa podczas Submission Period:** wszystkie 12 zaakceptowanych ról ma centralne przypisanie do jednego z pięciu istniejących wnętrz. Wejście, praca, wyjście i powrót wynikają z istniejącego FSM oraz tego samego tasku/evidence; brak dowodu pozostawia agenta na mapie.
- **Działa podczas Submission Period:** ukryta mapa nie renderuje duplikatu agenta. Pierwszy snapshot aktywnego taska nie tworzy fikcyjnego observed edge, a stare zakończenie bez wiarygodnego czasu nie udaje świeżego Success.
- **Aktualny live contract:** potwierdzony stream sesji Hermesa tworzy evidence-backed task dla właściwego profilu. `profile.is_active` pozostaje wyłącznie atrybutem wyboru profilu; nie uruchamia Working. Role nieobecne w odpowiedzi `/api/profiles` pozostają widoczne jako `offline`, dzięki czemu częściowy payload nie usuwa topologii miasta.
- **Wydajność:** ukryty presentation clock i Ambient Director są pauzowane, prawdziwy transport SSE pozostaje aktywny, a lokalny zegar wnętrza działa tylko dla kwalifikującego się agenta.
- **Do ręcznego odbioru:** finalne GL/RL skali, rytmu pracy i integracji z tłem na realnym 393×852; automatyczne kontrakty i build przeszły.
