# Hermes World — North Star execution plan

Ten plan nie zastępuje `NEXT_WINDOW_MAP_AGENTS.md`. Doprecyzowuje dalsze wykonanie po integracji agentów. Mapa v2, jej geometria, crop i budynki pozostają zablokowane. `server.js`, `src/api.js`, Hermes OS CAT i kontrakty API są poza zakresem.

North Star: Hermes World jest ambientową warstwą observability, nie grą. W ciągu dwóch sekund użytkownik ma odczytać globalny health, liczbę pracujących/czekających agentów, warning/error/stuck oraz miejsce problemu.

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

