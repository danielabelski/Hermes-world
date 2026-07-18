# Faza 2.5 — trwała i kompletna historia zdarzeń

- Data: 2026-07-18, Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Zakres: wyłącznie środowisko demo; produkcja pozostała zamrożona na `958b9da08bee9613900e902b3da558aadef826e8`.
- Punkt powrotu demo: tag `demo-release-audit-start-2026-07-18`.

## Odtworzone miejsca utraty danych

1. `server/worldEventHub.js` przechowywał najwyżej 500 zdarzeń wyłącznie w pamięci procesu. Restart usuwał historię, identyfikatory deduplikacji i guardy sekwencji runu.
2. `/api/world/events/snapshot` zwracał wyłącznie powyższy stan RAM.
3. `WorldBridge` używał jednego nieuporządkowanego `find()` dla ukończeń cronów. Dla jednego joba pokazywał najwyżej jeden rekord, a wybór wyniku nie był gwarantowany chronologicznie.
4. Surowy log i event domenowy są odrębnymi źródłami. Nie uznano logu za trwały event i nie utworzono fikcyjnej historii.

## Minimalna poprawka

- Hub zdarzeń otrzymał opcjonalny, atomowo zapisywany magazyn JSON skonfigurowany przez `HERMES_WORLD_EVENT_HISTORY`; domyślna ścieżka demo to `data/world-event-history.json`.
- Przy starcie serwera historia jest odtwarzana, ograniczana do 500 rekordów i ponownie buduje deduplikację `eventId` oraz najwyższą sekwencję każdego `runId`.
- Zdarzenie jest publikowane dopiero po udanym trwałym zapisie. Błąd zapisu zwraca `503`/`persistence_failed` zamiast fałszywego potwierdzenia sukcesu.
- Zapis używa pliku tymczasowego i atomowej zmiany nazwy. Log diagnostyczny zawiera wyłącznie metadane, bez treści eventu i sekretów.
- `WorldBridge` normalizuje wszystkie trwałe ukończenia cronów, deduplikuje je po stabilnym ID, sortuje po timestampie i zachowuje osobny wpis aktywności dla każdego ukończenia.
- Najnowszy rezultat joba jest wybierany na podstawie timestampu, a nie kolejności zwróconej tablicy.
- Nie wykonano backfillu. Brakujących historycznych eventów nie odtworzono bez wiarygodnego źródła.

## Walidacja test-first

- Przed poprawką test restartu huba: **EXPECTED FAIL** — snapshot po restarcie był pusty.
- Przed poprawką test historii jednego crona z dwoma ukończeniami: **EXPECTED FAIL** — starszy rekord wygrywał i tylko jeden wpis trafiał do aktywności.
- Po poprawce focused event/cron tests: **11/11 PASS**.
- Pełny zestaw po implementacji: **163/163 PASS**, 7 suites, 0 fail, 0 skipped.
- ESLint: **PASS**.
- `node --check server.js`: **PASS**.
- World Life validator: **PASS**.
- `git diff --check`: **PASS**.
- Build demo: **PASS**, Vite 8.0.16, 874 moduły, 10,07 s; główny JS 432,61 kB / 133,21 kB gzip.

## Test rzeczywistego restartu procesu

1. Uruchomiono izolowany serwer demo na porcie 4198 z magazynem `data/world-event-history-phase25.json`.
2. Opublikowano event `phase25-restart:1`; odpowiedź potwierdziła zapis, a snapshot zawierał dokładnie jeden rekord.
3. Proces został zakończony i uruchomiony ponownie z tym samym magazynem.
4. Snapshot po restarcie nadal zawierał dokładnie ten sam event i cursor — **PASS**.
5. Proces testowy zakończono, listener 4198 usunięto, plik testowy skasowano — **PASS**.

Pierwsza próba użyła katalogu tymczasowego spoza repo i otrzymała systemowy `EPERM`. Serwer prawidłowo zwrócił wtedy `503 persistence_failed`; powtórzenie w ignorowanym katalogu `data/` przeszło bez zmiany kodu.

## Kontrola dostępności API

- `GET /api/crons/recent` bez uwierzytelnienia: **401 zgodnie z kontraktem bezpieczeństwa**.
- Normalny widok `?demo=1&walkAudit=2`: **PASS** — renderuje 10 agentów na mapie i stan 7/12.
- Bezpośrednie otwarcie chronionego endpointu przez przeglądarkę Codexa zostało zablokowane przez klienta. Nie obchodzono zabezpieczenia i nie uruchamiano nieznanego crona w ciemno.

## Ograniczenie i kolejny gate

Kontrolowany prawdziwy cron, korelacja `log → event → trwały zapis → API → SSE → UI`, ponowne otwarcie aplikacji i odzyskanie po reconnect pozostają **MANUAL ACTION REQUIRED / FAZA 3**. Faza 2.5 zamyka potwierdzone miejsca utraty w kodzie, ale nie oznacza ręcznego testu produkcyjnego ani zgody na migrację.
