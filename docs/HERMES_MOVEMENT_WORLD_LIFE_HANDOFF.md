# HERMES OS Living World — handoff: Movement & World Life Pass

## 1. Cel następnego okna

Dowieźć jeden widoczny milestone na zatwierdzonej mapie:

> Kowal, Uczony i Zwiadowca są prawidłowo osadzeni, poruszają się po istniejących drogach, wykonują pełny cykl pracy, uruchamiają reakcje właściwych budynków i pozostają czytelni na telefonie.

To nie jest okno na redesign, backend, kolejną mapę, nowe postacie ani dokumentację open source.

## 2. Nienaruszalne zasady

- Pracuj wyłącznie w `hermes-os-living-world`.
- Nie modyfikuj Hermes OS CAT w `C:\Users\User\.gemini\antigravity\scratch\hermes-os-panel`.
- Nie zmieniaj `server.js` ani istniejącego kontraktu backendu.
- Aktualny wygląd mapy otrzymał **GL**. Nie generuj nowej mapy i nie zmieniaj jej kompozycji.
- Zachowaj mobile-first. Desktop rozszerza telefon, nie zastępuje go.
- Backend, taski i logi są źródłem prawdy. Świat jest projekcją stanu, nie źródłem stanu.
- Rozwijaj istniejące: `LivingWorldStateMachine`, `roadGraph`, `HeroSprite`, `WorldFallback`, `HermesInfrastructureLayer`. Nie twórz konkurencyjnego silnika ruchu.
- Nie uruchamiaj wielu serwerów. Preview uruchamiaj tylko po komunikacie do użytkownika; dokładnie jeden proces; wyłącz natychmiast po GL/RL.

## 3. Zatwierdzony stan wizualny

- Aktywne assety mapy:
  - `src/assets/hermes-citadel-hd-v2.png`
  - `src/assets/hermes-citadel-mobile-v2.png`
- Kierunek: premium AI-fantasy, ciemne indygo, kamień, brąz, cyjanowe kryształy i przewody danych.
- Obecna mapa, jej klimat i obecne UI są bazą. Dozwolone są wyłącznie korekty czytelności, anchorów i efektów stanowych.
- Użytkownik zatwierdził kamerę i możliwość oddalania.

## 4. Co faktycznie już działa

1. `WorldFallback` renderuje zatwierdzoną mapę v2 oraz 12 osobnych assetów postaci.
2. `HeroSprite` używa zwykłego `<img>`, dolnego anchora, kontaktowego cienia i nie wycina postaci przez `clip-path`/maskę/sprite crop.
3. `roadGraph.js` zawiera jawne trasy i węzły dla 12 profili; trasa Kowala prowadzi przez zachodnią drogę do wejścia Kuźni.
4. `HeroSprite` obsługuje wieloodcinkową animację przez cztery punkty trasy.
5. `LivingWorldStateMachine` rozpoznaje m.in. `walking-to-work`, `working`, `carrying`, `success`, `blocked`, `incident`, `walking-home` i `resting`.
6. `useDomWorldCamera` zapewnia pan myszką/palcem, pinch-to-zoom, zoom kółkiem, reset podwójnym kliknięciem i ograniczenia kamery.
7. Live i demo są jawnie rozdzielone: `?demo=1` uruchamia fixture; zwykły adres nie podstawia ukradkiem demo.
8. `WorldBridge` ma strict API, `Promise.allSettled`, cache domen i provenance `live/stale/unknown/demo`; polling jest rozdzielany na 5/15/60 sekund.

## 5. Stan częściowy i znane braki

### Ruch

- Obecny ruch nadal jest głównie animacją CSS `left/top`; nie ma kompletnej, trwałej sekwencji `arrive → work → exit → return`.
- Próba dodania `transitionUntil`/`visualCompletedAt` nie znajduje się w aktualnym pliku. Następne okno musi wdrożyć ją świadomie i przetestować.
- W live task może zostać zauważony dopiero po 15 sekundach. Nie wolno uzależniać marszu tylko od `started_at < 4.2 s`.
- Orientacja jest obecnie wyliczana dla całej trasy, nie każdego segmentu.
- Brakuje prostego lane offsetu, więc agenci mogą na siebie nachodzić.
- Zwiadowca ma trasę do swojego budynku, ale nie ma jeszcze właściwej pętli patrolowej wzdłuż murów.

### Postacie

- Skala jest nadal duża (`72–106 px`, mobile `62–80 px`) i wymaga kalibracji na mapie dla trzech agentów.
- Aura/presence jest widoczna domyślnie. Docelowo ma być subtelna w idle i mocniejsza tylko dla selected/warning/error/ważnego eventu.
- `blocked/incident` mają obniżoną opacity; nie wolno ponownie robić z nich półprzezroczystych duchów.
- Anchor i cień istnieją, ale trzeba je ocenić osobno dla Kowala, Uczonego i Zwiadowcy.

### Reakcje świata

- `HermesInfrastructureLayer` posiada kryształy i przewody oraz ogólną reakcję na stany.
- Brakuje czytelnych, osobnych reakcji:
  - Kuźnia: ogień/światło/dym,
  - Knowledge Archive: puls danych/runa,
  - punkt obserwacyjny: sygnał patrolu.
- Reakcje muszą wynikać z FSM agenta i wyłączać się po pracy.

### Mobile UI

- Kamera i pełnoekranowa mapa działają.
- Brakuje ambient mode chowającego drugorzędne overlaye po bezczynności.
- Status główny i krytyczne alerty muszą pozostać zawsze widoczne.

### Repo/checkpoint

- Folder `hermes-os-living-world` nie jest obecnie rozpoznawany jako samodzielne repo Git (`git status` zwraca brak repozytorium).
- Nie wykonuj `git init` bez zgody użytkownika.
- Checkpoint wykonaj przez manifest SHA-256 i kopię wyłącznie plików dotykanych w tym passie do lokalnego katalogu `checkpoints/movement-world-life-pre/`.

## 6. Dokładna kolejność prac

### Task 0 — bezpieczny checkpoint i baseline

1. Potwierdź brak działających procesów preview należących do Living World.
2. Sprawdź pliki wymienione w sekcji „zakres plików”.
3. Wykonaj `npm.cmd run build` — proces ma się sam zakończyć.
4. Uruchom istniejące testy, jeżeli skrypt testowy istnieje; nie instaluj nowego frameworka.
5. Utwórz manifest hashy i kopię tylko plików, które będą edytowane.
6. Zapisz wynik baseline w maksymalnie ośmiu punktach i od razu przejdź do Task 1.

**Gate:** zielony build albo jednoznacznie udokumentowany istniejący błąd niezwiązany z passem.

### Task 1 — kontrakt trzech podróży

Rozszerz istniejące dane tras, nie twórz nowego systemu.

Dodaj jawne journey definitions:

- `coder`: dispatch/citadel → central junction → forge lane → forge entrance → forge work anchor → reverse route,
- `researcher`: dispatch/citadel → upper hub → library lane → archive entrance → archive work anchor → powrót lub Cytadela,
- `prospecting`: scout lodge → wall lane A → observation point → wall lane B → scout lodge.

Każda definicja zawiera:

- `homePoint`, `dispatchPoint`, `entrancePoint`, `workPoint`,
- `outboundWaypoints`, `returnWaypoints`,
- `laneOffset`,
- `walkDurationMs`, `arriveDurationMs`, `workDurationMs`, `successDurationMs`,
- `buildingId`, `workEffect`.

Preferowany plik: rozszerzenie `src/world/data/roadGraph.js` lub jeden mały plik danych importowany przez niego.

**Gate:** wszystkie punkty leżą na widocznej drodze, placu albo wejściu mapy mobile v2.

### Task 2 — trwały FSM, bez teleportów

Rozszerz `LivingWorldStateMachine.js` o pełną sekwencję:

`idle → walking-to-work → arriving → working → success|incident → walking-home → idle`

Zasady:

- wykrycie nowego taska `running` ma tworzyć prezentacyjny `transitionStartedAt` i `transitionUntil`, niezależnie od wieku backendowego `started_at`,
- przy kolejnych pollach metadane przejścia muszą zostać zachowane z poprzedniego snapshotu,
- `done` tworzy `visualCompletedAt`, aby sukces był widoczny nawet przy opóźnionym pollingu,
- `blocked/error` przerywa normalny cykl i uruchamia właściwy stan bez teleportu,
- live wykorzystuje realne taski/logi; demo może użyć istniejącego `WorldSceneScript`, ale nie może wpływać na live.

Dodaj lekki presentation clock (np. hook odświeżający wyłącznie resolver czasu), jeżeli live nie renderuje faz pomiędzy pollami. Nie twórz drugiego store ani nowej kolejki eventów.

**Gate:** stały snapshot nie uruchamia cyklu ponownie; nowy task uruchamia dokładnie jedną podróż.

### Task 3 — renderer ruchu po segmentach

Rozwijaj `HeroSprite` i `WorldFallback`:

- czas segmentu proporcjonalny do jego długości,
- orientacja aktualizowana na każdym segmencie,
- delikatny krok/bob zamiast płynnego ślizgania,
- stopy i cień pozostają sklejone z podłożem,
- z-index zależy od bieżącego `y`,
- `laneOffset` rozsuwa agentów na wspólnej drodze,
- `arriving` kończy się dokładnie przy wejściu,
- podczas `working` agent jest przy stanowisku albo kontrolowanie znika za progiem — nie na dachu.

Nie wprowadzaj A*, navmesha ani crowd simulation.

**Gate:** Kowal, Uczony i Zwiadowca przechodzą swoje trasy bez przecięcia brył budynków.

### Task 4 — kalibracja trzech postaci

Bez nowych ilustracji:

- zmniejsz bazową skalę,
- ujednolić wizualną wysokość,
- popraw bottom-center foot anchor,
- cień: mała elipsa, niska opacity, stały kontakt z drogą,
- opacity postaci w normalnych stanach: 1,
- aura idle: bardzo słaba albo wyłączona,
- aura mocna tylko dla selected/warning/error/ważnego eventu.

Najpierw Kowal, Uczony, Zwiadowca. Pozostałych nie przebudowuj perfekcyjnie w tym oknie.

**Gate:** w typowym pionowym viewportcie postacie są czytelne, lecz nie dominują nad budynkami.

### Task 5 — reakcje trzech budynków

Rozszerz `HermesInfrastructureLayer`, nie buduj osobnego systemu efektów.

- `forge + working/carrying`: puls paleniska, mały dym lub ciepłe światło,
- `library + working`: cyjanowa runa/puls danych,
- `scout-lodge/watchpoint + observe`: sygnał obserwacyjny,
- `keep`: spokojny heartbeat,
- fontanna/kryształ: stały, tani ambient.

Efekt jest funkcją `buildingId + phase`; po pracy wraca do idle. Ogranicz liczbę cząstek i animacji blur na mobile.

**Gate:** patrząc bez tekstu, wiadomo, w którym budynku ktoś pracuje.

### Task 6 — trzy obowiązkowe scenariusze

#### Kowal

1. Idle/dispatch.
2. Otrzymuje task.
3. Idzie drogą do Kuźni.
4. Zatrzymuje się przy wejściu.
5. Pracuje; Kuźnia reaguje.
6. Success lub error.
7. Wychodzi z paczką/rezultatem.
8. Wraca trasą odwrotną.

#### Uczony

1. Idzie do Knowledge Archive.
2. Arrive przy wejściu.
3. Thinking/working.
4. Puls danych budynku.
5. Wychodzi z raportem.
6. Wraca lub przechodzi do Cytadeli.

#### Zwiadowca

1. Rozpoczyna patrol.
2. Idzie wzdłuż murów.
3. Zatrzymuje się w punkcie obserwacyjnym.
4. Observe.
5. Wraca z raportem/mapą.
6. Pętla może działać wyłącznie w jawnym demo; live patrol wynika z realnego stanu.

**Gate:** każdy scenariusz można jednoznacznie zaobserwować od początku do końca.

### Task 7 — ambient mode mobile

Dodaj jeden mały mechanizm bez przebudowy UI:

- timer bezczynności 5–7 sekund,
- drugorzędne overlaye dostają klasę `is-ambient` i chowają/minimalizują się,
- główny status `HERMES / n z 12 / stan` zostaje,
- krytyczny alert zostaje,
- pointer/touch/keyboard przywraca kontrolki,
- bottom sheet nie przechodzi w ambient podczas otwarcia.

**Gate:** ruch agentów jest widoczny na telefonie, a UI nie zasłania centrum świata.

### Task 8 — test i checkpoint końcowy

1. Build.
2. Test resolvera FSM dla całego cyklu.
3. Test tras: pierwsza/ostatnia pozycja, brak pustych segmentów, reverse route.
4. Test `prefers-reduced-motion`.
5. Jeden preview desktop i jeden viewport mobile na dokładnie jednym serwerze.
6. Po GL/RL zatrzymaj serwer.
7. Zapisz manifest końcowy i listę zmienionych plików.

## 7. Zakres plików następnego okna

Pliki prawdopodobnie edytowane:

- `src/world/LivingWorldStateMachine.js`
- `src/world/WorldBridge.js` — tylko minimalne metadane przejść
- `src/world/data/roadGraph.js`
- `src/world/WorldFallback.jsx`
- `src/components/HeroSprite.jsx`
- `src/components/HeroSprite.css`
- `src/world/HermesInfrastructureLayer.jsx`
- `src/world/hermesInfrastructureLayer.css`
- `src/world/useDomWorldCamera.js` — tylko jeśli gesty kolidują z selekcją/ruchami
- istniejący CSS overlayów dla ambient mode
- mały nowy hook ambient mode, jeżeli brak właściwego istniejącego miejsca

Pliki poza zakresem:

- `server.js`
- oryginalny Hermes OS CAT
- assety mapy v2
- assety 12 postaci
- architektura API poza minimalnym zachowaniem transition metadata
- Pixi renderer, jeśli DOM fallback już dowozi milestone

## 8. Kryteria Definition of Done

- Mapa v2 pozostaje bez zmian.
- Kowal faktycznie idzie drogą do Kuźni, uruchamia reakcję i wraca.
- Uczony faktycznie idzie do Archive, pracuje, wychodzi z raportem.
- Zwiadowca patroluje trasę przy murach i wraca.
- Brak teleportów i chodzenia po dachach.
- Trzy postacie mają spójną skalę, foot anchor, kontaktowy cień i pełną opacity.
- Aura nie robi z postaci naklejek/duchów.
- Budynki reagują tylko na właściwe stany.
- Świat ma spokojny ambient bez interakcji.
- Mobile UI odsłania świat po bezczynności.
- Kamera nadal działa dotykiem i myszką.
- Build i testy przechodzą.
- Działa telefon i desktop.
- Końcowy preview używa jednego procesu, który zostaje wyłączony po ocenie.

## 9. Pierwsze polecenie dla następnego agenta

> Przeczytaj cały `docs/HERMES_MOVEMENT_WORLD_LIFE_HANDOFF.md`. Nie wracaj do starego planu i nie projektuj niczego od nowa. Wykonaj Task 0, następnie od razu Task 1–6. Nie pytaj o ponowną akceptację zatwierdzonej mapy. Priorytetem jest widoczny pełny cykl Kowala, Uczonego i Zwiadowcy na mobile. Nie uruchamiaj więcej niż jednego serwera i zawsze go wyłącz po checkpointcie.

