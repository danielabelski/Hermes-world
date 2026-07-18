# Faza 3 — korekta realnej telemetrii wnętrz

- Data: 2026-07-18, Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Zakres: wyłącznie demo; produkcja pozostała nietknięta.

## Odtworzony problem

Ręczna walidacja telefonu wykazała `CRONY 0` i `SUKCES 0` w Obserwatorium oraz pozornie nieruchomą temperaturę Kuźni. Odczyt dwóch kolejnych odpowiedzi demo `/api/system/metrics`, rozdzielonych o około 6 sekund, potwierdził realne zmiany CPU i temperatury: 44,1% / 69°C → 44,8% / 73°C. Źródło telemetryczne oraz odświeżanie backendu były aktywne.

Pierwszy rzeczywisty punkt utraty cronów znajdował się w normalizacji historii: Hermes WebUI zwraca `completed_at` jako Unix seconds, natomiast klient próbował parsować wartość przez `Date.parse`. Wszystkie prawdziwe ukończenia były odrzucane, choć fixture testowy z ISO przechodził.

## Minimalna korekta

- Normalizator akceptuje Unix seconds, Unix milliseconds i ISO bez zmiany źródłowego timestampu.
- Pełna, deduplikowana historia ukończeń jest częścią snapshotu i store.
- Obserwatorium liczy realne crony oraz procent sukcesów z trwałych wykonań; inventory scheduler pozostaje bezpiecznym fallbackiem.
- Każde wnętrze nadal wykonuje istniejący atomowy fresh fetch przy wejściu.
- Archiwum opisuje wyłącznie realny endpoint pamięci Hermesa; nie jest nazywane RAG/Obsidian health bez osobnego autorytatywnego źródła.

## Walidacja

- Test kontraktu realnego epoch-seconds: PASS.
- Test kolejnych aktualizacji temperatury: PASS.
- Test Watchera przy pustym inventory i dostępnej historii: PASS.
- Focused tests: 13/13 PASS.
- Pełne `npm test`: 167/167 PASS, 8 suites, 0 fail.
- ESLint: PASS.
- World Life validator: PASS.
- `git diff --check`: PASS.
- Build: pierwsza próba w sandboxie — ENVIRONMENTAL RETRY (`EPERM` dla `.vite-temp`); identyczny zatwierdzony build poza ograniczeniem — PASS, 874 moduły, 3,52 s, main 432,80 kB / 133,27 kB gzip.

## Ograniczenia

Nie uruchomiono nieznanego crona tylko w celu testu. Pełne prześledzenie bezpiecznego realnego crona i taska workerowego przez log → event → zapis → API/SSE → UI pozostaje kolejnym blockerem demo.
