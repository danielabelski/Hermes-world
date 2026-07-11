# Hermes World — North Star execution plan

Ten plan nie zastępuje `NEXT_WINDOW_MAP_AGENTS.md`. Doprecyzowuje dalsze wykonanie po integracji agentów. Mapa v2, jej geometria, crop i budynki pozostają zablokowane. `server.js`, `src/api.js`, Hermes OS CAT i kontrakty API są poza zakresem.

North Star: Hermes World jest ambientową warstwą observability, nie grą. W ciągu dwóch sekund użytkownik ma odczytać globalny health, liczbę pracujących/czekających agentów, warning/error/stuck oraz miejsce problemu.

## NEXT WINDOW — locked execution order

Nie implementować tych faz w oknie checkpointu. Następne okno zaczyna od pierwszej niezakończonej fazy po ponownym uruchomieniu testów i builda. Nie powtarzać zakończonych auditów produktu, sprite'ów, routingu ani map identity.

### Phase 1 — Stuck vs waiting vs thinking

Cel: jednoznacznie rozróżnić trzy stany bez dużych aur i bez przebudowy FSM.

- Unikalny marker stuck: blokada, czas albo zatrzymana strzałka zamiast wielokropka.
- Wolny okresowy puls przy stopach; mocniejszy niż waiting, słabszy niż error.
- Thinking pozostaje spokojnym symbolem analizy, waiting dyskretnym sygnałem oczekiwania.
- Test trzech stanów na realnym tle mapy i w widoku około 390×844.

Definition of done: użytkownik rozpoznaje wszystkie trzy stany bez tickera; stuck nie wygląda jak idle, waiting jak warning, a thinking jak problem.

### Phase 2 — Critical source localization

Cel: w ciągu dwóch sekund wskazać agenta i subsystem źródłowy.

- Czerwony marker konkretnego agenta.
- Subtelna reakcja właściwego budynku/subsystemu.
- Opcjonalna krótka semantyczna linia wyłącznie dla aktywnego problemu.
- Bez spaghetti, wielkich aur i nowych globalnych efektów.

Definition of done: wiadomo, który agent zawiódł, który subsystem jest dotknięty i czy alert jest lokalny czy globalny.

### Phase 3 — Agent micro-normalization

Cel: zachować obecną mniejszą skalę jako baseline i poprawić wyłącznie outliery.

- Maksymalne indywidualne korekty około ±5–8%.
- Sprawdzić perspektywę, anchor przy stopach i cień kontaktowy.
- Nie zmieniać waypointów, routingu ani globalnej skali.

Definition of done: żadna postać nie dominuje nad mapą, role pozostają czytelne, a sylwetki nie wyglądają jak wklejone ilustracje.

### Phase 4 — Non-destructive map readability variants

Cel: rozjaśnić aktualną mapę bez naruszenia geometrii i mapowania.

- Przygotować trzy warianty: baseline, lekki pass i trochę mocniejszy wariant testowy.
- Używać wyłącznie CSS, compositingu, overlayów i tonalnych masek.
- Lekko podnieść brightness/shadows, ograniczyć blue cast, ocieplić kamień/drogi i uspokoić szum tras.
- Zachować cyan jako kolor infrastruktury AI.
- Nie podmieniać mapy, nie zmieniać cropu, geometrii ani waypointów.

Definition of done: użytkownik wybiera najmniejszą zmianę, która poprawia czytelność dróg i agentów na telefonie.

### Phase 5 — Debug overlay usability

Cel: zachować wartość diagnostyczną bez wyświetlania wszystkiego naraz.

- Wybór jednego agenta.
- Osobne toggle: route, labels, entrances, nodes, depth zones.
- Debug domyślnie wyłączony i nadal dev-only.

Definition of done: można sprawdzić jedną trasę bez chaosu etykiet; normalny użytkownik nigdy nie widzi overlayu.

### Phase 6 — Final mobile observability matrix

Przetestować około 390×844: stable, working, waiting, thinking, warning, critical, stuck, success i offline.

Dla każdego stanu sprawdzić global health, active/total, lokalizację problemu, rolę, status, kontrast, brak zasłaniania przez UI i zrozumienie bez klikania.

Definition of done: wszystkie dziewięć scen przechodzi product test zapisany w `HERMES_WORLD_VISUAL_BASELINE.md`.

## Bieżący checkpoint

- [x] Semantyczne trasy aktualnej mapy i domyślnie wyłączony `?debugRoutes=1`.
- [x] Pełny flow Kowala: droga, próg Kuźni, praca, wyjście i powrót.
- [x] Flow Uczonego do Biblioteki oraz Zwiadowcy do punktu obserwacyjnego.
- [x] Wspólny renderer, anchor stóp, Y-sort, contact shadow i minimalne foreground masks.
- [x] Dwanaście unikalnych zestawów sprite'ów, 108/108 wymaganych plików WebP, zero aktywnych fallbacków.
- [x] Stany `idle/walk/work/thinking/waiting/success/warning/error/stuck/offline` bez hologramów i globalnego tintu.
- [x] Subsystemy Kuźnia/Biblioteka/Wieża/Core reagują na stan, a dormant data flows są ukryte.
- [x] Odwracalny tonalny readability pass przez CSS; assety mapy niezmienione.
- [x] Korekta mobile: 52 px bazowo, per-role shadows, osobny start Zwiadowcy, usunięte cztery punkty z dachów/fasad i mniejszy centralny tłok.
- [x] Targeted normalization: indywidualne wysokości 40–46 px, największe role mniejsze o 20–27%, wspólny profil tonalny i cień bez zmiany anchorów.
- [x] Live before/after przez `?agentVisual=before` oraz deterministyczne scenariusze `healthy/warning/critical`.
- [x] Controlled map readability pass jako odwracalny CSS: globalna korekcja plus lokalne, subtelne rozjaśnienie dróg i placów.

## Kolejność dalszej pracy

### 1. Mobile route and ground-contact validation

Cel observability: agent stojący na drodze i mający czytelny cień jest natychmiast rozpoznawalny jako aktywna jednostka, nie dekoracja mapy.

- Sprawdzić 390×844, 393×852, większy mobile i desktop.
- Zweryfikować referencyjne trasy przez `?debugRoutes=1`.
- Usunąć każdy punkt na dachu, murze, wodzie lub pod krytycznym UI.
- Nie zmieniać geometrii mapy ani nie dodawać pathfindingu.

### 2. Reference-role readability matrix

Cel observability: rola i status mają być odczytywane dwoma niezależnymi kanałami bez podpisów.

- Kowal: `idle / working / error`.
- Uczony: `idle / thinking / error`.
- Zwiadowca: `idle / patrol / warning`.
- Testować na realnym tle i docelowej skali mobile, bez prezentacyjnego powiększania.
- Jeśli stan jest nieczytelny, poprawić mały ring/symbol/animację; jeśli rola jest nieczytelna, poprawić wyłącznie sprite/config roli.

### 3. Twelve-agent placement and behavior audit

Cel observability: wszystkie widoczne jednostki mają logiczne miejsce i ruch oznaczający prawdziwą pracę.

- Zweryfikować home/work/safe dla 12 profili na obu layoutach.
- Zachować jeden wspólny renderer i wspólne typy zachowań.
- Idle nie może wykonywać semantycznego spaceru; ruch oznacza dispatch, transfer, patrol albo return.
- Rozsunąć tory wyłącznie tam, gdzie pozwala droga; bez symulacji tłumu.

### 4. Subsystem and flow grammar

Cel observability: miejsce pracy lub awarii jest widoczne kątem oka.

- Kuźnia = coding/build, Biblioteka = research/knowledge, Wieża = monitoring, Cytadela = core.
- Efekty aktywne tylko podczas właściwego stanu; warning bursztynowy, error czerwony.
- Przepływy: cyan aktywny, dashed waiting, amber warning, red error; dormant niewidoczne.
- Nie dodawać dekoracyjnego spaghetti.

### 5. Ambient mobile UI polish

Cel observability: globalny health i alert nie konkurują z mapą ani nie zasłaniają agentów.

- Zachować health, active/total oraz alert count.
- Ticker, legenda i toast pozostają pomocnicze i nie mogą się nakładać.
- Ambient mode ukrywa elementy drugorzędne i wraca po dotknięciu.
- Drill-down pozostaje opcjonalny; ogólny stan musi być czytelny bez kliknięcia.

### 6. Final validation and checkpoint

Cel observability: dowód ekranowy potwierdza ten sam odczyt na wszystkich targetach.

- `npm test`, `npm run validate:world-life`, `npm run lint`, demo build.
- Screenshoty: mobile idle, Kowal→Kuźnia, Uczony→Biblioteka, Zwiadowca patrol, wszystkie 12, desktop.
- Sprawdzić skale, stopy, cienie, Y-sort, role, statusy i położenie.
- Commit i aktualizacja `NEXT_WINDOW_HANDOFF.md`.
- Dopiero po zielonych testach uruchomić dokładnie jeden preview na `0.0.0.0`; użytkownik wydaje `GL` albo `RL`.

## Po GL

Kolejny etap używa wyłącznie prawdziwych danych: global health, queue/overload per subsystem oraz prosty drill-down agent/budynek. Nie rozszerzać game designu, wnętrz, questów ani losowego ruchu.
