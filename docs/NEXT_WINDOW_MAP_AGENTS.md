# HERMES OS — NEXT WINDOW: MAP AGENTS & LIVING WORLD

## Cel

Zastąpić duże postacie-naklejki osobną warstwą małych agentów mapowych. Najpierw dowieźć pełny cykl Kowala, potem Uczonego i Zwiadowcy. Backend, API i logi pozostają źródłem prawdy; świat jest ich żywą reprezentacją.

## Zasady niepodlegające dyskusji

- Mapa v2 ma GL i jest zablokowana: nie zmieniać, nie generować, nie przebudowywać.
- Nie modyfikować Hermes OS CAT, `server.js` ani kontraktów `api.js`.
- Duże ilustracje są wyłącznie portretami UI: detail sheet, profil, karta agenta.
- Nie renderować ich na mapie i nie naprawiać aurą, opacity, filtrem, cropem, maską, `clip-path` ani skalą.
- Nie tworzyć mapowych agentów przez pomniejszenie lub wycięcie dużych ilustracji.
- Mały agent: osobny PNG/WebP, prawdziwe transparentne tło, wspólny canvas 96/128 px, render 48–64 px mobile, 3/4 izometria, pełna sylwetka, foot anchor, opacity 1, mały cień kontaktowy.
- Trzy sylwetki muszą być jednoznaczne: Kowal ciężki i ciepły z młotem; Uczony smuklejszy indygo/złoto z księgą; Zwiadowca lekki zielony/teal z kapturem/lunetą.
- Bez dużych aur. Statusy pokazują poza/narzędzie, lokalna reakcja budynku i mały symbol.
- Jeden scheduler animacji, jeden serwer dopiero na końcu, wyłączony po ocenie.

## Architektura

```text
Hermes API/logs -> WorldBridge -> LivingWorldStateMachine -> presentation model
                                                        |-> MapAgentLayer (małe sprite'y)
                                                        `-> React UI (duże portrety)
```

Nowe pliki:

- `src/components/map-agents/MapAgentSprite.jsx`
- `src/components/map-agents/MapAgentSprite.css`
- `src/components/map-agents/MapAgentLayer.jsx`
- `src/world/data/mapAgentManifest.js`
- `src/world/mapAgentPresentation.js`
- `src/world/mapAgentPresentation.test.js`
- `public/map-agents/coder/`
- `public/map-agents/researcher/`
- `public/map-agents/prospecting/`
- `public/map-agents/fallback/`

Modyfikowane: `WorldFallback.jsx`, BottomSheet/detail, kamera tylko w zakresie regresji gestów, walidator world-life. `HeroSprite` i duże assety nie są kasowane przed sprawdzeniem konsumentów; są usuwane tylko z warstwy świata.

## Task 0–15

### Task 0 — Bezpieczny baseline

Bez serwera i watcherów. Sprawdzić importy `HeroSprite`/portretów, zachować checkpoint dotykanych plików, odtworzyć wcześniejszy `null useRef` wyłącznie z kodu/stacku. Nie zgadywać i nie dotykać mapy.

### Task 1 — Rozdział kontraktów

Stworzyć osobny manifest portretów UI i osobny manifest mapowych sprite’ów. Dodać developerską asercję, że URL portretu nie może trafić do `MapAgentLayer`.

### Task 2 — Purpose-built placeholdery

Przygotować dla Kowala, Uczonego i Zwiadowcy osobne małe assety o wspólnym canvasie i kącie 3/4. Minimalnie: `idle`, `walk-a`, `walk-b`, `work`. Nie używać cropów dużych ilustracji. Najpierw sprawdzić statyczną skalę i foot anchor.

### Task 3 — `MapAgentSprite`

Osobny wrapper pozycji świata i wewnętrzny wrapper animacji, by transformy się nie nadpisywały. Props: profileId, visualState, direction, worldX/Y, baseScale, selected, severity, onSelect. Foot anchor `translate(-50%,-100%)`, cień pozostaje na ziemi, `z-index` z worldY. Walk ma dwufazowy krok i bob 1–2 px; idle maksymalnie 1 px, bez pływania.

### Task 4 — `MapAgentLayer`

Renderować presentation models, sortować po Y i obsługiwać strefy wejść/occlusion. Tap wybiera, drag/pinch steruje kamerą. Usunąć duże portrety z warstwy mapy; pozostałe 9 profili dostaje neutralny mały fallback, nigdy stary portret.

### Task 5 — Pełny cykl Kowala

`idle -> dispatch -> road walk -> arrive forge -> enter -> work -> success -> exit -> return -> idle`. Użyć istniejących `WORLD_LIFE_JOURNEYS`. Wejście i wyjście dokładnie przy progu, bez dachów/teleportów. Podczas pracy reaguje Kuźnia: lokalne iskry i ciepłe światło.

### Task 6 — Uczony

Ta sama data-driven architektura, bez kopiowania komponentu. Trasa do Knowledge Archive. Work: subtelne okno/runy/kartkowanie. Realne dane mają pierwszeństwo przed demo fallbackiem.

### Task 7 — Zwiadowca

Trasa do lodge/watch, odcinek patrolu i powrót. `observing` dostaje odrębną pozę. Blocked zatrzymuje postać na bezpiecznym waypointcie, nie w wodzie lub budynku.

### Task 8 — Status w dwie sekundy

Working = poza/narzędzie + budynek. Moving/task = mały pakunek/niebieski znacznik. Success = złoty błysk <900 ms. Warning = mały bursztynowy symbol. Blocked/error = czerwony symbol i zatrzymana poza. Offline = jawna desaturacja tylko w tym stanie.

### Task 9 — Portrety w UI

Tap małego agenta otwiera BottomSheet/detail z dużą ilustracją, nazwą, rolą, realnym statusem, taskiem i ostatnim zdarzeniem. Mobile compact->expanded; desktop panel boczny. Portret nie pojawia się pod panelem na mapie.

### Task 10 — Życie świata

Zachować subtelną wodę, światła, dym Kuźni, puls Core i runy Archive. Ambient nie może udawać realnego taska. Efekty funkcjonalne są sterowane FSM/API i lokalne, bez pełnoekranowych filtrów.

### Task 11 — Kamera

Traktować „zoom nie działa” jako P0. Mobile: one-finger pan, two-finger pinch. Desktop: drag i wheel zoom wokół kursora. Tap tylko poniżej progu ruchu; drag nie otwiera sheetu. Min zoom pokazuje mapę, max zachowuje jakość agentów.

### Task 12 — Stabilność React

Cleanup listenerów/tickerów/observerów ma być idempotentny. Nie wykonywać `.remove/.stop` na null/zniszczonym refie. Nie inicjalizować świata podwójnie w StrictMode/HMR. Kilka mount/unmount nie może wywołać critical UI error.

### Task 13 — Performance mobile

Jeden clock dla agentów, animować transform/opacity, pauza po `visibilitychange`, culling/LOD jako fundament skalowania. Cel 60 fps nowszy iPhone, stabilne 30 fps słabszy, bez long tasków >50 ms podczas ruchu.

### Task 14 — Testy

Testy mappingu stanów, foot anchor/Y-sort, trwałości cyklu między pollingami, tras i wejść. Asercja DOM: map layer nie zawiera URL z manifestu portretów. Uruchomić walidator i produkcyjny build, bez watchera.

### Task 15 — Jeden preview

Po zielonych testach uruchomić dokładnie jeden serwer. Sprawdzić desktop i iPhone: mapa, pan/zoom, Kowal wejście-praca-wyjście, Uczony, Zwiadowca, tap->duży portret. Po ocenie zatrzymać proces i potwierdzić brak serwera.

## Definition of Done

- Mapa v2 niezmieniona.
- Zero dużych portretów na mapie.
- Trzy różne, małe, nieprzezroczyste sprite’y w jednym kącie izometrycznym.
- Stopy zawsze na drodze; poprawny cień, skala i Y-sort.
- Ruch wygląda jak kroki, nie pływanie.
- Pełne wejście, praca i wyjście z właściwego budynku.
- Working/success/blocked rozpoznawalne bez tekstu w dwie sekundy.
- Duże ilustracje działają w UI po tapnięciu.
- Pan/zoom działa mobile i desktop.
- Brak błędu `null useRef`.
- Walidator, testy i build zielone.
- Jeden preview, wyłączony po ocenie.

## Referencje — wymagania odczytane z trzech obrazów

Wszystkie trzy obrazy użytkownika są obowiązującą referencją, nie źródłem gotowych cropów.

- Wyraźnie uproszczone, map-ready sprite’y, tworzone osobno na podstawie charakteru dużych ilustracji.
- Jedna konsekwentna perspektywa izometryczna 3/4.
- Docelowo 50–64 px wysokości na mapie.
- Małe, czytelne i w pełni nieprzezroczyste.
- Zredukowane detale, bez dużych poświat.
- Bazowa animacja idle oraz pełny walking cycle.
- Stopy stoją dokładnie na ścieżce, pod nimi mały cień kontaktowy.
- Jawne, odrębne stany: walking, working i alert.
- Pierwszy test chodu: cztery klatki skierowane w dół-prawo; dopiero po potwierdzeniu rytmu rozszerzyć kierunki.
- Uproszczenie ma zachować sylwetkę, kolor roli, narzędzie i osobowość, ale nie drobny detal portretu.
- Próba na mapie musi udowodnić skalę, kontakt z podłożem, czytelność i wejście/wyjście z budynku przed produkcją kompletu 12 agentów.

Styl ma być własnym Hermes AI/Fantasy, nie kopią Heroes ani innej gry.

## Polecenie startowe dla następnego modelu

Przeczytaj cały ten plik. Nie analizuj projektu od początku. Wykonuj Task 0–15 po kolei. Mapa v2 jest zablokowana. Duże ilustracje są tylko portretami UI. Najpierw pełny cykl Kowala, potem Uczony i Zwiadowca. Nie modyfikuj Hermes OS CAT, `server.js`, mapy ani API. Nie uruchamiaj więcej niż jednego serwera i preview uruchom dopiero po testach.
