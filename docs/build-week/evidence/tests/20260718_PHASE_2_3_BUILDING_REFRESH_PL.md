# Faza 2.3 — świeże dane przy każdym wejściu do budynku

- Data: 2026-07-18 (Europe/Warsaw).
- Branch: `build-week/hermes-world`.
- Punkt wejścia: commit `93892d1`.
- Zakres: wyłącznie demo; produkcja `main` pozostała na `958b9da08bee9613900e902b3da558aadef826e8`.

## Potwierdzona przyczyna i poprawka

Kliknięcie hotspotu wyłącznie otwierało wnętrze, bez świeżego odczytu API. Dodano centralne mapowanie pięciu wnętrz na domeny, które faktycznie prezentują, oraz jeden atomowy refresh tylko wymaganych domen przy każdym wejściu. Poprzedni poprawny snapshot pozostaje widoczny do odpowiedzi.

Nie zmieniono grafiki wnętrz, routingu, pozycji, agentów, FSM, event pipeline'u ani produkcji.

## Wyniki

- Pięć kolejnych wejść do Archiwum: **PASS 5/5**.
- `memory`, `logs`, `tasks`, `cronHistory`: 1 odczyt początkowy + 5 świeżych odczytów.
- Pozostałe domeny: 1 odczyt początkowy, bez dodatkowych żądań.
- Dokładnie 1 atomowa emisja na wejście; 0 emisji częściowych.
- Testy: **PASS 160/160**; ESLint: **PASS**; World Life validator: **PASS**; `git diff --check`: **PASS**.
- Build: **PASS** przez oficjalny Vite `--configLoader runner` po środowiskowym `EPERM`; 874 moduły, 2,45 s; main 431,20 kB / 132,77 kB gzip.

Ręczny test z realnym API zostanie powtórzony w pełnej macierzy Fazy 3. Produkcja nie została dotknięta.
