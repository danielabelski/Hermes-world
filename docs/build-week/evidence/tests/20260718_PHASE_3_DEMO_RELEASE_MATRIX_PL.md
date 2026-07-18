# FAZA 3 — macierz odbioru demo

Data: 2026-07-18, Europe/Warsaw

Branch: `build-week/hermes-world`

Commit wejściowy: `09a115ee7cd4a49a13a922c077294d4422f135a2`

Zakres: wyłącznie środowisko demo `4176`; produkcja pozostaje zamrożona na `958b9da08bee9613900e902b3da558aadef826e8`.

## Wyniki automatyczne

- Pełny zestaw testów: **PASS 164/164**, 7 suites, 0 fail, 0 skipped.
- ESLint: **PASS**.
- `validate:world-life`: **PASS**.
- Build Vite: **PASS**, 874 moduły; główny JS 432,61 kB / 133,21 kB gzip.
- Pięć kolejnych kontrolowanych połączeń do `/api/world/events/stream`: **PASS 5/5**. Każde otrzymało HTTP 200 i ten sam replay 47 454 B; klient zamykał połączenie po 3 sekundach. Po próbach pozostał dokładnie jeden listener serwera na porcie 4176.
- Pięć ponownych wejść do Archiwum w mobilnym viewport 393×852: **PASS 5/5**. Każdy odczyt pochodził z `Hermes runtime`, a metryki pozostawały spójne: sekcje pamięci 1, zdarzenia 40, w toku 0. Konsola: 0 błędów.
- Kontrolowany cold start fixture demo 393×852: **PASS**, gotowość mapy i agentów po 1903 ms; roster 12/12, 10 na mapie, 2 we wnętrzach, 0 invalid.
- Pięciokrotny kontrakt ruchu Kowala i pomiar DOM Zwiadowcy: **PASS** zgodnie z `20260718_PHASE_2_6_MOVEMENT_RELEASE_GATE_PL.md`.
- Trasy bezpośrednie root oraz pięciu wnętrz zwracają HTTP 200. Lokalny TTFB: 3,3–4,5 ms.
- Lokalny transfer po pięciu próbach: HTML 3,2–3,9 ms; główny JS 5,0–7,5 ms; CSS 4,0–6,1 ms; mapa mobile 5,3–8,3 ms. To pomiar lokalnego transportu, nie zastępstwo pomiaru Safari/LTE.
- Manifest `/manifest.json?v=5` i Service Worker `/sw.js?v=5`: **PASS**, prawidłowe typy treści oraz `Cache-Control: no-store`; `start_url` wskazuje `/`.

## Soak SSE

- Test jednego ciągłego streamu przez 30 minut: **PASS** — HTTP 200 utrzymane przez 1800 sekund, 120 odebranych chunków i 50 667 B. Po początkowym replayu przybywały dwa chunki / 54 B co około 30 sekund, co potwierdza regularny heartbeat bez martwego okna.
- Baseline procesu Node PID 10924: start 2026-07-16 21:03:01; working set 46,2 MB; private memory 82,6 MB; 238 uchwytów; 13 wątków.
- Po teście: working set 49,3 MB; private memory 82,7 MB; 235 uchwytów; 13 wątków; dokładnie jeden listener 4176. Private memory wzrosła o około 0,10 MB, liczba uchwytów spadła o 3, a liczba wątków pozostała stała — brak oznaki wycieku lub narastania listenerów.

## Testy wymagające ręcznego odbioru

Poniższych punktów nie oznaczono jako PASS bez rzeczywistego testu:

1. Zalogowany cold start na realnym telefonie.
2. 30 minut aktywnej aplikacji mobilnej bez ręcznego odświeżenia.
3. Blokada/odblokowanie telefonu oraz przejście aplikacji do tła i powrót.
4. Zmiana Wi‑Fi → LTE → Wi‑Fi z automatycznym reconnect i resync.
5. Pięć pełnych, rzeczywistych przejść iMessage → Hermes → właściwy worker → budynek → wynik.
6. Jeden bezpieczny realny cron prześledzony od logu przez zapis, API, SSE i UI, następnie potwierdzony po restarcie aplikacji.
7. Ręczne potwierdzenie braku migania/znikania rosteru oraz braku teleportów w realnym evencie.

Do wykonania tych testów potrzebna jest prawdziwa zalogowana sesja i kontrolowane polecenie autora. Tryb `?demo=1` nie może zastąpić dowodu działania realnego pipeline'u.

## Klasyfikacja release

- **BLOCKER:** pięć prawdziwych lifecycle'ów oraz mobilny reconnect/resync nie zostały jeszcze ręcznie odebrane.
- **WAŻNY:** automatyczny sterownik wbudowanej przeglądarki zniknął z aktualnego cache pluginu podczas zmiany konta; nie wpływa to na aplikację, ale uniemożliwia dalsze automatyczne klikanie w tej sesji.
- **KOSMETYCZNY:** brak nowych usterek kosmetycznych potwierdzonych w tej fazie.

## Decyzja

Nie wolno przejść do modyfikowania produkcji, dopóki wszystkie powyższe BLOCKERY nie otrzymają rzeczywistego wyniku PASS i autor nie wyda osobnego GL.
