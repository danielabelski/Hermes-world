# HERMES WORLD — CHECKPOINT PIERWSZEJ DZIAŁAJĄCEJ WERSJI

## AKTUALIZACJA NORTH STAR — 2026-07-11

Ta sekcja jest nadrzędna wobec historycznego checkpointu poniżej. Nie analizuj projektu od początku, nie zmieniaj kolejności planu i nie cofaj wykonanej pracy.

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

