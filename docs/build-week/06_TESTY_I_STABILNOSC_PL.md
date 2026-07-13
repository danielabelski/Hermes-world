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
