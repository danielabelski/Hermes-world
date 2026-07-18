# 13 — Status startowy Build Week

## Zamrożony punkt startowy

- Baseline commit: `b80b89d771457e6d6c515cda51e4d480f85245e1`.
- Baseline tag: `pre-build-week-baseline-2026-07-13`.
- Pierwszy commit projektu: `3b6754aedf4338997a0b445a4b7fce20f8d89c57`.
- 51 commitów aplikacji powstało przed 13 lipca 2026, 18:00 Europe/Warsaw.
- Branch konkursowy: `build-week/hermes-world`.
- Produkcyjny `main`: oddzielny, niezmieniony i czysty podczas zamknięcia dokumentacji.

## Stan dokumentacji

Polska dokumentacja provenance, zasad, sesji, decyzji, architektury, testów, dowodów, licencji, bezpieczeństwa i procedury pracy jest kompletna dla punktu startowego. Główny dokumentacyjny commit: `2b7a40fd6e3f69d42608b2302f2ec1fcd82d94fe`; commit snapshotu: `2b1e3e71665ff2214b62b14170f1cec49d04fb4f`. Końcowe wyniki walidacji są zapisane w dzienniku i rejestrze testów.

## Co jest pre-existing

Mapa, renderer, 12 agentów, waypointy/routing, statusy, demo event pipeline, choreografia, environmental life i mobile UI należą do baseline sprzed Submission Period. Hermes OS CAT jest własnym wcześniejszym projektem autora. Hermes Agent jest zewnętrznym runtime/CLI, bez wykrytego vendoringu. Wszystkie wizualne assety projektu są AI-generated original project assets.

## Meaningful extension rozpoczęta po baseline

```text
real Hermes event
→ adapter
→ normalizacja stanu
→ live transport
→ widoczna zmiana agenta w świecie mobilnym
```

Część prezentacyjna i semantyczna została wykonana po starcie w commitach `08ad9aa`, `4d5870e`, `3f03073` i `fdb75f4`: żywa woda i atmosfera, infrastruktura sterowana realną telemetrią oraz audytowalny nervous system runu. Następny test musi objąć pełny live Hermes E2E; nie należy przedstawiać pre-submission demo pipeline jako nowej pracy konkursowej.

## Aktualne ryzyka

1. Pierwszy extension istnieje na demo, lecz wymaga GL oraz testu z live Hermes runtime.
2. Finalny `/feedback` Session ID zostanie wybrany po powstaniu większości core functionality.
3. Brak prywatnego remote/off-device backupu.
4. Dostęp jurorski, finalne notices bundla, środowisko testowe, angielskie materiały, film i Devpost są zadaniami przed submission.

## Start następnego bloku

Wykonaj trzyminutową procedurę z [12_PROCEDURA_PRACY_OD_TERAZ_PL.md](12_PROCEDURA_PRACY_OD_TERAZ_PL.md), potwierdź branch `build-week/hermes-world`, a następnie przeprowadź pełny test live Hermes E2E pierwszego extension. Nie powtarzaj audytu baseline i nie przenoś zmian na produkcję bez GL.

## Aktualizacja handoffu — 2026-07-15 04:56 Europe/Warsaw

- Aktualny funkcjonalny HEAD przed dokumentacyjnym checkpointem: `a754475c1f2bc0181592ee703ba687624914fc40`.
- Cinematic interiors mają zoptymalizowane cold/warm entry; niewidoczna mapa nie wykonuje presentation clock ani ambient scheduling, ale realny SSE pozostaje podłączony.
- Wdrożono evidence-backed obecność agentów: pełny Kowal w Kuźni i Uczony w Archiwum, wspólny renderer, prawdziwe sprite’y mapowe, lokalne trasy oraz klikany drill-down.
- `isInside` gwarantuje pojedynczą własność renderu; initial snapshot, stale task i historyczne Success nie mogą wymyślić podróży ani świeżego zdarzenia.
- Citadel/Sanctum pozostają zablokowane do czasu zweryfikowania wewnętrznych tras; Watcher prawidłowo pracuje na zewnętrznym observation point.
- Walidacja automatyczna: 109/109 testów, lint, world-life validator, build i HTTP/cache benchmark PASS. Finalne estetyczne GL/RL agentów na 393×852 pozostaje ręczne.
- Najbliższy meaningful krok po GL: pełny live Hermes E2E z rzeczywistym eventem i evidence ID, następnie ewentualne aktywowanie kolejnego wnętrza tylko po potwierdzeniu prawdziwego routingu. Produkcji nie zmieniać bez osobnego GL.

## Aktualizacja handoffu — 2026-07-15 11:40 Europe/Warsaw

- Funkcjonalny HEAD: `ba85507`; branch `build-week/hermes-world`.
- Kowal jest wzorcem mobile-first: map-only korekta 1.10, czytelny ciężki profil, zachowana fizyczna skala wnętrza, cień i anchor stóp. `Working` nie kasuje indywidualnego kontrastu roli.
- Wszystkie 12 ról korzysta z centralnej macierzy widoczności/tonalności/cienia i jednego renderera; canvasy mapowe są ograniczone testem do 40–49 px.
- Uczony ma czytelniejszą mapę i Archiwum. Zwiadowca zachowuje prawdziwą zewnętrzną pozycję i pochyloną pozę obserwacji; marker nie odkleja się od sylwetki.
- Mapa i wnętrze współdzielą jeden kontrakt task/evidence. Nie ma już ścieżki, w której mapa ukrywa agenta, a wnętrze nie potrafi go przejąć.
- Automatyczna walidacja: 112/112 testów, lint, world-life validator, build i truth audit PASS. Finalne estetyczne GL/RL 393×852 pozostaje ręczne z powodu błędu integracji przeglądarki Codexa.
- Produkcyjny `main`: `7f586fe19f0f48dcdbee06aee573a3caf0689784`, czysty i nietknięty.
- Po GL: wykonać pełny live Hermes E2E z realnym `evidenceEventId`. Kolejne wnętrza aktywować wyłącznie po dowiedzeniu prawdziwej trasy; nie przenosić zmian na produkcję bez osobnej decyzji autora.

## Aktualizacja handoffu — 2026-07-15 12:45 Europe/Warsaw

- Funkcjonalny HEAD: `32d93f0`; branch `build-week/hermes-world`.
- Do manualnego GL/RL dodano demo-only macierz 12/12 agentów we wnętrzach: `?demo=1&interiorReview=1`. Strzałki przełączają role i pokoje, a `IDLE/PRACA` porównuje dwa podstawowe stany.
- Tryb QA nie emituje tasków, eventów, evidence ani stanów operacyjnych. Prawdziwy renderer wnętrz nadal wymaga dowiedzionego ownership.
- Walidacja: 115/115 testów, lint, world-life validator i build PASS; pierwszy fail kosztownego `backdrop-filter` został naprawiony przed checkpointem.
- **Obowiązkowy krok po GL agentów we wnętrzach:** utworzyć pełny off-device recovery package do Google Drive. Pakiet ma zawierać źródła i assety, komplet historii/branchy/tagów jako `git bundle --all`, aktualną dokumentację Build Week, manifest wersji, sumy SHA-256 i krótką instrukcję odtworzenia. Nie umieszczać sekretów, prywatnych `.env`, cache ani `node_modules`; zależności odtwarzać deterministycznie z lockfile. Zweryfikować archiwum próbą listowania i checksumą przed przekazaniem autorowi.
- Produkcja Correct v1 pozostaje nietknięta; backup wykonać dopiero po percepcyjnym GL/RL i finalnych mikroregulacjach rosteru.

## Aktualizacja handoffu — 2026-07-15 13:20 Europe/Warsaw

- Po manualnym RL Komnaty Kasztelan został zwiększony do 1,34, a Rycerz do maksymalnej bezpiecznej skali review 1,45. Kuźnia i Archiwum pozostają zatwierdzonym wzorcem percepcyjnym; skale mapowe nie zostały zmienione.
- Audyt potwierdził, że `PRACA` wcześniej była przeważnie statyczną pojedynczą pozą z praktycznie niewidocznym bobem. Wspólny `MapAgentSprite` ma teraz pięć lekkich transform-only rytmów pracy według istniejącego behavior type, działających na mapie i we wnętrzach tylko przy `visualState=work`.
- Nie dodano fake Working, tasków, eventów, timerów per agent, rasterów ani nowego renderera. `prefers-reduced-motion` wyłącza ruch centralnie.
- Walidacja: 119/119 testów, lint, world-life validator, build oraz HTTP 200 PASS. Końcowa estetyczna ocena Komnaty i czytelności ruchu pracy na telefonie pozostaje manualnym gate’em autora.
- Produkcyjny `main`: `7f586fe19f0f48dcdbee06aee573a3caf0689784`, czysty i nietknięty.
- Po finalnym GL nadal obowiązuje pełny recovery ZIP + `git bundle --all`, manifest, SHA-256 i instrukcja odtworzenia przed dalszym rozszerzaniem zakresu.

## Aktualizacja handoffu — 2026-07-15 13:38 Europe/Warsaw

- Skale i animacje agentów otrzymały GL autora. Ostatni RL kompozycji wycentrował Pazia w Komnacie oraz Zwiadowcę i Herolda w Obserwatorium (`x=50`) bez zmiany skali, Y, anchoru, routingu lub prawdy operacyjnej.
- Walidacja po korekcie: 120/120 testów, lint i build PASS; bundle bez wzrostu. Finalny gate dotyczy wyłącznie manualnego odbioru centrowania.
- Po finalnym GL wykonać w tej kolejności:
  1. pełny recovery ZIP, `git bundle --all`, manifest wersji, SHA-256 i test odtworzenia/listowania;
  2. kontrolowany diff demo ↔ produkcja i plan promocji wyłącznie zatwierdzonego zakresu;
  3. przeniesienie zmian na produkcję bez naruszenia konfiguracji 24/7, Tailscale, portów, API i danych;
  4. pełny audyt produkcyjny: testy, lint, build, cold/warm load, bundle, HTTP/cache, mobile 393×852, desktop, pamięć, console errors oraz realny Hermes event pipeline;
  5. produkcyjne GL dopiero po wszystkich PASS; dalsze zmiany i eksperymenty nadal prowadzić wyłącznie na demo/Build Week.
- Nie traktować promocji jako prostego kopiowania całego worktree. Zachować produkcyjne sekrety, deployment i konfigurację; integrować zatwierdzone commity lub precyzyjny diff po audycie.

## Aktualizacja handoffu — 2026-07-15 13:48 Europe/Warsaw

- Autor wydał finalne **GL** po ręcznej ocenie telefonu: pełny roster, skale, role-aware animacje pracy i końcowe centrowanie są zatwierdzone.
- Zamknięty punkt demo przed backupem: branch `build-week/hermes-world`, commit `e85c6c1c8f27118cda47f8e3649025694ddc0426`, 120/120 testów, lint, build i HTTP 200 PASS.
- Następny obowiązkowy krok: utworzyć i zweryfikować pełny recovery package z ZIP, `git bundle --all`, manifestem, SHA-256 i instrukcją odtworzenia. Dopiero później wolno rozpocząć selektywną promocję.
- Produkcja ma otrzymać wszystko z zatwierdzonego zakresu, ale jej konfiguracja 24/7, Tailscale, porty, API, dane i sekrety pozostają źródłem prawdy. Po wdrożeniu obowiązuje pełny audyt testów, bundla, cold/warm load, HTTP/cache, mobile, desktop, pamięci, konsoli i realnego pipeline’u Hermesa.
- Dalsze eksperymenty po promocji nadal prowadzić wyłącznie na demo/Build Week.

## Aktualizacja handoffu — 2026-07-15 14:10 Europe/Warsaw

- Pełny recovery package przed promocją został utworzony, odtworzony próbnie i zweryfikowany. Kopia na Pulpicie: `Hermes_Citadel_FULL_RECOVERY_2026-07-15_GL.zip`, 306,93 MiB, SHA-256 `aa1c67d04413b1cfd2a558c5bfd959d6dfe39bbcd3bc945831ad79c2f169ff40`.
- Bundle obejmuje wszystkie lokalne branche i tagi, w tym produkcyjny `main` sprzed promocji oraz pełny Build Week. Dwa źródłowe snapshoty i dwa gotowe buildy stanowią dodatkowe ścieżki odzyskania.
- Można rozpocząć audyt różnic i kontrolowaną promocję. Przed pierwszą zmianą produkcji utworzyć jednoznaczny tag/checkpoint obecnego `main`; nie nadpisywać konfiguracji usługi, Tailscale, portów, API ani sekretów.

## Aktualizacja handoffu — 2026-07-15 15:56 Europe/Warsaw

- Zatwierdzony Build Week został bezpiecznie promowany fast-forwardem na produkcyjny `main` do `be61d2d`; tag starego Correct v1 to `production-correct-v1-before-build-week-promotion-2026-07-15`. Produkcja 4175, backend 8787, watchdog i publiczny Funnel pozostały działające.
- Audyt prawdy wykazał, że world hub/SSE i wszystkie wizualne reakcje istniały, ale adapter nie był uruchomiony w produkcyjnej usłudze, więc wymaganie „każda wiadomość powoduje ruch” nie było jeszcze spełnione E2E.
- Na branchu Build Week dodano bezpośredni, evidence-backed edge wbudowanego czatu: potwierdzony `stream_id` i realne eventy SSE publikują kolejno Assigned/Thinking/Working/Waiting/Success/Critical. Treść rozmowy nie jest kopiowana, kliknięcie nie emituje stanu, a błąd wizualizacji nie przerywa Hermesa.
- Automatyczna walidacja: 123/123 testów, lint i build PASS; demo ingestion i replay SSE PASS; niezalogowany endpoint panelowy 401 PASS. Poprawka nie została jeszcze promowana na produkcję.
- Następna kolejność: commit atomowego edge → realny zalogowany chat smoke na demo → pełny cold/warm/mobile audit → tylko po PASS fast-forward produkcji → realny chat smoke na 4175 → zapis benchmarków i snapshot Build Week.

## Aktualizacja handoffu — 2026-07-15 17:14 Europe/Warsaw

- Autor wykrył po promocji dwie regresje odbiorcze produkcji: bardzo wolny, niekompletny cold-start oraz pełne niebieskie przewody przypominające debug/GPS. Poprzedniego niedomkniętego audytu nie traktować jako PASS.
- Na branchu Build Week naprawiono kolejność ładowania: responsive map preload z HTML, mapa przed efektami, początkowe sprite’y przed całą warstwą agentów, brak osieroconych cieni i markerów. Globalne oczekiwanie na `decode()` nie jest używane.
- Pełne tła przewodów usunięto; aktywne są tylko krótkie pakiety i lokalny ślad 6% trasy. Nie zmieniono waypointów, FSM, danych ani semantyki eventów.
- Automatycznie przechodzą 125/125 testów, lint, world-life validator i build. Autor potwierdził manualny cold/warm mobile **PASS / GL**: kompletny świat pojawia się natychmiast, bez zauważalnej fazy ładowania.
- Poprawkę cold-startu zapisano jako `6a8d13e59e95124b7a33b624ac18f6a438b97370`; wcześniejszy evidence-backed real chat edge to `ee58011dd0a03fa136d343126ca66728a7ec2361`.
- Produkcyjny `main` nadal jest na `be61d2d`. Następny krok: snapshot i commit dowodów → fast-forward produkcji → real chat smoke i pełna kontrola produkcyjna.

## Aktualizacja handoffu — 2026-07-15 17:55 Europe/Warsaw

- Produkcyjny `main` zawiera real chat SSE edge, atomowy cold-start oraz canonical launch i wskazuje `19f925e84e8d5d4810b6e38b91dde90db324c0b1`. Rollback przed tą serią zmian: tag `production-before-real-chat-cold-start-2026-07-15` na `be61d2d`.
- Automatyczne testy kodu, build, endpointy, SSE transport, cache headers i pojedynczy listener przechodzą. Publiczny HTTPS odpowiada 200.
- Manualny test starej ikony ujawnił nieobjęty wcześniejszym audytem historyczny shell/launch `?demo=1`, pustą mapę i `0/0` agentów. Nie zaliczać produkcji jako final PASS.
- Naprawa 4175 wymusza `/?demo=1 → /`; użytkownik musi jednorazowo otworzyć `/reset-client.html`, aby usunąć stary Service Worker/cache. Następny gate: brak etykiety demo i 12 agentów na telefonie, a dopiero potem prawdziwa wiadomość chat i dowód sekwencji world SSE.
- Po zamknięciu produkcji kolejnym zakresem na demo ma być map polish: dedykowane assety i naprawdę widoczny, płynny przepływ wody, następnie selektywne detale WOW bez regresji FPS, czasu startu lub czytelności observability.

## Aktualizacja handoffu — 2026-07-16 07:45 Europe/Warsaw

- Zweryfikowany Build Week live-runtime: `5ff6a68e19bb9d83e2060feb7e26f708dca49fd1`. Produkcyjny odpowiednik 1:1: `b9aedf217f4746ea5328bc66bc55f854b8959e02` na `main`; zakres aplikacyjny ma zero różnic.
- Naprawiono właściwą przyczynę pustego świata: frontend nie uznaje już samego HTTP 200 za logowanie, nie uruchamia live bridge przed `logged_in: true`, a produkcja nie może pozostać pod historycznym `?demo=1`. Demo nadal pozostaje oddzielnym, jawnym fixture.
- Publiczny adres produkcji: `https://hermes-os-panel.tail03d525.ts.net:10000/`. Jedno ukryte zadanie serwera wskazuje port 4175 i katalog produkcyjny; nie uruchamiano Chrome ani wielu runnerów.
- Automatyczna walidacja: 130/130 testów, lint i build PASS; publiczny root/auth/SSE PASS; 302 `?demo=1 → /` PASS; niezalogowane profiles 401 PASS; invalid event source 403 PASS.
- Następny obowiązkowy gate: autor loguje się na telefonie, potwierdza realny roster i domeny, a następnie wysyła jedną prawdziwą wiadomość do Hermesa. Oczekiwany łańcuch: potwierdzony Hermes `stream_id` → panel publisher → world event SSE → ruch Cytadeli/Kasztelana → terminalny Success albo Critical bez fake eventów.
- Dopiero po tym manualnym authenticated smoke można oznaczyć produkcję jako finalny E2E PASS. Kolejny rozwój wizualny nadal wyłącznie na demo/Build Week.

## Aktualizacja handoffu — 2026-07-16 10:17 Europe/Warsaw

- Produkcyjny `main` wskazuje `01e5b09`. Commity bloku: `0bf2464` (ochrona rosteru przy luce danych), `812398e` (kontrakty Hermes WebUI), `90fee4e` (realne sesje → agenci i wnętrza), `01e5b09` (brakujące role jako uczciwy Offline).
- Prawdziwe źródło danych to Hermes WebUI 8787 przez same-origin proxy Cytadeli. Hermes OS CAT nie jest backendem; posłużył wyłącznie jako wcześniejsza referencja interfejsu.
- `profile.is_active` nie oznacza pracy. Waiting/Working/Success wynikają z rzeczywistych pól sesji i edge’ów streamu. Brakujący profil nie znika i nie pracuje — pozostaje `offline`.
- Wszystkie 12 ról korzysta z jednego renderera oraz evidence-gated wejść do pięciu wnętrz. Nie ma podwójnego ownership sprite’a ani wejścia bez zgodnego task/evidence.
- Walidacja: 136/136 testów, lint, world-life validator i build PASS. Serwowany bundle `index-C1P_53PB.js`; dokładnie jeden listener 4175; publiczny auth Tailscale 200.
- **Jedyny otwarty gate tego zakresu:** zalogowany autor wysyła prawdziwą wiadomość i potwierdza na telefonie: właściwy agent rusza, wchodzi do przypisanego wnętrza, status kończy się Success albo Critical, a chronione liczniki/logi/crony/sesje pokazują realne wartości. Bez tego nie oznaczać pełnego authenticated E2E jako PASS.
- Dalszy rozwój wizualny i eksperymenty pozostają wyłącznie na `build-week/hermes-world`; produkcję zmieniać tylko po GL i pełnym preflight.

## Aktualizacja handoffu — 2026-07-16 10:50 Europe/Warsaw

- Produkcyjny HEAD: `b600192`. Ostatnia poprawka zmniejsza maksymalną obserwacyjną latencję sesji z 60 s do około 1 s bez zwiększania częstotliwości pozostałych endpointów i bez wielokrotnych renderów danych z cache.
- Finalny artifact: `index-ClaSbR_q.js`; 136/136 testów, lint, validator i build PASS; jeden listener 4175.
- Do pełnego zamknięcia pozostaje wyłącznie rzetelny test autora na zalogowanym telefonie: prawdziwa wiadomość → właściwy agent → wnętrze → Success/Critical oraz realne dane domen. Nie oznaczać go jako PASS przed obserwacją.

## Aktualizacja handoffu — 2026-07-16 11:18 Europe/Warsaw

- Produkcyjny HEAD: `c9a3205`; commity naprawcze: `27bf29a` (spójne live snapshoty i lokalne awarie domen) oraz `c9a3205` (usunięcie ukośnych pasów `telemetry-rain`).
- Różnica względem Hermes OS CAT została domknięta w modelu odporności: Cytadela zachowuje ostatni poprawny stan domen osobno, nie usuwa rosteru podczas równoległego odświeżania i nie rozłącza całego świata z powodu awarii opcjonalnych logów/cronów/inwentarzy. Globalny health nadal uczciwie reaguje na utratę rdzeniowych profili lub metryk.
- Nie zmieniono Hermes OS CAT, Hermes WebUI, serwera, API, portów, Tailscale ani procesu 24/7. Jeden listener 4175 serwuje publicznie `index-DTndlvuC.js`; root i auth odpowiadają HTTP 200.
- Walidacja automatyczna: 139/139 testów, lint, world-life validator i build PASS; fingerprint publiczny zgodny z lokalnym buildem; HTML `no-store`.
- Otwarty gate: autor odświeża zwykły zapisany adres produkcyjny i potwierdza przez kilka cykli odświeżania, że 12 ról nie znika, status nie przechodzi fałszywie Offline, nie ma ukośnych pasów i UI pozostaje płynne. Następnie jedna prawdziwa wiadomość ma potwierdzić agent → wnętrze → terminalny stan. Nie oznaczać E2E jako PASS przed tą obserwacją.

## Aktualizacja handoffu — 2026-07-16 12:04 Europe/Warsaw

- Aktualny branch demo: `build-week/hermes-world`; HEAD funkcjonalny: `6d0e073bb75a939dedf8660e1ce3538a5945a117`.
- Nowy zakres pozostaje wyłącznie na demo i nie został promowany: `67b03c8` rozdziela surowe logi od czytelnej narracji, `5aa7e22` dodaje ciągłą maskowaną wodę z własnym assetem autora, `6d0e073` scala SSE i wzmacnia lifecycle mobile.
- Automatyczny gate: 136/136 testów, lint, world-life validator i build PASS. Build: 875 modułów, 2,77 s; JS 420,45 kB / 129,06 kB gzip; CSS 76,73 kB / 16,48 kB gzip; woda 35,08 kB.
- Produkcyjny `main`, serwer 4175, Tailscale, Hermes WebUI, API i proces 24/7 pozostają nietknięte przez ten pass.
- Następny gate to wyłącznie manualny odbiór demo: widoczny stały przepływ wody na właściwych powierzchniach, brak ukośnych pasów, górny ticker jako raw logs, dolny panel jako czytelne komunikaty, płynne wejścia/wyjścia wnętrz, poprawny powrót z tła i brak regresji szybkości.
- Bez jednoznacznego GL autora nie wolno promować żadnej z tych zmian na produkcję.

## Aktualizacja handoffu — 2026-07-16 13:10 Europe/Warsaw

- Wersja wody z commita `5aa7e22` otrzymała manualny **RL**; przybliżone regiony zostały całkowicie zastąpione, nie tylko przygaszone.
- Aktualny funkcjonalny HEAD demo: `539144663bf789e1e5ad71d25cb4f40458222e25`. Woda korzysta z pikselowych masek wynikających z realnej geometrii map mobile/desktop i dwóch lekkich warstw transform-only.
- Automatyczny gate: fokus 24/24, pełne 136/136 testów, lint, validator i build PASS. Main JS jest mniejszy niż przed zmianą; nowe binarne zasoby runtime mają łącznie około 91,6 kB.
- Produkcja nadal nietknięta. Manualny test nowej wody na telefonie pozostaje jedynym otwartym gate tego passu.
- Po GL wody następny meaningful zakres pozostaje na demo: wzmocnienie widocznego łańcucha jednego prawdziwego eventu oraz uczciwego ambientu. Nie generować fake Working/Success; nie budzić niewłaściwych agentów; zachować jeden `evidenceEventId` i istniejącą architekturę directorów.
- Szczegółowe instrukcje wznowienia znajdują się na samej górze `NEXT_WINDOW_HANDOFF.md`.

## Aktualizacja handoffu — 2026-07-18 14:45 Europe/Warsaw

- Demo otrzymało minimalną naprawę kompletności dolnego feedu: taski agentów, wszystkie trwałe ukończenia cronów, delegacje/eventy SSE, warning/error i wyniki pozostają w jednej osi czasu zamiast wzajemnie się usuwać.
- Ręczny symptom wejściowy: widoczny wyłącznie „Paź zakończył zadanie…”, brak czterech dzisiejszych cronów i ostatniego wykonania około 12:00.
- Polling zachowuje teraz wcześniejsze autorytatywne eventy SSE, historia jest deduplikowana po ID i ograniczona do 40 pozycji. Dolny kanał rotuje realne wpisy z ostatnich 24 godzin i pokazuje godzinę; surowy górny ticker pozostaje osobnym kanałem.
- Automatyczny gate: 170/170 testów, lint, validator, `git diff --check` i build PASS; bundle demo `index-D42vLeMo.js` odpowiada HTTP 200.
- Produkcja pozostaje nietknięta na `958b9da08bee9613900e902b3da558aadef826e8`. Następny gate: autor otwiera demo i potwierdza, że widzi komunikat Pazia oraz wszystkie dzisiejsze crony w dolnej rotacji/arkuszu aktywności.
