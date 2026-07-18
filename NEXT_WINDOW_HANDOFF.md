# HERMES WORLD — CHECKPOINT PIERWSZEJ DZIAŁAJĄCEJ WERSJI

## ACTIVE HANDOFF — MAP-PIXEL WATER GATE (2026-07-16 13:45 CEST)

Ta sekcja zastępuje wcześniejszy aktywny opis wody. Produkcja pozostaje zamrożona.

### Stan i decyzja

- Repo/branch: `hermes-os-living-world-demo` / `build-week/hermes-world`.
- Commit funkcjonalny: `97fb9ff` (`fix(build-week): animate water from exact map pixels`).
- Manualny retest `97fb9ff`: **RL** — koryta były trafione, ale sinusoidalny displacement unosił cały wycinek i poruszał fragmentami murów.
- Korekta: `c10f531` (`fix(build-week): keep water banks and architecture stationary`). Usunięto całe przestrzenne przesuwanie źródła. Brzegi i piksele architektury są nieruchome; porusza się jedynie jednokierunkowa modulacja światła w konserwatywnie zawężonych kanałach.
- Autor nadał poprzedniemu wariantowi maska + generyczna tekstura **RL**: mimo lepszej geometrii nadal wyglądał jak drobny deszcz i był dopasowany percepcyjnie na około 1%.
- Aktywny renderer nie używa już żadnego ribbonu, pełnej trasy, przesuwanej kreski, SVG ani powtarzalnego wzoru.
- Nowa metoda animuje bezpośrednio piksele dwóch zamrożonych map. Granica wody jest stała; pomiędzy ośmioma klatkami zmienia się wyłącznie próbkowanie wnętrza nurtu.
- Mobile ma dwa osobne wycinki zewnętrznych koryt: lewy i prawy. Desktop ma osobny wycinek zatoki. Nakładki używają tego samego filtra tonalnego co mapa.
- Wszystkie pliki to lekkie animowane WebP z alfa, bez JS timerów i bez dodatkowego canvasu: 29 210 B, 19 322 B i 23 134 B; razem 71 666 B.
- `prefers-reduced-motion` całkowicie ukrywa warstwę animowaną i pozostawia niezmienioną mapę bazową.

### Walidacja automatyczna

- Fokus: 24/24 PASS.
- Pełny zestaw: 136/136 PASS.
- Lint: PASS.
- `validate:world-life`: PASS.
- Build: PASS, 877 modułów, 3,41 s przez `--configLoader native` po znanym środowiskowym locku Vite.
- Main JS: 417,84 kB / 128,19 kB gzip; CSS: 75,44 kB / 16,24 kB gzip.
- Jeden istniejący serwer demo 4176 podaje nowy build i animowany asset HTTP 200. Nie uruchomiono drugiego serwera ani przeglądarki.
- Manualna ocena telefonu: **PENDING**. Nie promować do produkcji przed GL autora.

### Następne działanie

1. Autor ocenia jedno demo: `http://100.69.167.105:4176/?demo=1`.
2. RL: poprawić wyłącznie percepcyjny defekt tej warstwy albo świadomie usunąć wodę; nie wracać do kresek/ribbonów.
3. GL: wykonać commit dokumentacyjny/checkpoint, a potem rozpocząć na demo audyt `REAL EVENT VISUAL CHAIN + HONEST AMBIENT LIFE` opisany niżej.
4. Produkcji, API, `server.js`, Hermes OS CAT, portów i Tailscale nie dotykać.

---

## WATER REFLECTION VFX REVIEW GATE — 2026-07-16 15:53 Europe/Warsaw

Scope: demo branch `build-week/hermes-world` only. Production remains untouched.

### Current implementation

- The failed full-water animated WebPs were removed from the runtime and repository.
- Water now uses seven mobile and three desktop code-native reflections. They are small irregular light patches, never full paths, and move only 7–11 px using transform/opacity.
- The three unrelated center-map “comets” from semantic conduits are disabled. Real message/delegation transit remains evidence-backed in `WorldOperationsLayer`.
- Automated verification: tests 136/136 PASS, lint PASS, world-life validation PASS, build PASS (874 modules, 3.99 s).
- Manual real-phone evaluation is still required. Do not label this GL automatically.

### Decision gate

1. Start exactly one demo preview on port 4176 after tests.
2. User checks `?demo=1` on the real phone.
3. GL: keep the reflections and close water polish.
4. RL: remove `PersistentWaterReflections` and its CSS completely; do not attempt another water technique.

### Next product task after the water decision

Design, before implementation, an honest “living observability demo” strategy. Any staged demo activity must be explicitly demo-only, must never enter real `operationalState`, active-agent counters, evidence IDs or Hermes events, and must be visually distinguishable from live telemetry. Preserve the real pipeline as the source of truth.

---

## ACTIVE HANDOFF — PIXEL-ALIGNED WATER + NEXT REAL-EVENT LIFE PASS (2026-07-16 13:10 CEST)

Ta sekcja jest aktualnym źródłem prawdy. Niższe sekcje pozostają historią projektu.

### Repo i granice

- Repo demo: `hermes-os-living-world-demo`.
- Branch: `build-week/hermes-world`.
- Ostatni commit funkcjonalny: `539144663bf789e1e5ad71d25cb4f40458222e25` (`fix(build-week): align flowing water to map geometry`).
- Produkcja pozostaje nietknięta. Nie promować niczego bez osobnego GL po manualnym teście demo.
- Nie zmieniać mapy bazowej, geometrii, cropu, waypointów, tras, FSM, API, `server.js`, portów ani Tailscale.

### Co właśnie ukończono na demo

- Poprzednia woda z ośmiu/sześciu przybliżonych prostokątnych regionów otrzymała jednoznaczny **RL** od autora i została usunięta.
- Nowe maski zostały wyprowadzone z pikseli dwóch faktycznie renderowanych map: mobile `941×1672` oraz desktop `1535×1024`. Mobile obejmuje wyłącznie zewnętrzne koryta i wodospady; desktop wyłącznie zatokę pod murami.
- Runtime maski są lekkimi RGBA: mobile `470×836`, 43 967 B; desktop `767×512`, 8 479 B. Kierunkowy wariant pionowy tekstury ma `256×1024`, 39 202 B.
- Dwa poziomy transform-only: wolniejszy głęboki nurt i szybsze refleksy. Brak JS timera, SVG turbulence, prostokątnych clipów, pełnych linii, pasków i ruchu poza maską.
- CSS maskuje pełną warstwę 1:1 do mapy; mobile płynie pionowo ku wodospadom, desktop poziomo przez zatokę. Reduced motion zachowuje statyczny, spokojny substytut.

### Walidacja

- Test fokusowy: 24/24 PASS.
- Pełny `npm.cmd test`: 136/136 PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run validate:world-life`: PASS.
- `npm.cmd run build`: PASS, Vite 8.0.16, 878 modułów, 6,31 s.
- Main JS: 417,70 kB / 128,09 kB gzip — mniej niż poprzednie 420,45 kB / 129,06 kB gzip.
- CSS: 77,47 kB / 16,58 kB gzip.
- Manualna percepcyjna ocena nowej wody na telefonie: **PENDING — nie oznaczać GL przed testem autora**.

### Najnowszy feedback autora o żywotności

- Prawdziwa wiadomość uruchomiła ruch Kowala do celu i powrót, więc podstawowy evidence-backed lifecycle działa.
- Odbiór nadal nie wygląda jak pełny „żywy event”; większość czasu agenci pozostają bezczynni, przez co świat sprawia wrażenie martwego.
- Nie każda wiadomość ma automatycznie budzić Kowala. Worker musi wynikać z prawdziwego mapowania/delegacji.
- Następny zakres po GL wody: **REAL EVENT VISUAL CHAIN + HONEST AMBIENT LIFE**, nadal wyłącznie na demo:
  1. realny pakiet wejściowy z bramy do Cytadeli;
  2. widoczna reakcja Kasztelana i command point;
  3. sygnał do faktycznie wybranego subsystemu;
  4. ruch wyłącznie właściwego workera i reakcja jego budynku;
  5. terminalny rezultat i zapis Archiwum na tym samym `evidenceEventId`;
  6. ambientowe patrol/inspect/rest/converse oddzielone od `operationalState`, maksymalnie 2–3 jednocześnie, bez fake Working/Success i bez zwiększania licznika aktywnych.
- Najpierw audyt istniejącej choreografii i Ambient Directora; nie budować drugiego systemu i nie powtarzać zakończonych analiz.

### Dokładne wznowienie w nowym oknie

1. Przeczytać w całości tę sekcję, `docs/build-week/13_STATUS_STARTOWY_BUILD_WEEK_PL.md` i ostatnie wpisy `02_DZIENNIK_BUILD_WEEK_PL.md` / `06_TESTY_I_STABILNOSC_PL.md`.
2. Sprawdzić branch, HEAD i `git status`; nie resetować i nie przepisywać historii.
3. Uruchomić/pozostawić dokładnie jeden serwer demo 4176; produkcji 4175 nie dotykać.
4. Autor ocenia wodę na `http://100.69.167.105:4176/?demo=1`.
5. RL: poprawić wyłącznie wskazany defekt wody i powtórzyć pełny gate.
6. GL: zapisać wynik i rozpocząć audit istniejącego real-event/ambient systemu według zakresu wyżej.

---

## ACTIVE DEMO GATE — WORLD CHOREOGRAPHY + AMBIENT DIRECTOR

- Scope: branch `demo` only. Production is frozen until explicit GL.
- Added separate `choreographyState` and `ambientState`; operational state remains owned exclusively by the existing event reducer.
- Chat: message pulse → Kasztelan route → command core → evidence-backed thinking/success → Archive confirmation → return.
- Delegation: Kasztelan → target district signal → only real assigned worker/FSM → existing building response → return.
- Ambient Director: deterministic, 20–60 second selection, max 3 actions, role behaviors, paired conversations, no repeated behavior, immediate event/poll interruption.
- Environmental life reuses existing Forge/core effects and adds only faint runes, lights and path wisps.
- Honest visual fixture: `?demo=1&scenario=ambient` has 12 agents, 0 tasks and 0 active agents.
- Hard invariant: ambient never emits work, success, alerts, status rings or active-agent increments.
- Full implementation notes and acceptance evidence: `docs/HERMES_WORLD_CHOREOGRAPHY_AMBIENT_DEMO.md`.
- Next action after checkpoint: user RL/GL. Do not copy to production automatically.


## ACTIVE DEMO GATE — REAL HERMES EVENT PIPELINE (2026-07-12)

- Nadrzędna zasada: wszystkie bieżące zmiany są wyłącznie w worktree `hermes-os-living-world-demo`, branch `demo`. Produkcja pozostaje nietknięta do jawnego GL użytkownika.
- Zaimplementowano kontrakt rzeczywistych eventów, lokalnie zabezpieczony POST, SSE z heartbeat/replay, kolejność/deduplikację, kolejkę adaptera oraz źródła JSONL i upstream SSE.
- Pierwszy pełny pionowy slice: Zwiadowca (`prospecting`) — assigned, droga, thinking, observe, success, wyjście/powrót przez istniejący FSM.
- Widoczność budynków: wariant A. Kowal i Uczony pracują jako pełne sprite'y przy punkcie interakcji fasady, nad maską foreground. Warstwy są partycjonowane; brak podwójnego renderowania.
- Centralne mapowanie profili obejmuje 12 agentów. `Komandos MoA` jest dozwolony wyłącznie dla warning/critical.
- Ambient pozostaje oddzielny od stanu operacyjnego; pierwszy realny event zatrzymuje fixture scenariusza, a polling nie nadpisuje nowszego stanu SSE.
- Walidacja ekranowa: BASELINE 393×852, LIGHT 393×852 i BASELINE 1366×768 — 12 agentów, online, brak błędów konsoli.
- Szczegółowy kontrakt, komendy i architektura: `docs/HERMES_WORLD_REAL_EVENT_PIPELINE_DEMO.md`.
- Następna decyzja: użytkownik ocenia demo RL/GL. Na RL poprawiać wyłącznie demo. Na GL wykonać osobny, audytowalny port do produkcji i pełną ponowną walidację; nie merge'ować automatycznie.


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

## FINAL V1 CORRECT AFTER HACKATHON — USER GL 2026-07-12

This section supersedes every earlier active directive in this file. The user approved the live mobile result after the production integration, PWA icon correction and performance pass. Treat this state as the restorable V1 baseline.

### Accepted production state

- BASELINE remains the production map default; LIGHT remains fallback and STRONG optional showcase.
- The single DOM map-agent renderer, twelve role identities, routes, waypoint graph, FSM, anchors, scale, depth ordering and observability grammar remain locked.
- Default `/` uses the real Cat-compatible production telemetry path. Demo data remains explicit only.
- The Hermes Citadel login/start surface and gold/cyan Citadel PWA icon replace inherited Hermes OS Cat branding.
- Android/iOS install assets use unique V3 filenames to bypass launcher cache. The final 192, 180 and 512 px PNGs were visually and pixel-dimension verified.
- Exactly one detached production server runs on port `4175` and remains alive after Codex closes while the laptop remains powered.

### Final performance pass

- Express compression is enabled for text responses.
- HTML, API, manifest and service worker remain `no-store`; hashed Vite assets use one-year immutable caching; map-agent WebP assets use a seven-day cache with stale-while-revalidate.
- The locked mobile map was converted without resizing or geometry changes from 3.54 MB PNG to 0.53 MB WebP (`941×1672`).
- The locked desktop map was converted without resizing or geometry changes from 3.49 MB PNG to 0.49 MB WebP (`1535×1024`).
- Login, foreground occlusion and world background all use the new WebP assets; the heavy V2 PNGs are absent from the final production bundle.
- The map receives high fetch priority after authentication.
- Agent animation frames are deferred until 700 ms after the map image loads. The first mobile frame dropped from 52 discovered resources to 16; animations then hydrate normally.
- Measured local mobile navigation at `390×844`: approximately 730 ms to the initial loaded document in the audit browser.

### Final verification

- Production build: passed (`812` modules).
- Tests: `33/33` passed.
- ESLint: passed.
- `validate:world-life`: passed.
- LAN production smoke: HTTP 200 on `http://192.168.8.132:4175`.
- Compression header verified for JavaScript.
- Cache headers verified for hashed assets and map-agent sprites.
- Mobile visual smoke at `390×844`: passed; WebP map retained the accepted composition and readability.

### Backup and restore policy

- The final cloud archive contains the complete committed source tree, public assets, tests, documentation, production `dist`, package lock, full Git history as a `git bundle`, checksums and restore instructions.
- `node_modules` is intentionally omitted because it is reproducible with `npm ci` and would make the archive unnecessarily large.
- `.env*` and runtime secret-bearing files under `data/` are intentionally excluded from the cloud ZIP. VAPID keys regenerate on first server start. This prevents credentials and push subscriptions from being exposed in Google Drive.
- The canonical release commit is the commit whose subject is `release: V1 correct after hackathon`. Read the exact hash with `git log --grep="release: V1 correct after hackathon" -1 --oneline`.

### Exact restore commands

```powershell
git clone hermes-citadel-v1-complete.bundle hermes-os-living-world
Set-Location hermes-os-living-world
npm.cmd ci
npm.cmd run build
$env:PORT='4175'
node server.js
```

### Future work boundary

Do not reopen visual direction or replace the map. Any later work must begin from a measured user-facing defect or a hackathon requirement. Preserve real telemetry as the source of truth and keep demo fixtures explicit.

---

## REMOTE PRODUCTION ACCESS — TAILSCALE FUNNEL LOCK

The Citadel is not a LAN-only application. The production operating model is: the Windows laptop remains powered and logged in, a single Node server listens on port `4175`, and Tailscale exposes it through a persistent public HTTPS Funnel.

### Canonical public URL

`https://hermes-os-panel.tail03d525.ts.net:10000/`

This endpoint works outside the home network, including LTE. It is separate from the existing Hermes OS endpoints on HTTPS 443/8443 and does not replace or modify them.

### Persistent host configuration

- Windows Scheduled Task: `Hermes Citadel Production V1`.
- Action: one hidden PowerShell task runs `scripts/run-citadel-service.ps1`, which starts the Hermes-managed `node.exe` in the Citadel project directory.
- Start trigger: Windows user logon.
- Recovery: the hidden service wrapper restarts Node after a crash; the task itself has `RestartOnFailure`, `ExecutionTimeLimit=0`, `StopOnIdleEnd=false` and `MultipleInstancesPolicy=IgnoreNew`.
- `server.js` defaults to port `4175` when `PORT` is not explicitly set.
- Tailscale Funnel: HTTPS port `10000` → `http://127.0.0.1:4175`.
- Reprovisioning script: `scripts/configure-citadel-remote.ps1`; service runner: `scripts/run-citadel-service.ps1`.

### Verified failure recovery

- The managed Node process was deliberately terminated.
- The watchdog created a new PID automatically.
- Local `/api/auth/status` returned HTTP 200 after recovery.
- Public Funnel `/api/auth/status` returned HTTP 200 after recovery.
- Exactly one listener remained on port 4175.

Do not give the user a `192.168.x.x` URL as the primary application address. That address is only a LAN diagnostic fallback. The canonical user-facing address is the Tailscale HTTPS URL above.

---

## DEMO-ONLY PERSISTENT WORLD LIFE — 2026-07-13

This section applies only to the separate demo repository and branch `pre-build-week/environmental-world-life`. Production Correct v1 remains untouched.

- Accepted RGBA world-effect checkpoint: `a436ad1`.
- The environmental architecture now separates continuous infrastructure life from finite operations and real-event choreography.
- Forge fire/smoke, water, Citadel core, Archive windows, Watcher lens, Sanctum orbit and gate lock remain continuously mounted.
- Forge sparks, Watcher beam, Archive runes and Citadel distribution remain operation-only additions.
- Ambient data routes were removed because they looked like agent paths. Data transit is now evidence-backed only.
- Legacy geometric site effects and duplicate core rendering are absent from the active tree.
- Ordinary working does not dim the whole environment; warning/critical still suppress unrelated ambient landmarks.
- Validation baseline: 72 tests, ESLint, production build, mobile 393×852, desktop 1366×768 and a full 48-second browser cycle with stable node counts and no console errors.
- Canonical implementation notes and exact verification are in `docs/HERMES_WORLD_ENVIRONMENTAL_LIFE_PRE_BUILD_WEEK.md`.
- Do not port this pass to production without explicit user GL after phone review.

---

## PRE-BUILD-WEEK WORLD LIFE CHECKPOINT — 2026-07-13

This section supersedes the earlier demo-only environmental section. It applies only to `hermes-os-living-world-demo` on branch `pre-build-week/environmental-world-life`. Production Correct v1 and its persistent service remain untouched.

- Implementation checkpoint: `593274b feat: finalize pre-build-week living world`.

### Completed implementation

- Persistent infrastructure life is separate from finite operations and real-event choreography.
- Forge fire/smoke, water reflections, Citadel core, Archive windows, Watcher lens, Sanctum orbit, Gate lock and two fog bands remain continuously mounted.
- A deterministic 36-second schedule has no dead interval and never exceeds two large simultaneous operations.
- Visual anchors are centralized separately from navigation nodes, routes and agent interaction points.
- Idle ambient renders no data paths. A data transit requires a real `evidenceEventId`, exposes only a short local wake and runs one finite cycle.
- Warning and critical suppress unrelated environmental motion while preserving the affected subsystem at full intensity.
- Duplicate legacy site effects, duplicate core rendering, `BuildingLifeLayer` and `DataPulseLayer` were removed from the active bundle.
- Thirteen accepted source strips have clean mobile-sized `*.runtime.png` derivatives. Combined payload is `795070` bytes; source assets remain unchanged.
- Citadel core, Forge fire and water reflection receive high fetch priority. Other effects use async decode and low priority.

### Validation

- Tests: `75/75` passed.
- World-life validator: passed.
- ESLint: passed.
- Build: passed (`842` modules).
- Runtime asset alpha, dimensions, eight-frame division and total payload are enforced by tests.
- The 36-second schedule and ten simulated minutes are tested for dead gaps, operation bounds and fabricated operational fields.
- Reduced motion, hidden-tab handling and warning/critical priority remain covered.
- All runtime assets return HTTP `200` from the existing demo server on port `4176`.
- Final automated screenshot capture in the in-app preview was unstable and reset during capture. Real-phone perceptual GL is mandatory and has not been inferred.

### Exact next action

1. Open `http://100.69.167.105:4176/?demo=1` on the real phone.
2. Observe the first 5 seconds and at least one complete 36-second cycle.
3. Check continuous Forge fire/water, Archive windows, Citadel core, operation handoffs and absence of GPS/debug paths.
4. Check `&focus=warning` and `&focus=critical`; the affected subsystem must dominate while unrelated ambient motion is suppressed.
5. User returns `GL` or exact `RL` defects.
6. On `RL`, change only named demo defects and repeat tests/build.
7. On `GL`, freeze this branch as the Build Week visual base. Any production port is a separate audited operation.

### Do not touch

- Production repository, port `4175`, Tailscale Funnel, scheduled service or production deployment.
- Map asset, crop, geometry, waypoint graph, routes, anchors, FSM, event pipeline, `server.js`, `src/api.js` or API contracts.
- Agent count, operational-state ownership or active-agent counters.
- Do not reintroduce ambient GPS lines, duplicate renderers, fake Working/Success or debug labels in normal view.

### Exact commands

```powershell
npm.cmd test
npm.cmd run validate:world-life
npm.cmd run lint
npm.cmd run build
```

Canonical notes: `docs/HERMES_WORLD_ENVIRONMENTAL_LIFE_PRE_BUILD_WEEK.md`.

---

## GPT-5.6 LIVING WORLD COMPLETION CHECKPOINT — 2026-07-13

Scope: demo repository only, branch `pre-build-week/environmental-world-life`. Production Correct v1 remains untouched.

### Completed after the final audit

- Split the real-event lifecycle into ingress (`Gate → Citadel → actual subsystem`) and an Archive return that appears only after evidence-backed Success.
- Bounded command/delegation choreography signals to the visible handoff instead of allowing them to mask long-running operational work.
- Centralized all 12 profile-to-subsystem mappings, including Gate behavior.
- Prevented stale/offline telemetry from replaying old Working or choreography presentation.
- Corrected infrastructure conduit geometry for the real non-square mobile and desktop stages.
- Paused hidden-tab scheduling and dimmed persistent windows during warning/critical.
- Removed the Stable/local-warning copy contradiction in the mobile health ribbon.

### Verification

- Tests: `83/83` passed.
- World-life validator: passed.
- ESLint: passed.
- Production build: passed (`844` modules, `16.13 s`).
- Browser smoke: `393×852`, no overflow, no console errors, Stable clean view and deterministic local-warning summary verified.
- Demo URL: `http://100.69.167.105:4176/?demo=1`.
- Commit subject: `pre-build: GPT-5.6 living world checkpoint`.

### Resume gate

1. User performs the final real-phone perceptual review.
2. `GL`: freeze this demo checkpoint; any production transfer is a separate audited operation.
3. `RL`: change only the exact named visual defect on the demo branch, rerun all four validation commands, then present the same demo URL.

Do not modify production, the base map, waypoint geometry, routes, FSM, event pipeline, `server.js` or API contracts without a new explicit instruction.

---

## DEMO SSE AWARENESS + ROOM TELEMETRY CHECKPOINT — 2026-07-16

Scope: demo repository only, branch `build-week/hermes-world`. Production `main` remains at `c9a32051a3367990ceae266adeed16366cbd4738` and was not modified during this pass.

### Implemented on demo

- A confirmed SSE event now produces a staggered, evidence-backed awareness wave across the city. Non-target agents only acknowledge the event with brief road motion; they never receive fake `Working` or `Success`.
- The true target worker keeps the real operational lifecycle, and real state always overrides presentation choreography.
- Archive now consumes `/api/memory` through a safe summary. Raw memory content never enters the world store or room UI.
- Room metrics are now semantically explicit: Archive = memory sections/activity/tasks; Citadel = active agents/sessions/API cost; Watcher = crons/completion/alerts; Sanctum = host RAM/derived health/incidents; Forge = CPU/temperature/tasks.

### Production truth audit

- Forge: real and correctly sourced.
- Citadel: real and correctly sourced; API cost derives from real sessions.
- Watcher: cron data and alerts are real; completion ratio is present only in the current demo pass.
- Sanctum: inputs are real, but `healthScore` is a transparent local derivation from telemetry/incidents, not a dedicated CAT endpoint. Host RAM must not be described as RAG memory.
- Archive on current production: partially real activity/log data, but not actual memory/RAG health. Production does have an existing `/api/memory` route, yet current production UI does not consume it.
- A true RAG-health claim still requires explicit retrieval/index evidence such as document count, last index time, retrieval success and latency. `/api/memory` alone does not prove those properties; do not fabricate them.
- Protected production payload values were not re-audited by bypassing authentication. HTTP 401 confirms guards only, not data correctness.

### Verification

- Focused tests: 46/46 PASS.
- Full tests: 137/137 PASS.
- ESLint: PASS.
- World-life validator: PASS.
- Build: PASS, 874 modules, 5.28 s; main JS 419.83 kB / 128.96 kB gzip.

### Exact next gate

1. Review the existing demo URL `http://100.69.167.105:4176/?demo=1` on the phone.
2. Send one real Hermes message and inspect the complete visible sequence: ingress → Citadel/Kasztelan → awareness waves → true worker/building → Archive on real Success.
3. Open all five rooms and verify metric labels/values; especially Archive memory and Sanctum RAM.
4. Return GL or exact RL defects.
5. Only after GL prepare a strict file/commit promotion manifest. Production changes remain a separate audited operation.

---

## REAL EVENT LIFECYCLE RESILIENCE CHECKPOINT — 2026-07-16

Scope: demo only, branch `build-week/hermes-world`. Production remains fixed at `c9a32051a3367990ceae266adeed16366cbd4738` and was not touched in this block.

### Completed

- Data packets now complete within the exact operation phase instead of disappearing before the destination.
- Archive return remains visible for its complete 5.8 s evidence-backed cycle.
- Agent fallback return includes the Success hold and full route home, preventing a final jump.
- Chat world-event publishing is ordered, acknowledged and retried with stable evidence IDs; permanent publication failure does not interrupt chat or fabricate terminal state.
- A dropped SSE cannot keep stale `Working` forever when the real session inventory explicitly proves that stream ended. No synthetic Success/Idle is generated.
- Concurrent real runs retain the newest active presentation while a genuine terminal edge from an older run can still reach Archive.

### Verification

- Targeted: 75/75 PASS.
- Full tests: 144/144 PASS.
- ESLint: PASS.
- World-life validator: PASS.
- Build: PASS, 874 modules, 3.65 s; main JS 420.47 kB / 129.21 kB gzip.
- Pure lifecycle derivation benchmark: about 70.635 µs per lifecycle over 20,000 iterations on this laptop.

### Honest limitations

- The selected chat profile is the current delegation target. Internal upstream delegation to another worker is not claimed without an explicit worker edge in Hermes SSE.
- Archive ingestion visualizes a real completed event; it is not proof that Obsidian/RAG persisted a memory record.
- Authenticated, perceptual real-phone E2E remains the next manual gate.

### Exact next action

1. Use the existing demo URL `http://100.69.167.105:4176/?demo=1`.
2. Send one real message and observe Gate → Citadel/Kasztelan → selected subsystem → real terminal → Archive → return.
3. Confirm no stale Working after background/reconnect and no agent teleport at the end.
4. Return GL or exact RL. Do not touch production before GL.

---

## DEMO MOVEMENT POLISH CHECKPOINT — 2026-07-16

Scope: demo only, branch `build-week/hermes-world`. Production remains fixed at `c9a32051a3367990ceae266adeed16366cbd4738` and was not touched.

### Completed

- The accepted real-event cycle is frozen; no fake reaction, cron or operational state was added.
- Walking agents now use a four-phase footstep pose with body sway, lean and synchronized contact-shadow compression instead of a floating-only bob.
- A real event interrupting ambient movement preserves the exact visible foot position and continues from the nearest segment of the agent's existing semantic route.
- The handoff is evidence/run scoped, applies only while travelling to work and cannot override Working or terminal state.

### Verification

- Focused tests: 44/44 PASS.
- Full tests: 146/146 PASS.
- ESLint and world-life validator: PASS.
- Build: PASS, 874 modules, 4.80 s; main JS 423.05 kB / 129.98 kB gzip.
- Pure handoff benchmark: 26.769 µs per iteration over 50,000 iterations.
- Demo runtime 4176 serves `index-Cm90ARzU.js` containing the new gait and handoff contracts.

### Exact next gate

1. Review walking on `http://100.69.167.105:4176/?demo=1`.
2. Observe at least one ambient walker and one real-event takeover.
3. Confirm visible stepping, no skating, no snap to home and no teleport at return.
4. Return GL or name the exact agent/phase that still looks wrong. Production stays untouched until a separate explicit GL.

---

## DEMO WALKING BIOMECHANICS PASS 2 — 2026-07-16

- Demo only; production unchanged at `c9a3205`.
- Contact frames are held longer than passing frames, reducing constant-speed skating without changing world speed.
- Each direction receives a subpixel stride vector, alternating weight transfer, body compression and synchronized shadow response.
- Rotation/scaling use each asset's actual foot anchor, preserving the logical point between the feet.
- Verification: focused 44/44, full 146/146, lint PASS, validator PASS, build PASS.
- Served demo artifact: `index-dUUrp4or.js`; manual phone GL/RL remains the only gate.

---

## APPROVED PRODUCTION PROMOTION — 2026-07-16

- User GL was explicit: promote only the reviewed demo patch, with zero unsolicited production improvements.
- Production baseline `c9a32051a3367990ceae266adeed16366cbd4738` was clean. Patch SHA-256 was `8CFEF0DC878D646E2FCCEA4721B1DB84B3D8923A97A3317957EF7040CE5B729D` and `git apply --check` passed.
- Production commit is `83937de` (`feat(build-week): promote approved living world pass`), 37 files, +864/-210. No `server.js`, backend API, Tailscale, ports, PWA/service worker or deployment files changed.
- Verification: full tests 152/152 PASS, ESLint PASS, world-life validator PASS, build PASS (874 modules, 5.42 s; runner loader used after Windows `.vite-temp` EPERM).
- Public production `https://hermes-os-panel.tail03d525.ts.net:10000/` serves `index-BwVrGPEq.js` and `index-BE6fnGPj.css`; Funnel points to the existing 4175 runtime.
- Final process state: one 4175 listener, PID 6764, owned by the original watchdog. A diagnostic duplicate watchdog was detected and stopped.
- SSE snapshot, public/local root, auth status, world snapshot and system metrics pass. Protected payloads correctly return 401 without browser cookie.
- Before any further production change, require a new explicit GL. Do not optimize, refactor or fix production automatically.
- Remaining gate: authenticated manual verification of 12 agents, five interiors, raw ticker vs semantic feed, real-chat lifecycle and mobile perception. This is a verification task only, not authorization to change production.

### Critical post-promotion fix

- Production exposed React #185 before the first live snapshot because `WorldEventTicker` returned a new empty selector array while `state.raw` was absent. Demo did not reproduce because fixture raw logs exist immediately.
- Fixed only with stable `EMPTY_RAW_LOGS`; regression test added. No other behavior changed.
- Demo commit `3e39fd8`; production commit `958b9da`.
- Verification: 153/153 tests, lint, validator and build PASS. Public production serves `index-tYcI17tU.js` with HTTP 200.
- Manual authenticated refresh remains the final gate.

---

## DEMO FULL ROSTER + REAL-EVENT MOTION CHECKPOINT — 2026-07-17

Scope: demo only, branch `build-week/hermes-world`. Production is frozen and unchanged at `main` `958b9da08bee9613900ceae266adeed16366cbd4738`.

### What is now verified

- The scene owns all 12 canonical presentations: 10 agents on the map and 2 inside verified interiors. The header value `7/12` is the active-agent counter, not a renderer count.
- The mobile Citadel facade no longer hides the stationary Kasztelan. Lower-courtyard roles use presentation-only spacing; logical routes, semantic nodes, foot positions and map geometry remain unchanged.
- Evidence-backed choreography may own movement only for the exact matching real run (`runId === taskId`). Unrelated operational work still wins and no fake Working/Success is emitted.
- A real event requests an immediate shared presentation-clock tick. No extra SSE connection, polling loop or per-agent timer was added.
- Root diagnostics expose total/on-map/inside/invalid occupancy for regression checks without adding visible debug UI.

### Final verification

- Full tests 150/150 PASS; ESLint PASS; world-life validator PASS; `git diff --check` PASS.
- Build PASS: 874 modules, 22.95 s, main 424.46 kB / 130.58 kB gzip.
- Mobile 393×852 and desktop 1366×768: 12 total, 10 map, 2 inside, 0 invalid; all 10 map assets ready; zero significant sprite overlaps.
- Runtime movement sample: 3.926 world units over 12 seconds, maximum step 0.411; no teleport. Console: 0 errors, 0 warnings.
- Production `main` remains untouched. Do not promote without a new explicit GL.

### Exact next gate

1. Keep using `http://127.0.0.1:4176/?demo=1` for local demo review.
2. Perform one authenticated real-message test on the phone and confirm visible first reaction, continuous worker movement and complete return.
3. Treat `7/12` as active count; use the verified 10 map + 2 interior occupancy when checking missing agents.
4. Any future production promotion must be a reviewed selective patch with a fresh GL; do not add opportunistic production fixes.

### Mobile Safari correction after the checkpoint

- A real phone screenshot exposed a three-agent collision not reproduced by the full-height 393×852 viewport. The short Safari viewport 393×700 is now an explicit regression target.
- The fixed `stationaryCrowdOffset` approach was rejected and removed. It moved agents even when no collision existed and could place Herold on a facade.
- `mapAgentCrowdLanes.js` now applies small pixel-only lane offsets only while Zwiadowca, DevOps and Herold form a lower-courtyard cluster. Logical routes and coordinates remain frozen.
- Measured Zwiadowca/DevOps overlap fell from 914 px² to 96 px²; the remaining contact is 2 px high and all three silhouettes are independently readable.
- Final validation: focused 25/25, full 150/150, ESLint, world-life validator, build and 393×700 visual check PASS. Production remains untouched.

---
## Korekta 2026-07-18 00:13 — rozmieszczenie agentów

- Nie zmieniać bazowych pozycji, waypointów ani semantic nodes bez wyraźnego polecenia autora.
- Warstwa `mapAgentCrowdLanes` z commita `52527cb` została wycofana, ponieważ przesuwała postacie na dach/fasadę w widoku mobilnym.
- Przywrócono dokładny wcześniejszy renderer rozmieszczenia; roster, ruch, SSE, FSM i produkcja pozostały nietknięte.
- Walidacja: 150/150 testów PASS, build PASS, World Life validator PASS.

## Demo scripted walking fix — 2026-07-18 00:45

- Demo-only `WorldSceneScript` no longer lets stale fixture task timestamps pin a scripted walker at the route endpoint.
- The walking beat now owns a stable start timestamp and continuously advances over the already-approved semantic route. No map coordinates, routes, waypoint definitions, placement profiles, FSM, SSE, API or production files changed.
- Browser proof: Zwiadowca advanced from `52.539/35.237` to `60.993/31.332` while occupancy stayed 12/12 (`10 map + 2 interior`).
- A real Hermes message was observed as one evidence-backed `assigned → thinking → success` lifecycle; no unrelated fake Working was emitted.
- Validation: 151/151 tests PASS; world-life validator PASS; build PASS (874 modules, 424.96 kB / 130.73 kB gzip main JS); `git diff --check` PASS.
- Production remains frozen. Do not promote without a new explicit GL.

## RELEASE AUDIT START — 2026-07-18 05:56 Europe/Warsaw

- Demo baseline: `build-week/hermes-world` at `01df5476a77988f0ed9f6d03c11f295b32093ba8`, tag `demo-release-audit-start-2026-07-18`.
- Production baseline: `main` at `958b9da08bee9613900e902b3da558aadef826e8`, tag `production-release-audit-start-2026-07-18`.
- Both worktrees were clean when the release audit began. Production code/runtime/configuration were not changed.
- Hard gate: complete diagnosis and all demo acceptance tests before producing a promotion manifest; require a separate author GL/RL before any production modification.
- Diagnostic order: shared SSE lifecycle → authoritative resync → building re-entry freshness → connection/Hermes/worker status separation → durable event history → evidence-backed movement → five full demo runs.
- Do not refactor `server.js`, rebuild architecture, change routes/waypoints/map placement, or add features during this release pass. Every correction must be minimal, regression-tested, documented and committed separately.

### Read-only diagnosis completed

- Baseline tests remain green: 151/151. The existing shared EventSource singleton and last-subscriber cleanup are valid foundations.
- Confirmed release blockers are narrowly scoped: observable SSE lifecycle/heartbeat/backoff; authoritative resync after reconnect; preservation of complete domains during progressive snapshots; fresh building fetch on every entry; separation of client transport from Hermes/worker presence; durable and complete cron/world-event history.
- Agent movement is frozen unless the later five-run acceptance test reproduces a concrete defect. No route, waypoint, position, FSM or map change is authorized by this audit.
- Detailed evidence and rollback notes are in `docs/build-week/evidence/tests/20260718_DEMO_RELEASE_DIAGNOSIS_PL.md`.
- Next exact step: add deterministic failing tests for five SSE reconnect cycles, heartbeat timeout, lifecycle cleanup and visibility/network recovery, then harden the existing singleton only.

### Phase 2.1 completed — shared SSE lifecycle

- The demo now owns exactly one observable EventSource, reconnect timer and heartbeat watchdog. It carries the last cursor through `after`, rejects callbacks from stale sources and cleans all sources/timers/browser listeners after the last unsubscribe.
- Server heartbeat is a named SSE event, so the browser can detect a silent/stale connection instead of waiting for manual refresh.
- Deterministic validation passed five consecutive disconnect/reconnect cycles, heartbeat timeout, hidden/foreground and offline/online transitions, with no duplicate delivery or accumulating resources.
- Validation: 155/155 tests, ESLint, World Life validator and build PASS. Production remains untouched.
- Next exact step: Phase 2.2 — connect `onStatus` to `useWorldBridge`, perform authoritative forced sync after reconnect, buffer/replay concurrent events, and prevent partial snapshots from clearing a previously confirmed roster.

### Phase 2.2 completed — authoritative reconnect resync

- `WorldBridge.sync({ force: true, atomic: true })` refreshes every domain after reconnect and emits one complete result. A forced resync arriving during ordinary polling queues behind it and then performs a fresh read.
- Progressive ordinary polling now seeds each in-progress result with the last confirmed domains, so fresh metrics never replace a valid 12-agent roster with an empty intermediate snapshot.
- `useWorldBridge` exposes transport/resync state, preserves the last trustworthy snapshot, and reapplies events received during the atomic read. Generation guards prevent an obsolete resync from winning after another disconnect.
- Validation: 158/158 tests, ESLint, World Life validator and build PASS. Production remains untouched.
- Next exact step: Phase 2.3 — define the minimal domain set per existing building and force those domains fresh on every entry, with a five-entry regression test and no visual/interior redesign.

### Phase 2.3 completed — fresh building data on every entry

- Every interior has a centralized minimal telemetry-domain list. Opening a building triggers one atomic refresh of only those domains and preserves the last confirmed view until the response arrives.
- Five consecutive Archive re-entries passed: its four domains refreshed five times, unrelated domains made no extra requests, and every entry produced exactly one complete emission.
- Validation: 160/160 tests, ESLint, World Life validator, `git diff --check` and build PASS. Production remains untouched.
- Next exact step: Phase 2.4 — separate client transport state from authoritative Hermes and worker presence so a broken EventSource reports reconnecting/stale data without fabricating system-wide offline.

### Phase 2.4 completed — transport state is not runtime presence

- EventSource loss now changes only `lifecycle.transport`. It no longer marks Hermes, every worker or every interior offline and no longer clears the last confirmed world state.
- Runtime offline requires explicit authoritative evidence: `lifecycle.hermesStatus`, `lifecycle.runtimeStatus`, `agent.presence`, `agent.online` or `agent.state`.
- Reconnecting and disconnected UI copy explicitly says that the app transport is recovering and the displayed Hermes state is the last confirmed one.
- Validation: 161/161 tests, ESLint, World Life validator, `git diff --check` and build PASS. Production remains untouched.
- Next exact step: Phase 2.5 — trace cron/task events from source through domain event creation, persistence, history API, SSE merge and UI; fix only the first proven loss point and never fabricate unavailable history.

### Phase 2.5 completed — durable event history and complete cron completions

- Confirmed loss points were narrow: the world-event hub was RAM-only, and cron presentation used one unordered completion per job.
- Accepted world-events are now written atomically before publication, restored across restart, and used to rebuild event-id dedupe and run sequence guards. Persistence failure is explicit and does not acknowledge an event that would be lost.
- Every authoritative cron completion is normalized, deduplicated by stable ID and sorted by timestamp. Latest job results are selected chronologically; older valid completions remain visible as separate activity records.
- No synthetic history or unverified backfill was created.
- Validation: 163/163 tests, ESLint, server syntax, World Life validator, `git diff --check` and build PASS. An isolated real server restart preserved the event/cursor and left no test process or file behind.
- Protected cron history correctly returns 401 without a session. The controlled real-cron correlation test remains part of Phase 3 and is not marked PASS prematurely.
- Production remains untouched.
- Next exact step: Phase 2.6 — run the accepted movement scenario five times and measure agent identity, route continuity, destination, building entry and terminal state. Change movement code only if this gate reproduces a concrete defect.
