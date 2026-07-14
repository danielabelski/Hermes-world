# 03 — Sesje Codexa

Rejestr oddziela dowód sesji od zrzutów zbiorczych statystyk konta. Modele podajemy na podstawie strukturalnych rekordów `turn_context`.

## Główne sesje

| ID dowodu | Data i czas Europe/Warsaw | Session ID | Model | Cel i wkład | Powiązane commity/pliki | Okres | Siła | `/feedback` |
|---|---|---|---|---|---|---|---|---|
| PRE-SESSION-001 | 2026-07-10 04:44:26 — 2026-07-11 04:31+ | `019f49e9-6897-7cb3-b9b9-006c13cebec5` | GPT-5.6 Terra/Luna/Sol | Sesja początkowa „Jesteś Senior Product Designer…”. Architektura, mobile UX, model danych, mapowanie świata, 12 agentów, renderer, trasy, interakcje, testy i iteracje wizualne. | Prowadzi do pierwszego checkpointu `3b6754a`; początkowy workspace i późniejszy vertical slice | przed | BARDZO SILNA | MOŻLIWE, ale praca pre-submission |
| PRE-SESSION-002 / BW-SESSION-001 | od 2026-07-11 04:45:52; trwała przez granicę 2026-07-13 18:00 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol/Luna | Integracja mapy, agenci, stany, mobile, real events, choreography, environmental life, testy; po granicy: audyt provenance i dokumentacja. | `bdedc3a`…`b80b89d`; po granicy `docs/build-week/**` bez commita | mieszany — fragmenty trzeba rozdzielać timestampem | BARDZO SILNA | MOŻLIWE; nie wybierać jeszcze |

## Model użyty przy projekcie

W sesji początkowej znaleziono 35 kontekstów `gpt-5.6-terra`, 2 `gpt-5.6-luna` i 49 `gpt-5.6-sol`. W sesji kontynuacyjnej znaleziono 72 konteksty `gpt-5.6-sol` i 3 `gpt-5.6-luna` do czasu audytu. Nie znaleziono kontekstu `gpt-5.5`.

Screen `PRE-IMG-005` pokazuje w CodexBarze „Top model: gpt-5.5”. To miesięczny agregat użycia konta, który obejmuje czas sprzed premiery GPT-5.6. Nie jest dowodem modelu tej sesji. Użytkownik potwierdził, że od premiery GPT-5.6 nie używał GPT-5.5; niezależnym dowodem technicznym są rekordy `turn_context`.

## Pełny manifest techniczny

Audyt lokalnego magazynu sesji wykrył **83 powiązane wątki główne i subagentowe**. Pełne, nieskrócone Session ID, czas Europe/Warsaw, model odnaleziony w pierwszym `turn_context`, typ, ścieżka zadania, parent ID, okres i siła dowodowa znajdują się w [ALL_SESSIONS_MANIFEST.csv](evidence/codex-sessions/ALL_SESSIONS_MANIFEST.csv). CSV jest mechanicznym indeksem metadanych; surowych JSONL nie kopiuje się do repo z uwagi na prywatność i rozmiar.

Wszystkie 83 wątki rozpoczęły się przed granicą. Główna sesja `019f4f11-…` trwała również po granicy, dlatego jej wpis ma okres „mieszany”, a konkretne czynności należy klasyfikować timestampem. Brak osobnego `turn_context` w krótkim wątku subagenta jest zapisywany jawnie, bez zgadywania modelu.

## Reprezentatywne sesje subagentów

Poniższe wpisy są czytelnym skrótem zakresu delegacji; pełny rejestr znajduje się w CSV powyżej.

| Session ID | Zadanie | Wkład | Okres | Siła |
|---|---|---|---|---|
| `019f50f4-e0ba-…` | `git_checkpoint_audit` | Audyt checkpointu i historii | przed | średnia |
| `019f511f-9873-…` | `desktop_route_validation` | Walidacja tras desktop | przed | średnia |
| `019f511f-eb87-…` | `mobile_route_validation` | Walidacja tras mobile | przed | średnia |
| `019f5120-4221-…` | `sprite_role_validation` | Role, skala i sprite’y | przed | średnia |
| `019f5278-d081-…` | `visual_audit` | Audyt wizualny | przed | średnia |
| `019f5279-3652-…` | `state_audit` | Audyt stanów | przed | średnia |
| `019f5431-b02a-…` | `cat_contract_audit` | Kontrakt danych z Hermes OS Cat | przed | średnia |
| `019f5809-9796-…` | `director_semantics_audit` | Semantyka ambient/choreography | przed | średnia |
| `019f596d-5eb6-…` | `world_life_audit` | Environmental World Life | przed | średnia |
| `019f5bba-71f7-…` | `completion_audit` | Końcowa walidacja pre-build | przed | średnia |

## Decyzje człowieka widoczne w sesjach

- Ustalenie, że Hermes World jest warstwą observability, a nie grą.
- Zamrożenie geometrii mapy i wybór BASELINE jako wariantu produkcyjnego.
- Wymóg realnych eventów bez fake Working/Success.
- Rozdzielenie demo i produkcji oraz GL/RL przed wdrożeniem.
- Wybór małych, rozróżnialnych agentów i mobile-first.
- Odrzucanie kolejnych iteracji, gdy nie dawały percepcyjnego efektu „świat żyje”.

## Kandydat do `/feedback`

Nie wybrano finalnego ID. Sesja początkowa jest mocnym dowodem genezy, lecz jest pre-submission. Sesja kontynuacyjna obejmuje znaczną część istniejącego core, ale większość tego core także powstała przed granicą. Najlepszym kandydatem powinien zostać prawdziwy wątek po 13 lipca 18:00, w którym powstanie większość znaczącego rozszerzenia konkursowego.

**Finalny Session ID zostanie wybrany dopiero po zbudowaniu podczas Submission Period większości kluczowej funkcjonalności konkursowej.**

## Sesja pierwszego meaningful extension

| Data i czas Europe/Warsaw | Session ID | Model | Cel i wkład | Decyzje autora | Okres | Znaczenie dla core | `/feedback` |
|---|---|---|---|---|---|---|---|
| 2026-07-13 22:39+ | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Żywa infrastruktura, ciągły przepływ wody, widoczna atmosfera, telemetria systemowa oraz evidence-backed choreography prawdziwego eventu | Wyłącznie demo; brak fake stanów; etapowe testy, snapshoty i commity; produkcja nietknięta | podczas Submission Period | BARDZO WYSOKIE — pierwszy zaplanowany functional meaningful extension | MOŻLIWE; ocenić po zamknięciu funkcjonalności |
| 2026-07-14 12:19–14:30 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Wzorcowa Kuźnia, wspólny renderer pięciu wnętrz, realna telemetria subsystemów, odrębna architektura oraz depth/material pass bez zwiększania kosztu animacji | Autor zaakceptował mechanizm wejścia/wyjścia i kierunek stylistyczny; zażądał większej głębi, materiałów i cieni przy zachowaniu szybkości | podczas Submission Period | WYSOKIE — rozwinięcie przestrzennego drill-downu observability | MOŻLIWE; porównać z późniejszą sesją real-event integration |
| 2026-07-14 20:42–21:21 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Read-only audyt realnych metryk Hermes OS CAT, rozdzielenie payloadów od heurystyk, atomowe progi wejścia agentów i premium spatial integration czterech wnętrz | Autor wskazał gotowe obszary CAT oraz wymagał realnego RAG/memory health, pełnego zapisu Build Week i poprawy wnętrz bez kosztu FPS | podczas Submission Period | WYSOKIE — łączy rzeczywistą telemetrię z przestrzennym drill-downem i usuwa widoczny błąd przejścia | MOŻLIWE; nie wybierać finalnie przed domknięciem live integration |
