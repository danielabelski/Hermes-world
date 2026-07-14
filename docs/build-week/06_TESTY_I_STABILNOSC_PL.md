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
