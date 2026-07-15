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
