# Raport startowy release — Hermes Heroes / Hermes OS

## Metryka raportu

- Data i czas: 2026-07-18 22:54:21 CEST (`Europe/Warsaw`).
- Zakres: rozpoczęcie procesu release po walidacji DEMO.
- Tryb: **FEATURE FREEZE**.
- Repozytorium DEMO: `C:\Users\User\Documents\Codex\2026-07-11\hermes-os-living-world-demo`.
- Repozytorium produkcyjne: `C:\Users\User\Documents\Codex\2026-07-11\hermes-os-living-world`.
- Publikacja repozytorium, filmu i submission: **poza zakresem / zabroniona**.

## Stan Git DEMO

- Branch: `build-week/hermes-world`.
- Aktualny commit bazowy: `5f74847f3039047b7f1945eaed30d0e161a2dd19`.
- Ostatni commit: `fix(build-week): join live cron activity`.
- Czas ostatniego commitu: 2026-07-18 22:08:04 CEST.
- Staged changes: brak.
- Working tree: **DIRTY — sklasyfikowany kandydat finalnego checkpointu DEMO**.
- `git diff --check`: PASS.

### Niezapisane zmiany funkcjonalne — zatwierdzony zakres

| Plik | Klasyfikacja | Cel | Decyzja |
|---|---|---|---|
| `src/world/directors/ambientDirector.js` | funkcjonalna, presentation-only | przerwać ambient tylko wywołanemu workerowi i zachować ruch partnera | włączyć do finalnego checkpointu DEMO |
| `src/world/directors/useWorldDirectors.js` | funkcjonalna, presentation-only | użyć bezpiecznego przerwania ambientu podczas prawdziwego eventu | włączyć do finalnego checkpointu DEMO |
| `src/world/directors/worldDirectorPresentation.js` | funkcjonalna, presentation-only | zachować płynny route handoff podczas prawdziwego `thinking` bez fake `working` | włączyć do finalnego checkpointu DEMO |
| `src/world/directors/worldDirectors.test.js` | test | regresja pozycji nóg, ruchu podczas `thinking` i ciągłości niezależnego ambientu | włączyć do finalnego checkpointu DEMO |

Zmiana nie modyfikuje backendu, payloadów, reducerów danych, FSM, mapy, waypointów, tras, cronów, historii, SSE, reconnectu, resyncu, service workera ani cache.

### Niezapisane zmiany dokumentacyjne — wymagane dowody

| Plik | Cel | Decyzja |
|---|---|---|
| `NEXT_WINDOW_HANDOFF.md` | aktywny handoff finalnego UX gate | włączyć |
| `docs/build-week/02_DZIENNIK_BUILD_WEEK_PL.md` | wpis Build Week `BW-2026-07-18-022` | włączyć |
| `docs/build-week/03_SESJE_CODEX_PL.md` | wpis bieżącej sesji | włączyć |
| `docs/build-week/06_TESTY_I_STABILNOSC_PL.md` | test `TEST-BW-073` | włączyć |
| `docs/build-week/evidence/tests/README_PL.md` | indeks nowego dowodu | włączyć |
| `docs/build-week/evidence/tests/20260718_PHASE_3_WORKER_HANDOFF_CONTINUITY_PL.md` | pełny raport test-first i realnego runu | włączyć |
| `docs/build-week/evidence/git-snapshots/20260718T203300Z-worker-handoff-continuity.txt` | snapshot DEMO/PROD sprzed commitu | włączyć |

Nie wykryto niezapisanych zmian obcych, eksperymentalnych ani niesklasyfikowanych.

Sam raport Fazy 0 jest nowym dwunastym plikiem working tree. Aktualizacje handoffu i journalu pozostają w dwóch już sklasyfikowanych ścieżkach dokumentacyjnych. Po kontroli tych 12 ścieżek Faza 1 dodaje wyłącznie wymagany przez prompt plik `docs/release/DEMO_VALIDATION_SUMMARY.md`; finalny checkpoint obejmuje więc dokładnie 13 ścieżek, bez żadnych innych plików.

## Zweryfikowany stan kandydata DEMO

Finalny kandydat jest obecnie jednoznacznie określony jako:

```text
5f74847f3039047b7f1945eaed30d0e161a2dd19
+ dokładnie 11 plików kandydata wejściowego wymienionych w tym raporcie
+ `docs/release/RELEASE_START_REPORT.md` utworzony w Fazie 0
```

Kandydat nie ma jeszcze własnego commit SHA ani tagu. Nie wolno przedstawiać `5f74847` jako finalnego commitu po korekcie handoffu.

Rzeczywiście wykonana walidacja kandydata:

- test-first przed poprawką: 19/20, oczekiwany FAIL;
- test docelowy po poprawce: 20/20 PASS;
- focused directors + movement + events: 66/66 PASS;
- pełne testy: 178/178 PASS, 8 suites, 0 fail;
- ESLint: PASS;
- World Life validator: PASS;
- `node --check`: PASS;
- `git diff --check`: PASS;
- build: PASS, Vite 8.0.16, 875 modułów, 3,01 s;
- artifact DEMO: `assets/index-D-EekdwD.js`, 437,53 kB / 134,82 kB gzip;
- runtime DEMO: jeden listener `0.0.0.0:4176`; auth HTTP 200.

Znane ograniczenie niebędące blockerem danych: pierwszy prawdziwy event Hermesa pojawia się po około 1–1,5 s; aplikacja nie może zmyślać wcześniejszego `working`.

## Stan produkcji

- Środowisko/branch: produkcyjne worktree / `main`.
- Commit: `958b9da08bee9613900e902b3da558aadef826e8`.
- Ostatni commit: `fix(build-week): stabilize live raw log selector`.
- Czas ostatniego commitu: 2026-07-16 19:42:46 CEST.
- Working tree: **CLEAN**.
- Aktualny artifact: `assets/index-tYcI17tU.js`.
- Frontend produkcyjny: listener `0.0.0.0:4175`, auth HTTP 200.
- Hermes WebUI: listener `0.0.0.0:8787`, auth HTTP 200.
- Hermes OS CAT: listener `0.0.0.0:8788`, auth HTTP 200.
- Produkcja nie została zmieniona, zrestartowana, zbudowana ani tagowana w Fazie 0.

## Istniejące punkty odniesienia

- Worktree produkcyjny: `main` / `958b9da`.
- Worktree DEMO: `build-week/hermes-world` / baza `5f74847` + sklasyfikowany patch.
- Istniejący promotion candidate: `build-week/promotion-candidate` / `fa0c55691046d6259f989284de7fd0ed36ae32bc`; nie uznano go automatycznie za aktualny patch.
- Istniejący tag audytu: `demo-release-audit-start-2026-07-18`.
- Istniejący tag wcześniejszego stanu produkcji: `production-correct-v1-before-build-week-promotion-2026-07-15`.
- Finalny tag DEMO i przedwdrożeniowy tag produkcji: **jeszcze nieutworzone**.

## Feature freeze

Feature freeze obowiązuje od rozpoczęcia tego raportu.

### Dozwolone

- krytyczne poprawki wymagane do wdrożenia już zatwierdzonego patcha;
- minimalne poprawki konfiguracji niezbędne do uruchomienia produkcji;
- dokumentacja release;
- usunięcie sekretów lub niebezpiecznych danych;
- minimalne poprawki krytycznych regresji wykrytych podczas walidacji produkcji.

### Niedozwolone

- nowe funkcje, ekrany i animacje;
- redesign lub kosmetyka;
- eksperymentalna telemetria;
- przebudowa backendu lub architektury;
- refaktor niezwiązany z wdrożeniem;
- zmiana działania workerów lub działającej integracji iMessage;
- zmiana działającej infrastruktury;
- publikacja repozytorium, filmu lub submission;
- tłumaczenie dokumentacji na angielski.

## Ryzyka i bramki

1. Kandydat DEMO jest nadal niezapisanym working tree — nie jest jeszcze odtwarzalnym checkpointem.
2. Nie utworzono finalnego tagu DEMO.
3. Nie wyodrębniono jeszcze listy commitów do produkcji względem `958b9da`.
4. Nie utworzono jeszcze przedwdrożeniowego tagu produkcji ani finalnej instrukcji rollbacku.
5. Nie wykonano żadnego testu produkcji po wdrożeniu, ponieważ wdrożenie nie nastąpiło.
6. Długotrwały test produkcyjny pozostaje przyszłą bramką i nie może być oznaczony PASS przed upływem rzeczywistego czasu.

## Decyzja Fazy 0

**FAZA 0: PASS — raport startowy i feature freeze zostały ustanowione.**

Do Fazy 1 można przejść wyłącznie w celu:

1. ponownej kontroli dokładnego diffu 12 sklasyfikowanych ścieżek;
2. utworzenia finalnego commitu DEMO;
3. potwierdzenia czystego worktree;
4. utworzenia jednoznacznego tagu checkpointu;
5. przygotowania `docs/release/DEMO_VALIDATION_SUMMARY.md`.

Produkcja pozostaje zamrożona do zakończenia Faz 1–3.
