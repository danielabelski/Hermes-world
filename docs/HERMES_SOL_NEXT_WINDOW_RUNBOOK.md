# Hermes OS Living World — Sol Next Window Runbook

## Cel następnego okna

Dowieźć pierwszą uczciwą wersję vertical slice'a, w której:

- 12 agentów jest wizualnie czytelnych;
- demo ma cztery deterministyczne scenariusze;
- tryb live pokazuje wyłącznie prawdziwe dane Hermesa;
- awaria backendu zachowuje ostatni stan jako `stale`;
- ruch i cue wynikają z przejść danych, nie z pętli gry;
- mapa zachowuje kompozycję, ale otrzymuje pierwszy widoczny język Hermes AI/Fantasy;
- build jest zielony i działa jeden adres mobilny.

Ten plik jest instrukcją wykonawczą. Pełna filozofia i dalszy backlog są w:

- `docs/HERMES_LIVING_WORLD_EXECUTION_PLAN.md`
- `docs/HERMES_MAP_IDENTITY_PLAN.md`

## Zasady bezpieczeństwa

1. Nie dotykać `C:\Users\User\.gemini\antigravity\scratch\hermes-os-panel`.
2. Pracować tylko w `hermes-os-living-world`.
3. Nie usuwać zatwierdzonej mapy, anchorów ani działających overlayów.
4. Nie uruchamiać więcej niż jednego Vite/Node preview.
5. Po kontroli zamknąć proces preview, chyba że użytkownik aktywnie go ogląda.
6. Każdy większy patch kończyć buildem, nie odpalać serwera do każdej drobnej zmiany.
7. Demo może być fikcją tylko gdy jawnie oznaczono `demo`; live nigdy.

## Etap 0 — Baseline i checkpoint wizualny

Status: w toku — użytkownik ogląda `/?demo=1`.

Zebrać decyzję:

- `GL` — skala i kierunek agentów zostają, poprawiamy jakość;
- `RL` — dokładna lista: assety, skala, pozycje, mapa, cue, overlay.

Nie zaczynać pełnego repaintu mapy przed tą decyzją. Można przygotować warstwy kodowe, ale nie zastępować master rastra.

Gate:

- mapa mieści się na telefonie;
- 12 agentów widać bez zoomu;
- nie występują stare proceduralne postacie;
- użytkownik akceptuje albo precyzyjnie odrzuca kierunek.

## Etap 1 — Domknąć system assetów agentów

Pliki:

- `public/heroes/hero-01.webp` … `hero-12.webp`
- `scripts/normalize_hero_assets.py`
- `src/components/HeroSprite.jsx`
- `src/components/HeroSprite.css`
- `src/world/data/agentPortraitAssets.js`
- `src/world/WorldCanvas.jsx`

Taski:

1. Obejrzeć contact sheet na białym, ciemnym i zielonym tle.
2. Usunąć tekst, podesty, czarne kliny oraz resztki panelu.
3. Jeśli arkusz nie pozwala odzyskać jakości — wymienić źródła na 12 natywnych renderów transparentnych; nie maskować problemu CSS-em.
4. Zachować 256×256, baseline około y=248, bottom-center anchor.
5. Usunąć legacy proceduralny blok `Graphics g` z Pixi, nie tylko pozostawić `renderAgents=false`.
6. Jeden profil → jeden asset → jeden renderer.
7. Tap target 44×44+, cień pozostaje na ziemi.

Testy:

- dokładnie 12 plików i 12 unikalnych hashy;
- transparentne narożniki;
- brak `clip-path`, `mask-image`, `background-position`;
- brak `fallback-agent` i brak widocznych agentów Pixi pod DOM.

## Etap 2 — Jawny wybór demo i neutralny start

Pliki:

- `src/App.jsx`
- `src/hooks/useWorldBridge.js`
- `src/world/store/worldStore.js`

Taski:

1. Rozdzielić `DEV auth bypass` od `FORCE_DEMO_WORLD`.
2. `FORCE_DEMO_WORLD = VITE_DEMO_WORLD === 'true' || query demo=1`.
3. Wywoływać `useWorldBridge({ demoMode: FORCE_DEMO_WORLD })`.
4. Normalny start store:
   - `source: unknown`,
   - `connection: connecting`,
   - agents/tasks/alerts/activity puste,
   - metrics `null`, nie zero.
5. Demo snapshot tylko w jawnym demo mode.
6. `cycleScenario` działa tylko dla source `demo`.

Gate:

- wejście bez `?demo=1` nie tworzy fikcyjnych agentów;
- `?demo=1` nie odpytuje live API i jest jawnie oznaczone;
- DEV nie oznacza automatycznie demo.

## Etap 3 — Strict API i partial domain polling

Pliki:

- `src/api.js`
- `src/world/WorldBridge.js`
- `src/hooks/useWorldBridge.js`

Taski:

1. Dodać opcjonalne `strict=false` do getterów API; zachować dotychczasową kompatybilność.
2. Bridge wywołuje gettery w trybie strict.
3. Zastąpić globalny `Promise.all` strukturą `Promise.allSettled` per domena.
4. Przechowywać `lastPayloadByDomain` i metadata:

```text
domains.<name>:
  status: live | stale | unknown | demo
  updatedAt
  error | null
```

5. Prawdziwe `[]` jest sukcesem i czyści starą domenę.
6. Failure z cache → stale cache.
7. Failure bez cache → unknown.
8. Jeden uszkodzony endpoint nie unieważnia pozostałych.

Polling:

- metrics: 5 s;
- profiles/tasks/logs/crons: 15 s;
- sessions/models/skills: 60 s.

Gate:

- metrics success + profiles failure nie tworzy 12 agentów;
- tasks success `[]` usuwa stare taski;
- błąd models nie zatrzymuje profiles/metrics.

## Etap 4 — Lifecycle live/stale/unknown/demo

Pliki:

- `src/world/WorldBridge.js`
- `src/hooks/useWorldBridge.js`
- `src/world/store/worldStore.js`
- status/health overlays.

Kontrakt:

```text
source: live | stale | unknown | demo
connection: connecting | online | degraded | offline
lastSuccessfulAt
snapshotAgeMs
domains
```

Taski:

1. Pierwszy total failure → unknown, nigdy demo.
2. Po prawdziwym live total failure → ostatni snapshot jako stale.
3. Reconnect stale → live bez przejścia przez demo.
4. Store przyjmuje puste listy, jeśli pole występuje w snapshot.
5. Store zapisuje `source` i `domains`, nie zgaduje ich z temperatury/raw.
6. Stale zamraża znaczący ruch i przygasza świat.
7. Badge pokazuje `STALE · Ns`; health jest unknown/stale, nie zielony.

Gate:

- live → stale → live zachowuje te same encje i pozycje;
- offline jest transportem, stale jest provenance;
- brak danych nie wygląda jak CPU=0 i słoneczny świat.

## Etap 5 — Cztery poprawne fixture’y testu dwóch sekund

Pliki:

- `src/world/data/demoScenarios.js`
- validator scenariuszy;
- nowe testy semantyczne.

Wspólne zasady:

- każda scena ma wszystkie 12 profili;
- fixture jest funkcją `createScenario(now)`;
- timestampy są relatywne;
- payload ma kształt dziewięciu prawdziwych domen API.

Sceny:

### Healthy

- 4 active: orchestrator, coder, developer, devops;
- dwa running taski;
- researcher done `now - 1200 ms`;
- CPU 23%, RAM 41%;
- brak warning/error.

### Warning

- 3 active;
- reviewer ma blocked task;
- świeży warning przypisany do reviewer;
- CPU 68%, RAM 74%.

### Critical

- 3 active responders: orchestrator, devops, komandos;
- coder ma świeży error `now - 800 ms`;
- alert `agent:coder`, building `forge`;
- CPU 93%, RAM 94%, cron error.

### Stale

- ostatni snapshot healthy;
- age około 32 s;
- brak nowych payloadów;
- świat zamrożony/przygaszony i jawnie stale.

Gate:

- każda scena odpowiada jednoznacznie na pięć pytań;
- critical pokazuje incident Kowala, nie blocked;
- success researcher jest widoczny tylko w healthy;
- liczebność rosteru nie zmienia się między scenami.

## Etap 6 — Atrybucja i freshness alertów

Pliki:

- `src/world/WorldBridge.js`
- `src/world/LivingWorldStateMachine.js`

Priorytet:

1. fresh attributed critical/error;
2. blocked task;
3. running task;
4. profiles active;
5. recent done;
6. idle;
7. unknown.

Taski:

1. Przypisać log po `profile`, `agent_id`, `task.assignee`, `logger_name` lub jednoznacznym prefiksie.
2. Nieprzypisany alert pozostaje `system`.
3. Każdy alert ma source/entityType/entityId/buildingId/createdAt/freshness.
4. Deduplikować stabilnym fingerprintem.
5. Warning/error mają okno świeżości albo nowsze recovery.
6. Cron error trwa do nowszego completion.
7. Historyczny log nie utrzymuje permanentnej burzy.

Gate:

- error researcher nie trafia do coder;
- critical fixture wskazuje coder + forge;
- kolejne polling results nie powtarzają success/alarm.

## Etap 7 — Event-driven ruch i zachowanie agentów

Pliki:

- `LivingWorldStateMachine.js`
- `WorldFallback.jsx`
- `HeroSprite.jsx/css`
- później Pixi equivalent.

Taski:

1. Niezmienny snapshot = niezmienna pozycja operacyjna.
2. inactive → active lub nowy running task uruchamia jeden marsz.
3. Existing active na pierwszym snapshotcie pojawia się przy work anchor.
4. Carrying pokazuje fizyczną paczkę.
5. Blocked zatrzymuje agenta aż do zmiany backendu.
6. Success odtwarza się raz per done fingerprint.
7. Stale zamraża ruch znaczący, idle może być ograniczony.
8. Cień nie podskakuje; obraz robi tylko mikrokrok.
9. Wchodzenie do budynku na obecnej płaskiej mapie: dojście do wejścia → cue budynku → ukrycie/pojawienie bez zniknięcia informacji o pracy.

Gate:

- brak zapętlonego spaceru;
- blocked nie odblokowuje się sam;
- agent active jest zawsze odnajdywalny;
- paczka odpowiada prawdziwemu taskowi.

## Etap 8 — Pierwszy Hermes Map Identity Pass

Nie zmieniać layoutu ani master anchorów.

Taski pierwszego passu:

1. Ustalić trzy sygnatury: Hermes Core, conduits, lokalne state beacons.
2. Zintegrować istniejącą `HermesInfrastructureLayer` z prawdziwymi source cues.
3. Zmniejszyć dekoracyjny cyan; cyan oznacza wyłącznie przepływ danych.
4. Hermes Core pulsuje health, nie jest ozdobnym kryształem RPG.
5. Command Spine, Knowledge Loop, Operations Loop biegną po istniejących drogach.
6. Aktywny jest tylko segment mający źródło w snapshot.
7. Przygotować paintover tego samego rastra:
   - czerwone dachy → ciemny łupek/metaloceramika;
   - flagi/blanki → pylony i pierścień obserwatorium;
   - fontanna → System Pulse Well;
   - brama → API Docks;
   - bruk → fizyczne szlaki sygnału.
8. Render 390×844 i 1440×900; blind test bez logo.

Gate:

- użytkownik mówi AI sanctuary/living system, nie zamek strategiczny;
- maks. 1/5 testerów wskazuje Heroes jako pierwsze skojarzenie;
- efekty mapy są słabsze od agentów;
- kompozycja i wejścia pozostają identyczne.

## Etap 9 — Mobile live interaction

Taski:

- tap agent → prawdziwy profil/task/model/freshness/error source;
- tap task → title/assignee/status/priority/timestamps;
- tap building → agent + active tasks + problem;
- safe areas dla iPhone;
- touch target 44×44;
- Health Ribbon i Status Badge nie zasłaniają problemu;
- pogoda dokładnie z CPU, stale z unknown weather;
- PWA/auth/push zachowane;
- brak fikcyjnych restart/reassign bez endpointu.

Testy viewportów:

- 375×812;
- 390×844;
- 430×932;
- landscape;
- tablet portrait.

## Etap 10 — Desktop extension

Ten sam snapshot i świat. Dodać:

- stały Command Panel;
- większy Activity Feed;
- agent/task details;
- keyboard focus i shortcuts;
- więcej detalu efektów przy większym budżecie.

Nie dodawać jeszcze replay, multi-select RTS, split environment ani historycznych wykresów.

## Etap 11 — Integracja wszystkich istniejących danych Hermesa

Mapowanie V1:

- profiles → agent state;
- kanban tasks → packages/blocked/done;
- logs → warning/error/recovery;
- metrics → weather/health/tempo;
- crons/history → Scheduler Spire;
- sessions/cost → ograniczony token flow/cost cue;
- models → model sources;
- skills → obecność narzędzia;
- session details → bottom sheet;
- chat stream → zachowany osobny widok/overlay;
- auth/PWA/push → zachowane ze szkieletu.

## Etap 12 — Konkursowa stabilizacja

Automatyczne:

- production build;
- testy provenance;
- testy czterech scenariuszy;
- test live → stale → live;
- walidacja 12 assetów;
- brak banned CSS;
- brak podwójnego renderer ownership.

Manualne:

- real Hermes backend;
- iPhone w sieci lokalnej;
- 2-second blind test;
- 55–60 fps;
- kilka cykli mount/unmount;
- brak wzrostu pamięci;
- tylko jeden proces preview;
- desktop i mobile pokazują identyczną prawdę.

## Kolejność w jednym intensywnym oknie Sol

Jeśli czas jest ograniczony, realizować dokładnie:

1. Etap 0 — GL/RL.
2. Etap 2 — jawne demo i neutralny start.
3. Etap 3 — strict API + allSettled.
4. Etap 4 — live/stale/unknown.
5. Etap 5 — cztery fixture’y.
6. Etap 6 — critical attribution.
7. Etap 7 — event-driven cue/ruch.
8. Etap 8 — pierwszy widoczny map identity pass.
9. Build + jeden mobile preview.

Etap assetów kontynuować równolegle tylko wtedy, gdy GL potwierdzi skalę i kierunek. Nie blokować uczciwego live na perfekcyjne klatki chodzenia, ale nie nazywać roboczych wycięć jako final premium art.

## Definition of Done następnego okna

- normalny URL nie pokazuje demo przy awarii;
- `?demo=1` ma cztery deterministyczne sceny i wszystkie 12 postaci;
- live/stale/live jest prawdziwe;
- critical wskazuje coder + forge;
- niezmienny snapshot nie generuje pętli ruchu;
- aktywni niosą prawdziwe taski;
- mapa ma pierwszy jednoznaczny Hermes cue pass;
- telefon pokazuje całą scenę;
- build przechodzi;
- użytkownik dostaje jeden działający adres i może wydać kolejne GL/RL.

