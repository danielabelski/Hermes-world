# Podsumowanie walidacji DEMO — Hermes Heroes / Hermes OS

## Metryka checkpointu

- Data przygotowania: 2026-07-18, Europe/Warsaw.
- Środowisko: DEMO.
- Branch: `build-week/hermes-world`.
- Poprzedni zatwierdzony checkpoint: `5f74847f3039047b7f1945eaed30d0e161a2dd19` (`fix(build-week): join live cron activity`).
- Finalny commit DEMO: **PENDING — do wpisania po utworzeniu commitu przez Git**.
- Tag walidacyjny: **PENDING — planowany `demo-validated-2026-07-18`**.
- Status Fazy 1: **BLOCKED technicznie wyłącznie na zapisie Git**. Kod, dokumentacja i walidacja są gotowe, ale nie wolno uznać checkpointu za odtwarzalny przed powstaniem commitu, tagu i czystego working tree.

## Zakres zatwierdzonego stanu

Stan wejściowy release przekazany przez autora potwierdza, że DEMO przeszło wszystkie zaplanowane testy, a znane blockery zostały usunięte. Ostatni sklasyfikowany patch usuwa pozorną pauzę ruchu przy przejęciu prawdziwego workera:

- zachowuje bieżący ruch wywołanego workera podczas prawdziwego etapu `thinking`, bez fałszywego oznaczania go jako `working`;
- nie zatrzymuje partnera ambientowej rozmowy ani niezwiązanych agentów;
- nie zmienia źródła zdarzeń, FSM, tras, mapy, API, cronów, Aktywności Cytadeli, CAT ani produkcji;
- dodaje test regresyjny dla operacyjnego handoffu.

Zatwierdzony kandydat obejmuje wyłącznie:

1. `src/world/directors/ambientDirector.js`
2. `src/world/directors/useWorldDirectors.js`
3. `src/world/directors/worldDirectorPresentation.js`
4. `src/world/directors/worldDirectors.test.js`
5. `NEXT_WINDOW_HANDOFF.md`
6. `docs/build-week/02_DZIENNIK_BUILD_WEEK_PL.md`
7. `docs/build-week/03_SESJE_CODEX_PL.md`
8. `docs/build-week/06_TESTY_I_STABILNOSC_PL.md`
9. `docs/build-week/evidence/tests/README_PL.md`
10. `docs/build-week/evidence/tests/20260718_PHASE_3_WORKER_HANDOFF_CONTINUITY_PL.md`
11. `docs/build-week/evidence/git-snapshots/20260718T203300Z-worker-handoff-continuity.txt`
12. `docs/release/RELEASE_START_REPORT.md`
13. `docs/release/DEMO_VALIDATION_SUMMARY.md`

Nie zatwierdzono żadnych dodatkowych funkcji, kosmetyki, refaktoru ani zmiany architektury.

## Wykonane testy i wyniki

### Automatyczne

- Test-first regresji handoffu: przed poprawką 19/20 z oczekiwanym FAIL; po poprawce 20/20 PASS.
- Zestaw focused dla directorów, ruchu i eventów: 66/66 PASS.
- Pełny zestaw testów: 178/178 PASS, 8 suites, 0 fail.
- ESLint: PASS.
- World Life validator: PASS.
- `node --check` dla trzech zmienionych modułów directorów: PASS.
- `git diff --check`: PASS.
- Build Vite 8.0.16: PASS, 875 modułów, 3,01 s.
- Artifact: `assets/index-D-EekdwD.js`, 437,53 kB / 134,82 kB gzip.
- Root DEMO, auth status i world snapshot na porcie 4176: HTTP 200.
- Liczba listenerów DEMO na porcie 4176: 1.

### Manualne / E2E autora

Stan wejściowy release oraz przekazany gate autora potwierdzają:

- cold start: GL;
- Wi‑Fi/LTE: GL;
- 12/12 workerów: GL;
- pięć cykli z rzędu: GL;
- wywołanie prawdziwego workera i zakończenie cyklu: GL;
- crony i inne ważne zdarzenia w Aktywności Cytadeli: GL;
- odświeżanie danych budynków: GL;
- reconnect: GL;
- logi: GL.

Nie dopisano wyniku, którego autor nie przekazał, ani fikcyjnego automatycznego testu zalogowanego telefonu.

## Znane ograniczenia nieblokujące

- Rzeczywisty event `assigned` może pojawić się z opóźnieniem około 1,27 s względem czasu źródłowego; jest to latencja publikacji, nie stan `stuck`.
- W analizowanym realnym runie pierwszy event `working` pojawił się około 3,79 s po `thinking`; poprawka zachowuje w tym czasie ciągłość ruchu, ale nie skraca prawdziwego reasoning ani nie fałszuje stanu.
- Ostrzeżenia LF/CRLF Git są informacyjne; `git diff --check` nie wykazał błędów.

## Izolacja produkcji

- Produkcja pozostaje na `main` / `958b9da08bee9613900e902b3da558aadef826e8`.
- Produkcyjne working tree było czyste podczas audytu Fazy 0.
- W Fazie 0–1 nie wdrożono, nie zrestartowano i nie zmodyfikowano produkcji, Hermes WebUI ani CAT.

## Bramka zamknięcia Fazy 1

Faza 1 może otrzymać PASS dopiero po wykonaniu wszystkich czterech kontroli:

1. utworzenie finalnego commitu DEMO;
2. wpisanie jego SHA do tego dokumentu;
3. utworzenie tagu `demo-validated-2026-07-18` na finalnym commicie dokumentacyjnym;
4. potwierdzenie pustego wyniku `git status --short`.

Do tego czasu nie wolno rozpoczynać Fazy 2 ani wdrożenia produkcyjnego.
