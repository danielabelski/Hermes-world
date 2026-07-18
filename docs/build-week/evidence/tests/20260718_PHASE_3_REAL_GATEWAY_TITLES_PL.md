# Phase 3 — prawdziwe nazwy operacji gateway

## Zakres

Wyłącznie demo `build-week/hermes-world`. Produkcja nie została zmieniona.

## Zdiagnozowany punkt utraty

`hermes-gateway-world-adapter.py` czytał z Hermes `state.db` identyfikator, źródło, timestamp i długość wiadomości, ale nie wyprowadzał bezpiecznej nazwy zadania. Eventy mogły więc pokazać wyłącznie techniczne `run_id`.

## Minimalna poprawka

- lokalne odczytanie treści najnowszej prawdziwej wiadomości użytkownika;
- wyprowadzenie pierwszej niepustej linii jako `task_title`;
- limit 96 znaków;
- redakcja URL, e-maili, długich identyfikatorów i przypisań sekretów;
- brak pełnej treści w JSONL i payloadzie;
- zachowanie tytułu przez `stream_start`, `reasoning`, narzędzia i `done`;
- wizualne złożenie etapów jednego runu w arkuszu bez usuwania autorytatywnej historii.

## Wyniki

| Kontrola | Wynik |
|---|---|
| Python test tytułu i prywatności | PASS 4/4 |
| Read-only E2E na realnym `state.db` | PASS |
| Eventy E2E | 3 (`stream_start`, `reasoning`, `done`) |
| Eventy z tytułem | 3/3 |
| Pola pełnej treści w payloadzie | 0 |
| Focused Node | PASS 55/55 |
| Pełna regresja | PASS 173/173 |
| ESLint | PASS |
| Build | PASS, 875 modułów, 3,69 s |
| Serwowany artifact | PASS, `index-B-p9MTP9.js` |
| Liczba watcherów po restarcie | PASS, dokładnie 1 (PID 85084) |

## Ograniczenia i manualny gate

Historycznych eventów, dla których źródło nie zachowało tytułu, nie uzupełniono sztucznie. Ręczny gate wymaga wysłania nowej nazwanej wiadomości po restarcie watchera i sprawdzenia arkusza na telefonie. Prawdziwe crony muszą pozostać osobnymi wpisami z rzeczywistymi nazwami.
