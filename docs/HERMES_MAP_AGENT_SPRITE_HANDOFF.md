# HERMES OS — MAP AGENTS & LIVING WORLD PASS

## 1. Cel okna

Dowieźć pierwszą wiarygodną wersję żywego świata, w której Kowal, Uczony i Zwiadowca są prawdziwymi małymi mieszkańcami mapy: stoją stopami na drodze, chodzą po waypointach, znikają w wejściu budynku, wykonują czytelną pracę i wracają. W ciągu dwóch sekund użytkownik ma odróżnić: kto pracuje, kto idzie, kto skończył i gdzie wystąpił problem.

To nie jest gra i nie budujemy mechaniki gry. Świat jest warstwą prezentacji stanu Hermesa. Backend, API i logi pozostają źródłem prawdy.

## 2. Bezwzględne ograniczenia

- Mapa v2 ma GL: nie edytuj, nie generuj i nie zmieniaj jej kompozycji.
- Nie modyfikuj oryginalnego Hermes OS CAT.
- Nie modyfikuj `server.js` ani kontraktów istniejącego `api.js`.
- Duże ilustracje nie są sprite’ami świata. Zachowaj je jako portrety w panelu szczegółów, profilu i kartach.
- Nie naprawiaj dużych ilustracji aurą, opacity, filtrem, cropem, maską, `clip-path`, pseudo-elementem ani kolejną zmianą skali.
- Nie twórz sprite’a przez zwykłe pomniejszenie pełnej ilustracji.
- Nie uruchamiaj wielu serwerów, ciężkich watcherów ani równoległych generatorów.
- Podgląd uruchom jeden raz, dopiero po buildzie i testach, a po ocenie zatrzymaj proces.

## 3. Co już działa i ma zostać

- GL-approved desktop/mobile map v2.
- `WorldBridge` mapujący dane Hermes API do warstwy prezentacji.
- `LivingWorldStateMachine` ze stanami m.in. idle, walking, arriving, working, observing, returning i blocked.
- `roadGraph.js` oraz `WORLD_LIFE_JOURNEYS` dla coder, researcher i prospecting.
- Ruch oparty o czas i dystans, a nie liczbę klatek.
- `usePresentationClock`, infrastruktura reaktywna, StatusBar i BottomSheet.
- Polling i metadane przejść chroniące animację przed resetem przy kolejnym odpytywaniu.
- Walidator `npm run validate:world-life`.

Obecny defekt architektoniczny: `WorldFallback.jsx` renderuje na mapie duże portrety przez `HeroSprite.jsx`. Trzeba rozdzielić reprezentację mapową od portretowej, bez naruszania FSM, tras i bridge'a.

## 4. Docelowy podział odpowiedzialności

```text
Hermes REST API / logs (źródło prawdy)
                |
           WorldBridge
                |
      LivingWorldStateMachine
                |
        presentation model
          /            \
 MapAgentLayer          React UI
 małe sprite'y          duże portrety
 ruch i praca           szczegóły/agenta
```

Mapa nie może importować assetów portretowych. UI nie może używać małego sprite’a jako głównego portretu.

## 5. Docelowa struktura plików

### Nowe pliki

- `src/components/map-agents/MapAgentSprite.jsx` — jeden agent mapowy, foot anchor, cień, kierunek, stan i event kliknięcia.
- `src/components/map-agents/MapAgentSprite.css` — wyłącznie layout, transform, opacity 1, cień kontaktowy i lekkie animacje; bez crop/mask/filter do usuwania tła.
- `src/components/map-agents/MapAgentLayer.jsx` — render listy, selekcja, sortowanie według Y i ograniczenie jakości na słabszych urządzeniach.
- `src/world/data/mapAgentManifest.js` — jawne mapowanie profilu na małe assety, paletę, bazową skalę, foot anchor i dozwolone kierunki.
- `src/world/mapAgentPresentation.js` — czysta funkcja: FSM + kierunek + etap trasy -> visual state/frame/effect.
- `src/world/mapAgentPresentation.test.js` — test kontraktu prezentacyjnego.
- `public/map-agents/coder/` — purpose-built placeholdery Kowala.
- `public/map-agents/researcher/` — purpose-built placeholdery Uczonego.
- `public/map-agents/prospecting/` — purpose-built placeholdery Zwiadowcy.
- `public/map-agents/fallback/` — mały neutralny token pozostałych profili, żeby żaden duży portret nie wrócił na mapę.

### Modyfikowane pliki

- `src/world/WorldFallback.jsx` — zamiana warstwy `HeroSprite` na `MapAgentLayer`; bez zmian mapy.
- `src/world/data/agentPortraitAssets.js` — pozostaje katalogiem portretów, ewentualnie zmiana nazwy eksportu dla jednoznaczności.
- komponent BottomSheet/detail — używa dużej ilustracji jako portretu po kliknięciu.
- `src/world/useDomWorldCamera.js` — wyłącznie naprawa potwierdzonej regresji pan/zoom.
- walidator world-life — dodatkowe asercje rozdziału map sprite / portrait.

### Pliki wycofane tylko z warstwy mapy

- `HeroSprite.jsx` i `HeroSprite.css` nie są kasowane automatycznie. Jeśli służą UI, zostają; jeśli nie mają konsumentów po migracji, oznacz je jako legacy i usuń dopiero po sprawdzeniu importów.

## 6. Kontrakt małego assetu mapowego

Na milestone użyj osobnych, celowo przygotowanych placeholderów, nie przeskalowanych portretów.

- Format: WebP lub PNG z prawdziwą przezroczystością.
- Wspólny canvas źródłowy: 96x96 albo 128x128 px dla wszystkich trzech.
- Render na mobile: 48–64 px wysokości sylwetki; desktop może użyć 56–72 px zależnie od zoomu.
- Perspektywa: jedna spójna 3/4 izometryczna.
- Sylwetka od stóp do głowy, bez obciętej broni, płaszcza czy kaptura.
- Foot anchor: środek dolnej krawędzi sylwetki; metadata w manifeście, nie magiczna stała w wielu komponentach.
- Pełna nieprzezroczystość postaci; półprzezroczyste mogą być wyłącznie małe efekty statusu.
- Mały cień kontaktowy jako osobny element pozostający na ziemi.
- Bez dużej aury. Status to niewielki akcent pod stopami lub piktogram nad głową.
- Kowal: ciężka, szeroka sylwetka, ciepły pomarańcz/czerwień, młot.
- Uczony: smuklejsza sylwetka, indygo/złoto, księga lub zwój.
- Zwiadowca: lekka pochylona sylwetka, zieleń/teal, kaptur lub luneta.

Minimalny zestaw milestone na agenta: `idle`, `walk-a`, `walk-b`, `work`. Jeśli assety kierunkowe nie są gotowe, dopuszczalne jest lustrzane odbicie tylko dla logicznie symetrycznej sylwetki; tekst, tarcza i asymetryczna broń nie mogą być odwracane bez kontroli.

## 7. Kontrakt komponentu

```text
MapAgentSprite props:
  profileId
  visualState: idle | walk | arrive | work | success | blocked | return
  direction: ne | se | sw | nw
  worldX, worldY
  baseScale
  selected
  statusSeverity
  onSelect(profileId)
```

Zasady renderowania:

- Jeden wrapper zakotwiczony stopami: `translate(-50%, -100%)`.
- `z-index` wyliczany z worldY i jawnych stref occlusion, nie z indeksu profilu.
- Cień jest rodzeństwem obrazu, nie częścią assetu.
- Obraz ma `display:block`, `object-fit:contain`, `opacity:1`.
- Walk może mieć 1–2 px vertical bob zsynchronizowany z dwoma krokami, ale translacja świata pochodzi wyłącznie z kontrolera trasy.
- Idle ma oddech maksymalnie 1 px; żadnego pływania całej postaci.
- Work jest czytelne przez zmianę pozy/narzędzia i reakcję budynku, a nie ogromną aurę.
- Hit target może być większy niż grafika, ale niewidoczny i nie może zasłaniać gestu kamery po rozpoczęciu drag/pinch.

## 8. Taski wykonawcze 0–15

### Task 0 — Stabilny baseline i checkpoint

- Nie uruchamiaj serwera.
- Sprawdź procesy tylko wtedy, gdy istnieje realna przesłanka, że coś działa w tle.
- Zapisz listę obecnych importów `HeroSprite` i `agentPortraitAssets`.
- Uruchom wyłącznie statyczne testy/build po zmianach, nie watch.
- Załóż checkpoint plików dotykanych w tym oknie.
- Zidentyfikuj źródło wcześniejszego `null ... useRef` przez kod i stack trace, jeśli jest dostępny; nie zgaduj.

Koniec taska: znany baseline, brak serwera, brak zmian mapy.

### Task 1 — Formalny rozdział portrait vs map sprite

- Wprowadź osobne nazwy i manifesty assetów.
- Dodaj komentarz kontraktowy: portrait tylko UI, mapAgent tylko świat.
- Dodaj asercję developerską/log ostrzegający, jeśli URL portretu trafi do `MapAgentLayer`.
- Nie usuwaj dużych ilustracji z repozytorium.

Koniec taska: niemożliwe jest przypadkowe użycie portretu przez nowy komponent mapowy.

### Task 2 — Trzy purpose-built placeholdery

- Przygotuj małe, nieprzezroczyste assety Kowala, Uczonego i Zwiadowcy zgodne ze specyfikacją.
- Każdy ma inną sylwetkę, dominantę kolorystyczną i narzędzie.
- Nie używaj wycinka ani pomniejszenia dużych ilustracji.
- Najpierw przygotuj jeden statyczny kadr na agenta i oceń skalę w kontekście mapy; dopiero potem minimalne kadry idle/walk/work.

Koniec taska: trzy osobne, transparentne małe assety o wspólnym canvasie i foot anchorze.

### Task 3 — `MapAgentSprite`

- Zbuduj komponent niezależny od starego `HeroSprite`.
- Dodaj kontaktowy cień, foot anchor, kierunek, stan i selekcję.
- Nie dodawaj dużej aury ani filtrów próbujących scalać postać z mapą.
- Upewnij się, że transform ruchu i transform animacji nie nadpisują się: wrapper świata oraz wewnętrzny wrapper animacji mają osobne odpowiedzialności.

Koniec taska: statyczne trzy postacie stoją poprawnie stopami na testowych waypointach.

### Task 4 — `MapAgentLayer` i Y-sort

- Warstwa przyjmuje presentation models, nie surowe rekordy API.
- Sortuje agentów po worldY oraz respektuje istniejące strefy wejść/occlusion.
- Klik wybiera agenta, drag/pinch porusza kamerą.
- Pozostałe 9 profili dostaje mały neutralny fallback lub pozostaje ukryte do chwili przygotowania poprawnego sprite’a; bez dużych portretów na mapie.

Koniec taska: żaden `.hero-image`/portret nie występuje w warstwie świata.

### Task 5 — Kowal: referencyjny pełny cykl

- `idle at home -> dispatch -> walk road -> arrive forge -> enter -> work -> success -> exit -> return -> idle`.
- Trasa wyłącznie po waypointach z `WORLD_LIFE_JOURNEYS`.
- Wejście: postać dochodzi do progu, jest zasłaniana przez front budynku lub płynnie znika w masce/strefie wejścia; nie teleportuje się na dachu.
- Praca: postać wewnątrz niewidoczna albo częściowo widoczna zgodnie z wejściem; Kuźnia reaguje iskrami/światłem.
- Wyjście zaczyna się dokładnie przy progu.

Koniec taska: pełny, powtarzalny i wizualnie wiarygodny cykl Kowala.

### Task 6 — Uczony

- Reuse tego samego systemu, bez kopiowania logiki komponentu.
- Trasa do Knowledge Archive.
- Work: subtelne światło okna, runy danych lub kartkowanie; sukces może dać krótki zwój/iskrę informacji.
- Zdarzenie live z API ma pierwszeństwo; demo fallback tylko gdy brak prawdziwych danych.

Koniec taska: drugi agent udowadnia, że system jest data-driven.

### Task 7 — Zwiadowca

- Trasa do Watch/Scout Lodge, patrol na zewnętrznym odcinku i powrót.
- Stan observing ma własną krótką pozę, nie jest idle z inną etykietą.
- Blocked/error zatrzymuje go w bezpiecznym waypointcie, nigdy w budynku lub wodzie.

Koniec taska: trzeci agent udowadnia trasę wieloetapową i stan obserwacji.

### Task 8 — Czytelne statusy w dwie sekundy

- Working: narzędzie/poza + reakcja przypisanego budynku.
- Walking/task: mały pakunek lub subtelny niebieski znacznik.
- Success: krótki złoty błysk do 900 ms, potem zanik.
- Warning: mały bursztynowy symbol nad głową.
- Blocked/error: czerwony symbol i zatrzymana poza; bez ciągłego wielkiego pulsowania.
- Offline: desaturacja sprite’a jest dopuszczalna tylko jako jawny stan, nie jako stały styl.

Koniec taska: status jest czytelny bez tekstu, ale nie zasłania sylwetki.

### Task 9 — Duże portrety wyłącznie w UI

- Po tapnięciu małego agenta otwórz BottomSheet/detail z jego dużą ilustracją.
- Pokaż nazwę, rolę, realny status, bieżące zadanie i ostatnie zdarzenie.
- Nie duplikuj portretu na mapie pod panelem.
- Mobile sheet startuje jako compact i może być rozwinięty; desktop może mieć stały panel boczny.

Koniec taska: duża sztuka odzyskuje właściwą rolę i podnosi jakość panelu szczegółów.

### Task 10 — World life bez fałszowania telemetrii

- Zachowaj wodę, subtelne światła, dym Kuźni, puls Core i runy Archive.
- Efekty funkcjonalne są sterowane FSM/API. Ambient może działać stale, ale nie może sugerować taska, którego nie ma.
- Ogranicz liczbę stale animowanych warstw; żadnych pełnoekranowych drogich filtrów.
- Zależności: agent arriving/working uruchamia lokalną reakcję budynku; success uruchamia krótki efekt; blocked wygasza normalny rytm i pokazuje problem.

Koniec taska: świat żyje także w idle, ale użytkownik odróżnia ambient od realnej pracy.

### Task 11 — Naprawa kamery i gestów

- Traktuj zgłoszenie „zoom nie działa w demo” jako realną regresję.
- Mobile: drag jednym palcem, pinch dwoma; UI overlay nie blokuje canvas/world poza własnym obszarem.
- Desktop: wheel zoom wokół kursora, drag myszką, opcjonalnie klawisze po MVP.
- Ustal min zoom pokazujący całą mapę i max zoom, przy którym agent nadal nie rozpada się jakościowo.
- Tap wybiera tylko przy ruchu poniżej progu; drag nie otwiera BottomSheet.

Koniec taska: ręczny test iPhone + desktop przechodzi bez konfliktu selekcji.

### Task 12 — Stabilność React/HMR

- Usuń możliwość operacji na `null`/zniszczonym refie w cleanupie kamery i warstwy świata.
- Cleanup ma być idempotentny: listener/ticker/observer może być odpinany wielokrotnie bez wyjątku.
- Nie inicjalizuj świata dwa razy w StrictMode/HMR.
- ErrorBoundary ma pokazać użyteczny błąd, ale nie może być używany do ukrywania wyjątku.

Koniec taska: kilka mount/unmount oraz HMR nie daje critical UI error.

### Task 13 — Performance mobile

- Animuj transform i opacity; nie animuj layoutu, blur ani dużych filtrów klatka po klatce.
- Aktualizuj pozycje w jednym schedulerze/clocku, nie osobnym RAF na każdego z 12 agentów.
- Pauzuj kosztowne ambienty po `visibilitychange` i w reduced motion/low power mode.
- Przy 12 agentach użyj wspólnego cyklu klatek i ogranicz efekty; architektura ma skalować się do większej liczby przez culling i LOD, bez projektowania teraz świata 200 agentów.
- Budżet: 60 fps na nowszym iPhonie, akceptowalne stabilne 30 fps na słabszym; brak długich tasków >50 ms podczas ruchu.

Koniec taska: brak wyraźnego jank podczas pan/zoom i trzech aktywnych cykli.

### Task 14 — Testy i walidacja

- Unit: presentation mapping dla idle/walk/work/success/blocked.
- Unit: foot anchor i Y-sort dla różnych worldY.
- Unit: polling nie resetuje trwającego cyklu.
- Validator: trasy nie przecinają zabronionych obszarów i mają entrance/work/return.
- DOM assertion: map layer nie zawiera assetu z manifestu portretów.
- Build produkcyjny.
- Nie uruchamiaj watchera ani wielokrotnych serwerów.

Koniec taska: testy i build zielone; jeśli lint przekroczy rozsądny czas, uruchom tylko na zmienionych plikach i zaraportuj prawdę.

### Task 15 — Jeden kontrolowany preview i GL/RL

- Uruchom dokładnie jeden serwer na jednym porcie dopiero po Task 14.
- Podaj komputerowy i LAN-owy adres telefonu.
- Scenariusz oceny: cała mapa -> Kowal idzie drogą -> wchodzi do Kuźni -> Kuźnia pracuje -> wychodzi; następnie Uczony i Zwiadowca; tap otwiera portret UI; pan/zoom działa.
- Po informacji, że użytkownik skończył oglądać, zatrzymaj proces i potwierdź brak pozostawionego serwera.

Koniec taska: użytkownik daje GL/RL na reprezentację agentów i żywotność świata.

## 9. Definition of Done okna

- Mapa v2 jest bitowo niezmieniona.
- Na mapie nie ma żadnej dużej ilustracji portretowej.
- Kowal, Uczony i Zwiadowca mają trzy osobne małe, czytelne sylwetki.
- Agenci mają prawdziwe przezroczyste tło, opacity 1, wspólną perspektywę i foot anchor.
- Ruch wygląda jak chodzenie: dwufazowy krok/bob, bez pływania i bez teleportów.
- Każdy porusza się po drodze, poprawnie wchodzi do właściwego budynku, pracuje i wychodzi.
- Budynek reaguje na stan agenta; ambient nie udaje realnego taska.
- Statusy working/success/blocked są rozpoznawalne w dwie sekundy bez czytania logów.
- Tap małego agenta pokazuje dużą ilustrację i realne dane w UI.
- Pan/zoom działa na telefonie i desktopie.
- Brak `null useRef` przy mount/unmount/HMR.
- Walidator, testy i produkcyjny build przechodzą.
- Preview używa jednego procesu i zostaje wyłączony po ocenie.

## 10. Kolejność priorytetów przy braku czasu

1. P0: rozdział portret/sprite, brak dużych ilustracji na mapie.
2. P0: poprawny mały Kowal i pełny cykl wejście–praca–wyjście.
3. P0: stabilność `useRef` oraz działający pan/zoom.
4. P1: Uczony i Zwiadowca na tej samej architekturze.
5. P1: czytelne realne statusy i portret w BottomSheet.
6. P2: dodatkowe ambienty i polish.

Nie poświęcaj poprawnego systemu agentów na rzecz większej liczby efektów.

## 11. Materiały referencyjne

- `C:\Users\User\Desktop\ChatGPT Image 11 lip 2026, 03_11_55.png` — referencja skali, rozróżnialnych sylwetek i palet małych agentów.
- `C:\Users\User\Desktop\ChatGPT Image 11 lip 2026, 03_12_18 (1).png` — referencja osadzenia małych agentów na izometrycznej drodze i kierunku uproszczenia.
- `C:\Users\User\Desktop\ChatGPT Image 11 lip 2026, 03_12_23 (2).png` — plik obecnie nie istnieje pod podaną ścieżką; nie blokuje realizacji.

Referencje nie są źródłem gotowych cropów. Należy zbudować własną tożsamość Hermes: fantasy infrastruktury AI, bez kopiowania Heroes, RimWorld ani innej gry.

## 12. Pierwsze polecenie dla następnego modelu

> Przeczytaj w całości `NEXT_WINDOW_HANDOFF.md` oraz `docs/HERMES_MAP_AGENT_SPRITE_HANDOFF.md`. Nie analizuj projektu od początku. Mapa v2 ma GL i jest zablokowana. Duże ilustracje są wyłącznie portretami UI. Wykonuj Task 0–15 po kolei, zaczynając od rozdziału assetów i pełnego cyklu Kowala. Następnie Uczony i Zwiadowca. Nie modyfikuj Hermes OS CAT, `server.js` ani mapy. Nie uruchamiaj więcej niż jednego serwera; preview dopiero po testach i wyłącz go po ocenie.
