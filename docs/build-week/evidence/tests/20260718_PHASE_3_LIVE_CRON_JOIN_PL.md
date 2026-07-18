# Phase 3 — live join cronów w Aktywności Cytadeli

## Zakres

- Data: 2026-07-18, Europe/Warsaw.
- Repo/branch: `hermes-os-living-world-demo` / `build-week/hermes-world`.
- Checkpoint wejściowy: `b16478d57ef187c93f7218f18b7f92b1a717dfae`.
- Produkcja `958b9da08bee9613900e902b3da558aadef826e8`, Hermes OS CAT oraz Hermes WebUI: read-only / bez zmian.
- Sesja: `019f76b1-bba0-7400-9167-0fab397eabc8`; model GPT-5.6.

## Surowy kontrakt

Read-only wywołanie tego samego handlera, którego używa Hermes WebUI, zwróciło:

- top-level: `completions`, `since`;
- 16 realnych completionów;
- pola completion: `job_id`, `name`, `status`, `completed_at`, `toast_notifications`;
- `completed_at`: liczba Unix seconds, np. `1784359894.154202`;
- `status`: `ok` dla bieżących wykonanych cronów.

Inventory zawierało 17 jobs. Wszystkie 16 wykonanych `job_id` pasowały 1:1 do inventory. `mcp-toolcheck` miał rzeczywiste `last_run_at: null` i `last_status: null`; nie przypisano mu fikcyjnego wyniku.

## Przyczyna

1. `?demo=1` mógł wybrać deterministyczny fixture zamiast uwierzytelnionej telemetrii.
2. Niedokończony endpoint DEMO nadpisywał autorytatywne pola WebUI danymi CLI.
3. Dla tego samego `job_id` WebUI i CLI raportowały timestamp różniący się o kilka sekund po persystencji.
4. Numeric Unix seconds zachowywał ułamkowe milisekundy, a ISO był parsowany do całkowitych ms. Exact-key dedupe tworzył dwa wpisy nawet dla logicznie tego samego runu.

## Minimalna poprawka

- `demo=1` oznacza środowisko DEMO, nie fixture; fixture wymaga `fixture=1` lub jawnego focusu.
- WebUI pozostaje źródłem nadrzędnym. CLI uzupełnia wyłącznie brakujące pola i brakujące jobs; awaria CLI nie niszczy poprawnej odpowiedzi WebUI.
- Unix seconds/milliseconds są normalizowane do całkowitych ms.
- Jawny `/crons/recent` wygrywa nad inventory fallbackiem tego samego joba w oknie 60 s.
- Zachowano prawdziwe `job_id`, nazwę, status, timestamp, source i stabilne event ID.
- Nie zmieniono renderera, mapy, ruchu, routingu, FSM, sprite’ów, wnętrz ani produkcji.

## Wynik realnego E2E danych

```text
rawJobs=17
rawCompletions=16
normalizedJobs=17
normalizedHistory=16
activityCronEvents=16
duplicateCronEvents=0
nullStatusJobs=1 (mcp-toolcheck, lastRunAt=null)
```

Najnowsze wpisy miały prawdziwe nazwy, status `ok`, timestamp oraz source `hermes-cron-history`, między innymi `kanban-requeue-watchdog`, `news-ai-daily`, `build-everyday`, `429-fallback-watchdog` i `job-scraper-afternoon`.

## Walidacja

- `node --test server/hermesCronInventory.test.js src/world/WorldBridge.contract.test.js src/world/mapAgentPresentation.test.js`: 45/45 PASS.
- `npm.cmd test`: 177/177 PASS.
- `node --test server/hermesCronInventory.test.js`: 2/2 PASS.
- `npm.cmd run lint`: PASS.
- `npm.cmd run validate:world-life`: PASS.
- `node --check server.js`: PASS.
- `git diff --check`: PASS.
- `npm.cmd run build`: PASS, 875 modułów, 15,06 s.
- Artifact: `index-DCTdIYBq.js` 437,39 kB / 134,79 kB gzip; CSS `index-BY3v_Mj2.css` 77,06 kB / 16,65 kB gzip.
- Root DEMO, auth status i world snapshot: HTTP 200.
- Runtime: jeden listener DEMO 4176; produkcja 4175, WebUI 8787 i CAT 8788 pozostały aktywne.

## Otwarta bramka manualna

Kontroler przeglądarki zablokował Tailscale i lokalny URL polityką bezpieczeństwa, dlatego nie zapisano automatycznego UI PASS. Autor musi potwierdzić na zalogowanym telefonie:

1. niepustą Aktywność Cytadeli;
2. prawdziwe nazwy i godziny cronów;
3. `CRON · SUKCES` / `CRON · BŁĄD`;
4. brak duplikatów;
5. ważne warning/error z logów;
6. historię po restarcie i reconnect;
7. 12/12 agentów i brak fake Working;
8. niezmieniony ruch oraz wejścia do budynków.

Produkcja pozostaje zamrożona do osobnego GL.
