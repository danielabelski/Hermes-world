# 06 — Testy i stabilność

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
