# Phase 3 — ciągłość ruchu przy realnym worker handoffie

## Zakres

- Data: 2026-07-18 22:15–22:33 Europe/Warsaw.
- Repo/branch: `hermes-os-living-world-demo` / `build-week/hermes-world`.
- Checkpoint wejściowy: `5f74847f3039047b7f1945eaed30d0e161a2dd19`.
- Zakres zmiany: wyłącznie presentation directors odpowiedzialne za przejęcie ambientowego ruchu przez prawdziwy event.
- Produkcja `958b9da08bee9613900e902b3da558aadef826e8`, CAT, Hermes WebUI, API, crony, Aktywność Cytadeli, mapa, trasy i FSM: bez zmian.

## Manualny gate wejściowy

Autor potwierdził GL dla cold startu, Wi-Fi/LTE, 12/12 workerów, pięciu cykli, prawdziwego worker lifecycle, cronów, innych zdarzeń, budynków, reconnectu i logów. Jedyny UX RL: po wywołaniu workera aktywny ruch wyglądał na zatrzymany przez około 2–3 sekundy.

## Surowy dowód

Run: `gateway-20260718_221532_2bf368-40612`.

```text
events=43
stuck=0
warning=0
critical=0
terminal=success
assigned published delay=1269 ms
assigned → thinking=12 ms
assigned → first working=3788 ms
```

Wniosek: nie wystąpił prawdziwy `stuck` ani renderer freeze. `thinking` natychmiast zastępował krótkie `assigned`, a director usuwał ambientowy ruch celu wraz z partnerem interakcji.

## Minimalna poprawka

- Prawdziwy worker zachowuje widoczną pozycję nóg i istniejącą trasę handoffu również w fazie `thinking`.
- Jego semantyczny i wizualny stan pozostaje `thinking`; `working` nadal wymaga prawdziwego eventu.
- Przerwanie ruchu dotyczy tylko workera. Partner rozmowy i niezwiązani agenci kontynuują ambient.
- Nie zmieniono zegara prezentacji, tras, prędkości, FSM, payloadów, reducerów ani źródeł danych.

## Walidacja

- Test-first przed poprawką: 19/20, oczekiwany FAIL na braku `operational-handoff` dla `thinking`.
- Po poprawce: `node --test src/world/directors/worldDirectors.test.js`: 20/20 PASS.
- Directors + movement + events: 66/66 PASS.
- `npm.cmd test`: 178/178 PASS, 8 suites, 0 fail.
- `npm.cmd run lint`: PASS.
- `npm.cmd run validate:world-life`: PASS.
- `node --check` trzech zmienionych directorów: PASS.
- `git diff --check`: PASS.
- `npm.cmd run build`: PASS, 875 modułów, 3,01 s.
- Artifact: `index-D-EekdwD.js`, 437,53 kB / 134,82 kB gzip.
- Jeden listener DEMO 4176; root, auth i world snapshot HTTP 200.

## Otwarta bramka

Jeden manualny retest prawdziwego workera na zalogowanym telefonie pozostaje wymagany. Kryterium GL: brak pozornego zatrzymania pozostałych agentów, płynny worker handoff podczas `ANALIZA`, prawdziwe `PRACA` dopiero po evencie working, poprawny sukces/powrót.
