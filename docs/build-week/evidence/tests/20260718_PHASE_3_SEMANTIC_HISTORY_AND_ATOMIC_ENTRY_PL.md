# Faza 3 — semantyczna historia i atomowe wejście

- Data: 2026-07-18, Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Zakres: wyłącznie demo. Produkcja pozostała nietknięta.

## Odtworzone problemy

1. Po cold starcie bieżące taski z autorytatywnego Kanbanu nie trafiały do dolnego, semantycznego feedu, jeżeli klient nie obserwował lokalnie zmiany statusu.
2. Status cron `failed` mógł zostać opisany jako sukces, ponieważ narracja rozpoznawała wyłącznie dokładne `error`.
3. Agent przechodzący do Kuźni lub Archiwum trafiał nad maskę fasady dopiero po osiągnięciu 96% całej drogi. Przy trasach o różnej długości maska mogła wcześniej odcinać sprite piksel po pikselu.

## Minimalna korekta

- Bieżące, timestampowane taski z Hermes Kanban są odtwarzane jako semantyczne wpisy również po cold starcie/resync. Nie tworzy to ruchu: timestamp prezentacyjnego przejścia pozostaje pusty bez rzeczywiście zaobserwowanej krawędzi statusu.
- Wpis ma stabilne ID, `source=hermes-kanban`, `correlationId` i zachowuje `evidenceEventId`, jeżeli backend go dostarczył.
- Crony `error`, `failed` i `fail` mają narrację błędu.
- Pełny sprite przechodzi do warstwy `facade-front` na początku ostatniego, jawnie zmapowanego odcinka dojścia i pozostaje tam podczas pierwszego odcinka wyjścia. Sam `isInside` nadal przełącza cały model atomowo przy progu wejścia.
- Nie zmieniono współrzędnych, waypointów, geometrii mapy, FSM ani źródeł telemetrii.

## Walidacja

- Kontrakt cold start task + cron: **PASS**.
- Kuźnia: pełny sprite na ostatnim odcinku, przed wejściem: **PASS**.
- Archiwum: pełny sprite na ostatnim odcinku, przed wejściem: **PASS**.
- Focused contract suite: **45/45 PASS**.
- Pełna regresja: **168/168 PASS**.
- ESLint: **PASS**.
- World Life validator: **PASS**.
- `git diff --check`: **PASS**.
- Build: **PASS**, 874 moduły, 3,05 s, main JS 433,05 kB / 133,34 kB gzip.

## Ograniczenia

- Endpointy demo są chronione sesją; niezalogowany odczyt lokalny zwraca prawidłowe `401`. Ręczna walidacja zalogowanego telefonu pozostaje konieczna.
- Nie wykonano nieznanego crona tylko w celu testu. Pełna korelacja bezpiecznego, realnego crona pozostaje manualnym testem odbioru.
