# Phase 3 — realna aktywność cronów

## Problem

Po usunięciu starych bezimiennych eventów gateway semantyczna Aktywność Cytadeli była pusta. Hermes posiadał realne crony, lecz opcjonalne `recent.completions` nie zawierało rekordów.

## Dowód i diagnoza

- Read-only `hermes cron list` zwróciło 15 nazwanych zadań z informacją o ostatnim wykonaniu.
- Inventory `crons.jobs[]` było autorytatywnym źródłem nazw i `last_run_at`.
- WorldBridge używał wyłącznie `cronHistory.completions`, więc przy pustej historii tracił istniejący dowód wykonania.

## Minimalna poprawka demo

- Inventory ostatnich wykonań zasila semantyczną historię jako fallback.
- Pełniejsza historia recent zastępuje fallback dla tego samego crona i czasu.
- Wpis zachowuje realną nazwę, czas i status.
- Paź jest narratorem zdarzenia systemowego; nie jest fałszywie przedstawiany jako wykonawca.
- Nie zmieniono event pipeline, schedulerów, ruchu, FSM, mapy ani produkcji.

## Walidacja automatyczna

- Testy: 175/175 PASS.
- ESLint: PASS.
- Build: PASS — 875 modułów, 5,55 s.
- Main bundle: 436,98 kB / 134,62 kB gzip.
- `git diff --check`: PASS.
- Artifact serwowany na porcie demo: `index-DnsOKSiO.js`, zgodny z bieżącym `dist/index.html`.

## Bramka ręczna

- Otworzyć Aktywność Cytadeli na zalogowanym telefonie.
- Potwierdzić konkretne nazwy i prawdziwe godziny cronów.
- Wysłać nową nazwaną wiadomość do Hermesa i potwierdzić, że lifecycle Pazia jest osobnym typem aktywności.
- Wynik: MANUAL ACTION REQUIRED / GL-RL.

Produkcja: UNCHANGED / NOT TOUCHED.
