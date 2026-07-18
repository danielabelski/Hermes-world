# Diagnoza stabilności demo przed release — 2026-07-18

## Zakres i punkt powrotu

- Demo: `build-week/hermes-world`, baza audytu `01df5476a77988f0ed9f6d03c11f295b32093ba8`, tag `demo-release-audit-start-2026-07-18`.
- Produkcja: `main`, baza zamrożona `958b9da08bee9613900e902b3da558aadef826e8`, tag `production-release-audit-start-2026-07-18`.
- Produkcja nie została zmieniona ani uruchomiona ponownie.
- Baseline testów demo: `npm test` — PASS 151/151.

## 1. Lifecycle SSE

### Stan faktyczny

- `src/world/events/worldEventStream.js:1-38` utrzymuje jeden współdzielony `EventSource` dla wielu konsumentów i zamyka go po usunięciu ostatniego subskrybenta.
- `server/worldEventHub.js:31-41` utrzymuje klientów i czyści pojedynczy timer heartbeat przy zamknięciu requestu.
- `server.js:422-432` wystawia SSE z `retry: 3000`, wyłącza buffering i obsługuje `Last-Event-ID`/`after`.

### Potwierdzona luka

- Klient nie obsługuje `open`, `error` ani heartbeat, nie publikuje stanów transportu i nie prowadzi kontrolowanego backoffu.
- Heartbeat serwera jest komentarzem SSE, więc JavaScript klienta nie może go obserwować ani mierzyć timeoutu.
- Brak jawnej reakcji na `visibilitychange`, `offline` i ponowny `online` w samym singletonie transportu.
- Test `world state and choreography share one SSE connection...` sprawdza wyłącznie współdzielenie i cleanup ostatniego subskrybenta; nie obejmuje pięciu reconnectów, timerów, heartbeatów ani duplikacji eventów.

### Minimalna poprawka

- Rozszerzyć istniejący singleton, bez tworzenia drugiego transportu: jawne stany, jeden timer reconnect, ograniczony backoff, cursor `after`, lifecycle przeglądarki, obserwowalny event heartbeat i pełny cleanup.
- Dodać deterministyczne testy z fałszywym `EventSource`, zegarem i pięcioma cyklami rozłączenia.

### Ryzyko i rollback

- Ryzyko: podwójny reconnect natywny + własny, utrata cursora albo timer po unmount.
- Ograniczenie: własny reconnect zawsze najpierw zamyka źródło; jeden współdzielony timer; test liczby instancji i timerów.
- Rollback: tag `demo-release-audit-start-2026-07-18`.

## 2. Resync i spójność snapshotu

### Stan faktyczny

- `src/hooks/useWorldBridge.js:174-204` przyjmuje snapshot/event z SSE, ale nie otrzymuje informacji o reconnect.
- `src/hooks/useWorldBridge.js:104-120` nakłada historię eventów na polling snapshot.
- `src/hooks/useWorldBridge.js:109-114` po pierwszym evencie na stałe preferuje `eventDrivenRef`, wymuszając `source=live` i `connection=online` także wtedy, gdy późniejszy polling zwróci domeny stale/degraded.
- `src/world/WorldBridge.js:348-444` emituje progresywny snapshot po zakończeniu każdej domeny. Wczesny snapshot może zawierać metryki, ale jeszcze nie profile.
- Istniejący test `production bridge publishes real metrics before an unrelated slow domain finishes` jawnie akceptuje pośredni snapshot bez agentów. W UI taki snapshot może wyczyścić roster, ponieważ `worldStore.applySnapshot` traktuje obecne `agents: []` jako autorytatywne.

### Minimalna poprawka

- Po każdym ponownym połączeniu oznaczyć UI jako `resyncing`, wymusić pełny snapshot wszystkich domen, zachować eventy przychodzące w trakcie i dopiero po atomowym połączeniu snapshot+eventy przejść do `live`.
- Progresywne snapshoty mogą aktualizować metryki, ale nie mogą kasować ostatniej potwierdzonej domeny profili/tasks, gdy ta domena jeszcze nie odpowiedziała.
- Usunąć permanentne wymuszanie `online` przez sam fakt wcześniejszego eventu.

### Ryzyko i rollback

- Ryzyko: race snapshot/event i chwilowe cofnięcie stanu.
- Ograniczenie: bufor eventów deduplikowany po `eventId`, jedno `syncPromise`, test eventu odebranego podczas resync.
- Rollback: osobny commit FAZY 2.2 oraz tag bazowy demo.

## 3. Świeżość danych budynków

### Stan faktyczny

- `src/world/WorldFallback.jsx:141-175` przy wejściu preloaduje grafikę i ustawia `activeInterior`; nie wywołuje `refresh` ani invalidacji domen.
- `src/components/building-interiors/BuildingInteriorScene.jsx:19-83` renderuje wyłącznie bieżące wartości store.
- `src/world/WorldBridge.js:335-346` odświeża domeny w rytmie 5 s, 15 s lub 60 s. Ponowne wejście może więc pokazać stary stan pamięci, sesji lub modeli przez maksymalnie minutę.

### Minimalna poprawka

- Przekazać istniejący `bridge.refresh` do wejścia budynku i wymusić wyłącznie domeny potrzebne danemu wnętrzu.
- Zachować ostatni widok podczas odświeżania i atomowo nadpisać go po odpowiedzi; nie czyścić wartości do pustych fallbacków.
- Test pięciu wejść z kontrolowaną zmianą odpowiedzi API.

## 4. Transport aplikacji a status Hermesa/workera

### Stan faktyczny

- `src/world/mapAgentPresentation.js:127-136` oznacza każdego agenta offline, gdy `lifecycle.connection === offline`, nawet bez autorytatywnego dowodu o workerze.
- `StatusBar.jsx:39-41` i `HealthRibbon.jsx:12-14` zamieniają awarię połączenia klienta w globalny status Offline.
- `worldEventReducer.js:39-49` poprawnie przechowuje niezależne `presence`, lecz `worldEventReducer.js:117-121` jednocześnie ustawia globalne połączenie `online` po dowolnym evencie.
- `WorldBridge` agreguje dostępność domen do `connection`, a ta sama właściwość jest używana jako status transportu, status danych i pośrednio status Hermesa.

### Minimalna poprawka

- Rozdzielić: `lifecycle.connection` (transport klienta), `lifecycle.dataStatus` (fresh/stale/unknown) oraz autorytatywne `agent.presence`/status systemu.
- Reconnecting pokazuje komunikat o możliwie nieaktualnych danych, ale zachowuje ostatni potwierdzony stan Hermesa i workerów.
- Worker dostaje Offline wyłącznie z `presence=offline` albo innego rzeczywistego źródła; nie z błędu EventSource.

## 5. Kompletność historii zdarzeń

### Stan faktyczny

- `server/worldEventHub.js:1-44` przechowuje maksymalnie 500 eventów wyłącznie w pamięci procesu; restart usuwa całą historię.
- `/api/world/events/snapshot` zwraca tylko ten bufor RAM.
- `server.js:259-300` rozpoznaje zakończenia cronów na potrzeby push, ale nie publikuje ich jako world-event i nie zapisuje do historii świata.
- `WorldBridge.js:261-264` kompresuje historię cronów do jednego dopasowanego completion na job.
- `WorldBridge.js:175-186` buduje aktywność wyłącznie z nowych krawędzi tasków i kilku bieżących stanów cronów; przy kolejnym snapshotcie wcześniejsze wpisy nie są trwałym źródłem prawdy.
- `ActivityFeed` pokazuje maksymalnie osiem elementów, ale problem zaczyna się wcześniej — brakujące wpisy nie docierają do modelu UI.

### Minimalna poprawka

- Najpierw test korelacyjny `cron → completion API → activity/history → restart/reconnect`.
- Użyć trwałych completions z istniejącego backendu jako autorytatywnego źródła cronów; nie rekonstruować fikcyjnych wpisów.
- Dodać trwałość zaakceptowanych world-eventów po stronie gatewaya tylko dla bezpiecznych metadanych kontraktu, z limitem i deduplikacją; nie zapisywać treści prywatnych wiadomości.
- Łączyć historię API z live SSE po trwałym `eventId`, z sortowaniem ISO/UTC i bez duplikatów.

### Ryzyko i rollback

- Ryzyko: podwójne wpisy z upstream history i live SSE, prywatne treści, koszt zapisu.
- Ograniczenie: canonical `eventId`, whitelist pól, limit, atomowy zapis, test restartu. Brak backfillu bez wiarygodnego źródła.

## 6. Ruch agentów

### Stan faktyczny

- Ruch jest evidence-backed przez `worldEventReducer`, istniejące trasy i `mapAgentPresentation`.
- Aktualny baseline zawiera naprawę skryptowego patrolu i zachowuje niezmienione waypointy/semantic nodes.
- Ostatni pomiar DOM: pięć kolejnych zmian współrzędnych, bez teleportu; roster 10 map + 2 interior.
- Testy obejmują wejście/wyjście Kowala, powrót, przejęcie ambient przez realny event i jeden pełny cykl.

### Decyzja release

- Nie zmieniać ruchu podczas diagnozy ani przy okazji napraw transportu.
- Uruchomić ten sam prawdziwy scenariusz pięć razy po stabilizacji danych. Zmieniać ruch tylko po odtworzonym błędzie i wyłącznie w istniejącej trasie.

## Kolejność minimalnych commitów demo

1. `fix(build-week): harden shared world event stream lifecycle`
2. `fix(build-week): resync authoritative world state after reconnect`
3. `fix(build-week): refresh building data on every entry`
4. `fix(build-week): separate client transport from Hermes presence`
5. `fix(build-week): retain complete durable world event history`
6. Ewentualny commit ruchu wyłącznie po nieudanym teście 5×.

Żaden z tych commitów nie może zostać przeniesiony na produkcję przed pełną FAZĄ 3 i osobnym GL autora.
