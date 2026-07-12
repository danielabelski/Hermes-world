# HERMES WORLD — CHECKPOINT PIERWSZEJ DZIAŁAJĄCEJ WERSJI

## IMPLEMENTATION WINDOW COMPLETE — 2026-07-11

Ta sekcja zastępuje status wykonawczy niższych sekcji. Visual baseline pozostaje wiążący.

### Completed phases

- Phase 1: `stuck / waiting / thinking` mają osobne markery i rytmy bez zmian FSM. Stuck używa `↛`, kwadratowego markera i wolnego pulsu. Commit `8515bae`.
- Phase 2: critical wiąże konkretny agent → subsystem przez marker, reakcję budynku i pojedynczy problem flow. Commit `2901879`.
- Phase 3: micro-normalization audit zakończony bez zmian; żadna rola nie uzasadnia korekty ±5–8%, globalny baseline 40–46 px pozostaje.
- Phase 4: trzy niedestrukcyjne warianty `baseline/light/strong`; default pozostaje `light`. Commit `a525a65`.
- Phase 5: debug overlay filtruje jednego agenta i warstwy route/nodes/labels/entrances/depth; `all` jest wyłącznie świadomym pełnym auditem. Commit `fc0da54`.
- Phase 6: deterministyczne focusy stable/working/waiting/thinking/warning/critical/stuck/success/offline na tym samym FSM i rendererze.

### Validation

- Tests: `26/26` passed.
- Lint: passed.
- World-life validator: passed.
- Production build: passed, `816` modules.
- Demo build: passed, `816` modules.
- Chronione mapy, geometria, waypointy, trasy, FSM, `server.js` i `src/api.js`: bez zmian.

### Manual mobile URLs

- Focus matrix: `/?focus=stable|working|waiting|thinking|warning|critical|stuck|success|offline`.
- Map variants: `&mapReadability=baseline|light|strong`.
- Debug: `?debugRoutes=1&debugAgent=coder&debugLayers=route,nodes,labels,entrances,depth`.
- Before scale remains available as `&agentVisual=before`, wyłącznie do porównania.

### Remaining decisions, not implementation bugs

- Użytkownik wybiera `light` albo `strong`; strong nie jest auto-approved.
- Użytkownik ocenia na telefonie nowy stuck marker i critical localization.
- Dopiero po tej ocenie dopuszczalne są korekty, bez zmiany globalnej skali i map geometry.

---

## FINAL SAFE CHECKPOINT — MOBILE AGENT BASELINE LOCK

Ta sekcja jest jedynym bieżącym źródłem prawdy. Niższe sekcje są historią wcześniejszych checkpointów.

### Current repository state

- Branch: `main`.
- Checkpoint parent przed dokumentacją: `178f691 add agent comparison and map readability pass`.
- Finalny checkpoint: commit o komunikacie `checkpoint: lock mobile agent scale and observability states`; dokładny hash należy odczytać przez `git log -1 --oneline` po otwarciu następnego okna i jest podany w raporcie końcowym bieżącego okna.
- Working tree przed finalnym commitem zawiera wyłącznie zamierzone aktualizacje dokumentacji checkpointu; po commicie ma być czyste.
- Data checkpointu: `2026-07-11 22:59 CEST`.
- Testy: `21/21` passed.
- World-life smoke validator: passed.
- Lint: passed.
- Demo build: passed, `810` modules.
- Production build: passed, `810` modules.
- Repo nie posiada skryptu `typecheck`; projekt jest JavaScript/JSX, a statyczną kontrolę zapewnia ESLint i build Vite.

### What was completed

- Dwanaście unikalnych, zróżnicowanych ról i `108/108` wymaganych WebP; aktywnych fallbacków brak.
- Globalny baseline skali 40–46 px oraz per-role contact shadows; największe sylwetki zmniejszone o 20–27%.
- Wspólny foot anchor `y=124/128`, Y-sort po stopach i minimalne foreground occlusion.
- Semantyczne waypointy oraz trasy desktop/mobile dla wszystkich ról.
- Pełny flow Kowala, Uczonego i Zwiadowcy: droga, wejście/próg, praca/observe, wyjście i powrót.
- Statusy idle/walking/working/thinking/waiting/success/warning/error/stuck/offline w istniejącym wspólnym systemie.
- Warning: bursztynowy globalny health, lokalny marker i karta ostrzeżenia.
- Critical: czytelny czerwony globalny status, alert count i scenariusz error.
- Stuck: odrębny stan domenowy, safe point i wolny ring; jego marker nadal wymaga dopracowania.
- Success: krótkotrwały impuls/karta bez stałej aury.
- Reakcje Kuźni, Biblioteki, Wieży i Core oraz aktywne/waiting/problem data flows.
- Debug routes `?debugRoutes=1`, domyślnie wyłączony.
- Deterministyczne scenariusze `healthy/warning/critical` i live before/after `?agentVisual=before`.
- Mobile UI polish: ograniczony tłok agentów, toast odsunięty od health ribbon, punkty z dachów/fasad poprawione przed baseline lockiem.
- Odwracalny CSS readability pass bez modyfikacji assetu ani geometrii mapy.
- Testy kontraktu sprite'ów, skali, statusów, routingu, wejść, return cycle i scenariuszy observability.

### Accepted decisions

- Aktualna mniejsza skala wygrywa i jest globalnym baseline'em. Nie wracać do większych agentów.
- Późniejsze korekty dotyczą wyłącznie pojedynczych ról i mieszczą się około ±5–8%.
- Nie rollbackować nowych, zróżnicowanych postaci ani nie wracać do identycznych kapturów.
- Aktualna niebiesko-granatowa mapa pozostaje. Nie wracać do złotej mapy.
- Mapę poprawiać wyłącznie niedestrukcyjnie przez CSS/compositing/overlaye.
- Warning zachować bez zmiany podstawowej gramatyki.
- Globalny critical zachować; w następnym oknie poprawić lokalizację konkretnego agenta i subsystemu.
- Stuck odróżnić od waiting/thinking bez przebudowy FSM i bez dużych aur.
- Success zachować jako krótki sygnał potwierdzenia.
- Debug overlay zachować jako dev-only, domyślnie wyłączony.
- North Star: fantasy/AI jest językiem prezentacji, observability jest produktem.

### Known issues

- Mapa nadal jest tonalnie gęsta, miejscami za ciemna i zbyt niebieska; istniejący lekki CSS pass jest odwracalny, ale kolejne warianty wymagają decyzji użytkownika.
- Drogi i place wymagają dalszej oceny czytelności na realnym telefonie, nie zmiany geometrii.
- Pojedyncze postacie mogą wymagać korekt maksymalnie około ±5–8%.
- Critical nie wskazuje jeszcze wystarczająco bezpośrednio pary agent → budynek/subsystem.
- Stuck jest wizualnie niejednoznaczny; symbol nie może przypominać waiting/thinking.
- Debug overlay pokazuje wszystkie etykiety naraz i potrzebuje filtrowania po jednym agencie oraz osobnych toggli.
- Finalna macierz mobile wymaga ręcznego product testu stable/working/waiting/thinking/warning/critical/stuck/success/offline.

### Do not touch

- Asset, layout, crop, proporcje i geometria aktualnej mapy.
- Budynki, drogi, wejścia, waypointy, semantic nodes, trasy, depth zones oraz punkty `home/safe/work`, chyba że wykryto konkretny błąd.
- Działający FSM i architektura statusów.
- Nowe zróżnicowane role oraz aktualna mniejsza skala jako globalny baseline.
- `server.js`, `src/api.js`, Hermes OS CAT i kontrakty API.
- Nie generować nowej/złotej mapy, nie dodawać game mechanics, nie przebudowywać rendererów ani całej architektury.

### Exact resume instructions

1. Przeczytaj workspace `AGENTS.md`/instrukcje sesji.
2. Przeczytaj `NEXT_WINDOW_HANDOFF.md` od tej sekcji.
3. Przeczytaj `docs/HERMES_WORLD_VISUAL_BASELINE.md`.
4. Przeczytaj `docs/NORTH_STAR_EXECUTION_PLAN.md`, sekcję `NEXT WINDOW — locked execution order`.
5. Sprawdź `git status`, `git diff` i `git log -3 --oneline`.
6. Uruchom poniższe testy i build.
7. Zacznij wyłącznie od Phase 1: stuck vs waiting vs thinking.
8. Nie powtarzaj zakończonych auditów sprite'ów, routingu, waypointów, map identity ani produktu.
9. Nie zaczynaj ponownie planowania produktu i nie implementuj Phase 2 przed domknięciem Phase 1.

### Exact commands

```powershell
npm.cmd test
npm.cmd run validate:world-life
npm.cmd run lint
npm.cmd run build
npm.cmd run build -- --mode demo
```

Repo nie definiuje osobnego `typecheck`; nie instalować TypeScript tylko dla uzyskania dodatkowej komendy.

---

## AKTUALIZACJA NORTH STAR — 2026-07-11

Ta sekcja jest nadrzędna wobec historycznego checkpointu poniżej. Nie analizuj projektu od początku, nie zmieniaj kolejności planu i nie cofaj wykonanej pracy.

### TARGETED NORMALIZATION + READABILITY PASS

- Atomowy checkpoint normalizacji skali: `50590ef normalize map-agent visual scale`.
- Dwanaście ról zachowuje te same assety, kolory, narzędzia, statusy, pozycje i trasy.
- Alpha audit potwierdził wspólny foot anchor `y=124/128`; anchor correction pozostaje `0` dla wszystkich ról.
- Efektywne wysokości środkowe są testowane w przedziale `40–46 px` zamiast wcześniejszych `46–57 px`.
- Największe redukcje: Komandos/Kasztelan `-27%`, Uczony `-24%`, Herold `-21%`, Kowal `-20%`.
- Wspólny łagodny profil saturation/contrast/brightness uspokaja ilustracyjność bez tintowania roli lub statusu.
- Cień jest mniejszy, wspólny i skalowany do szerokości konkretnej sylwetki.
- Live before/after: zwykły URL pokazuje normalizację; `?agentVisual=before` odtwarza poprzednią efektywną skalę bez zmiany world position.
- Controlled map pass pozostaje odwracalnym CSS: lekko jaśniejsze cienie, słabszy blue cast i lokalne rozjaśnienie realnych dróg/placów.
- Główny asset mapy, crop, geometria, wejścia, waypointy, trasy, depth zones, FSM i API są bez zmian.
- Waiting flow jest subtelną linią przerywaną; dormant pozostaje niewidoczny, warning/error zachowują amber/red.
- Deterministyczne mobile fixtures: `?scenario=healthy`, `?scenario=warning`, `?scenario=critical`.
- Raport pomiarowy i checklist: `docs/AGENT_NORMALIZATION_REPORT.md`.
- Ostatnia walidacja: `21/21` testów, world validator, lint i demo build (`810` modułów) — wszystko zielone.
- Zakaz automatycznej serii Chrome pozostaje. Finalna ocena odbywa się na jednym preview LAN.

- Checkpoint stanów i infrastruktury: `ef25ab9 refine observability states and subsystem signals`.
- Checkpoint kompletnego rosteru: `4ea5f60 integrate semantic routes and twelve map-agent identities`.
- Dokładny dalszy plan: `docs/NORTH_STAR_EXECUTION_PLAN.md`.
- Wszystkie 12 ról ma unikalny zestaw mapowych sprite'ów; 108/108 WebP istnieje, aktywnych fallbacków brak.
- Mapa v2, `server.js`, `src/api.js`, Hermes OS CAT i API nie zostały zmienione.

### Dowiezione po poprzednim handoffie

- Semantyczne trasy desktop/mobile i domyślnie wyłączony `?debugRoutes=1`.
- Pełny cykl Kowala oraz wspólny resolver Uczonego i Zwiadowcy, wraz z wejściem, pracą, wyjściem, powrotem i safe point.
- Jeden renderer, anchor stóp 124/128, Y-sort po stopach, per-role contact shadow i minimalne foreground occlusion.
- Bazowa wysokość 52 px; fallback/default 50 px. Osobny start Zwiadowcy i czytelniejsze lane offsets.
- Cztery ambientowe punkty z dachów/fasad przeniesiono, a home/safe/work zatłoczonych ról rozdzielono.
- Statusy `idle/walk/work/thinking/waiting/success/warning/error/stuck/offline` bez hologramów i dużych aur.
- Ranking tasków gwarantuje, że aktualne `pending/waiting` nie przegrywa ze starym `done`.
- Kuźnia/Biblioteka/Wieża/Core reagują semantycznie; dormant flows są ukryte, warning/error mają osobne kolory.
- Odwracalny tonalny pass działa przez CSS; assety mapy nie zostały nadpisane.
- Toast nie nachodzi już na dolny health ribbon.

### Ostatnia walidacja

- `npm test`: 20/20.
- `npm run validate:world-life`: passed.
- `npm run lint`: passed.
- `npm run build -- --mode demo`: passed, 810 modułów.
- Zachowane screenshoty: mobile idle, research, patrol, all-12/debug i desktop. Wadliwy headless capture Kuźni nie jest dowodem walidacyjnym.
- Nie uruchamiać ponownie automatycznej serii Chrome. Sprawdzono 0 procesów headless; preview ma być dokładnie jeden i służyć ręcznej ocenie telefonu.

### Następny checkpoint

1. Uruchomić jeden preview `0.0.0.0:4175` po zielonych testach.
2. Użytkownik podaje `GL` albo `RL`.
3. `RL`: poprawić wyłącznie wskazane elementy.
4. `GL`: przejść do global health, queue/overload per subsystem i drill-down na prawdziwych danych.
5. Po ocenie zatrzymać preview i potwierdzić brak listenera.

### Twarde zasady

- Zero nowych generacji obrazów. Jeśli brakuje assetu, przekazać użytkownikowi dokładny prompt/format.
- Nie uruchamiać automatycznych serii Chrome/headless.
- Nie tworzyć gry, losowego ruchu, wnętrz ani nowego pathfindingu.
- Ruch oznacza aktywność operacyjną; kliknięcie jest tylko drill-downem.

---

Pracuj na aktualnym stanie repozytorium. Nie analizuj projektu od początku i nie zmieniaj architektury. Mapa v2 ma GL i jest zablokowana. Nie modyfikuj `server.js`, `src/api.js`, kontraktów API ani assetów mapy. Duże ilustracje pozostają wyłącznie portretami UI.

## Stan na 2026-07-11

- Task 0–14 z `docs/NEXT_WINDOW_MAP_AGENTS.md` zostały wykonane.
- Task 15 osiągnął działające demo desktop/mobile dostępne w LAN; użytkownik uznał je za pierwszą zadowalającą wersję i solidny vertical slice, ale nie za finalny polish.
- Oddzielna warstwa `MapAgentLayer` renderuje małe, purpose-built sprite’y. Portrety z `/heroes/` są odrzucane przez asercję manifestu.
- Kowal, Uczony i Zwiadowca mają data-driven cykle drogi, wejścia, pracy, wyjścia i powrotu. Pozostałe profile korzystają z neutralnego małego fallbacku.
- Tap otwiera UI z dużym portretem. Kamera obsługuje desktop drag/wheel oraz mobile pan/pinch z progiem tap/drag.
- Jest jeden wspólny clock animacji, culling/LOD, pauza po `visibilitychange` oraz lokalne efekty Kuźni, Archiwum i posterunku.
- Ostatnia pełna walidacja: 15/15 testów, lint, world validator, walidator 36 sprite’ów i produkcyjny build — wszystko zielone.
- Sprawdzone hashe potwierdziły brak zmian w `server.js`, `src/api.js` oraz obu assetach mapy v2.

## Obecny milestone — wyłącznie polish agentów

1. Zmniejszyć agentów o około 10–20%, zachowując zależność skali od pozycji Y.
2. Dopracować foot anchor, `yOffset` i mały miękki cień dokładnie pod stopami.
3. Skalibrować osobne waypointy desktop/mobile, progi i safe points Kowala, Uczonego i Zwiadowcy bez zmiany mapy ani state machine.
4. Wzmocnić rozróżnialność trzech ról przez wspólny config: sylwetka, postura, narzędzie, tempo i sposób stania; bez osobnych rendererów.
5. Dopiero po GL dla tej trójki rozszerzyć poprawny schemat konfiguracyjny na pozostałych 9 agentów.
6. Na końcu uruchomić testy i build, a następnie dokładnie jeden preview LAN do oceny na telefonie.

## Reguła checkpointów

- Podczas implementacji i testów preview ma być wyłączony.
- Każdy checkpoint uruchamiać jako jeden serwer na `0.0.0.0`, dostępny z telefonu w tej samej sieci Wi-Fi.
- Użytkownik ocenia `GL` lub `RL`. Nie uznawać checkpointu za zaakceptowany samodzielnie.
- Po ocenie wyłączyć serwer i potwierdzić brak listenera.

## Pliki kluczowe

- `src/components/map-agents/MapAgentSprite.jsx`
- `src/components/map-agents/MapAgentSprite.css`
- `src/components/map-agents/MapAgentLayer.jsx`
- `src/world/data/mapAgentManifest.js`
- `src/world/data/roadGraph.js`
- `src/world/mapAgentPresentation.js`
- `src/world/mapAgentPresentation.test.js`

## Zakazy

- Nie zmieniać ani nie generować mapy v2.
- Nie modyfikować Hermes OS CAT, `server.js`, `src/api.js` ani API.
- Nie wracać do dużych postaci/duchów na mapie.
- Nie tworzyć 12 rendererów ani 12 rozjechanych implementacji.
- Nie uruchamiać więcej niż jednego serwera.

## Następna decyzja produktowa

- `GL`: trójka jest wzorcem; tworzyć własne sprite’y/config dla pozostałych 9 ról, potem ożywienie mapy i finalny polish.
- `RL`: poprawić wyłącznie wskazane problemy trójki przed rozszerzaniem rosteru.

## NEXT ACCOUNT / WINDOW RESUME — MAP READABILITY + OBSERVABILITY POLISH

### Progress after plan checkpoint

- Task 0 baseline: preview 4175 stopped; tests, validator and lint passed. Production and demo builds passed outside the sandbox after the shared Vite cache returned a sandbox-only `EPERM`.
- Task 2 hierarchy implemented: `critical > warning > stuck > success > info` now selects the main moment card. Active alert/stuck replaces concurrent success visually; success remains in activity history/ticker.
- Added pure resolver `src/world/worldMomentPriority.js` and conflict tests. Current suite: `27/27`.
- First remaining task: Task 1 final non-destructive readability tuning, then Task 3 regression and Task 4 debug numbering.

### POLISH PASS COMPLETE — 2026-07-12

- `61a77ce`: wdrożona hierarchia głównego komunikatu `critical > warning > stuck > success > info`.
- `c4f7662`: dopracowany odwracalny wariant light; łagodniejszy filtr globalny i lokalne maski osi, placów oraz wejść. Baseline i strong pozostają dostępne; strong nadal wymaga GL.
- `f2882c2`: debug jednej trasy numeruje punkty, skraca nazwy, zachowuje pełne nazwy w `<title>` i obsługuje osobne home/safe/work/depth/occlusion. `?focus=` sam uruchamia deterministyczny tryb demo.
- Naprawiono eskalację widocznego success do nowego alertu/stuck także bez nowego wpisu activity.
- Audyt 12 agentów: wszystkie 40–46 px, foot anchor 124/128, komplet shadowScale i poprawny Y-sort; brak podstaw do micro-korekt.
- Finalna walidacja: `29/29`, world-life validator, lint, production build i demo build (`819` modułów) — zielone.
- Chronione: mapa/assety/geometria, waypointy, routing, FSM, `server.js`, `src/api.js`, Hermes OS CAT i API bez zmian.
- Pozostała wyłącznie ręczna ocena użytkownika GL/RL na jednym preview LAN: light kontra baseline/strong, stuck/critical oraz debug Kowala.

Ta sekcja jest bieżącą instrukcją wznowienia i ma pierwszeństwo przed historią niżej.

### Repository state

- Branch `main`; HEAD `f8239ba complete mobile observability validation matrix`.
- Working tree przed aktualizacją dokumentów było czyste.
- Jeden ręczny preview LAN działa na `0.0.0.0:4175`, PID 2308. Następne okno zatrzymuje go przed implementacją i nie uruchamia kolejnego do finalnej walidacji.
- Ostatnia walidacja: testy `26/26`, lint, world-life validator, production build i demo build — zielone.

### Ukończone — nie powtarzać

- `8515bae`: thinking/waiting/stuck bez zmian FSM.
- `2901879`: critical agent→subsystem i jedna linia problemowa.
- Micro-normalization audit: brak outlierów; baseline 40–46 px.
- `a525a65`: `mapReadability=baseline|light|strong`, default light.
- `fc0da54`: filtrowany debug jednego agenta.
- `f8239ba`: focusy stable/working/waiting/thinking/warning/critical/stuck/success/offline.
- Geometria, waypointy, routing, FSM, backend/API i assety mapy nietknięte.

### Pierwszy niezakończony problem

Po safe resume kontynuować finalny readability pass i wdrożyć hierarchię `critical > warning > stuck > success > info`. Success nie może być główną zieloną kartą przy aktywnym critical, warning albo stuck.

### Locked order

0. Safe resume, wyłączenie preview i pełny baseline test/build.
1. Finalny niedestrukcyjny readability pass; strong tylko po GL.
2. Hierarchia komunikatów wraz z testami konfliktów.
3. Walidacja regresyjna statusów i critical localization, bez redesignu.
4. Debug Kowala: numery, krótkie nazwy, home/safe/work i occlusion toggles.
5. Micro-normalization tylko przy dowodzie na konkretny outlier.
6. Dziesięć scen mobile i baseline/light/strong before/after.
7. Pełna walidacja, checkpoint, dokumenty i dokładnie jeden preview do GL/RL.

Pełny plan i DoD: końcowa, nadrzędna sekcja `NEXT WINDOW — MAP READABILITY + OBSERVABILITY POLISH PASS` w `docs/NORTH_STAR_EXECUTION_PLAN.md`.

### Hard locks

- Bez rollbacku, nowej mapy/estetyki/assetów, globalnej zmiany skali, zmian FSM i architektury.
- Bez zmian geometrii, cropu, dróg, wejść, waypointów, routingu, depth zones i home/safe/work.
- Bez zmian `server.js`, `src/api.js`, Hermes OS CAT i API.
- Bez subagentów, serii Chrome/headless, kilku serwerów, game mechanics i losowego ruchu.
- Preview off podczas pracy; dokładnie jeden dopiero po zielonych testach i commicie.

### Exact commands

```powershell
npm.cmd test
npm.cmd run validate:world-life
npm.cmd run lint
npm.cmd run build
npm.cmd run build -- --mode demo
```

Repo nie ma osobnego `typecheck`; nie instalować TypeScript.

---
## FINAL MOBILE BASE CHECKPOINT — 2026-07-12

Ta sekcja jest nadrzędnym źródłem prawdy dla następnego okna.

### Repository

- Branch: `main`.
- Kod produktu: `f0ad1c1 feat: finalize mobile Hermes Citadel presentation`.
- Working tree przed dokumentacyjnym checkpointem: czyste.
- Testy: `31/31`.
- Lint: passed.
- World-life validator: passed.
- Production build: passed, `820` modules.
- Demo build: passed, `820` modules.

### Completed in this window

- Mapa: jawne presety `light=production`, `strong=showcase`, `baseline=fallback`; `mapVariant` jest nazwą docelową, stare `mapReadability` pozostaje kompatybilne.
- Tożsamość: Cytadela/Archiwum/Kuźnia/Wieża mają jawne role systemowe. Kuźnia to `build-load-throughput` z neutralnym żarem oraz working/warning-stuck/critical.
- Postacie: jeden produkcyjny renderer `WorldFallback → MapAgentLayer → MapAgentSprite`; Pixi ma `renderAgents=false`. Usunięto tymczasowy `agentVisual=before`. Wszystkie postacie są transparentnymi WebP z manifestu map-agents.
- Stany: thinking `⌬` z orbitą, waiting `◷`, stuck `↛`, working aktywny ring, warning/critical zachowane, success krótkotrwały, offline wyciszony. Lokalny priorytet nie pozwala success przykryć alertu.
- UI mobile: lżejszy header, kompaktowy insight panel, ticker pokazuje jedną wiadomość w dwóch liniach bez losowego truncation.
- Integracja: activity i alerts korzystają ze wspólnego deduplikowanego strumienia z rankingiem `critical > warning > stuck > success > info`.
- Cleanup: culling respektuje tę samą hierarchię; compatibility Pixi nie mapuje warning/stuck na thinking.
- Chronione assety mapy, geometria, waypointy, routing, FSM, `server.js`, `src/api.js`, Hermes OS CAT i API: bez zmian.

### Accepted production setup

- Default: `?mapVariant=light` lub brak parametru.
- Showcase/marketing: `?mapVariant=strong`.
- Low-intensity/fallback: `?mapVariant=baseline`.
- Deterministyczna macierz oceny: `?focus=stable|working|thinking|waiting|stuck|warning|critical|success|offline`.
- Demo fixtures używają tych samych rendererów i resolverów co tryb live; różni je źródło snapshotu.

### NEXT WINDOW — exact locked order

1. Przeczytać `AGENTS.md`, tę sekcję, visual baseline i końcową sekcję planu.
2. Sprawdzić `git status`, `git log -5`, testy i oba buildy; nie powtarzać audytów mapy, sprite'ów, skali, routingu ani produktu.
3. Uruchomić dokładnie jeden preview LAN i uzyskać od użytkownika GL/RL dla: light, Kuźni, thinking/waiting/stuck, tickera i top UI.
4. RL: poprawić wyłącznie wskazane elementy, bez zmiany mapy/geometrii/globalnej skali/architektury.
5. GL: przejść do production-data binding audit — sprawdzić istniejący WorldBridge dla realnych health/agents/tasks/alerts/logs bez zmiany API.
6. Ujednolicić tylko brakujące adaptery live→presentation, jeśli istnieją dowodowe różnice względem fixtures. Nie dodawać fałszywej telemetrii.
7. Wykonać mobile performance/accessibility smoke: 390×844, większy mobile, desktop; reduced motion, offline, focus/tap, brak podwójnego renderingu.
8. Pełne testy/buildy, checkpoint i zaktualizowany handoff. Jeden preview tylko na końcu.

### Do not touch

- Nie generować nowej mapy ani postaci.
- Nie zmieniać map assets, cropu, geometrii, waypointów, routingu, FSM, skali globalnej i anchorów bez konkretnej regresji.
- Nie modyfikować `server.js`, `src/api.js`, Hermes OS CAT ani kontraktów API bez osobnej zgody.
- Nie włączać drugiego renderera agentów, nie dodawać mechanik gry, serii Chrome/headless ani wielu serwerów.
- Nie wracać do `agentVisual=before`, identycznych kapturów, hero cutoutów i wielkich aur.

### Exact commands

```powershell
npm.cmd test
npm.cmd run validate:world-life
npm.cmd run lint
npm.cmd run build
npm.cmd run build -- --mode demo
```

---
## ACTIVE DIRECTIVE — FINISH TODAY AFTER GL

Nie odkładać production integration na abstrakcyjne „następne okno”. Bieżący checkpoint ma zostać pokazany użytkownikowi do GL/RL. Po GL natychmiast kontynuować — także po przelogowaniu/limicie — aż do ukończenia production-data binding dzisiaj.

### Current pre-hackathon baseline

- BASELINE jest produkcyjnym defaultem; lekko poprawiono brightness/road separation bez zmiany assetu/geometrii.
- LIGHT jest fallbackiem, STRONG opcjonalnym showcase.
- Stable jest czysty: kontekstowy ticker i insight są ukryte w spoczynku.
- Working ma czytelniejszy lokalny puls i aktywność.
- Thinking ma analityczny glyph `⌬`, orbitalny marker i dotted ring.
- Waiting ma spokojny `◷` oraz neutralny dashed rhythm.
- Success ma krótki check/glint i rozszerzający się zielony ring.
- Online nie jest osobnym stanem sceny; jest atrybutem `lifecycle.connection` / `data-connection`.
- Stable/Warning/Critical/Offline/Stuck pozostają bez szerokiego redesignu.
- Walidacja: 31/31, lint, validator, production build i demo build (820 modułów) zielone.

### Mandatory action after user GL

1. Wyłączyć preview i potwierdzić zero listenerów.
2. Prześledzić prawdziwy przepływ `useWorldBridge → WorldBridge/API snapshot → worldStore → presentation`.
3. Zbudować tabelę faktycznie dostępnych danych: global health, lifecycle/connection, agents, tasks, alerts, activity/logs, subsystem ownership.
4. Podłączyć finalną warstwę wizualną do realnych snapshotów przez minimalne adaptery; fixtures pozostają tylko testami.
5. Nie zmieniać `server.js`, `src/api.js` ani kontraktów API bez osobnej zgody. Brakujące dane oznaczyć jako brak kontraktu, nie symulować.
6. Zweryfikować dziewięć stanów na danych odpowiadających live contract, reconnect/offline, alert priority i agent→subsystem.
7. Testy, oba buildy, mobile smoke, produkcyjny checkpoint, aktualny handoff i dokładnie jeden końcowy preview.
8. Nie kończyć samym audytem ani planem. Dowieźć działające production binding dzisiaj.

---
## HACKATHON PRODUCT HANDOFF — VISUAL V1 GL / PRODUCTION INTEGRATION ACTIVE

### Binding decision

- User GL: final visual pre-hackathon base approved on 2026-07-12.
- BASELINE is locked as the production default.
- LIGHT remains an alternate fallback; STRONG remains optional showcase only.
- Working/Thinking/Waiting/Success polish, clean Stable view, state hierarchy, mobile ticker/UI and one-renderer agent system are accepted.
- Do not reopen map identity, map geometry, global sprite scale, renderer choice or the state art direction without a concrete regression.

### Product truth for the hackathon

Hermes Citadel / Hermes Heroes is an ambient observability interface for the real Hermes agent system. Real profiles, tasks, logs, metrics, cron state, sessions, models and skills are the source of truth. The map, agents, buildings, flows and effects are presentations of that telemetry. Demo fixtures exist only for deterministic testing and screenshots.

### Active milestone — must finish today

Move the accepted visual layer onto the real production data path. Start by reading the existing Hermes OS Cat implementation and its handoff because CPU, temperature, profiles/agents and other data mappings already exist there. Do not redesign contracts or invent replacements before verifying that implementation.

Required order:

1. Stop preview; keep zero servers during implementation.
2. Audit Hermes OS Cat data sources, endpoints, response shapes, auth/proxy behavior and refresh cadence.
3. Audit existing Citadel `api.js → useWorldBridge → WorldBridge → worldStore → presentation` against Cat.
4. Produce an exact source-to-world mapping and classify: ready / adapter needed / unavailable.
5. Implement only missing adapters and integration glue; reuse the established Cat contract.
6. Default URL without `demo=1` and without `focus=` must use real data and clearly expose live/stale/offline provenance.
7. Never silently replace failed live telemetry with demo data. Demo must remain explicit.
8. Verify global health, CPU, memory, temperature, profiles, tasks, logs/alerts, crons, sessions/cost, models, skills, connection/reconnect and agent→subsystem ownership.
9. Validate all nine visual states on live-shaped contract fixtures and available real endpoints.
10. Full tests/lint/validator/builds, protected diff, production checkpoint and exactly one final LAN preview.

### Hard constraints

- Preserve accepted BASELINE visual GL.
- Do not modify map assets, geometry, crop, waypoint graph, routes, anchors or global agent scale.
- Do not enable a second agent renderer.
- Do not fabricate missing telemetry.
- Do not modify `server.js`, `src/api.js` or API contracts until the Cat audit proves a minimal change is required; document and request authority if it is materially broader.
- No game mechanics, asset generation, Chrome/headless screenshot series or multiple servers.

---
## PRODUCTION CITADEL COMPLETE — HACKATHON BASE

This section supersedes earlier active-milestone instructions.

### Final state

- Visual V1 GL remains locked: BASELINE production default, LIGHT fallback, STRONG showcase.
- Production data skeleton was confirmed to have existed since `3b6754a`; there was no hidden finished branch or Cat patch to cherry-pick.
- Cat `server.js` and Citadel `server.js` are byte-identical. Citadel `api.js` is the safer Cat-compatible version with strict reads and domain-aware failures.
- Default `/` is live. Fixtures require explicit demo/focus configuration.
- Login callback bug fixed; successful password login enters Citadel with the authenticated same-origin cookie.
- Metrics sync every 5s; 15s/60s domains retain independent caches.
- Blocked tasks localize to agent/building; failed cron localizes to Clock Tower.
- Sessions count as active only when streaming/recent. Skills are global capability data; per-agent skill ownership remains unknown instead of fabricated.
- Unknown Hermes profiles are counted but not rendered with invented identities.
- Cat-shaped live payload and stale→recovery integration tests added.
- New Citadel-specific login/start screen and lightweight SVG PWA mark replace Cat/Matrix branding.

### Verification

- Tests: `33/33` passed.
- Lint: passed.
- World-life validator: passed.
- Production build: passed, `812` modules; built last into `dist`.
- Demo build: passed, `812` modules.
- Production server smoke on `0.0.0.0:4175`: root, manifest, icon, auth status and real host metrics HTTP 200.
- Real metrics returned CPU, RAM and Core Temp sensor data.
- Profiles/tasks/logs/crons/sessions/skills/models correctly returned 401 before login, proving auth boundary rather than silent demo fallback.
- Exactly one production listener left running for phone verification.
- Protected map assets/geometries/routes/FSM and `server.js`/`src/api.js` unchanged.

### Commits

- Visual pre-hackathon GL: `b80a453`.
- GL/hackathon milestone lock: `47a7ac0`.
- Production telemetry/onboarding implementation: `e2230c2`.
- Final Citadel PWA identity/service worker: `39495cb`.
- Final documentation checkpoint: read `git log -1` after this document commit.

### Data contract

Read `docs/HACKATHON_PRODUCTION_DATA_MAP.md`. It is the canonical source→adapter→visual mapping and lists telemetry that must remain unavailable rather than simulated.

### Remaining work after this checkpoint

Only authenticated phone verification and targeted defects found there. Do not restart map/status/UI design. Future post-baseline APIs may add queue/RAG/latency/tracing, but they are not authorized or required for this hackathon base.

---
