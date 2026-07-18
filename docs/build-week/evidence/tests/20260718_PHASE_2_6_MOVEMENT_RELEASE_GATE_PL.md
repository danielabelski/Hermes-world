# Faza 2.6 — release gate ruchu agentów

- Data: 2026-07-18, Europe/Warsaw.
- Branch: `build-week/hermes-world`.
- Zakres: walidacja zaakceptowanego ruchu w demo; bez zmian logiki ruchu, tras, waypointów, pozycji, mapy lub produkcji.

## Zasada testu

Ruch miał zostać zmieniony tylko po odtworzeniu konkretnego błędu. Dodano wyłącznie kontrakt regresyjny wykonujący pięć pełnych, deterministycznych przebiegów tej samej podróży Kowala:

`home → droga → wejście Kuźni → wnętrze/Working → wyjście → Success → droga powrotna → home/Idle`.

Każdy przebieg sprawdza:

- profil `coder` i właściwe `taskId` przez całą podróż,
- budynek `forge`,
- widoczne odcinki `road`, `enter`, `work`, `exit`, `success`, `return`, `idle`,
- wejście dopiero po przekroczeniu istniejącego progu,
- brak skoku większego niż 5 jednostek świata pomiędzy próbkami co 250 ms,
- zakończenie dokładnie w zatwierdzonym punkcie home 46/36.5.

## Wyniki

- Pięć pełnych przebiegów: **PASS 5/5**.
- Błędny worker: **0/5**.
- Błędny budynek albo task ownership: **0/5**.
- Teleport outbound/return: **0**.
- Brak wejścia, Working, wyjścia, Success, powrotu lub Idle: **0**.
- Focused movement/interior tests: **39/39 PASS**.
- Pełny zestaw: **164/164 PASS**, 7 suites, 0 fail, 0 skipped.
- ESLint zmienionego testu: **PASS**.
- World Life validator: **PASS**.
- `git diff --check`: **PASS**.
- Build demo: **PASS**, 874 moduły, 39,47 s pod obciążeniem hosta; main JS bez zmiany 432,61 kB / 133,21 kB gzip.

## Pomiar działającego DOM demo

Po świeżym przeładowaniu `?demo=1&walkAudit=2` pobrano 15 kolejnych próbek Zwiadowcy:

- początek: 54.348/34.353,
- koniec marszu: 67/31.5,
- ruch postępował po kolejnych współrzędnych bez cofnięcia do home i bez teleportu,
- roster w każdej próbce: 12 total, 10 na mapie, 2 we wnętrzach, 0 invalid,
- `assetReady=true` w każdej próbce,
- konsola po pomiarze: 0 errors, 0 warnings.

Końcowe próbki stojące w 67/31.5 są krótkim zatrzymaniem na celu przed następnym beatem, nie teleportem ani zagubieniem trasy.

## Decyzja

Nie odtworzono błędu ruchu finalnego scenariusza. Nie zmieniono implementacji ruchu. Faza 3 ma jeszcze potwierdzić ten sam kontrakt na prawdziwym eventcie Hermesa i iMessage pięć razy.
