# Hermes OS Living World — Execution Directive

## 0. Nienaruszalne zasady

1. Projekt rozwijamy wyłącznie w `hermes-os-living-world`.
2. Nie modyfikujemy, nie przenosimy i nie czyścimy działającego Hermes OS CAT.
3. Hermes backend, API i logi są jedynym źródłem prawdy.
4. Living World jest warstwą projekcji: interpretuje stan i fizycznie go odgrywa.
5. Renderer nie może sam wymyślać pracy, błędu, sukcesu, tasku ani stanu systemu.
6. Ambient może ożywiać świat, ale nie może zmieniać znaczenia operacyjnego.
7. To jest narzędzie observability w formie żywego świata, nie gra.
8. Nie dodajemy fabuły, ekonomii, progresji, walki, statystyk RPG ani game loopu.
9. Telefon jest pełnym produktem. Desktop pokazuje ten sam świat i dodaje kontrolę oraz szczegóły.
10. Obowiązuje test dwóch sekund: bez logów i tabel użytkownik widzi pracę, problem i zdrowie systemu.

## 1. Kontrakt danych

```text
Hermes REST API / logi / taski / metryki
                    │
                    ▼
           normalizacja i freshness
                    │
                    ▼
          kanoniczny WorldSnapshot
                    │
                    ▼
       deterministyczna interpretacja
                    │
                    ▼
 agent / budynek / paczka / pogoda / overlay
```

### Dozwolona interpretacja renderera

- interpolacja pomiędzy dwoma prawdziwymi anchorami;
- jednorazowa animacja po wykrytej zmianie backendu;
- mikroruch idle 1–2 px;
- krótka celebracja realnego `done`;
- wygaszenie ostatniego prawdziwego snapshotu jako `stale`.

### Niedozwolona interpretacja renderera

- zapętlone chodzenie tylko dlatego, że agent jest aktywny;
- przełączanie live na demo po błędzie endpointu;
- tworzenie fikcyjnych 12 agentów idle przy braku `/profiles`;
- arbitralne przypisywanie błędu systemowego do konkretnego agenta;
- utrzymywanie burzy przez historyczny, dawno nieaktualny log;
- restartowanie animacji przy każdym pollingu bez zmiany stanu.

## 2. Minimalny model źródła

```text
source.mode:
  connecting | live | stale | demo | unavailable

source.lastSuccessfulAt
source.snapshotAgeMs

source.domains:
  profiles | tasks | metrics | logs | crons | sessions | models | skills
  value: live | stale | unavailable
```

Reguły:

- demo działa tylko po jawnym `?demo=1` lub fladze środowiskowej;
- po utracie backendu zachowujemy ostatni prawdziwy snapshot;
- partial success aktualizuje wyłącznie domenę, która odpowiedziała;
- brak danych oznacza `unknown/stale`, nigdy automatycznie `healthy/idle`;
- polling pozostaje zgodny z istniejącym szkieletem: metrics 5 s, profiles/tasks/logs/crons 15 s, dane wolne 60 s.

## 3. Minimalny kontrakt agenta

```text
AgentProjection:
  profile
  displayName
  buildingId
  backendActive
  taskId | null
  taskStatus | null
  alertSeverity | null
  alertSource | null
  model | null
  skillAvailable | unknown
  updatedAt
  freshness
```

Stałe wizualne — rola, asset, budynek, kolor profilu — pochodzą z definicji. Stan operacyjny zawsze pochodzi z API.

## 4. Minimalny FSM vertical slice'a

```text
unknown
idle
walking-to-work
working
carrying
blocked
incident
success
walking-home
```

Priorytet interpretacji:

1. świeży, przypisany critical/error;
2. aktualny blocked task;
3. aktualny running task;
4. `profiles[].is_active`;
5. świeże przejście tasku do done;
6. idle;
7. stale/unknown.

Zasady przejść:

- pierwszy snapshot z agentem active pokazuje go od razu przy stanowisku;
- marsz uruchamia się tylko przy rzeczywistym przejściu inactive → active lub nowym running task;
- niezmienny snapshot nie generuje kolejnych spacerów;
- blocked trwa aż do zmiany backendu;
- success odtwarza się raz dla fingerprintu zakończenia;
- agent aktywny pozostaje widoczny; budynek wzmacnia jego pracę, ale go nie zastępuje.

## 5. Test dwóch sekund

Przygotować cztery fixture'y zgodne ze schematem prawdziwego API:

1. `healthy` — kilku agentów active, taski running, brak alertu;
2. `warning` — jeden blocked task i przypisany agent;
3. `critical` — świeży error z jednoznacznym źródłem;
4. `stale` — ostatni prawdziwy snapshot po utracie połączenia.

Na ekranie 390×844, bez bottom sheet, użytkownik ma odpowiedzieć:

- ilu agentów pracuje;
- który agent ma problem;
- który agent właśnie skończył;
- czy system jest zdrowy;
- gdzie trwa praca.

Gate: minimum 80% poprawnych odpowiedzi w krótkim teście; status bar jest redundancją, nie jedynym źródłem odpowiedzi.

## 6. Backlog wykonawczy w kolejności

### Task 1 — Jeden właściciel renderowania postaci

- DOM `HeroSprite` jest właścicielem postaci w obecnym vertical slice.
- Pixi może renderować mapę/efekty, ale `renderAgents=false`.
- Usunąć docelowo legacy proceduralne ciało z `WorldCanvas`.
- Nigdy nie montować równolegle dwóch zestawów bohaterów.

Definition of Done:

- na mapie istnieje dokładnie 12 postaci;
- brak starego proceduralnego „ludzika” pod assetem;
- jeden profil mapuje się do jednego unikalnego pliku;
- rozmiar i proporcje nie są deformowane.

### Task 2 — Produkcyjny pipeline 12 bohaterów

- osobne `public/heroes/hero-01.webp` … `hero-12.webp`;
- canvas 256×256, lossless WebP, transparentne tło;
- bottom-center anchor i wspólny baseline;
- pełne głowy, nogi, peleryny, broń i rekwizyty;
- checkerboard QA na jasnym, ciemnym i zielonym tle;
- finalnie pozyskać natywne rendery alfa, ponieważ arkusz kontaktowy ma wtopione ciemne tło.

Definition of Done:

- żadnego tekstu, podestu ani czarnego wielokąta z arkusza;
- 12 unikalnych hashy;
- każda sylwetka czytelna bez etykiety;
- widoczny kontakt stóp z podłożem.

### Task 3 — HeroSprite i fizyczna obecność

- zwykły `<img>`; bez clip-path, mask, background crop i pseudo-postaci;
- osobny element kontaktowego cienia;
- bottom-center anchor;
- wrapper przesuwa się po ziemi, obraz wykonuje tylko mikrokrok;
- cień nie podskakuje;
- agent na telefonie ma być postacią, nie kropką;
- blocked/incident/success mają drugi kanał poza kolorem;
- carrying ma widoczną paczkę.

Definition of Done:

- aktywnych agentów można znaleźć w 2 sekundy;
- stopa i cień pozostają sklejone z trasą;
- idle nie wygląda jak unoszenie;
- tap otwiera prawdziwe szczegóły danego profilu.

### Task 4 — Live/demo/stale provenance

Pliki docelowe: `useWorldBridge`, normalizatory snapshotu, `worldStore`.

- wyłączyć automatyczny fallback live → demo;
- przechowywać ostatni dobry snapshot;
- oznaczyć freshness per domena;
- usunąć fikcyjne profile w trybie live;
- jawnie oznaczyć demo w UI i accessibility.

Definition of Done:

- live → stale → live nie resetuje świata;
- awaria jednego endpointu nie zatrzymuje pozostałych;
- active count równa się dokładnie liczbie `is_active === true`.

### Task 5 — Task/log/incident attribution

- fingerprint i deduplikacja logów;
- freshness window warning/error;
- mapowanie profilu po profile, assignee, task ID i logger name;
- nieprzypisany alarm pozostaje systemowy;
- cron error trwa do nowszego completion.

Definition of Done:

- błąd researcher nie trafia do coder;
- każdy cue ma `source`, `entityType`, `entityId`, `createdAt`, `freshness`;
- powtarzany polling nie tworzy nowych celebracji.

### Task 6 — Żywe cue świata

Vertical slice używa tylko czterech kanałów:

1. agenci — profiles/tasks/logs;
2. paczki — kanban;
3. budynki — stan przypisanego agenta;
4. pogoda + Hermes Core — metrics/health.

Dodatkowo: Clock Tower dla cronów i spokojne źródła modeli.

Definition of Done:

- budynek nie animuje stanu bez źródła;
- blocked task ma paczkę przy właściwym agencie;
- CPU mapuje się dokładnie na pogodę;
- stale metrics nie udają słońca;
- efekty nigdy nie zasłaniają agentów.

### Task 7 — Mobile composition

Testować: 375×812, 390×844, 430×932, landscape i tablet portrait.

- cały operacyjny świat widoczny bez pierwszego gestu;
- brak pustych pasów i ucięć;
- postacie poza safe-area/status bar/Health Ribbon;
- touch target co najmniej 44×44 CSS px;
- aktywność i błąd mają wyższy priorytet niż dekoracje.

### Task 8 — Details on demand

Tap agent:

- profil/rola;
- realny stan i task;
- model;
- ostatnia aktualizacja;
- źródło warning/error;
- live/stale/demo.

Nie dodawać fikcyjnych restart/reassign bez istniejącego, bezpiecznego endpointu.

### Task 9 — Desktop extension

Ten sam snapshot i ten sam świat. Dodatki:

- stały Command Panel;
- większy Activity Feed;
- wygodne agent/task details;
- keyboard focus i shortcuts;
- więcej detalu renderera przy większym budżecie.

Odkładamy: replay, multi-select RTS, split environment i historyczne wykresy.

### Task 10 — Stabilizacja

- production build;
- test realnego backendu;
- live → stale → live;
- 55–60 fps na współczesnym iPhonie;
- brak wzrostu pamięci po mount/unmount;
- `visibilitychange` pauzuje tickery;
- jeden preview = jeden proces Node;
- po testach nie pozostawiać serwera w tle.

## 7. Aktualny stan roboczy

- zatwierdzona mapa mobilna i desktopowa pozostają bez zmiany kompozycji;
- istnieje 12 osobnych ścieżek assetów i mapowanie jeden-do-jednego;
- `HeroSprite` używa `<img>`, bottom-center anchor i osobnego cienia;
- stary CSS `.fallback-agent` został usunięty;
- DOM jest właścicielem bohaterów; Pixi agents są opt-in i wyłączone w App;
- zapętlony 14-sekundowy cykl active został usunięty z FSM;
- źródłowy arkusz nie ma alfa, więc assety wymagają dalszego QA lub natywnych renderów transparentnych;
- live/demo/stale provenance pozostaje kolejnym krytycznym zadaniem;
- build i przegląd runtime trzeba wykonać po każdej zmianie integracyjnej.

## 8. Świadomie odkładamy

- Tiled i pełny tilemap renderer;
- A* i rozbudowany pathfinding;
- wnętrza wszystkich budynków;
- game economy i dynamiczny wzrost miasta;
- pełne sprite sheets 8 kierunków;
- skalowanie UI do 200 agentów w tym vertical slice;
- sound, haptics, replay, marketplace, pluginy i open-source cleanup.

Kod danych nie może blokować skali 50–200 agentów, ale obecna wersja nie płaci za nią złożonością.

## 9. Miernik sukcesu

Projekt jest gotowy do konkursowego vertical slice'a, gdy użytkownik po dwóch sekundach mówi:

> Pracują cztery osoby. Kowal jest zablokowany. Uczony właśnie skończył. System jest przeciążony, a problem jest przy kuźni.

Każda część tego zdania musi pochodzić z prawdziwego snapshotu Hermes OS.

