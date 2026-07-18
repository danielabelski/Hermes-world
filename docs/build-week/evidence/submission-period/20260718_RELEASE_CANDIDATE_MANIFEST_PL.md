# Hermes World — manifest kandydata do promocji z demo

## Stan źródłowy

- Demo: `build-week/hermes-world` at `753eea021a2fbe3fc48844fb8cb6510370fb08cb`.
- Produkcja: `main` at `958b9da08bee9613900e902b3da558aadef826e8`.
- Produkcyjny working tree: czysty.
- Produkcja nie została zmieniona podczas przygotowania tego manifestu.
- Punkt powrotu: tag `production-release-audit-start-2026-07-18`.

## Zatwierdzony logiczny zakres kandydata

Po manualnym GL należy integrować na osobnym kandydacie utworzonym z bieżącego `main`, w tej kolejności:

1. `cd5e651` — jeden lifecycle SSE, heartbeat, backoff, cleanup i odporność na tło/sieć.
2. `2d8a3ae` — autorytatywny, atomowy resync po reconnect i zachowanie rosteru.
3. `0fd8d50` — świeży, selektywny fetch przy każdym wejściu do budynku.
4. `774df00` — rozdzielenie transportu klienta od statusu Hermesa i workerów.
5. `9c32bd9` — trwała historia world-eventów i kompletne ukończenia cronów.
6. `2d6dbb7` — pięciokrotny kontrakt ruchu release.
7. `cd1ddab` — prawdziwe timestampy cronów oraz realna telemetria Watchera/wnętrz.
8. `0e3310a` — semantyczna historia timestampowanych tasków Kanban bez fake motion.
9. `f26f475` — atomowe przejęcie sprite'a przez fasadę na zmapowanym progu.

## Czego nie przenosić

- całego brancha demo przez merge;
- historycznych screenshotów i snapshotów jako części runtime;
- parametrów `?demo=1`, fixture'ów i demo-only focus jako zachowania produkcyjnego;
- prywatnych adresów, sesji, sekretów i danych logowania;
- starego pliku `20260717_PRODUCTION_CANDIDATE.patch` jako substytutu obecnego stanu;
- niepowiązanych zmian mapy, waypointów, rozmieszczenia, assetów i efektów;
- eksperymentalnych poprawek z wycofanych commitów crowd/preload.

## Pliki o podwyższonym ryzyku konfliktu

Bieżący `main` zmienił je niezależnie od baseline'u audytu, dlatego nie wolno zastępować ich całymi kopiami z demo:

- `package.json`
- `src/hooks/useWorldBridge.js`
- `src/productionRuntimePolicy.test.js`
- `src/world/buildingEntryConfig.js`
- `src/world/mapAgentPresentation.js`
- `src/world/mapAgentPresentation.test.js`
- `src/world/store/worldStore.js`
- `src/world/WorldBridge.contract.test.js`
- `src/world/WorldBridge.js`
- `src/world/WorldFallback.jsx`

Każdy konflikt należy rozwiązać zachowując produkcyjną autoryzację, URL/API/SSE, PWA/cache oraz istniejące, zatwierdzone rozmieszczenie agentów. Nie wolno wykonywać hurtowego `checkout --theirs` ani kopiować całego drzewa demo.

## Bramka przed promocją

Manualny test najnowszego demo musi potwierdzić:

1. Watcher pokazuje realne crony i sukcesy.
2. Kuźnia odświeża CPU/temperaturę.
3. każde wnętrze odświeża własne realne domeny po ponownym wejściu;
4. górny ticker pozostaje RAW, dolny feed pokazuje realne taski/crony/eventy;
5. Uczony i Kowal nie są odcinani pikselami przy fasadzie;
6. pięć cykli zachowuje właściwego workera, drogę, budynek i powrót;
7. jeden bezpieczny realny cron przechodzi przez log → event → zapis → API/SSE → UI;
8. autor wydaje osobne GL na promocję.

## Procedura po GL

1. Utworzyć nowego kandydata z dokładnego produkcyjnego `main`.
2. Zastosować dziewięć logicznych commitów sekwencyjnie, rozwiązując tylko rzeczywiste konflikty.
3. Nie modyfikować konfiguracji produkcyjnej ani sekretów.
4. Uruchomić pełne testy, lint, validator, build i kontrolę diffu.
5. Uruchomić kandydata na odrębnym porcie i powtórzyć pełną macierz telefonu.
6. Dopiero po drugim GL zabezpieczyć produkcję tagiem, wdrożyć minimalny zestaw i wykonać niezależną walidację produkcji.
7. Przy pierwszym BLOCKERZE natychmiast wrócić do punktu sprzed promocji.

## Rollback

Punkt powrotu produkcji: `958b9da08bee9613900e902b3da558aadef826e8`, tag `production-release-audit-start-2026-07-18`. Dokładna komenda rollbacku zostanie dobrana do mechanizmu wdrożenia dopiero przy zatwierdzonej promocji; manifest nie wykonuje żadnej operacji na produkcji.
