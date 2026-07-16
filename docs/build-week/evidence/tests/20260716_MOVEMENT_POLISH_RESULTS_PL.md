# Movement polish — wyniki walidacji

- Data: 2026-07-16
- Branch wejściowy: `build-week/hermes-world`
- HEAD wejściowy: `335ecda`
- Session ID: `019f4f11-14e9-70e0-8d61-26226257864c`
- Zakres: demo; naturalny krok i ciągłość ambient → real event.

## Wyniki

- Testy fokusowe: 44/44 PASS.
- Pełny zestaw: 146/146 PASS.
- ESLint: PASS.
- Walidator world-life: PASS.
- Build: PASS, 874 moduły, 4,80 s.
- Main JS: 423,05 kB / 129,98 kB gzip.
- CSS: 76,69 kB / 16,56 kB gzip.
- Runtime 4176: `assets/index-Cm90ARzU.js`, kontrakty gait/handoff obecne.
- Mikrobenchmark: 50 000 handoffów / 1 338,470 ms / 26,769 µs na iterację.

## Ograniczenie

Automaty potwierdzają ciągłość współrzędnych, trasę, priorytet realnego stanu i koszt czystej logiki. Naturalność kroku oraz percepcyjny brak ślizgania na 393×852 wymagają oceny autora na realnym telefonie.
