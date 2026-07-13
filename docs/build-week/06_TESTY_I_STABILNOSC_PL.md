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
