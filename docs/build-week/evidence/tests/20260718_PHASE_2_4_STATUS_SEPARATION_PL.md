# Faza 2.4 — rozdzielenie transportu aplikacji od stanu Hermesa

- Data: 2026-07-18, Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Zakres: wyłącznie środowisko demo; produkcja pozostała zamrożona na `958b9da08bee9613900e902b3da558aadef826e8`.
- Punkt powrotu demo: tag `demo-release-audit-start-2026-07-18`.

## Odtworzony problem

Warstwa prezentacji traktowała `lifecycle.connection === "offline"` albo `lifecycle.phase === "unavailable"` jako dowód, że Hermes i jego workerzy są offline. Było to błędne: te pola opisują dostępność transportu klienta, a nie autorytatywny stan runtime.

## Minimalna poprawka

- Transport aplikacji pozostaje w `lifecycle.transport` i może przyjąć stan `connecting`, `live`, `reconnecting`, `resyncing` albo `disconnected`.
- Status Hermesa i workerów nie jest już wyliczany z błędu EventSource.
- `offline` wymaga jawnego dowodu z runtime: `agent.presence`, `agent.online`, `agent.state`, `lifecycle.hermesStatus` albo `lifecycle.runtimeStatus`.
- Podczas reconnect UI komunikuje „Łączenie” lub „Rozłączono” oraz zachowuje ostatni potwierdzony stan Hermesa.
- Nie czyszczono agentów, zadań, wnętrz ani ostatniego autorytatywnego snapshotu.
- Kontrolowany scenariusz demo `offline` otrzymał jawny `hermesStatus: "offline"`, aby nadal testował rzeczywisty offline, a nie awarię transportu.

Nie zmieniono mapy, routingu, waypointów, ruchu, FSM, event pipeline'u, backendu ani produkcji.

## Walidacja

- Test regresyjny: utrata transportu przy `agent.presence === "online"` nie tworzy offline — **PASS**.
- Test regresyjny: jawne `agent.presence === "offline"` nadal tworzy offline — **PASS**.
- Wnętrze budynku zachowuje prawdziwy stan pracy podczas `transport: "reconnecting"` — **PASS**.
- Wnętrze przechodzi offline przy autorytatywnym `hermesStatus: "offline"` — **PASS**.
- Pełny zestaw: **161/161 PASS**, 7 suites, 0 fail, 0 skipped.
- ESLint: **PASS**.
- World Life validator: **PASS**.
- `git diff --check`: **PASS**.
- Build demo: **PASS**, Vite 8.0.16, 874 moduły, 2,18 s; główny JS 431,96 kB / 132,97 kB gzip.

## Ograniczenie

Ręczne zerwanie transportu na realnym telefonie oraz powrót Wi‑Fi/LTE pozostają częścią pełnej macierzy fazy 3. Wyników tych testów nie oznaczono przedwcześnie jako PASS.
