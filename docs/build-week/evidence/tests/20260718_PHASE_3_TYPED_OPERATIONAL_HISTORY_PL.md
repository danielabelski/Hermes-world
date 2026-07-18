# TEST-BW-067 — typowana historia operacyjna

- Data: 2026-07-18, Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Zakres: wyłącznie demo; produkcja nietknięta.

## Odtworzony problem

Ręczny odbiór autora wykazał serię ogólnych komunikatów Pazia, ale brak nazw cronów. Godzina 14:31 pochodziła z timestampów lifecycle agenta i nie była dowodem wykonania crona.

## Minimalna korekta

- Cron zachowuje `cronName`, `cronStatus`, stabilny identyfikator i autorytatywny `completedAt`.
- Cron jest prezentowany niezależnie od agenta jako `CRON · SUKCES`, `CRON · BŁĄD` albo z rzeczywistym statusem.
- Komunikat zawsze zawiera nazwę crona; cron nie jest przypisywany Paziowi bez takiego dowodu w danych.
- Lifecycle agenta ma osobne etykiety: `ZADANIE`, `ANALIZA`, `PRACA`, `OCZEKIWANIE`, `UKOŃCZONE` itd.
- Rotacja zachowuje alerty jako najwyższy priorytet, a następnie eksponuje najnowszy cron, task i event agenta, bez usuwania pozostałych zdarzeń.

## Walidacja

- Pełny zestaw po pierwszej wersji kontraktu: **172/172 PASS**.
- Focused po finalnej korekcie semantyki: **38/38 PASS**.
- ESLint i `git diff --check`: **PASS**.
- Build: **PASS**, Vite 8.0.16, 875 modułów, 2,97 s.
- Main JS: **435,95 kB / 134,32 kB gzip**.
- Mikrobenchmark prezentacji i zbalansowania 40 wpisów: **0,014107 ms/operację** (100 000 iteracji).
- Demo root: **HTTP 200**, artifact `index-Cc-0oBZW.js`.
- Próby builda w sandboxie: **ENVIRONMENTAL RETRY / EPERM `.vite-temp`**; identyczny build poza ograniczeniem: **PASS**.

## Ograniczenie dowodu

Automatyczne testy potwierdzają kontrakt i renderowanie. Widoczność prawdziwych chronionych cronów na zalogowanym telefonie nadal wymaga manualnego GL autora. Cron E2E nie został oznaczony jako PASS.
