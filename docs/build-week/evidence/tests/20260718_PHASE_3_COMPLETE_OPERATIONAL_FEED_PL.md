# Phase 3 — kompletny dolny feed operacyjny

## Odtworzony problem

Ręczna kontrola zalogowanego demo pokazała komunikat o ukończeniu zadania przez Pazia, ale nie pokazała czterech wykonań cronów z tego samego dnia, w tym ostatniego około 12:00.

## Przyczyna

1. Nowy snapshot pollingowy budował `activity` wyłącznie z aktualnego Kanbanu i historii cronów, przez co mógł usunąć wcześniejsze autorytatywne zdarzenia wprowadzone przez reducer SSE.
2. Wspólna prezentacja ograniczała historię domyślnie do pięciu pozycji, a arkusz do ośmiu.
3. Sortowanie według klasy wizualnej przed czasem mogło wypchnąć zwykłe ukończenia cronów przez taski agentów.

## Zmiana

- `WorldBridge` scala poprzednią aktywność, bieżące taski i wszystkie cron completions po stabilnym ID.
- Historia pozostaje ograniczona do 40 pozycji i jest sortowana chronologicznie.
- Critical i Warning zachowują priorytet przerwania, ale zwykłe crony i taski nie wypierają się według typu.
- Dolny kanał rotuje realne wpisy z ostatnich 24 godzin, podaje godzinę i oznacza cron etykietą `CRON`.
- Pełny arkusz aktywności pokazuje do 40 pozycji.

## Granice prawdy

- Nie utworzono fikcyjnych eventów.
- Nie odtworzono brakującej historii z surowych logów.
- Widoczne są wyłącznie dane z Hermes Kanban, trwałej historii cronów, world SSE i autorytatywnych alertów.
- Produkcja nie została zmieniona.

## Walidacja

- regresja 4 cronów + 12 tasków: PASS;
- zachowanie eventu SSE po kolejnym pollingu: PASS;
- priorytet aktywnego Critical/Warning: PASS;
- pełne testy: 170/170 PASS;
- ESLint: PASS;
- World Life validator: PASS;
- `git diff --check`: PASS;
- build: PASS, 874 moduły, 5,00 s;
- main JS: 433,92 kB / 133,65 kB gzip;
- demo HTTP: 200, `index-D42vLeMo.js`.

## Otwarty gate

Manualny GL/RL autora na zalogowanym telefonie: komunikat Pazia oraz wszystkie cztery dzisiejsze crony muszą być dostępne w dolnej rotacji i pełnym arkuszu aktywności.
