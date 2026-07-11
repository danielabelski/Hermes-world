# Hermes World — North Star execution plan

Ten plan nie zastępuje `NEXT_WINDOW_MAP_AGENTS.md`. Doprecyzowuje dalsze wykonanie po integracji agentów. Mapa v2, jej geometria, crop i budynki pozostają zablokowane. `server.js`, `src/api.js`, Hermes OS CAT i kontrakty API są poza zakresem.

North Star: Hermes World jest ambientową warstwą observability, nie grą. W ciągu dwóch sekund użytkownik ma odczytać globalny health, liczbę pracujących/czekających agentów, warning/error/stuck oraz miejsce problemu.

## NEXT WINDOW — locked execution order

Nie implementować tych faz w oknie checkpointu. Następne okno zaczyna od pierwszej niezakończonej fazy po ponownym uruchomieniu testów i builda. Nie powtarzać zakończonych auditów produktu, sprite'ów, routingu ani map identity.

Status realizacji bieżącego okna:

- [x] Phase 1 — stuck vs waiting vs thinking (`8515bae`).
- [x] Phase 2 — critical source localization (`2901879`).
- [x] Phase 3 — agent micro-normalization audit; brak outliera, więc brak zmian skali.
- [x] Phase 4 — reversible baseline/light/strong variants (`a525a65`).
- [x] Phase 5 — filtered route debug (`fc0da54`).
- [x] Phase 6 — deterministic nine-state matrix; final checkpoint w handoffie.

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

## NEXT WINDOW — MAP READABILITY + OBSERVABILITY POLISH PASS

Ta sekcja jest bieżącym planem wykonawczym. Nie powtarzać ukończonych faz opisanych niżej. Pracować sekwencyjnie w głównym agencie, bez nowych assetów, subagentów i zmian architektury.

### Stan wejściowy i blokady

- Branch `main`, checkpoint `f8239ba`; przed planowaniem working tree było czyste.
- Testy `26/26`, lint, validator oraz build produkcyjny i demo były zielone.
- Ukończono: osobne thinking/waiting/stuck, critical agent→subsystem, warianty mapy baseline/light/strong, debug per agent i deterministyczną macierz dziewięciu stanów.
- Jeden preview `0.0.0.0:4175` służy ocenie telefonu. Następne okno zatrzymuje go przed implementacją i potwierdza brak listenera.
- Nie zmieniać assetu/geometrii/cropu mapy, waypointów, routingu, depth zones, home/safe/work, globalnej skali, FSM, rendererów, `server.js`, `src/api.js`, Hermes OS CAT ani API.
- Bez generowania assetów, serii Chrome/headless i mechanik gry.

### Task 0 — Safe resume i baseline

1. Przeczytać `AGENTS.md`, handoff, visual baseline i tę sekcję.
2. Sprawdzić Git, ostatnie sześć commitów i listener preview.
3. Zatrzymać wyłącznie preview 4175; nie zabijać niezwiązanych procesów.
4. Uruchomić: `npm.cmd test`, `npm.cmd run validate:world-life`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run build -- --mode demo`.
5. Nie tworzyć pustego checkpointu, jeśli repo jest czyste.

DoD: zielony baseline i zero preview podczas implementacji.

### Task 1 — Finalny non-destructive map readability pass

1. Zachować warianty `baseline/light/strong` oraz asset mapy bez zmian.
2. Porównać identyczne sceny stable/working/warning/critical na mobile.
3. Strojenie wyłącznie przez CSS/compositing: shadows, brightness, blue cast, temperatura kamienia/dróg, saturation tła i lokalne tonalne maski.
4. Priorytet: główna droga, plac/fontanna, wejścia Cytadeli/Kuźni/Biblioteki, stanowiska pracy i patrol.
5. Cyan pozostaje kolorem infrastruktury. Bez spłaszczenia głębi i bez wielkich aur.
6. Wybrać najmniejszą skuteczną zmianę; `strong` nie staje się domyślny bez GL użytkownika.

DoD: lepsza czytelność dróg i agentów, słabszy blue cast, identyczne hashe assetu i geometrii.

### Task 2 — Twarda hierarchia komunikatów

W istniejącej prezentacji wdrożyć ranking `critical > warning > stuck > success > info`.

1. Jedno źródło wyboru głównej dolnej karty, bez nowego event systemu.
2. Critical spina kartę, global health, summary, marker agenta i subsystem; success zostaje tylko w tickerze/historii.
3. Warning wygrywa z success; stuck wygrywa z success/info, ale nie udaje critical.
4. Success jest krótkotrwały i nigdy nie przykrywa alertu.
5. Testy konfliktów: critical+success, warning+success, stuck+success oraz brak alertu.

DoD: brak sprzecznych głównych komunikatów na jednym ekranie.

### Task 3 — Regresja statusów i critical localization

Nie przeprojektowywać wykonanych stanów. Na realnym tle potwierdzić: thinking `?` bez alarmu, waiting `…` z chłodnym ringiem, stuck `↛` z bursztynowym wolnym pulsem oraz error/critical z agentem, subsystemem i jedną linią problemową. Poprawić wyłącznie wykryty błąd mobile, bez zmian FSM.

DoD: trzy stany są rozpoznawalne bez tickera, a critical wskazuje agent→subsystem w 2 sekundy.

### Task 4 — Debug Kowala: kolejność zamiast spamu

1. Jeden agent i jedna trasa po `debugRoutes=1`.
2. Numerować kolejne punkty `1→2→3→4…`.
3. Na mapie krótkie etykiety; pełne nazwy w małym inspectorze/interakcji.
4. Zachować istniejące toggles i dodać `home/safe/work` oraz `occlusion markers`.
5. Etykiety nie zasłaniają sprite'a ani głównej drogi; debug domyślnie off.
6. Test konfiguracji i deterministycznej kolejności.

DoD: czytelna ponumerowana trasa bez technicznego chaosu.

### Task 5 — Agent micro-normalization tylko przy dowodzie

Sprawdzić 12 agentów: stopy, cień, drzwi/droga, depth sorting i ilustracyjność. Nie zmieniać nic bez widocznego outliera. Jeśli istnieje, tylko indywidualne ±5–8%, bez przesunięcia pozycji i waypointów.

DoD: baseline 40–46 px pozostaje; każda ewentualna korekta ma konkretny powód.

### Task 6 — Mobile observability matrix i before/after

Na około 390×844 sprawdzić: stable, working, thinking, waiting, stuck, warning, critical, success, offline i debug route Kowala. Dla każdego: health, active/total, lokalizacja agent/subsystem, rola/status, kontrast, UI oraz brak konfliktu success z alertem. Porównać baseline/light/strong na identycznym kadrze. Bez automatycznej serii Chrome.

DoD: każdy stan jest zrozumiały bez kliknięcia i tickera w maksymalnie 2 sekundy.

### Task 7 — Walidacja, checkpoint i telefon

1. Powtórzyć pięć komend Task 0 oraz smoke/status/route tests.
2. Sprawdzić chronione pliki/assety, sekrety, artefakty i procesy.
3. Zaktualizować visual baseline, raport i handoff stanem faktycznym.
4. Commit: `checkpoint: improve map readability and observability hierarchy` lub równoważny.
5. Dopiero po zielonym commicie dokładnie jeden preview `0.0.0.0:4175`; potwierdzić jeden listener i zero headless.
6. Podać LAN URL-e i pozostawić decyzję `GL/RL` użytkownikowi.

DoD: czysty working tree, zielone testy/buildy, aktualny handoff i jeden preview do oceny.

---
