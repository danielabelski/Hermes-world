# Kandydat patcha produkcyjnego — 2026-07-17

## Status

Patch przygotowany, ale **niezastosowany**. Produkcyjny `main` pozostaje nietknięty.

- Produkcyjna baza: `958b9da08bee9613900e902b3da558aadef826e8`
- Demo kandydat: `d20fcf4` (`fix(build-week): cache agent frame preloads`)
- Branch: `build-week/hermes-world`
- Patch binarny: `20260717_PRODUCTION_CANDIDATE.patch`
- Rozmiar patcha: `243104` bajtów
- SHA-256 patcha: `59E82715D01B8542F4C7CA7B2CDD96E27FF8EB60AAA71D017A4148037966742F`
- Produkcyjny listener 4175: bez zmian

## Zawartość kandydata

Kandydat został wygenerowany jako różnica `main..HEAD` dla kodu aplikacji, assetów runtime, testów i skryptów. Obejmuje między innymi:

1. most prawdziwych zdarzeń `state.db → JSONL → Node adapter → world SSE`;
2. aktualny kontrakt `useWorldBridge` dla demo i live SSE;
3. korektę cold startu: agenci nie są globalnie ukrywani do czasu załadowania wszystkich sprite’ów;
4. test regresyjny niezależnego ładowania sprite’ów;
5. mikro-pass stabilnej klatki: poprzedni sprite pozostaje widoczny do czasu preładowania i dekodowania nowej klatki;
6. zatwierdzone poprawki wnętrz, agentów, telemetrycznego świata i warstw środowiskowych obecne na branchu demo;
7. testy i skrypty pomocnicze związane z Build Week.

Dokumentacja Build Week nie jest częścią patcha aplikacyjnego. Skrypt `hermes-gateway-world-adapter.py` wymaga osobnego, kontrolowanego uruchomienia na hoście produkcyjnym dopiero po manualnym GL.

## Walidacja przed promocją

- Demo: pełny zestaw 147/147 PASS.
- Demo build: PASS, 874 moduły, 43,34 s.
- Realny E2E state.db → hub → SSE: PASS na demo.
- Cold start regression: PASS automatycznie.
- Manualny test 393×852 po świeżym wejściu i nowej wiadomości WSL/iMessage: **REQUIRED**.
- Manualny test konkretnego workera wywołanego przez Hermesa: **REQUIRED** — potwierdzić, że właściwy agent pojawia się na mapie i idzie do zadania bez fake Working.
- Produkcja po zastosowaniu patcha: niezweryfikowana i dlatego patch nie może być jeszcze wdrożony.

## Procedura zastosowania po GL

1. Zachować backup produkcji i potwierdzić czysty `main`.
2. Przejrzeć `git diff` patcha względem `958b9da`.
3. Zastosować na osobnym branchu kandydata, nie bezpośrednio na `main`.
4. Uruchomić pełny build/test i dokładny authenticated E2E.
5. Dopiero po potwierdzeniu: zaktualizować produkcyjny runtime oraz osobno uruchomić watcher/forwarder.
6. Wykonać manualny test LTE, cold start, SSE, agentów i wejść do budynków.

Do czasu tych kroków patch pozostaje artefaktem audytowym; nie ma zgody na samoczynne wdrożenie.

## Aktualizacja 2026-07-17 14:55 Europe/Warsaw

Patch wygenerowano ponownie po commitcie `d20fcf4f3ca2e789128afd568d3c6bc78d8dca8f` (plik został zapisany bezpośrednio przez Git, aby zachować poprawny format binarny). Zawiera mikro-pass eliminujący migawkę sprite’a oraz deduplikowany cache preloadu. Reverse apply check na branchu demo: **PASS**. Produkcyjny `main` pozostaje nietknięty i czysty; zastosowanie wymaga osobnego GL po manualnym cold start i authenticated worker smoke teście.
