# 03 — Sesje Codexa

## Aktualizacja 2026-07-15 — kompletny cinematic interior VFX suite

| Data i czas Europe/Warsaw | Session ID | Model | Cel i wkład | Decyzje autora | Okres | Znaczenie dla core | `/feedback` |
|---|---|---|---|---|---|---|---|
| 2026-07-15 01:33–03:25 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol + wbudowane image generation | Sekwencyjne wygenerowanie dziesięciu brakujących źródeł, cleanup i normalizacja całego zestawu 11 stripów, integracja pięciu wnętrz, testy kontraktowe, build, benchmark first-open i checkpoint | Autor zezwolił na maksymalnie dwa lekkie subtaski, wymagał pełnego zestawu przed wspólną walidacją i zachowania produkcji do GL | podczas Submission Period | BARDZO WYSOKIE — kompletny pipeline assetowy, architektura jednego renderera, performance i dowody Build Week | TAK — mocny kandydat; finalny wybór nadal po live integration |
| 2026-07-15 10:54–11:40 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Iteracyjny agent perfection pass: pomiary 12 sprite’ów, Kowal mobile-first, wspólna macierz widoczności, atomowa własność map/interior, markery pochylonych póz, testy i build | Autor odrzucił podejście „pierwsza wersja wystarczy”, zatwierdził pracę do jakości finalnej i zażądał pełnego zapisu od godziny 10:54 | podczas Submission Period | BARDZO WYSOKIE — prawdziwy kontrakt lokalizacji, wspólny renderer, pełny roster i rygor testowy | TAK — mocny kandydat; finalny wybór nadal po live Hermes E2E |
| 2026-07-15 11:52–12:01 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Kontynuacja percepcyjna: lokalne render-review wszystkich stanów i dwóch wnętrz, wykrycie utraty kontrastu Kowala na linii produkcyjnej, mikroregulacja bez zmiany skali, testy i build | Autor wymagał dalszej pracy do jakości finalnej zamiast zatrzymania na samych testach; ostateczne GL/RL pozostaje po jego stronie | podczas Submission Period | WYSOKIE — pokazuje iterację wizualną opartą na dowodzie zamiast „pierwszego strzału” | MOŻLIWE |

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
| 2026-07-14 23:26 – 2026-07-15 00:15 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Integracja pięciu wygenerowanych cinematic interior plates, wspólny renderer, fizycznie zakotwiczone animacje, lazy loading, testy i kontrola budżetu | Autor dostarczył pięć oryginalnych ilustracji AI, zatwierdził kierunek „WOW” i ograniczył zakres do demo; obecność agentów we wnętrzu odłożył do etapu po GL | podczas Submission Period | BARDZO WYSOKIE — finalizuje przestrzenny drill-down subsystemów jako znaczącą funkcję konkursową | TAK — mocny kandydat; finalny wybór nadal po domknięciu live integration |
| 2026-07-15 14:10–trwa | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Recovery verification, kontrolowana promocja GL, audyt produkcji i domknięcie realnego Hermes chat SSE → world choreography | Autor wydał GL rosteru, zatwierdził backup oraz promocję i wskazał wymaganie, aby każda prawdziwa wiadomość powodowała ruch świata | podczas Submission Period | BARDZO WYSOKIE — łączy realny lifecycle czatu z obserwowalnym światem bez fake Working/Success | TAK — mocny kandydat; finalny wybór po pełnym live smoke i dalszej meaningful extension |
| 2026-07-15 00:23–00:43 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Audyt cold-entry, benchmark transferu pięciu wnętrz, minimalny performance pass i specyfikacja 11 dedykowanych assetów | Autor wykrył percepcyjne przycięcie, odrzucił recykling efektów mapy i zdecydował generować dedykowane stripy osobno w ChatGPT | podczas Submission Period | WYSOKIE — pokazuje iterację opartą na pomiarze, rozdzielenie środowisk i współpracę Codex–ChatGPT–autor | MOŻLIWE |
| 2026-07-15 00:47–01:32 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol + wbudowane image generation | Odrzucenie niedopasowanego ognia, wygenerowanie source sheetu z referencją wnętrza, alpha cleanup, fixed-pivot normalization, integracja, benchmark i testy | Autor ustanowił próg jakości: efekt musi pasować do wnętrza, nie tylko być technicznie poprawny; polecił generowanie pojedynczo | podczas Submission Period | WYSOKIE — pełny dowodowy pipeline visual asset → kod → test → wydajność | MOŻLIWE |
| 2026-07-15 01:36–04:56 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Audyt cold/warm entry, zatrzymanie pracy ukrytej mapy, jeden evidence-backed renderer agentów we wnętrzu, iteracyjny Kowal, zweryfikowany Uczony, ochrona initial snapshot i pełny test handoffu | Autor wymagał jakości ponad szybkość, najpierw wzorcowego Kowala, następnie wspólnego systemu; zabronił fake ruchu i polecił pełny zapis Build Week | podczas Submission Period | BARDZO WYSOKIE — łączy prawdziwy FSM, task/evidence, przestrzenny drill-down i ten sam sprite w jedną audytowalną reprezentację | TAK — mocny kandydat; finalny wybór po live Hermes E2E |
| 2026-07-15 15:56–17:14 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Uczciwy audyt regresji produkcyjnej, reprodukcja niepełnego cold-startu, responsive preload, atomowa bramka mapy i 12 agentów, usunięcie debugowych przewodów, testy i pomiar HTTP | Autor odrzucił niepełny benchmark, zgłosił wolne ładowanie i pełne linie, a następnie potwierdził realny mobile GL po poprawce | podczas Submission Period | BARDZO WYSOKIE — pokazuje wykrycie regresji po wdrożeniu, dowodową diagnozę i iterację do natychmiastowego cold-startu | TAK — mocny kandydat; finalny wybór po realnym chat E2E |
| 2026-07-16 07:06–10:17 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Diagnoza pustej produkcji, auth gate i PWA, naprawa rosteru `0/0`, weryfikacja rzeczywistych kontraktów Hermes WebUI, live sessions → operational state, evidence-backed wejścia 12 ról, pełne testy i publiczny runtime | Autor wymagał zatrzymania samowolnych zmian, dokładnego odtworzenia zatwierdzonego demo, wszystkich danych live, wejść do wnętrz i pełnego zapisu Build Week od 07:06 | podczas Submission Period | BARDZO WYSOKIE — domyka granicę demo/live, realną aktywność sesji i przestrzenną reprezentację 12 ról | TAK — mocny kandydat po manualnym authenticated chat E2E |
| 2026-07-16 15:35–17:22 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Zamknięcie nieudanych kierunków animacji wody, lekki refleks VFX bez rasterów, evidence-backed fala reakcji miasta na prawdziwe SSE, telemetria pięciu wnętrz z bezpiecznym `/api/memory` oraz odporność pełnego lifecycle’u: retry/order, kompletny powrót, konkurencyjne runy i recovery po utracie SSE | Autor odrzucił fake activity i kosztowne efekty, zachował subtelną wodę jako nieprzeszkadzający fallback, zażądał „WOW” opartego na prawdziwym działaniu oraz pełnego audytu, benchmarków i dokumentowania przed produkcją | podczas Submission Period | BARDZO WYSOKIE — pokazuje iteracyjne RL, zmianę strategii, prywatnościowe mapowanie pamięci i dowodowe domknięcie prawdziwego eventu bez fałszowania stanu | TAK — mocny kandydat po manualnym mobile GL |
| 2026-07-16 17:27–18:00 | `019f4f11-14e9-70e0-8d61-26226257864c` | GPT-5.6 Sol | Polish ruchu po GL cyklu: diagnoza ślizgania i skoku ambient → operational, wspólna biomechanika kroku, route-aware handoff bieżącej pozycji, testy regresji, benchmark i build | Autor zamroził zaakceptowany cykl, odrzucił rozszerzanie go fake reakcjami i wskazał naturalność ruchu jako jedyny aktywny problem | podczas Submission Period | WYSOKIE — evidence-backed poprawa prezentacji bez zmiany źródła prawdy, FSM ani produkcji | MOŻLIWE |
