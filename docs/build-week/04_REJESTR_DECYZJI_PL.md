# 04 — Rejestr decyzji

## DEC-001 — Mobile-first observability

- Problem: bogaty świat mógł stać się grą lub dekoracją zamiast interfejsem systemowym.
- Warianty: game-first; dashboard-first bez świata; ambient observability w świecie fantasy-tech.
- Propozycja Codexa: czytelna hierarchia globalny stan → lokalny sygnał → drill-down.
- Decyzja człowieka: Hermes World ma być realną warstwą observability; stan ma być zrozumiały na telefonie w 2–5 sekund.
- Konsekwencje: realne eventy są źródłem prawdy; dekoracja nie może fałszować pracy.
- Okres: przed Submission Period.

## DEC-002 — Geometria mapy i wariant BASELINE

- Problem: różne warianty mapy i ryzyko utraty waypointów.
- Warianty: nowa mapa; LIGHT; STRONG; BASELINE.
- Propozycja Codexa: presety niedestrukcyjne i walidacja mobile.
- Decyzja człowieka: BASELINE jest finalnym defaultem, LIGHT fallbackiem; geometria, crop, wejścia, waypointy i depth zones są zamrożone.
- Konsekwencje: poprawki mapy wyłącznie warstwowe/tonalne.
- Okres: przed Submission Period.

## DEC-003 — Real event pipeline, nie symulacja

- Problem: żywy świat mógł udawać faktyczne taski agentów.
- Warianty: losowe fake stany; wyłącznie statyczny świat; rozdzielenie operational/choreography/environment.
- Propozycja Codexa: oddzielne warstwy i priorytety.
- Decyzja człowieka: `operationalState` tylko z prawdziwych eventów; ambient nie zwiększa aktywnych agentów i nie emituje Success.
- Konsekwencje: event ma evidence ID i przerywa ambient; symulacja pozostaje jawnie demo-only.
- Okres: przed Submission Period.

## DEC-004 — Normalizacja stanów

- Problem: waiting, thinking i stuck były wizualnie mylone.
- Warianty: duże aury; tekst-only; małe semantyczne markery i zachowanie.
- Decyzja człowieka: rola i status są niezależnymi kanałami; `online` jest atrybutem obecności, nie pełnym operational state; alert ma być czytelny bez tickera.
- Konsekwencje: dziewięć scenariuszy walidacyjnych mobile.
- Okres: przed Submission Period.

## DEC-005 — Rozdzielenie demo i produkcji

- Problem: iteracje wizualne nie mogły naruszać stabilnej wersji Correct v1.
- Warianty: praca na produkcji; osobny branch/worktree demo.
- Decyzja człowieka: wszystkie eksperymenty na demo, produkcja nietknięta do GL.
- Konsekwencje: produkcja `main` i demo `pre-build-week/environmental-world-life` są oddzielnymi worktree.
- Okres: przed Submission Period.

## DEC-006 — Uczciwa granica konkursowa

- Problem: projekt istniał przed startem Submission Period.
- Propozycja Codexa: baseline `b80b89d`, annotated tag, append-only dokumentacja i snapshoty.
- Decyzja człowieka: zachować pełną genezę GPT-5.6/Codex, lecz nie przedstawiać pracy sprzed 18:00 jako Build Week.
- Konsekwencje: jurorom pokazujemy jasno diff i funkcje dodane po baseline.
- Okres: podczas Submission Period.
- Możliwość zmiany: baseline jest zamrożony; przyszłe commity nie zmieniają tego punktu.

## DEC-007 — Prywatne repozytorium i brak licencji OSS

- Problem: publiczne repo lub licencja open-source nie są wymagane, jeśli jurorzy otrzymają dostęp prywatny.
- Warianty: publikacja z OSS license; prywatne repo; brak dostępu.
- Wkład Codexa: rozdzielenie własnego kodu od third-party notices.
- Decyzja człowieka: repo pozostaje prywatne, własny kod nie otrzymuje licencji open-source.
- Konsekwencje: przed submission udostępnić repo oficjalnym adresom; notices nie licencjonują Hermes World.

## DEC-008 — CAT jako własny pre-existing projekt

- Problem: odziedziczony shell mógł zostać błędnie sklasyfikowany jako third-party.
- Decyzja człowieka: Hermes OS CAT jest własnym wcześniejszym projektem autora.
- Konsekwencje: 23 zmodyfikowane pliki i 12 assetów dokumentują granicę czasu, nie cudze IP.

## DEC-009 — Assety AI-generated originals

- Problem: brak części historycznych promptów nie oznacza nieznanego źródła.
- Decyzja człowieka: wszystkie wizualne assety obu projektów wygenerowano od zera dla autora.
- Konsekwencje: klasyfikacja `AI-generated original project assets`; nowe assety nadal otrzymują model/prompt/hash, jeśli dostępne.

## DEC-010 — Baseline tag i branch konkursowy

- Problem: praca sprzed i podczas konkursu musi być mechanicznie rozdzielona.
- Wkład Codexa: tag na dokładnym HEAD oraz osobny branch.
- Decyzja człowieka: tag `pre-build-week-baseline-2026-07-13` na `b80b89d…`; praca na `build-week/hermes-world`.
- Konsekwencje: nie przepisywać historii ani nie przesuwać tagu.

## DEC-011 — Append-only evidence workflow

- Problem: korekty dokumentacji mogłyby zacierać historię.
- Decyzja człowieka: dziennik, sesje, decyzje, testy i dowody są append-only; snapshot przed i po bloku.
- Konsekwencje: korekta jest nowym wpisem, nie cichą edycją starego dowodu.

## DEC-012 — `/feedback` dopiero po core functionality

- Problem: przedwczesny wybór wskazałby sesję pre-submission lub dokumentacyjną.
- Decyzja człowieka: finalny Session ID zostanie wybrany po zbudowaniu większości kluczowej funkcjonalności konkursowej.
- Konsekwencje: obecnie prowadzona jest tylko lista kandydatów.

## DEC-013 — Infrastruktura żyje z telemetrii, nie z fake stanów

- Problem: statyczna mapa nie komunikowała, że realny system stale działa, a użycie stanów agentów do dekoracyjnego ruchu fałszowałoby observability.
- Warianty: dekoracyjne losowe animacje; fake `Working`; rytm infrastruktury z prawdziwego heartbeat, CPU/load, journalu, kolejki, sesji i cronów.
- Wkład Codexa: rozdzielenie `operationalState`, `choreographyState` i `environmentState` oraz czterech kanałów intensywności.
- Decyzja człowieka: mapa ma żyć stale, ale praca agentów i `Success` mogą pochodzić wyłącznie z realnych eventów.
- Konsekwencje: telemetria moduluje budynki bez zmiany liczników i FSM; alert może stłumić infrastrukturę, lecz nie wyłącza wody ani atmosfery.
- Okres: podczas Submission Period.

## DEC-014 — Jeden lifecycle evidence ID, osobny trigger event

- Problem: kolejne eventy jednego runu miały różne identyfikatory i trudno było wizualnie oraz dowodowo prześledzić cały przebieg.
- Decyzja: pierwszy realny event staje się `lifecycleEvidenceId` dla całej sekwencji; dokładny event uruchamiający etap jest zachowany jako `triggerEventId`.
- Konsekwencje: sekwencja brama → Cytadela → subsystem → Archiwum jest audytowalna; Archiwum nadal wymaga osobnego prawdziwego eventu `success`.
- Okres: podczas Submission Period.

## DEC-015 — Płynność ma pierwszeństwo przed liczbą efektów

- Problem: szerokie rozmyte pasy atmosfery i wody zwiększały koszt kompozycji oraz wyglądały jak overlay zamiast integralnej części miasta.
- Warianty: dodawać kolejne efekty; globalnie wyłączyć ambient; ograniczyć kosztowne warstwy i adaptować wyłącznie dekoracyjny ambient do realnego FPS urządzenia.
- Wkład Codexa: audyt liczby animacji i powierzchni blur, krótkie refleksy wody zamiast szerokich pasów oraz automatyczne poziomy `full` / `reduced` / `minimal`.
- Decyzja człowieka: demo dla jurorów ma przede wszystkim działać płynnie; żadna dekoracyjna animacja nie może powodować lagów.
- Konsekwencje: kosztowne pasy zostały usunięte; prawdziwe eventy, alerty, Cytadela i Kuźnia zachowują priorytet; wolniejsze urządzenie redukuje tylko ambient.
- Możliwość zmiany: progi można stroić na podstawie testów realnego iPhone’a, bez zmiany event pipeline’u.
- Okres: podczas Submission Period.

## DEC-BW-014 — Cinematic plates zamiast kodowo rysowanych komór

- Problem: funkcjonalne wnętrza były stylistycznie spójne, lecz nadal wyglądały płasko i nie osiągały oczekiwanego efektu przestrzennego.
- Rozważane warianty: dalsze rozbudowywanie CSS; generowanie pełnych wnętrz; jedna płyta rastrowa z lokalnymi, fizycznie zakotwiczonymi animacjami.
- Decyzja: pięć oryginalnych płyt 4:5 stanowi bazę wizualną, a wspólny renderer dodaje wyłącznie małe warstwy funkcjonalne nad rzeczywistymi elementami ilustracji.
- Uzasadnienie: najwyższa jakość wizualna przy mniejszym DOM, mniejszym CSS i zachowaniu płynności mobile; role subsystemów są czytelne bez tekstu.
- Wkład Codexa: audyt hotspotów i budżetu, renderer, mapowanie efektów, testy, lazy loading i zachowanie semantyki eventów.
- Decyzja człowieka: wybór i dostarczenie wszystkich pięciu ilustracji, zatwierdzenie kierunku cinematic oraz wymóg demo-only do GL/RL.
- Konsekwencje: poprzednie komory CSS przestają być aktywnym rendererem; produkcja pozostaje nietknięta. Agent wewnątrz budynku jest osobnym przyszłym etapem po GL.
- Możliwość zmiany: lokalne hotspoty, intensywność i animacje można regulować centralnie bez podmiany płyt ani kontraktu danych.

## DEC-BW-015 — Dedykowane efekty wnętrz i podział pracy ChatGPT/Codex

- Problem: odziedziczone stripy mapowe zwiększają transfer pierwszego wejścia, nie zawsze pasują perspektywą do wnętrz i mają niespójne liczby klatek.
- Warianty: pozostawić wspólne efekty; tworzyć ruch wyłącznie w CSS; przygotować mały komplet dedykowanych stripów per wnętrze.
- Decyzja: maksymalnie dwa stale aktywne, dedykowane efekty per pokój; efekt eventowy może być trzeci, ale pozostaje nieaktywny bez prawdziwego zdarzenia. Wszystkie stripy mają jednolity kontrakt 8 klatek.
- Wkład Codexa: benchmark, specyfikacja techniczna, 11 promptów, późniejsza normalizacja, integracja, testy i provenance.
- Decyzja człowieka: generowanie źródeł pojedynczo w ChatGPT, specjalnie dla projektu, aby wykorzystać dostępne generowanie obrazów i zachować limit Codexa na architekturę oraz implementację.
- Konsekwencje: światowe efekty nie są usuwane przed gotowym zamiennikiem; migracja odbywa się atomowo per wnętrze i podlega GL/RL na demo.
- Możliwość zmiany: liczba klatek i rozdzielczość runtime mogą zostać obniżone po benchmarku bez ponownego generowania źródła.

## DEC-BW-016 — Agent we wnętrzu wyłącznie z dowiedzionego `isInside`

- Problem: dekoracyjne umieszczenie agentów w pięciu cinematic interiors wyglądałoby atrakcyjnie, ale mogłoby fałszować prawdziwą lokalizację, pracę lub sukces i tworzyć podwójny rendering map/interior.
- Warianty: stale dekoracyjni agenci; osobny interior FSM; wspólny renderer aktywowany wyłącznie przez istniejący task, FSM, route visibility i evidence.
- Decyzja: `presentation.isInside` jest atomowym przełącznikiem własności sprite’u. Wnętrze pokazuje agenta tylko przy zgodnym profilu, budynku, tasku, lifecycle i etapie `enter/work/exit`; nieświeże dane wymagają świeżego `evidenceEventId`.
- Wkład Codexa: audyt routingu, centralna konfiguracja lokalnych tras, ponowne użycie `MapAgentSprite`, zabezpieczenie snapshotu startowego i testy pełnego handoffu.
- Decyzja człowieka: najpierw dopracować wzorcowego Kowala, nie robić agentów jednym strzałem, nie akceptować fake ruchu i utrzymać produkcję bez zmian do GL.
- Konsekwencje: Kuźnia/Kowal i Archiwum/Uczony działają. Watcher pozostaje na zewnętrznym punkcie obserwacyjnym, a Cytadela i Sanctum nie pokazują fikcyjnego wnętrzowego agenta do czasu dowiedzenia trasy.
- Możliwość zmiany: kolejne wnętrze aktywuje się przez dopisanie zweryfikowanej konfiguracji do wspólnego kontraktu, bez nowego renderera i bez zmiany FSM.

## DEC-BW-017 — Oddzielna korekta widoczności mapowej od fizycznej skali sprite’a

- Problem: pojedyncze ciężkie lub smukłe sylwetki miały podobny canvas, lecz różną percepcyjną czytelność na 393×852; globalne powiększenie psułoby skalę miasta i wnętrz.
- Warianty: globalnie powiększyć wszystkie postacie; modyfikować assety i anchory; dodać ograniczoną map-only korektę percepcyjnej powierzchni przy wspólnym rendererze.
- Decyzja: `renderScale` pozostaje fizyczną normalizacją assetu na wszystkich powierzchniach, a `mapVisibilityScale` jest małą, centralną korektą wyłącznie mapy. Zakres jest testowo ograniczony do 1.00–1.12 i 40–49 px efektywnego canvasa.
- Wkład Codexa: pomiar alpha bounds, contact sheet na realnym tle mapy, macierz 12 ról, zachowanie anchoru stóp, korekta markerów i testy regresji `Working`/`Offline`.
- Decyzja człowieka: Kowal ma być bardziej widoczny, ale nie dominować; najpierw dopracować go jako wzorzec, następnie cały roster, bez fałszywych wnętrz.
- Konsekwencje: Kowal ma korektę 1.10 tylko na mapie; Uczony i kilka smukłych ról mają mniejsze korekty. Wnętrza i routing nie zmieniają skali logicznej ani pozycji stóp.
- Możliwość zmiany: po GL autora na realnym telefonie dopuszczalne są wyłącznie mikroregulacje w centralnej macierzy, bez zmian geometrii i FSM.

## DEC-BW-018 — Jawny roster review zamiast fałszywej obecności operacyjnej

- Problem: truth-gated wnętrza słusznie nie pokazują agenta bez taska/evidence, ale autor potrzebuje porównać wszystkie 12 assetów we wnętrzach przed GL.
- Warianty: wymuszać fake taski; tworzyć osobne screenshoty; dodać jawny, parametryzowany tryb percepcyjnego QA korzystający z produkcyjnego renderera.
- Decyzja: `interiorReview=1` działa tylko razem z `demo=1`, pokazuje jedną wybraną postać, jej nazwę i pozycję testową oraz pozwala przełączyć `IDLE/PRACA`. Nie dotyka operational state ani evidence contract.
- Wkład Codexa: centralna macierz 12/12, jeden przełącznik pomieszczeń, test pokrycia i zakresów, usunięcie kosztownego `backdrop-filter` po pierwszym failu.
- Decyzja człowieka: wszystkie postacie muszą zostać ocenione we wnętrzach pod kątem rozmiaru, wyglądu, pozy i dopasowania; sam Kowal nie wystarcza.
- Konsekwencje: możliwy jest szybki GL/RL całego rosteru bez udawania, że agenci faktycznie pracują wewnątrz. Zwykłe demo i runtime pozostają bez zmian.
- Możliwość zmiany: po GL tryb może pozostać dev-only lub zostać usunięty bez wpływu na renderer operacyjny.
