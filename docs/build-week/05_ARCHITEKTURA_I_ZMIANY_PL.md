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
