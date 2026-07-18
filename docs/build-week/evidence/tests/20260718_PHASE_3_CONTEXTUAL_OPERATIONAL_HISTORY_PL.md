# FAZA 3 — kontekstowa historia operacyjna

Data: 2026-07-18, Europe/Warsaw
Branch: `build-week/hermes-world`
Zakres: wyłącznie demo

## Problem wykryty manualnie

Typy `ZADANIE`, `ANALIZA`, `PRACA` i `UKOŃCZONE` były rozróżnione, ale wpisy nadal wyglądały podobnie, ponieważ nie zawierały konkretnej nazwy operacji. Dodatkowo reducer posiadał dwa przypisania pola `title`; późniejsze nadpisywało prawdziwy tytuł ogólnym komunikatem transportowym.

## Minimalna korekta

- Wiadomość użytkownika staje się `task_title` dopiero po uzyskaniu prawdziwego `stream_id`.
- Ten sam tytuł jest niesiony przez wszystkie potwierdzone etapy lifecycle.
- Reducer zachowuje tytuł z pierwszego eventu dla kolejnych eventów tego samego `taskId`.
- Feed pokazuje konkretny tytuł i etap agenta.
- Cron pokazuje swoją rzeczywistą nazwę i wynik, bez fałszywego przypisania do Pazia.
- Retencja wzrosła do 80 pozycji, bez dodawania nowego źródła danych lub pracy okresowej.

## Przykładowa semantyka

- `ZADANIE — Paź przyjął zadanie „Sprawdź stan serwera”.`
- `ANALIZA — Paź analizuje zadanie „Sprawdź stan serwera”.`
- `PRACA — Paź wykonuje „Sprawdź stan serwera” w Komnacie Dowodzenia.`
- `UKOŃCZONE — Paź zakończył zadanie „Sprawdź stan serwera” i przekazał rezultat.`
- `CRON · SUKCES — Morning health check — wykonany pomyślnie.`

## Wyniki

- Focused contracts: **54/54 PASS**.
- Pełna regresja: **172/172 PASS**.
- ESLint: **PASS**.
- Build: **PASS**, 875 modułów, 4,76 s.
- Main bundle: 436,33 kB / 134,44 kB gzip.
- Mikrobenchmark 80 pozycji: 20 000 pełnych przeliczeń merge + prezentacja, średnio **0,24311 ms** na feed.
- Serwowany artifact: `index-B2WX7yfx.js`.
- Produkcja: **UNCHANGED / CLEAN**, `958b9da08bee9613900e902b3da558aadef826e8`.

## Ograniczenie dowodu

Automatyczne testy potwierdzają kontrakt i rendering danych. Odbiór na zalogowanym telefonie z prawdziwą wiadomością oraz prawdziwymi dzisiejszymi cronami pozostaje `MANUAL ACTION REQUIRED`; nie jest oznaczony jako PASS przed obserwacją autora.
