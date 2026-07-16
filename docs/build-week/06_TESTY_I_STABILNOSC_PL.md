# 06 — Testy i stabilność

## TEST-BW-018 — Kompletny zestaw cinematic interior VFX

- Czas: 2026-07-15 03:25 Europe/Warsaw / 2026-07-15 01:25 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `36c1ed1`.
- `npm.cmd test`: **PASS 102/102**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 866 modułów, 7,92 s; lazy `BuildingInteriorScene` JS 9,70 kB, CSS 10,18 kB.
- `git diff --check`: **PASS**.
- Kontrakt assetów: **PASS** — dokładnie 11 runtime PNG; każdy 1024×128 RGBA, źródło 2048×256 RGBA, limit 250 kB per-file i 1,8 MB łącznie.
- Kontrakt importów: **PASS** — 11 dedykowanych importów z `building-interior-effects`, 0 importów `assets/world-effects` w rendererze wnętrz i brak użycia źródeł/artifacts w runtime.
- Zimny transfer aktywnego wnętrza: **PASS względem budżetów** — Cytadela ~424 kB, Archiwum ~491 kB, Watcher ~578 kB, Sanctum ~506 kB, Kuźnia ~495 kB. Każdy pokój mieści się w przyjętym budżecie 650–900 kB.
- HTTP smoke: **PASS** — mapa oraz `interior=citadel|forge|archive|watcher|sanctum` zwracają 200 na jednym istniejącym serwerze demo 4176.
- Automatyczne sterowanie wbudowaną przeglądarką: **FAIL — narzędzie**, błąd inicjalizacji kontrolera `Cannot redefine property: process`; nie jest to błąd aplikacji. Desktop został zaakceptowany przez autora; finalny telefon 393×852: **MANUAL ACTION REQUIRED**.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-022 — Macierz QA 12/12 agentów we wnętrzach

- Czas: 2026-07-15 12:45 Europe/Warsaw / 2026-07-15 10:45 UTC.
- Branch/commit: `build-week/hermes-world` / `32d93f0`.
- Pokrycie rosteru: **PASS 12/12** — każdy kanoniczny profil występuje dokładnie raz, bez duplikatów i fallbacków.
- Bezpieczne pozycje: **PASS** — każda pozycja korzysta z istniejącej płyty wnętrza, zakresów 25–75 cqw / 55–88 cqh i skali 1,10–1,30.
- Truth boundary: **PASS** — review jest aktywne wyłącznie dla `demo=1&interiorReview=1`; nie przechodzi przez operational ownership i nie emituje stanów/eventów.
- Pierwszy przebieg: **FAIL → FIXED** — test wydajności wykrył `backdrop-filter`; filtr usunięto przed ponowną walidacją.
- `npm.cmd test`: **PASS 115/115**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, main JS 414,63 kB / 126,97 kB gzip; lazy interior JS 16,16 kB / 6,19 kB gzip; lazy CSS 14,19 kB / 3,57 kB gzip.
- Percepcyjna ocena 393×852: **MANUAL ACTION REQUIRED**.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-023 — Regresja po RL skali Rycerza i Watchera

- Czas: 2026-07-15 13:05 Europe/Warsaw / 2026-07-15 11:05 UTC.
- Branch/commit: `build-week/hermes-world` / `e3bf035`.
- Test wzorca: **PASS** — Kuźnia i Archiwum pozostają w zakresie 1,20–1,25; Watcher ma minimum 1,34; Rycerz minimum 1,38.
- Izolacja review: **PASS** — pięć pokoi ma deterministyczny pierwszy profil, a zwykły renderer evidence pozostaje alternatywą aktywną bez `demo=1&interiorReview=1`.
- `npm.cmd test`: **PASS 118/118**.
- Lint: **PASS**.
- `validate:world-life`: **PASS**.
- Build: **PASS**, main 414,74 kB / 126,99 kB gzip; lazy interior 16,16 kB / 6,19 kB gzip; CSS 14,19 kB / 3,57 kB gzip.
- Finalna percepcja: **MANUAL ACTION REQUIRED** — autor ocenia poprawioną skalę na realnym telefonie.

## TEST-BW-019 — Wydajność wejścia i evidence-backed interior agents

- Czas: 2026-07-15 04:56 Europe/Warsaw / 2026-07-15 02:56 UTC.
- Branch/HEAD: `build-week/hermes-world` / `a754475c1f2bc0181592ee703ba687624914fc40`.
- Zakres: cold/warm entry, pauzowanie ukrytej mapy, jeden wspólny renderer agentów we wnętrzu, routing Kowala i Uczonego, atomowa własność map/interior oraz ochrona przed fake evidence.
- `npm.cmd test`: **PASS 109/109**, 0 fail, 0 skipped. Sześć nowych testów obejmuje brak agenta przed progiem, wejście, dojście do stanowiska, pracę, wyjście, odrzucenie syntetycznego evidence, blokadę niezweryfikowanych pokoi oraz zweryfikowane Archiwum.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS** — evidence-backed journeys, bezpieczny initial state, persistence polling, pełny FSM, stuck oraz rozdzielenie portrait/map.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 868 modułów, 3,53 s; build wykonany poza sandboxem po znanym EPERM procesu Vite, bez zmiany konfiguracji.
- Bundle: main JS 410,32 kB / 125,54 kB gzip; lazy interior JS 14,55 kB / 5,73 kB gzip; lazy interior CSS 12,34 kB / 3,13 kB gzip.
- HTTP/cache: **PASS** — lokalnie HTML 2 382 B / 0,0166 s, lazy chunk 14 558 B / 0,0177 s, plansza Kuźni 347 498 B / 0,0096 s warm; przez Tailscale HTML 200 / 0,0067 s i plansza 200 / 0,0077 s. Plansza ma immutable cache. Wyniki nie są deklarowane jako browser-paint/FPS.
- Brak podwójnego renderingu: **PASS** — `MapAgentLayer` filtruje `isInside`; test kontraktowy wymaga wyłącznej własności sprite’u przez jedną warstwę.
- Truthfulness: **PASS** — Kuźnia/Kowal i Archiwum/Uczony aktywne; Cytadela, Sanctum i Watcher świadomie nie renderują fikcyjnego agenta wewnątrz.
- Reduced motion i przejścia: **PASS kontraktowy** — lokalny ruch jest wyłączany/redukowany przez istniejące media query; anchor i logical position pozostają stabilne.
- Finalna walidacja wizualna na realnym 393×852: **MANUAL ACTION REQUIRED** — kontroler przeglądarki Codexa nie uruchomił się; bez fałszywego oznaczania PASS.
- Produkcja: **PASS — nietknięta**.

## TEST-PRE-001 — Końcowa walidacja pre-build baseline

- Czas: 2026-07-13, przed 16:47:03 Europe/Warsaw.
- Commit: `b80b89d771457e6d6c515cda51e4d480f85245e1`.
- Branch: `pre-build-week/environmental-world-life`.
- Środowisko: lokalny Windows, demo branch, mobile validation 393×852 oraz build Vite.
- Komendy według istniejącego handoffu i historii sesji: repozytoryjne testy, `validate-world-life`, lint i build produkcyjny.
- Wynik: 83/83 testów zaliczonych; `validate-world-life` zaliczony; lint zaliczony; build zaliczony, 844 moduły, około 16,13 s.
- Mobile: brak zgłoszonego overflow i błędów konsoli w końcowej walidacji 393×852.
- Klasyfikacja: **pre-submission**. Nie jest dowodem funkcji dodanej podczas Build Week.
- Źródło: pre-build handoff i log sesji `019f4f11-14e9-70e0-8d61-26226257864c`.
- Pełny log: nie został jeszcze skopiowany do `evidence/tests/`; zachowanie pełnego logu jest brakiem.

## TEST-BW-001 — Dokumentacja i capture-evidence

- Czas: 2026-07-13 po 18:00 Europe/Warsaw.
- Commit: brak; working tree dokumentacyjny na bazie `b80b89d`.
- Branch: `pre-build-week/environmental-world-life`.
- Zakres: `git diff --check`, składnia Bash, uruchomienie snapshotu, kontrola braku zmian aplikacji.
- Wynik: składnia Bash zaliczona (`bash -n`); skrypt uruchomiony bez operacji sieciowych/Git write; snapshot `20260713T185301Z-git-snapshot.txt` zawiera prawidłowe UTC, Europe/Warsaw, branch, HEAD, status, pełną listę untracked i commity od baseline. Kod aplikacji nie został zmieniony.
- Klasyfikacja: podczas Submission Period.

## Format następnych wpisów

Każdy test musi podać czas, commit, branch, środowisko, dokładną komendę, wynik/liczbę testów, błędy i regresje, działanie naprawcze oraz link do pełnego logu. Wynik „zaliczony” bez artefaktu powinien być oznaczony jako słabszy dowód.

## TEST-BW-002 — Finalizacja dokumentacji i dowodów

- Czas: 2026-07-13 około 22:00 Europe/Warsaw.
- Branch/HEAD przed commitem: `build-week/hermes-world` / `b80b89d…`; dirty tree wyłącznie dokumentacyjny.
- Środowisko: Windows PowerShell + `C:\Program Files\Git\bin\bash.exe -lc`.
- Składnia skryptu: `bash -n scripts/build-week/capture-evidence.sh` — **PASS**.
- Snapshot dirty tree: rzeczywiste uruchomienie — **PASS**; `20260713T200118Z-git-snapshot.txt`.
- UTC i Europe/Warsaw: **PASS**, różnica +02:00 zgodna z CEST.
- Integralność oryginałów screenshotów: **PASS 6/6** względem zapisanych SHA-256.
- Kopie redagowane: **PASS 6/6** — osobne PNG, kontrola wizualna i własne hashe.
- Manifest sesji: **PASS**, 83 rekordy, SHA-256 `483E2FCB…01685B`.
- Secret scan nowej dokumentacji: **PASS**, 0 rozpoznanych sekretów.
- Markdown links: **PASS**, 0 broken links.
- Duplikaty funkcjonalne dokumentów: **PASS**, 0.
- Sprzeczności rozstrzygniętych kwestii: **PASS** po korektach.
- Trailing whitespace i `git diff --check`: **PASS**, 0.
- Zmiany kodu aplikacji: **PASS**, 0.
- Ograniczenie: bezpośrednie `bash.exe` systemu Windows wskazuje WSL bez dystrybucji; poprawna walidacja wymaga Git Bash uruchomionego z `-lc`, aby załadować `/usr/bin/date`.
- Clean-tree behavior: **PASS** w izolowanej kopii na commicie `2b1e3e7`; skrypt odczytał 0 linii statusu przed utworzeniem snapshotu, a katalog testowy został bezpiecznie usunięty.

## Macierz końcowa

| Kontrola | Status |
|---|---|
| Git status i zakres plików | PASS |
| Secret scan | PASS |
| Prywatne oryginały poza stage | PASS |
| Screenshoty i SHA-256 | PASS |
| Markdown links / broken references | PASS |
| Duplikaty i sprzeczności | PASS |
| Strefy i daty konkursu | PASS |
| Trailing whitespace | PASS |
| Shell syntax i dirty snapshot | PASS |
| Clean-tree snapshot | PASS — sprawdzany po końcowym commicie w izolowanej czystej kopii |
| Kod aplikacji / produkcja | PASS — brak zmian |
| Branch i baseline tag | PASS |
| Remote backup | MANUAL ACTION REQUIRED — brak remote |

## TEST-BW-003 — Pierwszy functional meaningful extension

- Czas: 2026-07-13 22:39–23:16 Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Commity funkcjonalne: `08ad9aa`, `4d5870e`, `3f03073`, `fdb75f4`.
- `git diff --check` — **PASS**, 0 błędów whitespace.
- `npm.cmd run lint` — **PASS**.
- `npm.cmd test` — **PASS 87/87**, 0 fail, 0 skipped.
- `npm.cmd run validate:world-life` — **PASS**.
- `npm.cmd run build` — **PASS**, Vite 8.0.16, 844 moduły, około 5,35 s w końcowym uruchomieniu.
- Mobile 393×852: **PASS** — realny viewport w lokalnej przeglądarce; cztery ścieżki przepływu wody; przesunięcie `strokeDashoffset` potwierdzone między próbkami; transform cienia chmury zmienił się między próbkami; po korekcie opacity cienia `0.078`.
- Konsola browser: **PASS**, 0 błędów.
- Semantyka: **PASS** — test potwierdza brak fake operational source, Archive tylko z evidence-backed success oraz ciągły lifecycle evidence ID.
- Produkcja: **PASS** — nie uruchamiano ani nie modyfikowano produkcyjnego worktree.
- Ograniczenie: test lokalny miał brak połączenia do runtime API, więc oceniono warstwę wizualną i kontrakty danych; pełny live Hermes E2E pozostaje następnym osobnym testem integracyjnym.

## TEST-BW-004 — Mobile motion performance i adaptive ambient

- Czas: 2026-07-14 00:02 Europe/Warsaw / 2026-07-13 22:02 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `d91f2fa5bc1a3513a672884022991c41ac995d2f`.
- Środowisko: build Vite serwowany przez jeden serwer demo na porcie 4176; kontrola DOM/CSS przy viewport 393×852.
- Pomiar wejściowy: 49 widocznych animacji CSS; 192 548 px animowanej powierzchni z blur; 394 węzły DOM; 36 obrazów.
- Pomiar po usunięciu wadliwych warstw: 42 animacje; 77 027 px animowanej powierzchni z blur; 0 `.atmosphere-cloud-wisp`; 0 `.persistent-water-flow__soft`; 4 krótkie water glints.
- Lokalny transport: HTML 200; po końcowym buildzie TTFB około 7 ms na loopback. Rozmiar `dist/assets`: około 3,04 MB, w tym obrazy około 2,11 MB i JS około 0,86 MB przed kompresją HTTP.
- `npm.cmd test`: **PASS 88/88**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, 844 moduły, 3,46 s; główny JS 400,73 kB / 122,64 kB gzip; CSS 71,02 kB / 15,37 kB gzip.
- Test polityki jakości: **PASS** — progi 52/42 FPS, histereza trzech zdrowych próbek, brak selektorów adaptive quality obejmujących `WorldOperationsLayer`.
- Ograniczenie: osadzona przeglądarka automatyzacyjna działała jako `document.visibilityState=hidden` i poprawnie wstrzymała `requestAnimationFrame`; nie użyto tej próbki jako fałszywego wyniku FPS. Rzeczywisty aktywny klient zapisuje wynik w `data-measured-fps` i sam dobiera `data-motion-quality`.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-007 — Pogoda z realnej telemetrii

- Czas: 2026-07-14 02:05 Europe/Warsaw / 2026-07-14 00:05 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `d8f7e3d6f2e1f59ad5918984674378f7f28207db`.
- Środowisko: demo Build Week, jeden istniejący serwer na porcie 4176, dane wejściowe z istniejącego snapshotu `system`.
- `node --test src/world/directors/telemetryWeatherDirector.test.js`: **PASS 4/4** — realne CPU/temperatura, dwell i awaryjny skok, histereza, brak telemetrii.
- `npm.cmd run lint`: **PASS** — bez wyłączania reguł i bez zmiany konfiguracji testowej.
- Semantyka: **PASS** — wynik reżysera nie zawiera `operationalState`; brak fake `Working` i `Success`.
- Zakres integracji: **PASS** — brak zmian `server.js`, API, Hermes OS CAT i produkcyjnego worktree.
- Ograniczenie: pogoda jest reprezentacją telemetrycznego obciążenia hosta, nie odrębnym alarmem; krytyczne zdarzenia nadal pochodzą wyłącznie z prawdziwego pipeline’u Hermesa.

## TEST-BW-008 — Wzorcowe wejście i wnętrze Kuźni

- Czas: 2026-07-14 02:44 Europe/Warsaw / 2026-07-14 00:44 UTC.
- Branch: `build-week/hermes-world`.
- Środowisko: istniejący serwer demo na porcie 4176, BASELINE, viewport 393×852 oraz produkcyjny build Vite.
- Hotspot: **PASS** — 52×62 px, semantic entrance; test potwierdza osobne współrzędne desktop/mobile i brak aktywacji niedokończonych wnętrz.
- Wejście: **PASS** — tap otwiera Kuźnię, faza wynika z realnego snapshotu, focus trafia do przycisku powrotu.
- Powrót: **PASS** — focus wraca do hotspotu, mapa jest odblokowana; transform przed i po: `matrix(1, 0, 0, 1, -240.688, -426)`.
- Dostępność: **PASS** — focus trap, Escape, `inert`, `aria-hidden` i restore focus.
- `npm.cmd test`: **PASS 97/97**, 0 fail, 0 skipped.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 848 modułów; główny JS 405,78 kB / 124,15 kB gzip; lazy chunk wnętrza 6,10 kB / 2,27 kB gzip i CSS 8,54 kB / 2,65 kB gzip.
- `git diff --check`: **PASS** po kosmetycznej korekcie EOF.
- Ograniczenie: finalna ocena estetyczna należy do użytkownika na telefonie; jeden wzorzec nie oznacza jeszcze wdrożenia wnętrz wszystkich budynków.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-009 — Visual integration polish Kuźni

- Czas: 2026-07-14 12:19 Europe/Warsaw / 2026-07-14 10:19 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `6fec34084f28a6eedb582fcbb2cded202fe5b38a`.
- Viewport 393×852: **PASS** — wejście otwiera scenę, header/readout pozostają czytelne, komora ma trzy plany i brak prostokątnych overlayów oderwanych od architektury.
- Budżet sceny: **PASS** — 65 potomków DOM, 9 elementów z animacją, 4 elementy z lokalnym filtrem; brak pełnoekranowego blur i animowanych layout properties.
- Lint zmienionego komponentu: **PASS**.
- `npm.cmd test`: **PASS 97/97**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 848 modułów, 9,01 s; lazy JS wnętrza 6,84 kB / 2,34 kB gzip; CSS wnętrza 16,15 kB / 4,55 kB gzip.
- `git diff --check`: **PASS**.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-010 — Pięć wnętrz subsystemów i wspólny kontrakt

- Czas: 2026-07-14 12:55 Europe/Warsaw / 2026-07-14 10:55 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `3da2925`.
- Viewport 393×852: **PASS** — Archiwum, Cytadela, Watcher i Sanctum otwierają właściwy dialog, zachowują czytelny header/readout i zamykają się do niezmienionej mapy.
- Focus/return: **PASS** — po wyjściu z Sanctum aktywnym elementem ponownie jest `Wejdź do Sanctum Regeneracji`; liczba otwartych dialogów wynosi 0.
- Kontrakt danych: **PASS** — fazy budynków korzystają z istniejących danych i nie emitują `operationalState`, `Success` ani fikcyjnego evidence ID.
- Kontrakt mapy: **PASS** — testy potwierdzają semantic nodes dla Kuźni, Archiwum, Cytadeli i Watchera oraz jawny istniejący landmark Sanctum; brak zmian routingu.
- `npm.cmd test`: **PASS 100/100**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 848 modułów; główny JS 407,94 kB / 124,74 kB gzip; lazy JS wnętrz 11,80 kB / 3,68 kB gzip; CSS wnętrz 27,52 kB / 7,07 kB gzip.
- `git diff --check`: **PASS**.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-011 — Globalna pogoda bez regresji ruchu

- Czas: 2026-07-14 13:00 Europe/Warsaw / 2026-07-14 11:00 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `d257223`.
- Testy reżyserów pogody i operacji: **PASS 26/26**.
- Kontrakt kosztu: **PASS** — `telemetry-weather-grade` obejmuje stage, ma `animation-name: none`, nie dodaje schedulera, filtra ani cząstek; `prefers-reduced-motion` wyłącza również przejście tonalne.
- Adaptive quality: **PASS** — w trybie minimalnym usuwany jest `will-change`; duże prawdziwe operacje eventowe nadal pozostają w osobnej warstwie i nie są tłumione.
- Build: **PASS**, 848 modułów, 3,46 s; główny JS 407,99 kB / 124,74 kB gzip; CSS wzrósł wyłącznie o reguły stanowe do 75,53 kB / 16,31 kB gzip.
- Ograniczenie: odczyt FPS osadzonej przeglądarki nie jest traktowany jako miarodajny dla aktywnego telefonu; brak regresji potwierdzono przez niezmienioną liczbę animacji pogodowych i brak nowej animacji pełnoekranowej.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-012 — Rozpoznawalność i budżet czterech wnętrz

- Czas: 2026-07-14 13:48 Europe/Warsaw / 2026-07-14 11:48 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `ac5b3f8`.
- Viewport 393×852: **PASS** — Archiwum, Cytadela, Watcher i Sanctum mają odrębne, semantyczne landmarki i nie wyglądają jak warianty jednej cyber-komory.
- Koszt aktywnej sceny: Archiwum 65 DOM / 5 animacji / 3 filtry; Cytadela 63 / 5 / 2; Watcher 57 / 5 / 2; Sanctum 64 / 6 / 2. Mapa pozostaje pauzowana pod otwartym wnętrzem.
- Kontrakt tożsamości: **PASS** — test wymaga regałów i kodeksu Archiwum, chorągwi i stołu Cytadeli, teleskopu i parapetu Watchera oraz apteki i basenu Sanctum; renderer Kuźni nie został zduplikowany.
- `npm.cmd test`: **PASS 101/101**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 848 modułów; lazy JS wnętrz 13,64 kB / 3,84 kB gzip; CSS wnętrz 39,78 kB / 9,91 kB gzip; główny JS bez wzrostu 407,99 kB / 124,74 kB gzip.
- `git diff --check`: **PASS**.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-013 — Głębia, materiały i budżet wnętrz

- Czas: 2026-07-14 14:30 Europe/Warsaw / 2026-07-14 12:30 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `c95006b31674c006728e7121ace802dcb47f745f`.
- Kontrakt renderera: **PASS** — dokładnie cztery nowe komory korzystają ze wspólnego `RoomDepth`; wymagane są sklepienie, ściany boczne, posadzka i lokalne światło.
- Kontrakt wydajności: **PASS** — 0 nowych assetów rastrowych, timerów, filtrów i deklaracji animacji w bloku głębi; główny bundle JS pozostał bez wzrostu 407,99 kB / 124,74 kB gzip.
- Lazy interior bundle: JS 14,19 kB / 3,92 kB gzip; CSS 45,13 kB / 11,02 kB gzip. Mapa nadal jest pauzowana pod otwartym wnętrzem.
- `npm.cmd test`: **PASS 101/101**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 848 modułów, 3,26 s.
- `git diff --check`: **PASS**.
- Automatyczna walidacja w przeglądarce Codexa: **MANUAL ACTION REQUIRED** — runtime sterowania przeglądarką nie zainicjalizował się; finalne GL/RL na 393×852 należy do autora. Nie oznaczono tego kroku jako PASS bez dowodu.
- Produkcja: **PASS — branch `main` czysty i nietknięty**.

## TEST-BW-014 — Atomowe progi, premium spatial integration i audyt CAT

- Czas: 2026-07-14 21:21 Europe/Warsaw / 2026-07-14 19:21 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `5fcbea00cdd879086b9eb5dc401b91f031a507ae`.
- Read-only audyt CAT: **PASS** — potwierdzono endpointy i pola używane przez dashboard, benchmarki, providerów, crony, logi i pamięć; brak zmian w CAT.
- Kontrakt progu wejścia: **PASS** — testy Kowala i Uczonego potwierdzają pełną sylwetkę przed progiem, ukrycie całej sylwetki wewnątrz i pełne pojawienie przy wyjściu; 10 pozostałych profili pozostaje renderowanych.
- Kontrakt przestrzenny: **PASS** — test wymaga łuku tylnego, żeber, posadzki, lokalnej plamy światła, progów pierwszego planu i unikalnych landmarków czterech wnętrz.
- Kontrakt wydajności: **PASS** — premium blok nie zawiera `animation` ani `@keyframes`; 0 nowych assetów, timerów i schedulerów.
- `npm.cmd test`: **PASS 101/101**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 848 modułów, 21,20 s; główny JS 408,19 kB / 124,82 kB gzip; lazy interior JS 15,35 kB / 4,04 kB gzip; lazy interior CSS 51,16 kB / 12,21 kB gzip.
- `git diff --check`: **PASS**.
- Automatyczna walidacja przeglądarkowa 393×852: **MANUAL ACTION REQUIRED** — brak działającego sterowania przeglądarką w tej sesji; nie zapisano fałszywego PASS.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-015 — Cinematic subsystem interiors

- Czas: 2026-07-15 00:15 Europe/Warsaw / 2026-07-14 22:15 UTC.
- Branch/HEAD: `build-week/hermes-world` / `d16969e`.
- Zakres: pięć wnętrz 1024×1280, wspólny lazy renderer, lokalne hotspoty animacji, progi wejścia i istniejący kontrakt telemetrii.
- `npm.cmd test`: **PASS 101/101**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 854 moduły.
- Bundle: główny JS 408,33 kB / 124,86 kB gzip; lazy interior JS 9,85 kB / 4,09 kB gzip; lazy interior CSS 17,51 kB / 4,26 kB gzip.
- Kontrakt wydajności: **PASS** — raster bazowy i efekty wnętrza są ładowane wyłącznie po otwarciu drill-downu; mapa pozostaje pauzowana pod modalem; nie dodano timerów per element.
- Kontrakt semantyczny: **PASS** — zachowano `evidenceEventId`, operacyjne fazy i realne metryki; warstwa wizualna nie emituje nowych stanów.
- Przejście wejściowe: **PASS po poprawce** — usunięto animację opacity całej płyty, która w pierwszej klatce ujawniała mapę pod wnętrzem.
- Automatyczna finalna walidacja 393×852: **MANUAL ACTION REQUIRED** — końcowe GL/RL autora na realnym telefonie przez Tailscale; nie zapisano fałszywego PASS.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-016 — First-open interior performance pass

- Czas: 2026-07-15 00:43 Europe/Warsaw / 2026-07-14 22:43 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `62ad776313f437ee794b3bd3f591110f2b0f0868`; wynik zapisany w `8f43378`.
- Audyt Vite: **PASS** — pięć plansz nie pobiera się równocześnie; aktywne jest tylko jedno wnętrze. Kuźnia pozostaje najcięższa (około 795 kB first-open przed migracją dedykowanych efektów).
- Kontrakt prewarm: **PASS** — `requestIdleCallback` ładuje tylko lazy kod/CSS, bez pięciu JPG; pointer/focus rozpoczyna predecode jednej wybranej planszy.
- Kontrakt renderowania: **PASS** — efekty montują się po `onLoad` planszy; stripy mają `fetchPriority="low"` i `decoding="async"`; mobilny duplicate backdrop jest wyłączony; pełnoekranowy camera settle usunięty.
- `npm.cmd test`: **PASS 101/101**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS poza sandboxem po powtarzalnym EPERM pliku tymczasowego Vite**, 855 modułów, 3,02 s. Nie zmieniono konfiguracji testów ani Vite.
- Bundle: lazy interior JS 9,43 kB / 3,91 gzip; lazy interior CSS 17,27 kB / 4,20 gzip; main JS 409,60 kB / 125,28 gzip.
- Test realnego telefonu 393×852: **MANUAL ACTION REQUIRED** po odświeżeniu serwera demo.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-017 — Dedykowany ogień cinematic Kuźni

- Czas: 2026-07-15 01:32 Europe/Warsaw / 2026-07-14 23:32 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `7010990`; wynik zapisany w `7ed6f77`.
- Alpha source: **PASS** — płaskie chroma-key usunięte lokalnie, zachowane częściowo przezroczyste krawędzie, brak prostokątnego tła.
- Kontrakt klatek: **PASS** — 8 klatek, source 2048×256, runtime 1024×128, identyczny baseline i fixed pivot.
- Kontrakt importu: **PASS** — wnętrze importuje `building-interior-effects/forge-interior-fire-strip.runtime.png` i nie importuje mapowego `world-effects/forge-fire-strip.runtime.png`.
- Koszt: **PASS** — 65 025 B runtime, redukcja około 68% względem 205 184 B.
- `npm.cmd test`: **PASS 101/101**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, 856 modułów, 3,36 s; build uruchomiony poza sandboxem po EPERM pliku tymczasowego Vite.
- Walidacja 393×852: **MANUAL ACTION REQUIRED** — finalna ocena skali, koloru i integracji z piecem przez autora na telefonie.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-005 — Perceptual visibility bez regresji wydajności

- Czas: 2026-07-14 00:15 Europe/Warsaw / 2026-07-13 22:15 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `3eeca294ba69c69dda5ed75f41aed55594da80e1`.
- Kontrakt wody: liczba ścieżek bez wzrostu; `stroke-dasharray: 3.2 24 1.4 71.4`; dwa krótkie refleksy, brak szerokiej grupy soft-water.
- Kontrakt chmury: jeden element; `filter: none`; animacja transform 23 s desktop / 21 s mobile; brak `cloud-wisp`.
- Pomiar kontrolny aktywnej sceny desktop: 36 widocznych animacji w bieżącym stanie, 0 px animowanej powierzchni z CSS `blur()`.
- `npm.cmd test`: **PASS 88/88**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, 844 moduły, 3,78 s; rozmiary głównych chunków bez istotnej zmiany.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-006 — Maskowana woda i stabilność trybu ambient

- Czas: 2026-07-14 01:25 Europe/Warsaw / 2026-07-13 23:25 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `0f75829117e870d819b526f89d3806d1a90e4a54`.
- Środowisko: jeden istniejący serwer demo, viewport 393×852, BASELINE, tryb ambient aktywowany po 6 sekundach.
- Audyt wizualny: **PASS** — usunięto pełnoekranowy cień chmury oraz liniowy przepływ SVG; po 7,6 s mapa pozostaje kompletna bez czarnych wycięć.
- Kontrakt wody: **PASS** — osiem lokalnych obszarów mobile i sześć desktop; ruch pozostaje wewnątrz masek; brak pełnoekranowego SVG/image copy, `stroke-dasharray`, animowanego `blur` i pełnoekranowego blend mode.
- Pomiar ruchu: **PASS** — transform refleksów zmienił się o około 22–31 px w próbce 1,8 s.
- `npm.cmd test`: **PASS 88/88**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 843 moduły; główny JS 401,66 kB / 122,70 kB gzip; CSS 70,32 kB / 15,22 kB gzip.
- Ograniczenie: ostateczna ocena naturalności i intensywności przepływu należy do użytkownika na realnym telefonie przez Tailscale; kontrakt techniczny i brak artefaktów zostały potwierdzone.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-020 — Agent perfection, truth ownership i pełna macierz 12 ról

- Czas: 2026-07-15 11:40 Europe/Warsaw / 2026-07-15 09:40 UTC.
- Branch/HEAD funkcjonalny: `build-week/hermes-world` / `ba85507`.
- Kontrakt sprite’ów: **PASS** — 12/12 unikalnych profili, canvas 128×128, stopa `y=124`, anchor `0.96875`, brak portretów UI i brak fallbackowego kaptura.
- Kontrakt skali: **PASS** — efektywny canvas mapowy wszystkich ról 40–49 px; `mapVisibilityScale` 1.00–1.10; Kowal map-only 1.10, fizyczny `renderScale` bez zmian.
- Kontrakt stanu: **PASS** — `Working` nie kasuje profilu widoczności roli; `Offline` pozostaje jawnym grayscale/brightness override; markery Uczonego i Zwiadowcy uwzględniają pochyloną klatkę.
- Kontrakt ownership: **PASS** — ten sam gate task/evidence steruje mapą i wnętrzem; brak taska lub stale bez evidence nie może ukryć sprite’a z obu powierzchni.
- Truth audit: **PASS** — wewnątrz aktywne wyłącznie Kowal/Kuźnia i Uczony/Archiwum; Zwiadowca pozostaje exterior; Cytadela/Sanctum bez wymyślonej obecności.
- `npm.cmd test`: **PASS 112/112**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 869 modułów, 2,87 s poza sandboxem po znanym EPERM pliku `.vite-temp`; konfiguracji nie zmieniono.
- Bundle: main JS 412,55 kB / 126,26 kB gzip; lazy interior JS 14,47 kB / 5,72 kB gzip; lazy CSS 12,55 kB / 3,19 kB gzip.
- HTTP/cache: **PASS** dla statusu 200 i immutable cache assetów; pomiar nie jest FPS/browser-paint.
- Podgląd automatyczny 393×852: **MANUAL ACTION REQUIRED** — niedostępna integracja sterowania kartą; końcowe estetyczne GL/RL autora na realnym telefonie.
- Produkcja: **PASS — `main` czysty i nietknięty**.

## TEST-BW-021 — Percepcyjna integracja Kowala w cinematic Forge

- Czas: 2026-07-15 12:01 Europe/Warsaw / 2026-07-15 10:01 UTC.
- Branch/HEAD: `build-week/hermes-world` / `40282ed`.
- Render-review: **PASS techniczny** — docelowe kompozycje 393 px potwierdziły właściwy anchor, rozmiar i stanowisko; review nie zastępuje screenshotu z przeglądarki ani GL autora.
- Korekta kontrastu: **PASS** — wyłącznie zmienne tonu istniejącego renderera; bez zmiany skali, pozycji, assetu, filtra pełnoekranowego, timera lub operational state.
- Testy wnętrz: **PASS 11/11**.
- Lint: **PASS**.
- Build: **PASS**, 869 modułów, 3,29 s; main JS 412,55 kB / 126,26 kB gzip; lazy interior CSS 12,76 kB / 3,22 kB gzip.
- Mobile estetyczne GL/RL: **MANUAL ACTION REQUIRED**.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-024 — Ruch pracy i skala Komnaty

- Czas: 2026-07-15 13:20 Europe/Warsaw / 2026-07-15 11:20 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `d952234`; working tree zawierał wyłącznie ten atomowy pass i dokumentację.
- Audyt klatek alpha: **PASS diagnostyczny** — wszystkie sprite’y zachowują canvas 128×128 i stopę `y=124`; potwierdzono, że `work` jest pojedynczą pozą, nie wieloklatkową animacją. Największa różnica wysokości pozy dotyczy Zwiadowcy, ale jest to zamierzona pochylona obserwacja, nie utrata anchoru.
- Wspólny kontrakt pracy: **PASS** — renderer wystawia istniejący `behaviorType`, a CSS zawiera ruch dla pięciu typów zachowania, wspólny dla mapy i wnętrza. Ruch powstaje tylko dla `is-work`.
- Reduced motion: **PASS** — test źródłowy blokuje brak centralnego `animation:none!important` dla warstwy ruchu.
- Skala QA Komnaty: **PASS kontraktu** — Kasztelan 1,34; Rycerz 1,45; limit 1,45 zachowany. Ocena estetyczna na telefonie: **MANUAL ACTION REQUIRED**.
- `npm.cmd test`: **PASS 119/119**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 871 modułów; main JS 414,78 kB / 127,01 kB gzip; lazy interior JS/CSS bez wzrostu względem poprzedniego passu.
- Istniejący serwer demo: **PASS HTTP 200**; nie uruchomiono drugiego serwera.
- Produkcja: **PASS — czysta i nietknięta**.

## TEST-BW-025 — Centrowanie focal axis Komnaty i Watchera

- Czas: 2026-07-15 13:38 Europe/Warsaw / 2026-07-15 11:38 UTC.
- Kontrakt pozycji QA: **PASS** — Paź, Zwiadowca i Herold mają `x=50`; skale i Y pozostają zatwierdzone bez zmian.
- Truth boundary: **PASS** — test review nadal potwierdza brak tasków, eventów, `evidenceEventId` i ingerencji w normalny `InteriorAgentPresence`.
- `npm.cmd test`: **PASS 120/120**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 871 modułów; bundle bez wzrostu.
- Mobile/desktop estetyczne GL: **MANUAL ACTION REQUIRED** — wyłącznie ocena końcowego centrowania.
- Produkcja: **PASS — nietknięta**.

## TEST-BW-026 — Końcowy odbiór rosteru przez autora

- Czas: 2026-07-15 13:48 Europe/Warsaw / 2026-07-15 11:48 UTC.
- Branch/HEAD: `build-week/hermes-world` / `e85c6c1c8f27118cda47f8e3649025694ddc0426`.
- Realny telefon 393×852: **PASS / GL AUTORA** — skala, ruch pracy i końcowe centrowanie Pazia, Zwiadowcy oraz Herolda zostały zaakceptowane bez kolejnego RL.
- Zakres automatyczny poprzedzający GL: **PASS 120/120 testów**, lint PASS, build PASS, HTTP demo 200; szczegóły i rozmiary bundla zapisano w TEST-BW-025 oraz BW-2026-07-15-033.
- Granica prawdy: **PASS** — review pozostaje demo-only; GL nie aktywuje fikcyjnych tasków, eventów, `Working`, `Success` ani lokalizacji w normalnym runtime.
- Gate recovery/promocji: **OTWARTY** — można utworzyć pełny backup, a po jego zweryfikowaniu rozpocząć kontrolowane wdrożenie na produkcję.
- Produkcja w chwili odbioru: **PASS — czysta i nietknięta**.

## TEST-BW-027 — Integralność pełnego backupu przed promocją

- Czas: 2026-07-15 14:10 Europe/Warsaw / 2026-07-15 12:10 UTC.
- `git fsck --full --strict`: **PASS** — brak korupcji; tylko cztery dangling blobs.
- High-confidence tracked secret scan: **PASS — 0 plików**.
- `git bundle verify`: **PASS** — pełna historia, 8 refów.
- Restore test: **PASS** — clone z bundle, switch na `build-week/hermes-world`, HEAD `88f8ddc2ba9a087b49adf10090cc8bac249ce1f1`, 719 śledzonych plików.
- Archive listing: **PASS** — demo source 780 wpisów, production source 562, demo build 328, production build 297.
- Kopia Pulpit: **PASS** — 321 836 131 B / 306,93 MiB; SHA-256 kopii zgodny ze źródłem: `aa1c67d04413b1cfd2a558c5bfd959d6dfe39bbcd3bc945831ad79c2f169ff40`.
- Produkcja podczas backupu: **PASS — czysta i nietknięta**.

## TEST-BW-028 — Produkcyjny preflight i realny chat world-event edge

- Czas: 2026-07-15 15:56 Europe/Warsaw / 13:56 UTC.
- Produkcyjny preflight po fast-forward: **PASS** — testy 120/120, lint, world-life validator i build; root, metryki oraz world snapshot HTTP 200; pojedynczy listener 4175; backend 8787 i Tailscale Funnel 10000 zachowane.
- Diagnoza E2E: **FAIL → NAPRAWIONE NA DEMO** — produkcyjny world hub był pusty, a runner 24/7 nie uruchamiał sidecara. Sam renderer nie stanowił dowodu połączenia każdej wiadomości z ruchem.
- Test czystego źródła: **PASS** — publisher nie emituje nic bez prawdziwego `stream_id`; późniejsze edge pochodzą z realnych eventów SSE, nie z tokenów ani kliknięcia.
- Dedup/terminal: **PASS** — wielokrotne `thinking`, `tool`, `done` nie dublują stanu; `apperror` blokuje późniejszy Success.
- Live demo ingestion: **PASS** — trzy eventy `stream_start`, `reasoning`, `done` przyjęte jako 202 i znormalizowane do `assigned`, `thinking`, `success`; SSE replay zachował `runId`, `seq` i źródło.
- Kontrola dostępu: **PASS** — panel ingestion bez cookie zwraca HTTP 401; zwykły lokalny adapter pozostaje ograniczony do loopback/token.
- Pełny zestaw: **PASS 123/123**, 0 fail, 0 skipped. Lint: **PASS**. Build: **PASS**, 871 modułów, 4,24 s; main JS 414,78 kB / 127,01 kB gzip, bez wzrostu bundla względem promowanej wersji.
- Realny zalogowany chat na produkcji: **MANUAL ACTION REQUIRED** po promocji tej poprawki; nie jest jeszcze oznaczony jako PASS.

## TEST-BW-029 — Cold-start readiness i usunięcie pełnych przewodów

- Czas: 2026-07-15 17:14 Europe/Warsaw / 15:14 UTC.
- Branch/startowy HEAD: `build-week/hermes-world` / `ee58011dd0a03fa136d343126ca66728a7ec2361`.
- Reprodukcja regresji produkcyjnej: **PASS diagnostyczny** — zapisano cold-start z mapą i rasterami agentów niegotowymi, przy widocznych cieniach/efektach oraz pełnych przewodach. Nie został przedstawiony jako poprawny stan produktu.
- Readiness contract: **PASS** — mapa ma responsive preload w HTML, efekty montują się po `mapLoaded`, 12 początkowych sprite’ów ma wysoki priorytet, a cała warstwa agentów ujawnia się atomowo po gotowości obrazów. Pojedynczy sprite nie pokazuje cienia, ringu ani markera przed `onLoad`.
- Transit contract: **PASS** — pełny background przewodu jest wymuszony na `none`; aktywny sygnał ma 20 px. Lokalny wake zajmuje 6% ścieżki, nie 16%; test blokuje powrót pełnego route bed.
- `npm.cmd test`: **PASS 125/125**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 warnings.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 871 modułów; main JS 415,44 kB / 127,20 kB gzip; CSS 78,07 kB / 16,80 kB gzip.
- HTTP/cache: **PASS** — HTML i wszystkie krytyczne zasoby 200; JS gzip 126 128 B w 0,053 s, mapa 531 412 B w 0,011 s, sprite 15 278 B w 0,008 s na localhost. Pomiar PowerShell `Invoke-WebRequest` został odrzucony jako niereprezentatywny narzut klienta; zapisano wynik `curl`.
- Automatyczny browser audit: **FAIL / NIEZALICZONY** — Browser bootstrap `Cannot redefine property: process`; izolowany CDP nie ukończył `Page.enable`. Nie zapisano fałszywego FPS.
- Realny telefon, cold i warm: **PASS / GL AUTORA** — kompletny świat pojawia się natychmiast, bez widocznej fazy ładowania, osieroconych cieni i pełnych niebieskich linii.
- Zweryfikowany commit funkcjonalny: `6a8d13e59e95124b7a33b624ac18f6a438b97370`.
- Produkcja: **PASS — nietknięta podczas naprawy**, promocja dopiero po commicie i snapshotcie.

## TEST-BW-030 — Produkcyjny launch PWA po promocji chat SSE/cold-start

- Czas: 2026-07-15 17:14–17:55 Europe/Warsaw / 15:14–15:55 UTC.
- Fast-forward produkcji do `cf876af`: **PASS**; zakres odpowiada zatwierdzonym commitom Build Week.
- `npm.cmd test`: **PASS 125/125**; lint: **PASS**; world-life validator: **PASS**; build: **PASS**, 871 modułów, 7,30 s.
- Endpointy lokalne `/`, `/api/auth/status`, `/api/system/metrics`, `/api/world/events/snapshot`: **PASS HTTP 200**. SSE: **PASS** dla statusu 200, `text/event-stream`, `no-cache, no-transform`, początkowego retry i pustego snapshotu.
- Publiczny HTTPS przez Tailscale: **PASS HTTP 200** sprawdzony klientem Node. Windows PowerShell/curl Schannel zwrócił błąd lokalnego magazynu credentials, więc jego wynik nie został błędnie przypisany serwerowi.
- Manualne uruchomienie starej ikony PWA: **FAIL** — historyczny launch/cache uruchomił tryb demo i `0/0` agentów. To unieważnia pełny odbiór wizualny mimo poprawnych endpointów.
- Canonical production launch: **PASS automatyczny** — commit `19f925e`; `/?demo=1` na 4175 zwraca `302 Location: /`, zwykły `/` zwraca 200, reset klienta zwraca 200; demo 4176 nie zostało semantycznie wyłączone.
- Listener production: **PASS — dokładnie 1**. Health po pięciu kolejnych kontrolach: **PASS 5/5 root 200**.
- Manualny czysty launch 12 agentów: **MANUAL ACTION REQUIRED** po jednorazowym `/reset-client.html`.
- Realny zalogowany chat SSE: **MANUAL ACTION REQUIRED** dopiero po zaliczeniu czystego launchu; snapshot przed testem ma 0 eventów.

## TEST-BW-031 — Produkcyjny authenticated live runtime po restarcie

- Czas: 2026-07-16 07:06–07:45 Europe/Warsaw / 05:06–05:45 UTC.
- Branch/commity: Build Week `5ff6a68e19bb9d83e2060feb7e26f708dca49fd1`; produkcyjny `main` `b9aedf217f4746ea5328bc66bc55f854b8959e02`.
- Zakres aplikacyjny `src`, `public`, `server.js`, `index.html`, manifesty npm i konfiguracja Vite: **PASS — zero różnic** między zatwierdzonym Build Week a produkcyjnym commitem.
- `npm.cmd test`: **PASS 130/130**; obejmuje auth gate, zakaz live SSE w demo, canonical production URL, Service Worker bez wymuszonej nawigacji, real chat SSE publisher, evidence chain i brak publikacji bez potwierdzonego `stream_id`.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 872 moduły, 2,84 s; main JS 415 602 B / 127,30 kB gzip, CSS 78,07 kB / 16,80 kB gzip.
- Lokalny transport, 5 prób: root **PASS 200**, warm total 5,5–7,2 ms; bundle **PASS 200**, 415 602 B, total 8,7–9,5 ms; auth **PASS 200**, 8,2–14,6 ms.
- Publiczny Tailscale HTTPS: root **PASS 200**, 68 ms; auth **PASS 200**, 61 ms; `/?demo=1` **PASS 302 → /**, 60 ms.
- SSE publiczne: **PASS**, `retry: 3000` oraz event `snapshot`; snapshot pusty przed prawdziwą wiadomością, zgodnie z zasadą bez fake eventów.
- Ochrona ingestion: fałszywe cookie + niepoprawne `x-hermes-world-source` daje **PASS 403**; nic nie opublikowano.
- Dostęp do chronionych danych bez sesji: `/api/profiles` daje **PASS 401**, a nie demo fallback.
- Trwały serwer: zadanie `Hermes Citadel Production V1` utworzone jako ukryte, z jedną instancją i produkcyjną ścieżką; publiczny endpoint działa po naprawie. Chrome/headless: **PASS — 0 procesów** uruchomionych przez testy.
- Pełny authenticated domains smoke i realna wiadomość chat: **MANUAL ACTION REQUIRED** — po restarcie brak lokalnej dystrybucji WSL przechowującej hasło; nie obchodzono zabezpieczeń i nie odczytywano sekretu.
- Stabilność 30 s, 8 kolejnych próbek: **PASS 8/8** dla localhost root, publicznego root i publicznego auth. Zakres czasu odpowiedzi: localhost 4,2–25,2 ms, publiczny root 45,8–85,5 ms, publiczny auth 44,6–72,0 ms. Chrome/headless po teście: **0**.

## TEST-BW-032 — Live endpoint contracts, roster i evidence-backed interiors

- Czas: 2026-07-16 10:17 Europe/Warsaw / 08:17 UTC.
- Produkcyjny branch/HEAD: `main` / `01e5b09`.
- Kontrakty klienta: **PASS** — same-origin credentials dla odczytów live, `/api/logs?tail=500`, `/api/sessions/search?limit=50&all_profiles=1`.
- Semantyka sesji: **PASS** — profil wybrany bez taska pozostaje idle; pending daje waiting bez zwiększenia aktywnych; prawdziwy stream daje working/motion z evidence; edge zakończenia daje done/success/return; niedawny `updated_at` bez aktywnego streamu nie udaje pracy.
- Roster: **PASS** — 12 stabilnych ról; częściowy live payload nie usuwa miasta, a brakująca rola ma jawny `offline` i `isActive=false`.
- Wnętrza: **PASS** — 12/12 zaakceptowanych ról ma jedno evidence-gated przypisanie w pięciu wnętrzach; test blokuje podwójny ownership mapy i pokoju oraz wejście bez tego samego task/evidence.
- Testy fokusowe: **PASS 38/38**. Pełny `npm.cmd test`: **PASS 136/136**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 błędów.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build -- --configLoader native`: **PASS**, Vite 8.0.16, 872 moduły, 3,55 s; main JS 421,17 kB / 129,10 kB gzip; CSS 78,07 kB / 16,80 kB gzip.
- Serwowany artifact: **PASS** — `/assets/index-C1P_53PB.js`, HTTP 200, zawiera nowe kontrakty `all_profiles=1` i `hermes-session`.
- Proces: **PASS** — dokładnie jeden listener 4175; nie uruchomiono dodatkowego serwera ani przeglądarki.
- Publiczny Tailscale auth status: **PASS HTTP 200** po finalnym buildzie.
- Endpointy chronione bez cookie: **PASS security contract** — profile/sessions/logs/crons/skills/models zwracają 401; nie użyto demo fallbacku.
- Zalogowane wartości endpointów i realna wiadomość na telefonie: **MANUAL ACTION REQUIRED** — wymaga sesji autora; automaty nie odczytywały sekretów ani cookie.

## TEST-BW-033 — Cadence realnych sesji i bounded rendering

- Czas: 2026-07-16 10:50 Europe/Warsaw / 08:50 UTC.
- Session cadence: **PASS** — sesje są due co 1 s; metryki pozostają 5 s, profile/tasks/logs/crons 15 s, skills/models 60 s.
- Bounded publish: **PASS** — domena użyta z cache nie emituje progresywnego snapshotu; realny odczyt lub błąd emituje aktualizację. Nie dodano timera per agent ani per efekt.
- Cadence test: **PASS** — cztery kolejne synchronizacje odświeżyły sesje 4 razy, metryki zgodnie z 5 s, profile zgodnie z 15 s.
- `node --test src/world/mapAgentPresentation.test.js`: **PASS 26/26**.
- Pełny `npm.cmd test`: **PASS 136/136**.
- Targeted ESLint oraz wcześniejszy pełny lint: **PASS**.
- `npm.cmd run validate:world-life`: **PASS** po usunięciu historycznego założenia `agents[0] === coder`.
- Build: **PASS**, 872 moduły, 8,20 s; main JS 421,21 kB / 129,12 kB gzip; serwowany `index-ClaSbR_q.js`.
- Listener 4175: **PASS — dokładnie 1**. Dodatkowego serwera ani przeglądarki nie uruchomiono.
- Percepcyjna reakcja na prawdziwą wiadomość z zalogowanego telefonu: **MANUAL ACTION REQUIRED**.

## TEST-BW-034 — Spójność domen live, odporność rosteru i usunięcie pasów pogodowych

- Czas: 2026-07-16 11:18 Europe/Warsaw / 09:18 UTC.
- Manualny test wejściowy telefonu: **FAIL** — agent roster znikał po chwilowym pokazaniu, globalny status przechodził do Offline/Degraded, a ukośne pasy `telemetry-rain` były widoczne po obu stronach mapy. Ten wynik jest dowodem regresji i bramką dla naprawy.
- Test wolnego odświeżenia profili: **PASS** — każdy progresywny snapshot zachowuje ostatni spójny roster i stan online istniejącego profilu; brak przejściowego `0/12`.
- Test chwilowej awarii snapshotu w hooku: **PASS** — poprzedni wiarygodny świat pozostaje widoczny jako stale/degraded zamiast zostać zastąpiony pustym snapshotem.
- Test opcjonalnej domeny: **PASS** — awaria logów ustawia `domains.logs.state=stale`, ale przy live profiles+metrics globalny lifecycle pozostaje `source=live`, `connection=online`, a agent nie znika.
- Test domeny rdzeniowej: **PASS** — awaria metryk nadal daje globalne `degraded`, zachowuje ostatnią wartość i po odzyskaniu wraca do `online`; realna utrata telemetrii nie jest maskowana.
- Test warstwy atmosferycznej: **PASS** — renderer i CSS nie zawierają `telemetry-rain`; ukośne pasy nie mogą wrócić bez złamania testu.
- Testy fokusowe: **PASS 55/55**. Pełny `npm.cmd test`: **PASS 139/139**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**, 0 błędów. `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: pierwsza próba w sandboxie **FAIL — ENVIRONMENTAL EPERM** na `node_modules/.vite-temp`; identyczna komenda poza sandboxem **PASS**, Vite 8.0.16, 872 moduły, 4,52 s. Nie zmieniano konfiguracji ani kodu, aby ukryć ograniczenie.
- Finalny artifact: **PASS** — `index-DTndlvuC.js`, 421 496 B / 129,24 kB gzip; CSS 77,25 kB / 16,61 kB gzip. Publiczny root podaje dokładnie ten fingerprint i ma `no-store`; publiczny root, asset oraz auth: HTTP 200.
- Procesy: **PASS** — jeden listener Cytadeli 4175 (PID 6764), istniejący Hermes WebUI 8787 i Tailscale 10000; brak 4176 i brak nowego procesu serwera/przeglądarki.
- Ręczny retest zalogowanego telefonu po fixie: **MANUAL ACTION REQUIRED**. Do chwili obserwacji nie oznaczać pełnego mobile/live E2E jako PASS.

## TEST-BW-035 — Demo narrative/water/lifecycle gate

- Czas: 2026-07-16 12:04 Europe/Warsaw / 10:04 UTC.
- Branch/HEAD: `build-week/hermes-world` / `6d0e073bb75a939dedf8660e1ce3538a5945a117`.
- Zakres produkcji: **PASS — brak zmian**; test i implementacja dotyczą wyłącznie repo demo.
- Narracja: **PASS** — górny ticker pobiera tylko `state.raw.logs`; dolny feed pomija typ `log` i pokazuje semantic activity/alerts. Testy zachowują `rawMessage` i blokują surowy log w komunikacie narracyjnym.
- Woda: **PASS automatyczny** — finalny raster jest RGBA, ma 1024×256 px i 35 089 B; renderer zawiera 8 regionów mobile i 6 desktop; animacja używa ciągłego `translate3d(0 → -50%)`, bez `alternate`, opacity-only i dawnych reflection blobs. Reduced motion ma statyczny fallback.
- Weather stripes: **PASS** — renderer i CSS nie zawierają `telemetry-rain`.
- Event transport: **PASS** — wielu subskrybentów korzysta z jednego EventSource; ostatni unsubscribe zamyka połączenie; nie powstaje druga równoległa sesja SSE.
- Synchronizacja domen: **PASS** — równoległe wywołania `sync()` współdzielą jeden request; ukryta karta nie wykonuje polling sync; `visibilitychange`, `pageshow` i `online` wywołują kontrolowany refresh; listenery są usuwane przy unmount.
- Lifecycle renderera: **PASS** — sampler FPS ma ograniczone okna pracy i cleanup; otwarte wnętrze pauzuje mapę; zegar prezentacji i opóźnione zamknięcie wnętrza mają cleanup.
- `npm.cmd test`: **PASS 136/136**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 875 modułów, 2,77 s. Main JS 420,45 kB / 129,06 kB gzip; CSS 76,73 kB / 16,48 kB gzip; lazy interior JS 16,16 kB / 6,19 kB gzip; lazy interior CSS 14,19 kB / 3,57 kB gzip.
- Pierwsza próba builda w sandboxie: **FAIL — ENVIRONMENTAL EPERM** na pliku tymczasowym Vite. Identyczna komenda poza sandboxem: **PASS**; nie zmieniono kodu ani konfiguracji testów.
- Realny telefon 393×852, desktop, wejście/wyjście wszystkich wnętrz, background/foreground i dłuższa obserwacja: **MANUAL ACTION REQUIRED** po uruchomieniu pojedynczego serwera demo.

## TEST-BW-036 — Pixel-aligned water geometry and cost gate

- Czas: 2026-07-16 13:10 Europe/Warsaw / 11:10 UTC.
- Branch/commit: `build-week/hermes-world` / `539144663bf789e1e5ad71d25cb4f40458222e25`.
- Poprzednia percepcyjna wersja: **FAIL / RL** na realnym telefonie — efekt był oparty na przybliżonych prostokątnych regionach i nie czytał się jako przepływ rzeczywistej wody.
- Źródło geometrii: **PASS** — aktywny renderer importuje osobne pikselowe maski map mobile i desktop; brak `WATER_SURFACES`, ręcznych `clipPath` i `data-water-region`.
- Zakres maski: **PASS statyczny** — maski zostały porównane wizualnie z bazowymi mapami; mobile obejmuje zewnętrzne koryta/wodospady, desktop zatokę, bez pełnego prostokąta. Ostateczna ocena animacji pozostaje manualna.
- Asset contract: **PASS** — mobile mask RGBA `470×836`, 43 967 B; desktop mask RGBA `767×512`, 8 479 B; pionowa tekstura RGBA `256×1024`, 39 202 B. Wszystkie mieszczą się w testowanych budżetach.
- Motion contract: **PASS** — dwa ciągłe poziomy nurtu używają wyłącznie transform, osobnych skali/czasów i kierunku zależnego od layoutu; brak timera JS, `stroke-dasharray`, SVG turbulence i animowania layout properties.
- Reduced motion: **PASS** — animacje są wyłączane, pozostaje jedynie statyczny substytut o obniżonej opacity.
- Test fokusowy: **PASS 24/24**.
- Pełne `npm.cmd test`: **PASS 136/136**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 878 modułów, 6,31 s. Main JS 417,70 kB / 128,09 kB gzip; CSS 77,47 kB / 16,58 kB gzip.
- Percepcyjny test nowej animacji na telefonie 393×852: **MANUAL ACTION REQUIRED**; nie oznaczać GL automatycznie.

## TEST-BW-037 — Map-pixel water renderer gate

- Czas: 2026-07-16 13:45 Europe/Warsaw / 11:45 UTC.
- Zakres: **PASS — wyłącznie demo**; produkcyjny katalog i proces nie zostały zmienione.
- Poprzedni wariant teksturowanej maski: **FAIL / RL manualny** — autor widział drobne kreski podobne do deszczu.
- Renderer: **PASS statyczny** — aktywny komponent importuje wyłącznie trzy animacje wyprowadzone z pikseli mapy; nie importuje generic ribbonu ani masek poprzedniego wariantu i nie zawiera pełnej trasy/GPS.
- Geometria: **PASS statyczny** — alfa jest niezmienna pomiędzy klatkami i ograniczona do dwóch bocznych koryt mobile oraz portu desktop. Ostateczne dopasowanie percepcyjne pozostaje manualne.
- Format: **PASS** — wszystkie trzy pliki mają nagłówki RIFF/WEBP i chunk `ANIM`; Pillow odczytuje 8 klatek każdego pliku.
- Budżet: **PASS** — 166 652 B + 184 130 B + 33 570 B = 384 352 B; bez wzrostu main JS o logikę animacji.
- Reduced motion: **PASS** — cała warstwa wody jest ukrywana, bez dekodowania zastępczej animacji JS.
- Test fokusowy: **PASS 24/24**.
- Pełne `npm.cmd test`: **PASS 136/136**.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 877 modułów, 5,19 s; main JS 417,84 kB / 128,19 kB gzip; CSS 75,44 kB / 16,24 kB gzip.
- Runtime: **PASS** — istniejący serwer 4176 zwraca root HTTP 200 i nowy WebP HTTP 200 z `Content-Type: image/webp`; nie uruchomiono drugiego serwera ani przeglądarki.
- Telefon 393×852: **MANUAL ACTION REQUIRED** — autor nadaje RL/GL po obejrzeniu normalnego widoku bez debug overlay.

## TEST-BW-038 — Stationary banks / directional luminance gate

- Czas: 2026-07-16 14:06 Europe/Warsaw / 12:06 UTC.
- Wejściowy test telefonu: **FAIL / RL** — poprzednia animacja unosiła pełny wycinek i poruszała fragmentami murów.
- Kontrakt klatek: **PASS** — źródłowe współrzędne RGB są stałe; generator nie wykonuje `sample_x/sample_y`, translacji ani displacementu. Zmienna jest tylko luminancja fali o jednym kierunku.
- Zakres: **PASS statyczny** — wycinki mobile zwężono z 155 do 112 px, a aktywna alfa obejmuje jedynie konserwatywne kanały. Architektura nie może zmienić pozycji.
- Budżet: **PASS** — 29 210 B + 19 322 B + 23 134 B = 71 666 B.
- Fokus: **PASS 24/24**. Pełne testy: **PASS 136/136**. Lint: **PASS**. `validate:world-life`: **PASS**.
- Build: pierwsza próba **FAIL — środowiskowy EPERM** na pliku `node_modules/.vite-temp`; identyczny build z `--configLoader native` **PASS**, 877 modułów, 3,41 s. Nie zmieniono kodu ani konfiguracji testów, aby ukryć błąd środowiska.
- Manualny retest 393×852: **MANUAL ACTION REQUIRED**.

## TEST-BW-039 — Lightweight water-reflection VFX gate

- Czas: 2026-07-16 15:53 Europe/Warsaw / 13:53 UTC.
- Zakres: **PASS — wyłącznie demo**; produkcyjny branch, proces, Tailscale, API oraz deployment nie zostały zmienione.
- Pełne testy: **PASS 136/136**.
- ESLint: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- Build: **PASS**, Vite 8.0.16, 874 moduły, 3,99 s.
- Główny JS: 418,23 kB / 128,34 kB gzip; CSS: 76,41 kB / 16,48 kB gzip.
- Payload wody: **PASS — 0 B rasterów**; trzy animowane WebP zostały usunięte, a refleksy są kodowym VFX opartym na `transform` i `opacity`.
- Idle comets: **PASS statyczny** — pseudo-element przewodów jest wyłączony. Prawdziwy event transit pozostaje osobnym komponentem z `evidenceEventId`.
- Percepcyjny test 393×852: **MANUAL ACTION REQUIRED** — autor nadaje RL/GL po zobaczeniu normalnego widoku na realnym telefonie.

## TEST-BW-040 — SSE awareness i realna telemetria pomieszczeń

- Czas: 2026-07-16 16:53 Europe/Warsaw / 14:53 UTC.
- Zakres: **PASS — wyłącznie demo**; produkcyjny katalog, branch, proces 4175, Tailscale i deployment nie zostały zmienione.
- Choreografia SSE: **PASS** — test dowodzi czterech fal `acknowledge` opartych na jednym prawdziwym `evidenceEventId`, wykluczenia rzeczywistego workera, braku fake `work`/`success`, wygaśnięcia ruchu oraz pierwszeństwa operational state.
- Telemetria wnętrz: **PASS kontraktowy** — Kuźnia CPU/temperatura/task; Cytadela agenci/sesje/koszt API; Watcher crony/success/alerty; Sanctum RAM/health/incydenty; Archiwum bezpieczne podsumowanie `/api/memory`/zdarzenia/taski.
- Prywatność pamięci: **PASS projektowy** — do snapshotu trafia tylko `available`, `kind`, `sectionCount` i `characterCount`; surowa treść nie jest prezentowana ani zapisywana w world store.
- Testy fokusowe: **PASS 46/46**.
- Pełne `npm.cmd test`: **PASS 137/137**, 0 fail, 0 skipped.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 874 moduły, 5,28 s. Main JS 419,83 kB / 128,96 kB gzip; CSS 76,41 kB / 16,48 kB gzip; lazy interior JS 16,46 kB / 6,31 kB gzip.
- Event hub/bundle: **PASS techniczny** — istniejący serwer demo przyjął pojedynczy unikalny event, snapshot zawierał event, a root wskazał aktualny fingerprint bundla. Nie uruchomiono dodatkowego listenera.
- Manualny test telefonu: **MANUAL ACTION REQUIRED** — ocenić, czy po realnej wiadomości reakcja Kasztelana, czterech fal agentów, Cytadeli, właściwego budynku i Archiwum jest czytelna bez wyglądu fake work.

## TEST-BW-041 — Full real-event lifecycle resilience gate

- Czas: 2026-07-16 17:22 Europe/Warsaw / 15:22 UTC.
- Zakres: **PASS — wyłącznie demo**; produkcyjny kod i runtime nie zostały zmienione.
- Testy celowane: **PASS 75/75** — kolejność i retry publikacji, brak fake Success, pełny powrót, konkurencyjne runy, dokładne czasy tranzytu i cztery warianty uzgodnienia SSE z inventory sesji.
- Pełne `npm.cmd test`: **PASS 144/144**, 0 fail, 0 skipped.
- `npm.cmd run lint -- --quiet`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 874 moduły, 3,65 s. Main JS 420,47 kB / 129,21 kB gzip; CSS 76,41 kB / 16,48 kB gzip; lazy interior JS 16,46 kB / 6,31 kB gzip.
- `git diff --check`: **PASS**; wyłącznie ostrzeżenia Windows LF/CRLF, bez błędów whitespace.
- Benchmark derivacji lifecycle: **PASS budżetowy**, 20 000 przebiegów / 1412,7 ms / około 70,635 µs na przebieg. Ograniczenie: nie jest to browser FPS ani cold paint.
- Manualny prawdziwy chat przez LTE/telefon: **MANUAL ACTION REQUIRED** przed GL; test automatyczny nie może uczciwie zastąpić zalogowanej sesji autora i percepcyjnej oceny ruchu.

## TEST-BW-042 — Movement gait and no-teleport handoff gate

- Data/czas Europe/Warsaw: 2026-07-16 17:56–18:00.
- Branch/HEAD wejściowy: `build-week/hermes-world` / `335ecda` z niezatwierdzonym zakresem movement polish.
- Testy fokusowe: **PASS 44/44**.
- `npm.cmd test`: **PASS 146/146**, 7 suites, 0 fail.
- `npm.cmd run lint`: **PASS**.
- `npm.cmd run validate:world-life`: **PASS**.
- `npm.cmd run build`: **PASS**, Vite 8.0.16, 874 moduły, 4,80 s.
- Build: main JS 423,05 kB / 129,98 kB gzip; CSS 76,69 kB / 16,56 kB gzip.
- Runtime 4176: **PASS** — root podaje `assets/index-Cm90ARzU.js`; bundle zawiera nowy gait i `operational-handoff`.
- Ciągłość: **PASS** — początek handoffu jest identyczny z ostatnią pozycją ambientu; handoff tego samego runu nie działa w fazie `working`; pełny powrót Kowala pozostaje bez teleportu.
- Mikrobenchmark handoffu: 50 000 iteracji / 1 338,470 ms / 26,769 µs na iterację. To nie jest pomiar FPS ani energii telefonu.
- Manualna ocena naturalności kroku 393×852: **MANUAL ACTION REQUIRED**.

## TEST-BW-043 — Second-pass walking biomechanics gate

- Czas Europe/Warsaw: 2026-07-16 18:18–18:23.
- Testy fokusowe ruchu/dyrektorów/tras: **PASS 44/44**.
- Pełne `npm.cmd test`: **PASS 146/146**, 0 fail.
- ESLint: **PASS**.
- World-life validator: **PASS**.
- Build: **PASS**, Vite 8.0.16, 874 moduły, 5,00 s.
- Main JS: 423,69 kB / 130,30 kB gzip; CSS: 76,91 kB / 16,61 kB gzip.
- Runtime 4176: **PASS** — `index-dUUrp4or.js`; wykryto kontrakty nierównej kadencji kontaktu i `--map-agent-foot-origin`.
- Produkcja `c9a3205`: **UNCHANGED**.
- Percepcyjna ocena chodu na realnym telefonie: **MANUAL ACTION REQUIRED**.

## TEST-BW-044 — Final walking cadence and promotion-preparation gate

- Czas Europe/Warsaw: 2026-07-16 18:24–18:36.
- Zakres: wyłącznie demo `build-week/hermes-world`; produkcja `c9a3205` niezmieniona.
- Testy fokusowe ruchu, prezentacji i dyrektorów: **PASS 44/44**.
- Pełne `npm.cmd test`: **PASS 146/146**, 0 fail.
- ESLint: **PASS**.
- World-life validator: **PASS**.
- Build: **PASS**, Vite 8.0.16, 874 moduły, 3,80 s, użyty `--configLoader runner` po chwilowym Windows `EPERM` standardowego loadera w katalogu `.vite-temp`.
- Artefakty: main JS 423,69 kB / 130,30 kB gzip; CSS 76,99 kB / 16,62 kB gzip; lazy interior JS 16,46 kB / 6,31 kB gzip.
- Kontrakt 116 ms translacji przy zegarze 120 ms: **PASS**.
- Wdrożenie produkcyjne: **NOT APPLICABLE** — przygotowywany jest wyłącznie patch do wcześniejszego wglądu autora.

## TEST-BW-045 — Approved production promotion and runtime gate

- Czas Europe/Warsaw: 2026-07-16 18:55–19:24; UTC: 16:55–17:24.
- Baseline produkcji: `main` / `c9a32051a3367990ceae266adeed16366cbd4738`; finalny commit: `83937de`.
- Integralność patcha: **PASS** — SHA-256 `8CFEF0DC878D646E2FCCEA4721B1DB84B3D8923A97A3317957EF7040CE5B729D`; `git apply --check` PASS; 37 dozwolonych plików, brak `server.js`, backend API, deploymentu i PWA.
- Pełne testy: **PASS 152/152**, 0 fail.
- ESLint: **PASS**.
- World-life validator: **PASS**.
- Build: **PASS**, Vite 8.0.16, 874 moduły, 5,42 s z `--configLoader runner`; standardowy loader napotkał wyłącznie środowiskowy Windows `EPERM` w `.vite-temp`.
- Artefakty: main JS 429,41 kB / 132,10 kB gzip; CSS 76,98 kB / 16,63 kB gzip; lazy interior JS 13,87 kB / 5,41 kB gzip; całe `dist` 10,79 MB / 328 plików.
- Runtime lokalny: **PASS** — root HTTP 200 z nowym fingerprintem; `/api/auth/status`, `/api/world/events/snapshot`, `/api/system/metrics` HTTP 200; SSE zwraca snapshot.
- Benchmark lokalny, pięć sekwencyjnych prób: root min/mediana/max 84/168/768 ms; auth 87/105/1214 ms; snapshot 59/93/246 ms; metrics 56/77/95 ms. Pomiar wykonano pod obciążeniem Codexa; nie jest to FPS telefonu.
- Publiczny Funnel: **PASS** — Tailscale BackendState Running, `:10000` proxy do 4175, root HTTP 200 i nowy bundle. Publiczny cold/warm root: 1471 ms cold, następne 34–117 ms; auth 23–155 ms; snapshot 6–16 ms; metrics 7–17 ms.
- Cache: **PASS** — hashowane assety mają `public, max-age=31536000, immutable`; JS/CSS są kompresowane Brotli; główna mapa mobile WebP 531 412 B; wnętrza pozostają osobnym lazy chunkem.
- Procesy: **PASS po cleanup** — jeden listener 4175 PID 6764. Diagnostyczny duplikat watchdoga PID 5548 został zatrzymany bez dotykania właściwego procesu.
- Produkcyjny Git: **PASS** — `git diff --check` bez błędów, working tree czysty, brak niezatwierdzonych zmian.
- Zalogowany audyt wartości `/api/profiles`, sessions, logs, crons, skills, models i memory: **MANUAL ACTION REQUIRED** — bez cookie poprawnie zwracają 401; test nie omijał uwierzytelnienia i nie odczytywał sekretów.
- Percepcyjny test 393×852: **MANUAL ACTION REQUIRED** — agent roster 12, wejścia do pięciu wnętrz, brak dawnych linii, semantyczny feed i pełny real-chat lifecycle muszą zostać potwierdzone w już zalogowanej sesji autora.
