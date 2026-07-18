# 02 — Dziennik Build Week

## BW-2026-07-15-025 — Kompletny cinematic interior VFX suite

- Czas Europe/Warsaw: 2026-07-15 01:33–03:25.
- Czas UTC: 2026-07-14 23:33 – 2026-07-15 01:25.
- Branch/startowy HEAD: `build-week/hermes-world` / `36c1ed1`.
- Cel: zastąpić odziedziczone z mapy i kodowo rysowane hotspoty jedenastoma dedykowanymi efektami pasującymi do pięciu cinematic interior plates, bez obciążania startu mapy i bez zmian produkcji.
- Generowanie: dziesięć brakujących źródeł wygenerowano pojedynczo, każde z właściwym wnętrzem jako referencją. Razem z wcześniej zaakceptowanym ogniem powstał zestaw 11 efektów: Cytadela 2, Archiwum 2, Watcher 2, Sanctum 2 i Kuźnia 3. Nie uruchamiano równoległych generatorów ani ciężkich procesów wieloinstancyjnych.
- Pipeline: źródło chroma-key 4×2 → alpha cleanup → lokalny despill → fixed-pivot normalization → source strip 2048×256 → runtime strip 1024×128 RGBA. Oryginały, deterministyczne pochodne i wersje runtime mają osobne ścieżki oraz SHA-256.
- Integracja: `CinematicInteriorPlate` importuje wyłącznie `building-interior-effects`; wnętrza nie importują już żadnego `world-effects`. Efekty mapy pozostają nadal używane przez mapę główną i nie zostały usunięte z produktu.
- Semantyka: animacje reagują na istniejące fazy oraz realne evidence events. Nie dodano operational state, fake Working ani fake Success. Iskry Kuźni są widoczne tylko przy fazie pracy/alertu.
- Warstwowanie: dedykowane hotspoty są zakotwiczone na fizycznych elementach ilustracji, mają lokalne clipping/maski i dziedziczą z-index sceny. Warstwa efektów używa tego samego mikroskalowania co plansza, co usuwa dryf względem architektury.
- Wydajność: wszystkie runtime stripy mają po 1024×128 RGBA i mniej niż 250 kB; łączny budżet efektów wynosi około 0,87 MB, ale pojedyncze wejście pobiera tylko efekty aktywnego wnętrza. Szacowany zimny transfer: Cytadela ~424 kB, Archiwum ~491 kB, Watcher ~578 kB, Sanctum ~506 kB, Kuźnia ~495 kB; Kuźnia spadła z ~795 kB.
- Walidacja: 102/102 testów PASS; lint PASS; `validate:world-life` PASS; build PASS (866 modułów, 7,92 s); `git diff --check` PASS. Test assetowy weryfikuje liczbę, PNG signature, format RGBA, rozdzielczości, budżety per-file i budżet łączny.
- Audyty równoległe: dwa lekkie subtaski read-only sprawdziły anchory/hotspoty oraz budżety first-open; nie generowały assetów, nie uruchamiały serwerów i nie modyfikowały kodu.
- Demo: jeden istniejący serwer na porcie 4176; mapa oraz wszystkie pięć bezpośrednich URL-i zwracają HTTP 200. Produkcja Correct v1 pozostaje nietknięta.
- Ograniczenie dowodowe: kontroler wbudowanej przeglądarki Codexa nie zainicjalizował się (`Cannot redefine property: process`), dlatego automatycznego desktop/mobile visual PASS nie zapisano. Autor potwierdził, że desktop wygląda dobrze; finalne GL/RL telefonu przez Tailscale pozostaje otwarte.
- Snapshot przed commitem: `20260715T012153Z-git-snapshot.txt`.
- Sesja: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol; narzędzie obrazu pozostaje opisane bez wymyślania nieujawnionej nazwy modelu.

Dokument append-only. Korekty są nowymi wpisami, a nie cichą zmianą historii.

## BW-2026-07-13-001 — Zabezpieczenie provenance i systemu dowodów

- Czas Europe/Warsaw: 2026-07-13, od około 20:00
- Czas UTC: 2026-07-13, od około 18:00
- Cel: read-only audyt oficjalnych zasad, Git, sesji Codexa i dowodów; utworzenie polskiej dokumentacji roboczej.
- Faktycznie wykonano: zweryfikowano oficjalne źródła; ustalono commit baseline; rozdzielono pracę pre/post; przeanalizowano dwa główne wątki Codexa i modele `turn_context`; skatalogowano sześć screenów; rozpoczęto dokumentację i skrypt snapshotów.
- Pliki: wyłącznie `docs/build-week/**` i `scripts/build-week/capture-evidence.sh`; kod aplikacji nietknięty.
- Commit: brak — zgodnie z poleceniem commit wymaga osobnego potwierdzenia.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`.
- Model: GPT-5.6 Sol; wcześniejsze fragmenty wątku zawierają też GPT-5.6 Luna.
- Decyzje: baseline `b80b89d`; brak automatycznego tagu; CodexBar nie jest dowodem modelu bieżącej sesji; screenshoty pozostają oryginalne i wewnętrzne do czasu redakcji.
- Testy: w tym bloku nie uruchamiano aplikacji; planowana walidacja dokumentów, składni skryptu i `git diff --check`.
- Rezultat: dokumentacyjny stan post-submission bez zmiany funkcjonalności produktu.
- Problemy: brak remote; brak LICENSE i pełnego manifestu assetów; brak post-submission commita.
- Następny krok: zatwierdzenie dokumentacji, ewentualny annotated tag baseline i osobny documentation-only commit po decyzji człowieka.
- Dowody: `PRE-SESSION-001`, `PRE-SESSION-002`, `PRE-IMG-001`–`PRE-IMG-006`, pierwszy snapshot `GIT-SNAPSHOT-001`.

## BW-2026-07-13-002 — Walidacja dokumentacji i korekta snapshotu

- Czas Europe/Warsaw: 2026-07-13 20:53+
- Czas UTC: 2026-07-13 18:53+
- Cel: zweryfikować integralność dowodów i narzędzia capture-evidence.
- Faktycznie wykonano: potwierdzono SHA-256 wszystkich sześciu kopii względem manifestu; sprawdzono składnię Bash; uruchomiono skrypt; poprawiono przenośne wyliczenie strefy Europe/Warsaw; zachowano wcześniejszy błędny snapshot i opisano korektę zamiast zacierać historię.
- Zmienione pliki: wyłącznie `docs/build-week/**` i `scripts/build-week/capture-evidence.sh`.
- Commit: brak.
- Sesja: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Testy: hash 6/6 zgodny; `bash -n` PASS; capture-evidence PASS; wyszukiwanie sekretów w nowych dokumentach — brak trafień; trailing whitespace — brak; produkcyjny worktree `main` nadal czysty.
- Rezultat: kompletna dokumentacja robocza gotowa do decyzji o tagu i documentation-only commicie.
- Następny krok: decyzja człowieka o tagu baseline i commicie; nie wykonano ich automatycznie.
- Dowody: `GIT-SNAPSHOT-001`–`GIT-SNAPSHOT-003`, `SHA256SUMS.txt`.

## BW-2026-07-13-003 — Korekta strategii licencyjnej

- Czas Europe/Warsaw: 2026-07-13, po rozpoczęciu Submission Period.
- Cel: rozdzielić prawa do własnego kodu, licencje zależności, provenance assetów i notice’y.
- Decyzja człowieka: Hermes World pozostaje prywatny i nie otrzymuje licencji open-source; repo zostanie udostępnione jurorom prywatnie.
- Korekta wcześniejszego wpisu: brak `LICENSE` własnego projektu nie jest blockerem submission. Blockerem byłby brak dostępu jurorskiego albo naruszenie licencji komponentów zewnętrznych.
- Audyt: nie wykryto skopiowanego kodu NousResearch Hermes Agent; integracja używa zewnętrznego runtime/CLI. Techniczny shell Hermes OS CAT jest własnym kodem pre-existing.
- Pliki: wyłącznie dokumentacja i notice’y; kod aplikacji nietknięty.
- Commit/push: brak.
- Snapshot: `20260713T192557Z-git-snapshot.txt`.

## BW-2026-07-13-004 — Korekta provenance assetów i prywatności dowodów

- Czas: 2026-07-13 po 18:00 Europe/Warsaw / po 16:00 UTC.
- Decyzja autora: wszystkie wizualne elementy Hermes World i CAT są AI-generated original project assets; brak historycznego promptu nie oznacza zewnętrznego źródła.
- Wykonano: usunięto sprzeczne ryzyka; oryginały 6 screenshotów przeniesiono do ignorowanego katalogu; utworzono 6 osobnych redakcji; zachowano i zweryfikowano SHA-256.
- Prywatność: oryginały nie są przygotowane do commita; kopie redagowane przeszły kontrolę wizualną.
- Kod aplikacji: 0 zmian.

## BW-2026-07-13-005 — Zamknięcie dokumentacji, baseline i branch

- Czas: 2026-07-13 około 22:00 Europe/Warsaw / 20:00 UTC.
- Wykonano: ujednolicono dokumenty 00–13, notices i provenance; utworzono pełny manifest 83 dostępnych sesji; sprawdzono linki, duplikaty, daty, strefy, hashe, sekrety, whitespace i zakres zmian.
- Baseline: `b80b89d771457e6d6c515cda51e4d480f85245e1`.
- Tag: `pre-build-week-baseline-2026-07-13` wskazuje dokładnie baseline.
- Branch: utworzono `build-week/hermes-world` z baseline; wcześniejsze branche i produkcyjny `main` nie zostały zmienione.
- Commit: `docs(build-week): establish provenance and evidence system` — hash zostanie zapisany w kolejnym append-only wpisie po wykonaniu.
- Następny krok: snapshot po commicie, drugi mały commit dowodowy i clean-tree validation.

## BW-2026-07-13-006 — Dokumentacyjny commit i snapshot

- Czas Europe/Warsaw: 2026-07-13 22:07+.
- Commit: `2b7a40fd6e3f69d42608b2302f2ec1fcd82d94fe` — `docs(build-week): establish provenance and evidence system`.
- Zakres: 44 dozwolone pliki; 0 zmian kodu aplikacji; prywatne oryginały poza Git.
- Snapshot po commicie: `20260713T200743Z-git-snapshot.txt`, branch `build-week/hermes-world`, baseline ref rozwiązuje się do `b80b89d…`.
- Korekta narzędzia: stan tree jest od tej chwili pobierany przed utworzeniem pliku wyjściowego, dzięki czemu czysty input nie jest błędnie raportowany jako dirty przez sam snapshot.
- Następny krok: mały commit snapshotu i finalna clean-tree validation.

## BW-2026-07-13-007 — Zamknięcie systemu dowodowego

- Czas Europe/Warsaw: 2026-07-13 22:09+.
- Commit snapshotu: `2b1e3e71665ff2214b62b14170f1cec49d04fb4f` — `chore(build-week): record initial evidence snapshot`.
- Clean-tree test: PASS w izolowanej lokalnej kopii; sekcja wejściowego `git status --short` zawierała 0 wierszy, a kopia testowa została usunięta.
- Finalny zakres od baseline: wyłącznie `.gitignore`, `THIRD_PARTY_NOTICES.md`, `docs/build-week/**` i `scripts/build-week/**`.
- Produkcyjny `main`: `7f586fe19f0f48dcdbee06aee573a3caf0689784`, czysty i niezmieniony.
- Remote: brak; backup poza urządzeniem pozostaje ręcznym działaniem.
- Ten wpis zamyka dokumentację startową; jego commit ma komunikat `docs(build-week): close documentation handoff` i jest widoczny bezpośrednio w Git.

## BW-2026-07-13-008 — Start pierwszego meaningful extension

- Czas Europe/Warsaw: 2026-07-13 22:39+.
- Czas UTC: 2026-07-13 20:39+.
- Branch: `build-week/hermes-world`; startowy HEAD: `0a625df7dd0da128a9de63b3f117977aa916d843`.
- Cel bloku: zbudować żywą infrastrukturę miasta sterowaną prawdziwą telemetrią oraz czytelny nervous system prawdziwych eventów, bez generowania fake `Working` lub `Success`.
- Zakres pierwszego etapu: stały przepływ wody osadzony na realnych kanałach mapy oraz widoczne na telefonie chmury i cienie chmur.
- Decyzja człowieka: praca wyłącznie na demo; każda faza ma otrzymać testy, snapshot i czytelny commit Build Week; produkcja pozostaje nietknięta.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Snapshot startowy: `20260713T203947Z-git-snapshot.txt`.
- Status: rozpoczęto implementację po oficjalnej granicy Submission Period.

## BW-2026-07-13-009 — Living infrastructure i nervous system prawdziwego eventu

- Czas Europe/Warsaw: 2026-07-13 22:39–23:16.
- Czas UTC: 2026-07-13 20:39–21:16.
- Branch: `build-week/hermes-world`.
- Wykonano: stały przepływ wody dopasowany osobno do kanałów mobile i portu/fontanny desktop; duże chmury, cienie chmur i spokojną mgłę; niezależne intensywności atmosfery, infrastruktury, eventu i alert suppression; sterowanie rytmem Cytadeli, Kuźni, Archiwum, Sanctum i Watchera rzeczywistymi odczytami systemu, activity journal, zadaniami, sesjami oraz cronami.
- Prawdziwy lifecycle: jeden `lifecycleEvidenceId` prowadzi sekwencję brama → Cytadela → właściwy subsystem; `triggerEventId` zachowuje dokładny event etapu; Archiwum uruchamia zapis wyłącznie po prawdziwym `success`.
- Bezpieczeństwo semantyczne: telemetria infrastruktury nie zapisuje `operationalState`, nie zwiększa licznika aktywnych agentów i nie emituje fake `Working` ani `Success`.
- Commity: `08ad9aa` — woda i atmosfera; `4d5870e` — infrastruktura sterowana telemetrią; `3f03073` — nervous system realnego eventu; `fdb75f4` — korekta widoczności chmur po teście mobile.
- Walidacja: lint PASS; 87/87 testów PASS; `validate:world-life` PASS; build PASS (844 moduły); 393×852 PASS; 4 aktywne ścieżki wody; animowany cień chmury; 0 błędów konsoli.
- Znaleziona i naprawiona regresja: pierwszy cień chmury był zbyt ciemny i zasłaniał centrum mapy; obniżono jego intensywność do subtelnej lokalnej zmiany światła bez usuwania dużej amplitudy ruchu.
- Produkcja: nietknięta; lokalny serwer walidacyjny był jeden i został wyłączony po ocenie.

## BW-2026-07-14-010 — Mobile motion performance pass

- Czas Europe/Warsaw: 2026-07-14 00:02+.
- Czas UTC: 2026-07-13 22:02+.
- Branch/startowy HEAD: `build-week/hermes-world` / `d91f2fa5bc1a3513a672884022991c41ac995d2f`.
- Cel: usunąć źle wyglądające ruchome pasy i zmniejszyć koszt stałego ambientu bez osłabiania prawdziwych eventów.
- Audyt wejściowy 393×852: 49 równoległych animacji CSS; animowane elementy z `blur()` obejmowały około 192 548 px, czyli 57,5% powierzchni viewportu; 2 szerokie jasne pasy chmur i 4 szerokie miękkie pasy kanałów wody.
- Wykonano: usunięto jasne `cloud-wisp` oraz drugi kosztowny cień chmury; usunięto szerokie 16-pikselowe pasy wody; wodę pozostawiono jako cztery krótkie refleksy poruszające się po istniejących kanałach.
- Wynik statycznego porównania po zmianie: 42 animacje; 77 027 px animowanego blur, czyli około 23,0% viewportu; spadek powierzchni kosztownego blur o około 60%; 0 szerokich pasów chmur i 0 szerokich pasów wody.
- Ochrona wolniejszych urządzeń: warstwa mierzy realne `requestAnimationFrame` aktywnego klienta co 2 sekundy; poniżej 52 FPS redukuje wyłącznie dekoracyjny ambient, poniżej 42 FPS przechodzi w tryb minimalny. Prawdziwy `WorldOperationsLayer`, alerty i eventy nie podlegają redukcji.
- Walidacja: 88/88 testów PASS; `validate:world-life` PASS; lint PASS; build PASS (844 moduły, 3,46 s); serwer demo HTTP 200.
- Produkcja: nietknięta. Zmiany wyłącznie na branchu demo/Build Week.
- Snapshot startowy: `20260713T214031Z-git-snapshot.txt`.

## BW-2026-07-14-011 — Korekta percepcyjna chmury i wody

- Czas Europe/Warsaw: 2026-07-14 00:15+.
- Czas UTC: 2026-07-13 22:15+.
- Powód: po skutecznej optymalizacji użytkownik potwierdził odzyskaną szybkość, ale ruch chmury i wody stał się zbyt subtelny.
- Wykonano bez dodawania elementów: jedna chmura ma mocniejszy gradient i większy zasięg, ale nie używa `blur()`; każda istniejąca ścieżka wody pokazuje dwa krótkie refleksy zamiast jednego prawie niewidocznego punktu.
- Koszt: liczba ścieżek i animacji bez wzrostu; kontrola aktywnej sceny wykazała 0 px animowanego blur w warstwie środowiskowej objętej audytem.
- Walidacja: 88/88 testów PASS; world-life PASS; lint PASS; build PASS (844 moduły, 3,78 s).
- Produkcja: nietknięta; zmiany wyłącznie demo/Build Week.
- Snapshot wejściowy: `20260713T221311Z-git-snapshot.txt`.

## BW-2026-07-14-012 — Maskowany przepływ wody i usunięcie pasów kompozytora

- Czas Europe/Warsaw: 2026-07-14 00:35–01:25.
- Czas UTC: 2026-07-13 22:35–23:25.
- Branch/startowy HEAD: `build-week/hermes-world` / `0f75829117e870d819b526f89d3806d1a90e4a54`.
- Powód: użytkownik wskazał poruszający się pas po lewej stronie mapy oraz brak czytelnego przepływu rzeczywistych powierzchni wody.
- Audyt wizualny 393×852 wykazał dwa niezależne problemy: pełnoekranowy cień chmury oraz błędy kompozytora przy ukrywaniu warstw UI w trybie ambient.
- Wykonano: całkowicie usunięto wadliwy pełnoekranowy cień chmury; usunięto liniowe SVG udające przepływ; dodano lokalne, małe powierzchnie CSS ograniczone maskami do lewej i prawej wody, górnych kanałów oraz desktopowego portu/kanałów.
- Ruch wody: nieregularne refleksy przesuwają się wewnątrz nieruchomych masek. Próbka 1,8 s wykazała zmianę położenia o około 22–31 px. Warstwa nie kopiuje całej mapy, nie używa animowanego `blur`, filtrów ani pełnoekranowego blend mode.
- Tryb ambient: niekrytyczne panele są usuwane przez `display:none`, zamiast pozostawiać transformowane/backdrop-filter warstwy powodujące czarne wycięcia. Header, komunikat i sygnał stanu pozostają widoczne.
- Walidacja: 88/88 testów PASS; lint PASS; `validate:world-life` PASS; build PASS (843 moduły); mobilny ambient po 7,6 s bez czarnych pasów.
- Produkcja: nietknięta; zmiany wyłącznie na demo/Build Week.

## BW-2026-07-14-013 — Pogoda sterowana realną telemetrią hosta

- Czas Europe/Warsaw: 2026-07-14 01:30–02:05.
- Czas UTC: 2026-07-13 23:30 – 2026-07-14 00:05.
- Branch/startowy HEAD: `build-week/hermes-world` / `d8f7e3d6f2e1f59ad5918984674378f7f28207db`.
- Cel: wykorzystać istniejące realne odczyty CPU i temperatury jako spokojny język pogody świata, bez zmiany event pipeline’u, API, serwera ani stanów operacyjnych.
- Wykonano: centralny `telemetryWeatherDirector` z wygładzaniem EWMA, histerezą i minimalnym czasem przebywania w zwykłym progu; natychmiastowa reakcja pozostaje zarezerwowana dla potwierdzonego skoku awaryjnego. Warstwa prezentacyjna rozróżnia `clear`, `cloudy`, `rain`, `storm` i `unknown`.
- Semantyka: pogoda nie zapisuje `operationalState`, nie zwiększa licznika aktywnych agentów i nie emituje `Working`, `Success`, `Warning` ani `Critical`. CPU może zmieniać rytm świata, ale nie udaje zdarzenia Hermesa.
- Mobile/performance: użyto ograniczonych lokalnych chmur i deszczu bez pełnoekranowego przesuwającego się pasa; adaptive quality zachowuje jeden tani, podstawowy ruch chmury także w trybie minimalnym.
- Dane: wyłącznie istniejące `system.cpuPercent` i `system.temperatureC`; brak zmian w Hermes OS CAT, `server.js`, endpointach i produkcji.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Walidacja: testy reżysera obejmują spokojny stan, dwell, skok awaryjny, histerezę oraz brak telemetrii; pełny lint, testy, world-life validation i build zakończyły się powodzeniem w tym samym bloku.
- Następny krok wykonany w ramach tej samej sesji: wzorcowe, nieinwazyjne wejście do jednego budynku — Kuźni.

## BW-2026-07-14-014 — Wzorcowe wejście do Kuźni Systemowej

- Czas Europe/Warsaw: 2026-07-14 02:05–02:44.
- Czas UTC: 2026-07-14 00:05–00:44.
- Branch/startowy HEAD: `build-week/hermes-world` / `7704220` po zamknięciu Fazy 2.
- Cel: sprawdzić prosty, rozszerzalny mechanizm wejścia do jednego budynku bez nowej mapy, przebudowy świata ani utraty kontekstu przestrzennego.
- Wykonano: hotspot Kuźni powiązany z zamrożonym semantic node `forge_entrance` / `mobile_forge_entrance`; obszar dotyku 52×62 px; rozróżnienie tapnięcia od przeciągania; wnętrze ładowane leniwie i renderowane portalem ponad istniejącym UI.
- Mapa pozostaje zamontowana, a jej animacje są pauzowane pod otwartym wnętrzem. Po powrocie zachowane są zoom, przesunięcie i stan świata; test wykazał identyczną macierz transformacji przed wejściem i po wyjściu.
- Wnętrze pokazuje istniejące CPU, temperaturę, liczbę aktywnych buildów, bieżące zadanie i źródło połączenia. Prezentacja rozróżnia `standby`, `working`, `warning`, `critical` i `offline`, ale nie emituje nowych stanów i nie wymyśla `Success`.
- Dostępność: focus trap, Escape, przywrócenie focusu do hotspotu, `inert`/`aria-hidden` dla świata pod modalem oraz opisany przycisk powrotu.
- Mobile 393×852: hotspot `x=76.625`, `y=385.692`, `52×62`; wejście otworzyło fazę `working`, focus trafił do „Wróć do mapy Cytadeli”; wnętrze zmieściło się w pionowym layoucie.
- Świadomie aktywna jest tylko Kuźnia. Wspólny shell i czyste funkcje prezentacji są bazą do rozszerzenia po GL; niedokończone wnętrza nie są po cichu aktywowane.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Produkcja: nietknięta; brak zmian `server.js`, API, Hermes OS CAT, deploymentu i geometrii mapy.
- Następny krok po GL: wynieść stan wnętrza do wspólnego kontrolera i dopisać kolejne budynki na tym samym kontrakcie.

## BW-2026-07-14-015 — Zamknięcie Faz 2–3 i checkpoint dowodowy

- Czas Europe/Warsaw: 2026-07-14 03:09+.
- Czas UTC: 2026-07-14 01:09+.
- Korekta zakresu czasu: wpisy 013–014 opisują implementację i walidację do 02:44; formalne commity, snapshot i clean-tree validation zakończono po tej godzinie i są udokumentowane tutaj bez nadpisywania wcześniejszych wpisów.
- Commit Fazy 2: `7704220` — `feat(build-week): drive weather from real telemetry`.
- Commit Fazy 3: `cf49347` — `feat(build-week): add Forge interior vertical slice`.
- Snapshot: `20260714T010938Z-git-snapshot.txt`, Session ID `019f4f11-14e9-70e0-8d61-26226257864c`.
- Końcowa walidacja bloku: 97/97 testów PASS; world-life PASS; lint PASS; build PASS (848 modułów); `git diff --check` PASS.
- Produkcja Correct v1, jej serwer, API, Hermes OS CAT i geometria mapy pozostały nietknięte.
- Stan decyzji: demo jest gotowe do oceny GL/RL. Bez GL nie rozszerzać mechanizmu na pozostałe budynki.

## BW-2026-07-14-016 — Visual integration polish wnętrza Kuźni

- Czas Europe/Warsaw: 2026-07-14 12:19+.
- Czas UTC: 2026-07-14 10:19+.
- Branch/startowy HEAD: `build-week/hermes-world` / `6fec34084f28a6eedb582fcbb2cded202fe5b38a`.
- Decyzja autora: mechanizm wejścia/wyjścia został zaakceptowany; dalsza praca dotyczy jakości wizualnej wnętrza i rozszerzenia wspólnego systemu na kolejne budynki.
- Wykonano: izometryczną posadzkę, kamienno-metalową ścianę, asymetryczne łuki, wspólną podstawę maszyny, częściową okluzję kół, pivot młota, obudowę pieca, przewód energii Hermes i foreground. Ogień pozostaje ciepłym akcentem procesu, a cyan oznacza infrastrukturę systemową.
- Semantyka: tempo mechanizmu wynika z istniejącego stanu `standby` / `working` / `warning` / `critical` / `offline`; nie dodano nowego operational state ani fałszywego eventu.
- Wydajność: 65 elementów DOM we wnętrzu, 9 animowanych elementów i 4 lokalne filtry przy 393×852; animacje ograniczone do transform/opacity, mapa pozostaje pauzowana pod wnętrzem.
- Walidacja wizualna 393×852: PASS — scena zyskała wyraźne plany, perspektywę, wspólną architekturę i czytelny punkt pracy bez zmiany mechanizmu wejścia.
- Produkcja: nietknięta; zmiany wyłącznie demo/Build Week.

## BW-2026-07-14-017 — Wspólny system pięciu wnętrz subsystemów

- Czas Europe/Warsaw: 2026-07-14 12:20–12:55.
- Czas UTC: 2026-07-14 10:20–10:55.
- Branch/startowy HEAD: `build-week/hermes-world` / `3da2925`.
- Cel: rozszerzyć zaakceptowany mechanizm Kuźni na główne budynki bez pięciu osobnych rendererów, bez zmiany geometrii mapy i bez syntetycznych stanów operacyjnych.
- Wykonano: centralny rejestr wejść i semantyki dla Kuźni, Archiwum, Cytadeli, Watchera i Sanctum; jeden leniwie ładowany shell wnętrza; pięć odmiennych komór wizualnych; wspólny model wejścia, focus trapu, powrotu i przywracania focusu.
- Dane: każda komora wyprowadza fazę i metryki wyłącznie z istniejących tasków, alertów, lifecycle, telemetrii, aktywności, cronów i źródeł modeli. Usunięto fallback, który mógł podpisać budynek niepowiązaną aktywnością globalną.
- Mapa: użyto istniejących zamrożonych semantic nodes; Sanctum korzysta z już renderowanego landmarku środowiskowego. Nie zmieniono waypointów, tras, wejść agentów ani depth zones.
- Kontrola 393×852: wszystkie cztery nowe wnętrza otwierają się i wracają do mapy; focus wraca do właściwego hotspotu; etykiety wejść zostały wizualnie wyciszone w spoczynku i wzmacniają się na hover/focus.
- Walidacja: 100/100 testów PASS; pełny lint PASS; build PASS (848 modułów, 18,23 s); `git diff --check` PASS.
- Produkcja: nietknięta; zmiany wyłącznie demo/Build Week.

## BW-2026-07-14-018 — Lekki globalny język pogody

- Czas Europe/Warsaw: 2026-07-14 12:56+.
- Czas UTC: 2026-07-14 10:56+.
- Branch/startowy HEAD: `build-week/hermes-world` / `d257223`.
- Cel: sprawić, aby zmiana obciążenia CPU/temperatury była odczuwalna na całej mapie, bez kosztownego pełnoekranowego ruchu i bez naruszania płynności.
- Wykonano: jedna nieruchoma warstwa tonalna obejmująca cały stage i reagująca na istniejące tiery `clear`, `cloudy`, `rain`, `storm`; istniejące powierzchnie wody przyspieszają wraz z presją telemetrii; chmury i lokalny deszcz zachowują dotychczasowy ograniczony budżet.
- Koszt stały: 0 nowych timerów, 0 nowych keyframes, 0 nowych cząstek, 0 filtrów i 0 animacji pełnoekranowych. Globalna warstwa zmienia jedynie `background-color`/`opacity` przy faktycznej zmianie tieru.
- Semantyka: źródłem pozostają wyłącznie istniejące `system.cpuPercent` i `system.temperatureC`; warstwa nie emituje stanów operacyjnych ani alertów.
- Produkcja: nietknięta; zmiany wyłącznie demo/Build Week.

## BW-2026-07-14-019 — Architectural identity pass wnętrz subsystemów

- Czas Europe/Warsaw: 2026-07-14 13:08–13:48.
- Czas UTC: 2026-07-14 11:08–11:48.
- Branch/startowy HEAD: `build-week/hermes-world` / `ac5b3f8`.
- Problem: Archiwum, Cytadela, Watcher i Sanctum były funkcjonalne, lecz zbyt podobne — ciemne, abstrakcyjne komory o przewadze cyan, bez natychmiastowej informacji o funkcji miejsca.
- Wykonano: Archiwum przebudowano na skryptorium z regałami, fizycznym kodeksem i złotą taśmą zapisu; Cytadelę na gotycką salę dowodzenia z chorągwiami, stołem-mapą i podium; Watchera na otwarte obserwatorium z parapetem i dużym mosiężnym teleskopem; Sanctum na alchemiczne regeneratorium z aptekarskimi półkami, fiolkami, basenem i organicznym obiegiem.
- Kierunek wizualny: materiały kamień/drewno/mosiądz/tkanina dominują nad neonem; cyan pozostaje wyłącznie sygnałem infrastruktury, zgodnie z językiem mapy i zaakceptowaną Kuźnią.
- Zakres zamrożony: bez zmian wejść, współrzędnych, routingu, telemetrii, kontraktu danych, FSM, serwera, API i produkcji.
- Kontrola 393×852: każde wnętrze jest rozpoznawalne bez tekstu; wspólny header i readout zachowują hierarchię produktu, a geometria pomieszczeń pozostaje odmienna.
- Produkcja: nietknięta; zmiany wyłącznie demo/Build Week.

## BW-2026-07-14-020 — Depth and material pass wnętrz subsystemów

- Czas Europe/Warsaw: 2026-07-14 13:49–14:30.
- Czas UTC: 2026-07-14 11:49–12:30.
- Branch/startowy HEAD: `build-week/hermes-world` / `c95006b31674c006728e7121ace802dcb47f745f`.
- Cel: zachować zaakceptowaną tożsamość Archiwum, Cytadeli, Watchera i Sanctum, ale usunąć wrażenie płaskich ilustracji przez wspólną, tanią warstwę głębi i materiałów.
- Wykonano: wspólny `RoomDepth` z łukiem sklepienia, bocznymi ścianami, perspektywiczną posadzką i lokalnym stożkiem światła; każda komora ma własną paletę kamienia, rytm fug i materiał podłoża.
- Archiwum otrzymało cieplejszy kamień i drewno, cienie regałów, światło kodeksu oraz cięższy foreground; Cytadela — kamienną salę dowodzenia, cienie chorągwi, podium i stołu-mapę osadzoną na posadzce; Watcher — otwartą wieżę, czytelniejszy metal teleskopu i cień parapetu; Sanctum — zielony kamień, odbicie basenu, cienie aptecznych półek i organicznego fokusu.
- Warstwowanie: elementy tła pozostają za bryłą pomieszczenia, landmarki operacyjne na planie środkowym, a foreground zasłania dolną krawędź sceny. Nie zmieniono wejść, routingu, telemetrii, FSM ani kontraktu danych.
- Budżet: 0 nowych rasterów, 0 nowych timerów i 0 nowych deklaracji animacji/filtrów w kontrakcie `interior-depth`; główny JS pozostał 407,99 kB / 124,74 kB gzip. Zmiana dotyczy tylko lazy-loadowanego wnętrza: CSS 45,13 kB / 11,02 kB gzip, JS 14,19 kB / 3,92 kB gzip.
- Walidacja: `npm.cmd test` PASS 101/101; lint PASS; `validate:world-life` PASS; build PASS (848 modułów); `git diff --check` PASS. Test kontraktowy wymaga czterech warstw głębi i potwierdza brak dodatkowej animacji w nowym kontrakcie.
- Ograniczenie dowodowe: automatyczne sterowanie przeglądarką Codexa nie zainicjalizowało się w tej sesji; nie zapisano fałszywego wizualnego PASS. Ostateczny odbiór estetyczny pozostaje do GL/RL użytkownika na telefonie.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Produkcja: nietknięta i czysta na branchu `main`; zmiany wyłącznie demo/Build Week.

## BW-2026-07-14-021 — Premium spatial integration, atomowe progi i audyt telemetrii CAT

- Czas Europe/Warsaw: 2026-07-14 20:42–21:21.
- Czas UTC: 2026-07-14 18:42–19:21.
- Branch/startowy HEAD: `build-week/hermes-world` / `5fcbea00cdd879086b9eb5dc401b91f031a507ae`.
- Cel: zwiększyć przestrzenność czterech wnętrz bez kosztu płynności, naprawić pikselowe znikanie agentów przy wejściu oraz ustalić, które realne metryki Hermes OS CAT można uczciwie wykorzystać w subsystemach.
- Audyt CAT wykonano read-only. Potwierdzono wspólny backend Hermes i równoważne endpointy dla sesji/kosztu, logów, cronów, modeli, providerów, pamięci oraz metryk hosta. Nie zmieniono CAT, `server.js` ani API.
- Granica semantyczna: koszt, logi, historia cronów, tokeny, modele, providery, fallbacki, CPU/RAM/temperatura są realnymi wejściami. Health score, cron success, model effectiveness i provider health są agregatami/heurystykami produktu i muszą być tak opisywane. `/memory` zwraca pamięć, lecz nie stanowi RAG health; brak potwierdzonego endpointu Obsidian/index health.
- Wejście agentów: dla budynków z `workVisibility: inside` pełna sylwetka przechodzi na warstwę fasady, a następnie znika jako całość po logicznym progu; przy wyjściu pojawia się jako całość po przekroczeniu progu. Trasy, waypointy, FSM i anchory pozostają bez zmian.
- Wnętrza: wspólny system otrzymał materialny tylny łuk, żebra sklepienia, lokalną plamę światła i cięższe boczne progi. Archiwum dostało fizyczną lampę i nawę do kodeksu; Cytadela — oculus i reprezentacyjną oś sali; Watcher — masywne przesłony obserwatorium; Sanctum — organiczny baldachim i materialny ołtarz. Światło jest lokalnie modulowane istniejącą fazą operacyjną.
- Budżet: 0 nowych rasterów, schedulerów, timerów i keyframes. Premium pass jest statyczny; mapa nadal jest pauzowana pod otwartym wnętrzem. Główny JS: 408,19 kB / 124,82 kB gzip; lazy interior JS: 15,35 kB / 4,04 kB gzip; lazy interior CSS: 51,16 kB / 12,21 kB gzip.
- Walidacja: 101/101 testów PASS; lint PASS; `validate:world-life` PASS; build PASS (848 modułów); `git diff --check` PASS. Finalna ocena estetyczna na 393×852 pozostaje GL/RL autora, ponieważ sterowanie przeglądarką Codexa nie było dostępne.
- Commity: `f099dcc` (`fix(build-week): make building thresholds hide agents atomically`), `1027a08` (`feat(build-week): deepen subsystem interiors with physical architecture`), `2e8b63c` (`test(build-week): lock premium interior spatial contract`).
- Snapshot startowy: `20260714T184519Z-git-snapshot.txt`.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Produkcja Correct v1 i branch `main`: nietknięte.

## BW-2026-07-14-022 — Cinematic subsystem interiors

- Czas Europe/Warsaw: 2026-07-14 23:26 – 2026-07-15 00:15.
- Czas UTC: 2026-07-14 21:26–22:15.
- Branch/startowy HEAD: `build-week/hermes-world` / `2513ddbfdab9404a6287fd48530e4470cb97e58b`.
- Cel: zastąpić płaskie, kodowo rysowane komory pięcioma spójnymi wnętrzami klasy cinematic, zachowując jeden renderer, realną telemetrię, wejścia/wyjścia i budżet mobile.
- Źródła: pięć pionowych ilustracji 1024×1280 wygenerowanych od zera dla Hermes World na polecenie autora. Wdrożono Cytadelę, Archiwum, Watchera, Sanctum i Kuźnię.
- Implementacja: wspólny `CinematicInteriorPlate` renderuje bazową ilustrację i lokalne, zakotwiczone hotspoty animacji. Efekty dotyczą fizycznych elementów sceny: kryształu, pierścieni, kodeksu, armilarium, soczewki, skanera, basenu, obiegu energii, pieca, dymu, iskier i linii produkcyjnej.
- Semantyka: faza i metryki nadal pochodzą z istniejącego kontraktu operacyjnego; `evidenceEventId` pozostaje dostępny dla prawdziwych eventów. Warstwa wizualna nie emituje fake Working ani Success.
- Mobile/desktop: scena zachowuje proporcje 4:5; na szerokim ekranie płyta jest wycentrowana na nieruchomym, ciemnym tle. Mapa jest pauzowana pod otwartym wnętrzem, a assety są ładowane dopiero po otwarciu drill-downu.
- Dostępność: zachowano portal, focus trap, Escape, przywracanie focusu, reduced motion i pełne znikanie agentów na progu budynku.
- Walidacja techniczna: 101/101 testów PASS; lint PASS; `validate:world-life` PASS; build PASS (854 moduły); `git diff --check` PASS.
- Bundle: główny JS 408,33 kB / 124,86 kB gzip; lazy interior JS 9,85 kB / 4,09 kB gzip; lazy interior CSS 17,51 kB / 4,26 kB gzip. Pięć płyt ma 244–349 kB każda i nie obciąża startu mapy.
- Ograniczenie dowodowe: automatyczna walidacja wizualna ujawniła i usunęła przenikanie mapy podczas pierwszej klatki wejścia; ostateczny odbiór estetyczny 393×852 pozostaje do GL/RL autora na telefonie.
- Commit funkcjonalny: `d16969e` (`feat(build-week): integrate cinematic subsystem interiors`).
- Następny etap po GL, niezaimplementowany w tej sesji: prawdziwa obecność małego agenta we wnętrzu wyłącznie wtedy, gdy stan świata potwierdza jego wejście; prosta trasa do stanowiska oraz kliknięcie otwierające drill-down techniczny.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol.
- Produkcja Correct v1 i branch `main`: nietknięte.

## BW-2026-07-15-023 — Audyt i optymalizacja pierwszego wejścia do wnętrz

- Czas Europe/Warsaw: 2026-07-15 00:23–00:43.
- Czas UTC: 2026-07-14 22:23–22:43.
- Branch/startowy HEAD: `build-week/hermes-world` / `62ad776313f437ee794b3bd3f591110f2b0f0868`.
- Środowiska: zmiany wyłącznie w osobnym repo/branchu demo Build Week; repo produkcyjne Correct v1 pozostaje odseparowane i nie otrzymuje zmian przed GL autora.
- Proces Codexa: snapshot przed zmianą, read-only audyt bundla i ścieżki ładowania, pomiar zimnych requestów, implementacja minimalnego passu, test kontraktowy, pełne testy/lint/walidacja/build i kolejny checkpoint.
- Benchmark: first-open pobiera tylko lazy JS/CSS, jedną aktywną planszę i efekty wybranego pokoju. Szacowany zimny transfer: Cytadela około 379 kB, Archiwum 393 kB, Watcher 379 kB, Sanctum 453 kB, Kuźnia 795 kB. Kuźnia jest najdroższa z powodu odziedziczonych stripów ognia, dymu i iskier (około 419 kB dodatku).
- Diagnoza: waterfall klik → lazy chunk → plansza; równoległe dekodowanie planszy i stripów; dwie pełnoekranowe animacje wejścia; `mix-blend-mode: screen` na wszystkich hotspotach; dodatkowy raster backdropu na mobile.
- Implementacja: kod i CSS wnętrza są dogrzewane przez `requestIdleCallback` po załadowaniu mapy bez pobierania pięciu JPG; plansza jest predekodowana po pointer/focus; hotspoty montują się dopiero po załadowaniu planszy; stripy mają niski priorytet; mobile nie renderuje duplikatu backdropu; usunięto pełnoekranowe scale/camera settle; screen blend pozostał wyłącznie na sprite'ach.
- Wynik builda: lazy interior JS 9,43 kB / 3,91 kB gzip (wcześniej 9,85 / 4,09); CSS 17,27 kB / 4,20 kB gzip (wcześniej 17,51 / 4,26). Main JS wzrósł o 1,27 kB przez manifest i preloader URL-i, bez automatycznego pobierania plansz.
- Strategia assetów: istniejące efekty mapowe zostaną usunięte atomowo dopiero po dostarczeniu dedykowanych efektów wnętrz. Przygotowano 11 promptów i wspólny kontrakt 8-klatkowych transparentnych stripów.
- Workflow generatywny: autor generuje każdy oryginalny asset osobno w ChatGPT, specjalnie dla Hermes World. Jest to świadomy podział pracy: ChatGPT służy do generowania bitmap bez obciążania limitu implementacyjnego Codexa, a Codex odpowiada za specyfikację, provenance, deterministyczną normalizację, integrację, benchmarki, testy i commity.
- Model sesji implementacyjnej: GPT-5.6 Sol. Assety ChatGPT pozostają klasyfikowane jako `AI-generated original project assets`; dokładny model generujący należy dopisać, jeśli interfejs go ujawni.
- Walidacja: 101/101 testów PASS; lint PASS; `validate:world-life` PASS; build PASS (855 modułów); `git diff --check` PASS.
- Commit funkcjonalny: `8f43378` (`perf(build-week): smooth first interior entry`).
- Produkcja: nietknięta; finalna percepcyjna ocena płynności na telefonie pozostaje do GL/RL autora.

## BW-2026-07-15-024 — Pierwszy dedykowany cinematic VFX: ogień Kuźni

- Czas Europe/Warsaw: 2026-07-15 00:47–01:32.
- Czas UTC: 2026-07-14 22:47–23:32.
- Branch/startowy HEAD: `build-week/hermes-world` / `7010990`.
- Decyzja autora: technicznie poprawny ogień przesłany wcześniej został odrzucony, ponieważ stylistycznie pasował do mapy, ale nie do cinematic wnętrza Kuźni. Nie został wdrożony ani zapisany jako finalny asset.
- Generowanie: GPT-5.6 Sol przygotował precyzyjny prompt i wykorzystał wbudowane generowanie obrazu z `forge-execution-hall.jpg` jako ścisłą referencją stylu, światła, materiałów i perspektywy. Wygenerowano wyłącznie jeden source sheet; nie uruchamiano równoległych generatorów.
- Pipeline: source 4×2 na płaskim chroma-key → helper `remove_chroma_key.py` → drugi, ciaśniejszy matte/despill pass → deterministyczny podział komórek → wspólna skala → identyczny baseline → source strip 2048×256 → runtime 1024×128.
- Narzędzie: dodano reprodukowalny `scripts/normalize-interior-vfx-sheet.py`; skrypt nie generuje treści, tylko porządkuje klatki, stabilizuje pivot i tworzy lekką pochodną runtime.
- Integracja: wnętrze Kuźni przestało importować mapowy `world-effects/forge-fire-strip.runtime.png`; korzysta z `building-interior-effects/forge-interior-fire-strip.runtime.png`. Ogień mapowy pozostaje nietknięty w warstwie świata.
- Wydajność: dedykowany runtime waży 65 025 B wobec 205 184 B poprzedniego stripu, czyli około 68% mniej. Osiem klatek ma jeden baseline i prawdziwy kanał alpha.
- Walidacja: 101/101 testów PASS; lint PASS; build PASS (856 modułów, 3,36 s poza sandboxem po powtarzalnym EPERM Vite); kontrakt testowy blokuje ponowny import mapowego ognia do wnętrza.
- Commit funkcjonalny: `7ed6f77` (`feat(build-week): add cinematic forge interior fire`).
- Ograniczenie: finalne dopasowanie wielkości i intensywności wymaga percepcyjnej oceny autora na realnym telefonie; produkcja pozostaje nietknięta.

## BW-2026-07-15-026 — Domknięcie wydajności cinematic interiors

- Czas Europe/Warsaw: 2026-07-15 01:36–03:36.
- Czas UTC: 2026-07-14 23:36 – 2026-07-15 01:36.
- Branch/startowy HEAD: `build-week/hermes-world` / `ef3ea43`.
- Cel: przed dodaniem agentów potwierdzić koszt zimnego i ciepłego wejścia do pięciu wnętrz oraz usunąć pracę niewidocznej mapy, bez pogorszenia jakości ilustracji i efektów.
- Audyt: aktywny pokój pobiera jeden lazy chunk, jedną planszę 1024×1280 i własny mały zestaw VFX; pozostałe cztery pokoje nie są pobierane. Szacowany zimny transfer aktywnego pokoju wynosi około 0,43–0,59 MB, ciepłe ponowne wejście korzysta z `Cache-Control: public, max-age=31536000, immutable`, a zdekodowany koszt aktywnej sceny wynosi około 6 MB.
- Implementacja: ukryta mapa zatrzymuje prezentacyjny zegar i Ambient Director na czas otwartego wnętrza; prawdziwy transport SSE pozostaje aktywny. Plansza ma wysoki priorytet pobrania, a VFX mogą zostać zdekodowane równolegle, pozostając niewidoczne do chwili gotowości planszy.
- Pomiar HTTP po buildzie: lokalny HTML 2 382 B / 0,0166 s; lazy chunk 14 558 B / 0,0177 s; plansza Kuźni 347 498 B / 0,0096 s przy ciepłym cache. Przez Tailscale: HTML 200 / 0,0067 s, plansza Kuźni 200 / 0,0077 s. Są to pomiary transferu/cache, nie browser-paint ani miarodajny FPS telefonu.
- Commit: `8a9de6a` (`perf(build-week): preload interior vfx and pause hidden world`).
- Produkcja: nietknięta; brak zmian serwera, API, Hermes OS CAT i deploymentu.

## BW-2026-07-15-027 — Evidence-backed agenci we wnętrzach

- Czas Europe/Warsaw: 2026-07-15 03:36–04:56.
- Czas UTC: 2026-07-15 01:36–02:56.
- Branch/startowy HEAD: `build-week/hermes-world` / `8a9de6a`.
- Cel: zbudować jeden wspólny system obecności agenta w cinematic interior bez portretów, duplikacji i fałszywego `Working`/`Success`/położenia.
- Wzorzec Kuźni: Kowal używa dokładnie tego samego prawdziwego sprite’u, anchoru przy stopach, cienia kontaktowego i gramatyki statusu co na mapie. Po potwierdzonym logicznym wejściu przechodzi krótką lokalną trasą do stanowiska, pracuje przy fizycznym punkcie iskier i opuszcza wnętrze zgodnie z istniejącym FSM.
- Wspólny renderer: `InteriorAgentPresence` korzysta z `MapAgentSprite`, `resolveMapAgentPresentation`, istniejących tasków, lifecycle, alertów i `evidenceEventId`. Kliknięcie agenta otwiera istniejący drill-down profilu, a kompaktowa karta pokazuje task i źródło dowodu.
- Atomowa własność renderu: `presentation.isInside` jest jedynym przełącznikiem map/interior. Gdy agent jest wewnątrz, `MapAgentLayer` w ogóle nie tworzy jego mapowego DOM; wnętrze nie pokazuje go przed progiem ani po wyjściu.
- Ochrona prawdy: pierwszy snapshot aktywnego taska nie odtwarza fikcyjnego początku podróży. Stare `done` bez wiarygodnego timestampu nie udaje świeżego `Success`. Przy nieświeżej domenie tasków agent wymaga świeżego evidence event.
- Routing: Kuźnia/Kowal i Archiwum/Uczony mają zweryfikowane `workVisibility: inside` i są aktywne. Watcher pozostaje prawdziwym zewnętrznym punktem obserwacyjnym. Cytadela i Sanctum nie mają jeszcze dowiedzionej trasy wewnętrznej, dlatego wspólny renderer świadomie ich nie pokazuje zamiast wymyślać lokalizację.
- Walidacja: 109/109 testów PASS, w tym pełny handoff Kowala mobile+desktop, wejście/praca/wyjście Uczonego, odrzucenie fake evidence i blokada trzech niezweryfikowanych pomieszczeń; lint PASS; `validate:world-life` PASS; build PASS, Vite 8.0.16, 868 modułów, 3,53 s; `git diff --check` PASS.
- Bundle po zmianie: lazy interior JS 14,55 kB / 5,73 kB gzip; lazy interior CSS 12,34 kB / 3,13 kB gzip; main JS 410,32 kB / 125,54 kB gzip. Nie dodano nowego rastera ani osobnego renderera per agent.
- Commity: `09c119b` (`feat(build-week): add evidence-backed interior agents`), `60ed803` (`fix(build-week): harden interior agent evidence`), `a754475` (`test(build-week): verify interior agent handoff`).
- Ograniczenie dowodowe: automatyczne sterowanie przeglądarką nie zainicjalizowało się w tej sesji (`Cannot redefine property: process`), dlatego finalne estetyczne GL/RL na 393×852 pozostaje świadomie oznaczone jako manualne, a nie fałszywy PASS.
- Sesja Codexa: `019f4f11-14e9-70e0-8d61-26226257864c`, GPT-5.6 Sol. Dwa lekkie audyty pomocnicze objęły wydajność i prawdziwe punkty routingu; implementację i integrację wykonał główny agent.
- Produkcja Correct v1: nietknięta; całość wyłącznie na demo/Build Week.

## BW-2026-07-15-028 — Agent perfection pass: Kowal jako wzorzec i pełny roster

- Czas Europe/Warsaw: 2026-07-15 10:54–11:40.
- Czas UTC: 2026-07-15 08:54–09:40.
- Branch/startowy HEAD: `build-week/hermes-world` / `8b5454a0b6db5aacf81f190d257728d57334841d`.
- Cel autora: nie akceptować pierwszego przybliżenia; doprowadzić Kowala do poprawnej widoczności mobile, a następnie zastosować jeden spójny kontrakt do wszystkich 12 ról bez powiększania portretów, fałszowania lokalizacji i duplikowania rendererów.
- Snapshot startowy: `20260715T085540Z-git-snapshot.txt`; Session ID `019f4f11-14e9-70e0-8d61-26226257864c`; model GPT-5.6 Sol.
- Audyt wizualny: wszystkie runtime sprite’y mają wspólny canvas 128×128, stopy na `y=124` i prawidłowy `footAnchorY=0.96875`. Perspektywa Y pozostała bez zmian. Zidentyfikowano różnice percepcyjnej powierzchni sylwetek oraz odklejone markery nad pochylonymi klatkami Uczonego i Zwiadowcy.
- Implementacja Kowala: map-only `mapVisibilityScale=1.10`, zachowany mniejszy rozmiar we wnętrzu, ciepła separacja krawędzi bez dużej aury, pełny cień kontaktowy i zachowanie tożsamości podczas `Working`. Stan pracy nie nadpisuje już profilu kontrastu roli.
- Pełny roster: centralna macierz 12 profili reguluje minimalnie mapową widoczność, tonalność i cień. Efektywna wysokość canvasa mapowego jest ograniczona testem do 40–49 px. Role nadal wynikają z własnej sylwetki, narzędzia i koloru.
- Markery: pozycja statusu uwzględnia rzeczywisty górny margines klatki; niższa poza Zwiadowcy z lunetą pozostaje semantyczną pozą, a nie jest sztucznie rozciągana.
- Atomowa własność: mapa i wnętrze korzystają z jednego `hasInteriorOwnershipEvidence`. Brak taska lub stale/offline bez świeżego dowodu pozostawia sprite na mapie; dopiero zgodny task/evidence przekazuje go wnętrzu. Usunięto stan pośredni „agent niewidoczny nigdzie”.
- Truth boundary: tylko Kowal→Kuźnia i Uczony→Archiwum mają potwierdzone `inside`. Watcher/Zwiadowca pozostaje przy realnym zewnętrznym punkcie obserwacyjnym; Cytadela i Sanctum pozostają bez wymyślonego agenta wewnątrz.
- Walidacja końcowa: `npm.cmd test` PASS 112/112; lint PASS; `validate:world-life` PASS; build PASS (Vite 8.0.16, 869 modułów, 2,87 s poza sandboxem po znanym EPERM pliku tymczasowego); `git diff --check` PASS.
- Bundle: main JS 412,55 kB / 126,26 kB gzip; lazy interior JS 14,47 kB / 5,72 kB gzip; lazy interior CSS 12,55 kB / 3,19 kB gzip. Nie dodano rasterów, timerów ani rendererów per rola.
- HTTP/cache: HTML ma `no-store`; hashowane assety mają `public, max-age=31536000, immutable`. Pomiary PowerShell są kontrolą serwera/cache, nie dowodem browser-paint ani FPS telefonu.
- Automatyczny podgląd w przeglądarce Codexa: **MANUAL ACTION REQUIRED** — integracja ponownie zwróciła `Cannot redefine property: process`; nie zapisano fałszywego PASS. Końcowa ocena 393×852 należy do autora przez działające demo/Tailscale.
- Commity: `b28a3e2` (`fix(build-week): perfect agent visibility and interior ownership`), `5e406ce` (`test(build-week): lock agent visibility matrix`), `ba85507` (`fix(build-week): preserve role visibility while agents work`).
- Produkcja: `main` na `7f586fe19f0f48dcdbee06aee573a3caf0689784`, czysty i nietknięty.

## BW-2026-07-15-029 — Percepcyjny review stanów i osadzenie Kowala w Kuźni

- Czas Europe/Warsaw: 2026-07-15 11:52–12:01.
- Czas UTC: 2026-07-15 09:52–10:01.
- Branch/startowy HEAD: `build-week/hermes-world` / `1973302d2d07b51bfcbe1945cba73dce42ffa902`.
- Wykonano dwa lokalne, tymczasowe render-review bez zmiany assetów aplikacji: macierz reprezentatywnych stanów wszystkich 12 ról na rzeczywistych fragmentach mapy oraz Kowal/Uczony w docelowej płycie 393×491. Pliki kontrolne usunięto po ocenie; nie zostały przedstawione jako screenshot przeglądarkowy.
- Wynik: wszystkie role pozostają rozpoznawalne w zakresie 40–49 px; niższe klatki pracy wynikają z pozy i narzędzia. Uczony jest czytelny przy stanowisku. Kowal miał poprawny rozmiar, ale na ciemnej linii produkcyjnej tracił lokalny kontrast.
- Korekta: bez powiększania sprite’a i bez halo dodano we wnętrzu Kuźni ten sam subtelny profil kontrastu/krawędzi, który chroni jego ciężką metalową sylwetkę na mapie.
- Walidacja: testy kontraktu wnętrz 11/11 PASS; lint PASS; `git diff --check` PASS; build PASS, 869 modułów, 3,29 s. Lazy CSS 12,76 kB / 3,22 kB gzip; main JS bez zmiany 412,55 kB / 126,26 kB gzip.
- Commit: `40282ed` (`fix(build-week): seat Kowal clearly inside the Forge`). Produkcja nietknięta.

## BW-2026-07-15-030 — Kontrolowany przegląd 12 agentów we wnętrzach

- Czas Europe/Warsaw: sesja rozpoczęta 2026-07-15 10:54; blok przeglądu obsady domknięty 12:45.
- Czas UTC: sesja rozpoczęta 2026-07-15 08:54; blok przeglądu obsady domknięty 10:45.
- Branch/startowy HEAD: `build-week/hermes-world` / `0370be5fd70cf72247a040ebd78e14fd9e90b6d9`.
- Problem odbiorczy: prawdziwy tryb wnętrza poprawnie pokazywał tylko agenta z potwierdzonym ownership task/evidence, dlatego autor nie miał jednego miejsca do percepcyjnej oceny rozmiaru, anchoru, kontrastu i pozy wszystkich 12 sprite’ów.
- Implementacja: dodano jawnie developerski `?demo=1&interiorReview=1`. Strzałki przełączają 12/12 ról, automatycznie otwierając jedną z pięciu istniejących płyt wnętrz; `IDLE/PRACA` pozwala porównać najważniejsze klatki. Tryb korzysta z tego samego `MapAgentSprite`, assetów, foot anchoru i cienia co świat.
- Granica prawdy: review nie tworzy taska, eventu, `evidenceEventId`, `Working`, `Success`, nie zmienia FSM ani liczników. Zwykłe demo i runtime nadal korzystają wyłącznie z `InteriorAgentPresence` oraz potwierdzonego ownership. Rycerz jest jawnie oznaczony jako przegląd w zastępczej sali Cytadeli, ponieważ osobne wnętrze ochrony nie istnieje.
- Wydajność: po pierwszym teście usunięto kosztowny `backdrop-filter`; panel QA używa statycznego półprzezroczystego tła. Nie dodano rasterów ani nowego renderera per postać.
- Walidacja: `npm.cmd test` PASS 115/115; lint PASS; `validate:world-life` PASS; build PASS (Vite 8.0.16). Main JS 414,63 kB / 126,97 kB gzip; lazy interior JS 16,16 kB / 6,19 kB gzip; lazy CSS 14,19 kB / 3,57 kB gzip.
- Commit funkcjonalny: `32d93f0` (`feat(build-week): add interior roster review`).
- Odbiór wizualny: **MANUAL ACTION REQUIRED** na telefonie; tryb powstał właśnie po to, aby autor mógł wydać GL/RL osobno dla każdej roli.
- Produkcja Correct v1: nietknięta.

## BW-2026-07-15-031 — RL skali: Rycerz i Obserwatorium Watchera

- Czas Europe/Warsaw: 2026-07-15 12:45–13:05.
- Autor wykonał ręczny przegląd 12/12 i wskazał dwa konkretne problemy: Rycerz Elitarny był zdecydowanie za mały, a postacie na planszy Watchera były umiarkowanie za małe. Kuźnia i Archiwum zostały zatwierdzone jako wzorzec percepcyjnej skali.
- Korekta wyłącznie w demo QA: Rycerz `1,12 → 1,40` oraz punkt stóp `y=79 → 80`; Zwiadowca `1,22 → 1,36`, Herold `1,24 → 1,38`, oba punkty stóp `y=76 → 78`. Skale mapowe, produkcyjny renderer, FSM, routing i evidence nie zostały zmienione.
- Usprawnienie review: po zamknięciu wnętrza i kliknięciu budynku tryb QA wybiera deterministycznie pierwszą przypisaną rolę tego pokoju, zamiast przenosić poprzednią postać do niewłaściwego wnętrza.
- Walidacja: 118/118 testów PASS; lint PASS; world-life validator PASS; build PASS. Main JS 414,74 kB / 126,99 kB gzip; lazy interior bez wzrostu 16,16 kB / 6,19 kB gzip; CSS bez wzrostu 14,19 kB / 3,57 kB gzip.
- Commit: `e3bf035` (`fix(build-week): rebalance interior roster scale`).
- Kolejny gate: manualne GL/RL Rycerza i Watchera na tym samym URL; produkcja nietknięta.

## BW-2026-07-15-032 — Czytelna praca ról i druga korekta Komnaty

- Czas Europe/Warsaw: 2026-07-15 13:05–13:20.
- Branch/startowy HEAD: `build-week/hermes-world` / `d952234`.
- Informacja autora z manualnego QA: Kasztelan w Komnacie nadal był trochę za mały, Rycerz wymagał jeszcze lekkiego podniesienia, a zmiana pozy `IDLE → PRACA` nie dawała zauważalnego ruchu.
- Audyt renderera potwierdził problem: zestawy mają pojedynczą klatkę `work`, a wspólny ruch pracy poza dwoma historycznymi wyjątkami ograniczał się do około `0,2 px` pionowego bobu i ringu. Na telefonie nie był to wiarygodnie widoczny ruch.
- Implementacja: jeden `MapAgentSprite` otrzymał transform-only gramatykę pracy według istniejącego `behaviorType`: build, research, monitoring, patrol i courier. Animacja działa na mapie oraz we wnętrzu wyłącznie przy prawdziwym `visualState=work`; nie tworzy stanu, taska, eventu ani osobnego timera.
- Dostępność i wydajność: wszystkie animacje używają wyłącznie `transform`; `prefers-reduced-motion` wyłącza je centralnie. Nie dodano rasterów, bibliotek ani renderera per rola.
- Komnata QA: Kasztelan `1,20 → 1,34` i `y=78 → 79`; Rycerz `1,40 → 1,45`, czyli do bezpiecznego maksimum wspólnego renderera. Skala mapowa i operacyjna nie zostały zmienione.
- Walidacja: 119/119 testów PASS; lint PASS; `validate:world-life` PASS; build PASS, 871 modułów. Main JS 414,78 kB / 127,01 kB gzip; lazy interior JS 16,16 kB / 6,19 kB gzip; lazy CSS 14,19 kB / 3,57 kB gzip.
- Demo HTTP: PASS 200 na istniejącym serwerze 4176. Automatyczne sterowanie kartą nadal niedostępne (`Cannot redefine property: process`); końcowe estetyczne GL/RL pozostaje manualne i nie jest fałszywie oznaczone jako PASS.
- Produkcja: `main` na `7f586fe19f0f48dcdbee06aee573a3caf0689784`, czysty i nietknięty.

## BW-2026-07-15-033 — Finalne centrowanie obsady QA

- Czas Europe/Warsaw: 2026-07-15 13:28–13:38.
- Branch/startowy HEAD: `build-week/hermes-world` / `2886983`.
- Autor zatwierdził skale i animacje wszystkich ról. Ostatni RL dotyczył wyłącznie kompozycji: Paź w Komnacie oraz Zwiadowca i Herold w Obserwatorium byli przesunięci za daleko w bok.
- Korekta demo-only: `default.x 47 → 50`, `prospecting.x 57 → 50`, `outreach.x 57 → 50`. Pozycja stóp Y, skala, anchor, cień, sprite, routing i operational state pozostały bez zmian.
- Granica prawdy: korekta dotyczy wyłącznie kontrolowanego `interiorReview`; normalny runtime nie otrzymał nowej obecności we wnętrzu ani zmiany lokalizacji.
- Walidacja: 120/120 testów PASS; lint PASS; build PASS, 871 modułów. Bundle bez wzrostu: main JS 414,78 kB / 127,01 kB gzip; lazy interior JS 16,16 kB / 6,19 kB gzip; CSS 14,19 kB / 3,57 kB gzip.
- Produkcja: nietknięta.
- Następna zatwierdzona kolejność po finalnym GL: pełny recovery backup → kontrolowana promocja zatwierdzonego zakresu na produkcję → szczegółowy diff, audyt i benchmarki produkcyjne → dalsze eksperymenty wyłącznie na demo.

## BW-2026-07-15-034 — Finalne GL obsady i zgoda na zabezpieczenie oraz promocję

- Czas Europe/Warsaw: 2026-07-15 13:48.
- Czas UTC: 2026-07-15 11:48.
- Branch/HEAD ocenione przez autora: `build-week/hermes-world` / `e85c6c1c8f27118cda47f8e3649025694ddc0426`.
- Autor wykonał końcową ocenę na telefonie po wycentrowaniu Pazia, Zwiadowcy i Herolda i wydał jednoznaczne **GL**: „jest zajebiście”. Tym samym zamknięto ręczny gate 393×852 dla skali, animacji pracy i kompozycji pełnego rosteru.
- Zatwierdzony zakres obejmuje wspólny renderer 12 ról, prawdziwe sprite’y, anchor stóp, cień kontaktowy, role-aware ruch `PRACA`, evidence-backed ownership wnętrz oraz demo-only macierz QA. Nie zmienia to granicy prawdy: normalne wnętrza pokazują wyłącznie agentów z potwierdzonym task/evidence i routingiem.
- Autor zatwierdził następną kolejność: pełny zweryfikowany recovery package → kontrolowany audyt różnic demo/produkcja → selektywna promocja zatwierdzonego zakresu → pełny audyt i benchmarki produkcyjne → małe poprawki regresji, jeśli będą konieczne.
- Produkcja w chwili GL nadal pozostawała czysta i nietknięta na `7f586fe19f0f48dcdbee06aee573a3caf0689784`.

## BW-2026-07-15-035 — Pełny zweryfikowany recovery package przed promocją

- Czas Europe/Warsaw: 2026-07-15 13:58–14:10.
- Czas UTC: 2026-07-15 11:58–12:10.
- Punkt wejściowy: `build-week/hermes-world` / `88f8ddc2ba9a087b49adf10090cc8bac249ce1f1`; produkcja `main` / `7f586fe19f0f48dcdbee06aee573a3caf0689784`; oba drzewa czyste.
- Preflight: `git fsck --full --strict` nie wykrył korupcji; cztery dangling blobs są nieosiągalnymi obiektami roboczymi, nie błędem historii. Skan śledzonych źródeł wykrył 0 plików z wysokoprawdopodobnym sekretem. Prywatne `.env`, cache i `node_modules` zostały świadomie wyłączone.
- Pakiet zawiera pełny `git bundle --all`, dwa niezależne snapshoty źródeł, build demo i build produkcji sprzed promocji, manifest, listę refów, instrukcję odtworzenia, raport weryfikacji oraz wewnętrzne SHA-256.
- Próba odtworzenia: bundle zweryfikowany jako kompletna historia, sklonowany do nowego repo, branch `build-week/hermes-world` przełączony poprawnie na `88f8ddc`; odtworzono 719 śledzonych plików. Wszystkie cztery ZIP-y wewnętrzne przeszły listowanie.
- Finalny plik na Pulpicie: `Hermes_Citadel_FULL_RECOVERY_2026-07-15_GL.zip`, 321 836 131 B / 306,93 MiB. SHA-256 źródła i kopii na Pulpicie są identyczne: `aa1c67d04413b1cfd2a558c5bfd959d6dfe39bbcd3bc945831ad79c2f169ff40`.
- Wynik: **PASS**. Bramka bezpieczeństwa przed audytem i promocją produkcji jest zamknięta.

## BW-2026-07-15-036 — Promocja GL na produkcję i domknięcie prawdziwego chat → world edge

- Czas Europe/Warsaw: 2026-07-15 14:10–15:56; czas UTC: 12:10–13:56.
- Po zweryfikowanym backupie wykonano bezpieczny fast-forward produkcyjnego `main` z Correct v1 `7f586fe` do zatwierdzonego zakresu Build Week `be61d2d`. Przed zmianą utworzono tag `production-correct-v1-before-build-week-promotion-2026-07-15`.
- Produkcyjna usługa 24/7 zachowała port 4175, istniejący watchdog, Tailscale Funnel i backend Hermesa 8787. Po kontrolowanym restarcie istnieje dokładnie jeden listener produkcji; `/`, `/api/system/metrics` i `/api/world/events/snapshot` odpowiadają HTTP 200.
- Audyt ujawnił ważną lukę: renderer, reducer, choreografia i SSE world hub działały, ale usługa produkcyjna uruchamiała wyłącznie `server.js`. Sidecar `hermes-world-event-adapter.mjs` nadal domyślnie publikował do demo 4176 i nie był uruchomiony, więc każda wiadomość z wbudowanego czatu nie miała gwarantowanego połączenia z wizualnym światem.
- Implementacja na branchu Build Week: po potwierdzonym `stream_id` wbudowany chat publikuje edge `stream_start`; kolejne eventy pochodzą wyłącznie z prawdziwego SSE Hermesa: `reasoning/thinking`, `tool`, `approval`, `done` i `apperror`. Każdy run zachowuje jeden uporządkowany łańcuch `evidenceEventId`; kliknięcie przycisku ani token tekstowy nie tworzą stanu świata.
- Prywatność i granica prawdy: treść wiadomości nie jest kopiowana do world hub. Endpoint panelowy wymaga ważnego cookie panelu i jawnego nagłówka źródła. Błąd publikacji wizualizacji nigdy nie przerywa prawdziwej rozmowy. `apperror` jest terminalnym Critical i nie może zostać później zamieniony w fałszywy Success.
- Walidacja demo: testy 123/123 PASS, lint PASS, build PASS; osobny test live endpointu potwierdził `assigned → thinking → success`, kolejność 0/1/2 i replay SSE. Niezalogowany panel POST zwraca 401. Testowy run powstał wyłącznie na demo i zostanie wyczyszczony restartem przed odbiorem.
- Produkcja nie otrzyma tej poprawki przed osobnym realnym chat smoke i pełnym powtórzeniem benchmarków.

## BW-2026-07-15-037 — Audyt regresji cold-startu i bramka gotowości świata

- Czas Europe/Warsaw: 2026-07-15 15:56–17:14; czas UTC: 13:56–15:14.
- Branch/startowy HEAD: `build-week/hermes-world` / `ee58011dd0a03fa136d343126ca66728a7ec2361`. Produkcyjny `main` pozostaje na `be61d2d014f9640b7450179c48fb791a8eb48cf6`.
- Audyt po promocji ujawnił realną regresję percepcyjną: w zimnym starcie widoczne były warstwy efektów, kryształy i cienie agentów przed mapą oraz rasterami postaci. Pełne semantyczne przewody infrastruktury wyglądały jak debugowa trasa GPS. Wcześniejszy niedomknięty browser audit nie został zaliczony jako PASS.
- Przyczyna: efekty środowiskowe montowały się bez oczekiwania na `onLoad` mapy, kontener sprite’a renderował cień i status przed pierwszym `img.onload`, a `.hermes-conduit` posiadał widoczne tło na całej długości. Mapa rozpoczynała pobieranie dopiero po uruchomieniu głównego modułu JS.
- Implementacja demo: responsive preload rozpoczyna pobieranie właściwej mapy już z HTML; mapa i 12 początkowych sprite’ów mają wysoki priorytet; warstwa agentów ujawnia się atomowo po gotowości początkowych obrazów; pojedynczy sprite nie pokazuje osieroconego cienia/markera; efekty świata montują się dopiero po mapie. Nie użyto blokującego globalnego `decode()`.
- Linie: pełne tło przewodów zostało usunięte. Przewód przechowuje wyłącznie geometrię, a widoczny jest tylko krótki 20 px pakiet. Ślad `data-transit` skrócono z 16% do 6% trasy; segmenty zajmują tylko lokalne otoczenie pakietu.
- Koszt startowy: mapa mobile 531 412 B, 12 początkowych klatek idle 159 758 B, główny JS 415,44 kB / 127,20 kB gzip, CSS 78,07 kB / 16,80 kB gzip. Lokalny serwer zwraca skompresowany JS w 0,053 s i mapę w 0,011 s; są to pomiary HTTP, nie browser-paint ani FPS telefonu.
- Walidacja automatyczna: 125/125 testów PASS; lint PASS; `validate:world-life` PASS; build PASS (871 modułów); `git diff --check` PASS. Serwowany build 4176 zawiera responsive preload, readiness gate i krótki ślad.
- Automatyczna kontrola karty: **NIEZALICZONA** — integracja Browser zwróciła `Cannot redefine property: process`, a izolowany CDP nie ukończył inicjalizacji. Nie zapisano fałszywego FPS ani cold-start PASS.
- Manualny test autora na telefonie: **PASS / GL** — cold-start załadował kompletny świat natychmiast, bez momentu widocznego dla oka; brak osieroconych cieni i pełnych niebieskich linii. Warm-start również pozostaje natychmiastowy.
- Commit funkcjonalny: `6a8d13e59e95124b7a33b624ac18f6a438b97370` (`perf(build-week): make world cold start atomic`).
- Produkcja: podczas tego passu nietknięta; poprawki działają wyłącznie na demo 4176 do chwili kontrolowanej promocji.

## BW-2026-07-15-038 — Promocja cold-start/chat SSE i wykrycie historycznego launch URL PWA

- Czas Europe/Warsaw: 2026-07-15 17:14–17:55; czas UTC: 15:14–15:55.
- Zatwierdzone commity `ee58011`, `6a8d13e` i `cf876af` promowano fast-forwardem z Build Week na produkcyjny `main`. Przed zmianą utworzono tag `production-before-real-chat-cold-start-2026-07-15` na `be61d2d`.
- Produkcyjna walidacja po promocji: 125/125 testów PASS, lint PASS, `validate:world-life` PASS, build PASS (871 modułów, 7,30 s). Main JS: 415,44 kB / 127,20 kB gzip; CSS: 78,07 kB / 16,80 kB gzip; mapa mobile: 531 412 B.
- Proces produkcyjny po kontrolowanym przełączeniu: dokładnie jeden listener 4175; root, auth status, system metrics, world snapshot i SSE odpowiadają HTTP 200. Proces Node po starcie: około 60,28 MiB working set, 68,49 MiB private, 13 wątków i 237 uchwytów.
- Cache contract: HTML `no-store`; fingerprintowane JS/CSS/mapa `public, max-age=31536000, immutable`. Lokalny root w 10 próbach miał 0,007–0,176 s total; publiczny HTTPS odpowiadał 200, lecz pomiar Tailscale z obciążonego laptopa był zmienny (7 prób: mediana 454 ms, min 28,7 ms, max 1256,2 ms). Nie jest to FPS ani czas paint telefonu.
- Manualny test starej ikony Home Screen: **FAIL** — aplikacja uruchomiła historyczny shell/launch URL z trybem demo, pokazała `0/0` agentów i pustą mapę. Oznacza to, że wcześniejszy audyt endpointów i bundla nie pokrył rzeczywistego wejścia starej instalacji PWA; produkcyjnego odbioru nie zaliczono.
- Naprawa: port produkcyjny 4175 kanonizuje historyczne `/?demo=1` przez `302 → /`; port demo 4176 zachowuje tryb demo. Commit: `19f925e84e8d5d4810b6e38b91dde90db324c0b1` (`fix(build-week): canonicalize production home launch`). Publiczny reset `/reset-client.html` usuwa wyłącznie Service Workery/cache i wraca do czystego `/`; nie usuwa cookie logowania.
- Walidacja naprawy: `node --check server.js` PASS, 125/125 testów PASS, produkcyjny `/` 200, `/?demo=1` 302 do `/`, publiczny reset 200, dokładnie jeden listener 4175. Końcowy test 12 agentów oraz prawdziwego chat SSE na telefonie pozostaje **MANUAL ACTION REQUIRED**.

## BW-2026-07-16-039 — Diagnoza i kontrolowana odbudowa produkcyjnego live runtime

- Czas Europe/Warsaw: sesja rozpoczęta 2026-07-16 07:06; blok naprawczy 07:06–07:45. Czas UTC: 05:06–05:45.
- Punkt wyjścia: po wcześniejszych nieudanych próbach promocji użytkownik widział pusty świat, etykietę demo i `0/0` agentów. Produkcyjny proces 4175 nie wrócił po restarcie laptopa. Nie uruchamiano Chrome ani automatycznych przeglądarek; liczba procesów Chrome podczas całej naprawy: 0.
- Diagnoza źródłowa: historyczny launch `?demo=1` omijał uwierzytelnienie i uruchamiał fixture demo; produkcyjny frontend uznawał samo HTTP 200 z `/api/auth/status` za zalogowanie mimo `logged_in: false`, po czym chronione domeny zwracały 401 i świat pozostawał pusty. Dodatkowo zaplanowany task serwera po restarcie nie istniał, więc publiczny adres nie miał trwałego procesu 4175.
- Naprawa na branchu Build Week: bridge danych i EventSource startują dopiero po potwierdzonym `logged_in: true`; tryb demo nie otwiera live SSE; produkcyjny `/?demo=1` kanonizuje się do `/`; Service Worker v5 odświeża cache bez wymuszonego `client.navigate`. Commit: `5ff6a68e19bb9d83e2060feb7e26f708dca49fd1` (`fix(build-week): enforce authenticated live production runtime`).
- Promocja: przed zmianą utworzono tag `production-before-live-runtime-repair-2026-07-16` na `b0e23ee789da7915899ce00b83f6cd9333e529f0`. Dokładny zatwierdzony zakres aplikacji z `5ff6a68` przeniesiono 1:1 na produkcyjny `main`; diff aplikacyjny między commitami Build Week i produkcji jest pusty. Produkcyjny commit: `b9aedf217f4746ea5328bc66bc55f854b8959e02` (`fix(build-week): deploy authenticated live Citadel runtime`).
- Trwały proces: skonfigurowano dokładnie jedno ukryte zadanie `Hermes Citadel Production V1` z `MultipleInstances IgnoreNew`, wskazujące wyłącznie produkcyjny katalog i port 4175. Tailscale Funnel 10000 wskazuje na `127.0.0.1:4175`. Publiczny root oraz auth odpowiadają HTTP 200.
- Realny kontrakt: bez sesji `/api/profiles` zwraca 401 zamiast fixture; `/api/auth/status` uczciwie zwraca `logged_in: false`; niepoprawne źródło eventu panelu zwraca 403; publiczny `/api/world/events/stream` zwraca `retry: 3000` i snapshot. Nie opublikowano żadnego fake eventu.
- Walidacja: 130/130 testów PASS; lint PASS; build PASS (872 moduły, 2,84 s); main JS 415,60 kB / 127,30 kB gzip. Lokalne warm HTTP: root 5,5–7,2 ms, bundle 8,7–9,5 ms, auth 8,2–14,6 ms. Publiczny HTTPS: root 68 ms, auth 61 ms; canonical demo URL 302 w 60 ms. Są to pomiary transportu, nie FPS ani browser paint.
- Ograniczenie dowodowe po restarcie: lokalna dystrybucja WSL nie jest dostępna, więc automatyczny test zalogowanych domen nie może bezpiecznie pobrać hasła z wcześniejszego środowiska. Pełny zalogowany smoke `profiles/sessions/crons/logs` oraz prawdziwa wiadomość chat pozostają **MANUAL ACTION REQUIRED**; nie obchodzono uwierzytelnienia i nie zapisano sekretu.
- Stabilność końcowa 07:58: osiem kolejnych próbek w odstępach czterech sekund dało 8/8 lokalny root 200, 8/8 publiczny root 200 i 8/8 publiczny auth 200. Lokalny total po rozgrzaniu 4,2–5,6 ms; publiczny root 45,8–85,5 ms; publiczny auth 44,6–72,0 ms. Nadal 0 procesów Chrome.

## BW-2026-07-16-040 — Naprawa rosteru, kontraktów live i evidence-backed wejść do wnętrz

- Czas Europe/Warsaw: sesja rozpoczęta 2026-07-16 07:06; blok domknięty 10:17. Czas UTC: 05:06–08:17.
- Zakres: wyłącznie produkcyjny Hermes Citadel po wcześniejszym GL autora; bez zmian w Hermes OS CAT, Hermes WebUI, `server.js`, portach, Tailscale ani procesie 24/7.
- Incydent i przyczyna: wcześniejszy commit `b9aedf2` usunął stabilny skonfigurowany roster z początkowego stanu i pozwalał, aby pusta/częściowa odpowiedź live sprowadziła świat do `0/0`. Była to nieuzgodniona zmiana produkcyjna. Naprawa `0bf2464` przywróciła 12 neutralnych ról i ochronę przed pustym snapshotem. Kolejna naprawa `01e5b09` zachowuje pełną topologię 12 ról również przy częściowej liście profili: role nieobecne w prawdziwej odpowiedzi są jawnie `offline`, nigdy `Working`.
- Audyt kontraktów wykonano względem rzeczywistych handlerów Hermes WebUI, nie CAT jako źródła danych. Potwierdzono przepływ: Hermes WebUI 8787 → same-origin proxy Citadel → `src/api.js` → `WorldBridge` → store/UI. Skorygowano logi `lines=500 → tail=500`, dodano uwierzytelnione `credentials: same-origin` i rozszerzono sesje o `all_profiles=1`. Commit: `812398e`.
- Semantyka aktywności: `profile.is_active` oznacza wybór profilu, a nie wykonywanie pracy. Usunięto tę fałszywą interpretację. `Working` i ruch powstają teraz wyłącznie z prawdziwego `is_streaming`, `active_stream_id` albo oczekującej wiadomości `has_pending_user_message`. Ostatnio zmodyfikowana, ale nieaktywna sesja nie udaje pracy.
- Realny lifecycle sesji: oczekująca wiadomość → `waiting`; potwierdzony stream → `running` z prawdziwym `active_stream_id` jako evidence; zaobserwowane zakończenie → `done`, Success i powrót. Pierwszy snapshot nie odtwarza sztucznej podróży. Commit funkcjonalny: `90fee4e`.
- Wnętrza: zatwierdzone pozycje/skale wszystkich 12 ról zostały podłączone do jednego evidence-gated renderera w pięciu istniejących wnętrzach. Agent znika z mapy i pojawia się w pokoju wyłącznie po przekroczeniu prawdziwego progu swojej trasy oraz przy ownership tego samego taska/evidence. Nie dodano fake ruchu ani drugiego renderera.
- Walidacja: testy fokusowe 38/38 PASS; pełny zestaw 136/136 PASS; lint PASS; `validate:world-life` PASS; build PASS, 872 moduły, 3,55 s. Main JS 421,17 kB / 129,10 kB gzip; CSS 78,07 kB / 16,80 kB gzip.
- Runtime po buildzie: lokalny root serwuje fingerprint `index-C1P_53PB.js`; bundle zawiera `all_profiles=1` i `hermes-session`; dokładnie jeden listener 4175 (PID 6764); publiczny auth przez Tailscale HTTP 200. Nie uruchomiono drugiego serwera ani automatycznej przeglądarki.
- Macierz bez cookie: auth, metryki i world snapshot odpowiadają 200; chronione profile, sesje, logi, crony, skills i models odpowiadają 401. Jest to poprawny dowód ochrony tras, nie dowód treści zalogowanego payloadu.
- Ograniczenie dowodowe: pełne sprawdzenie wartości chronionych endpointów i wizualnej reakcji na prawdziwą wiadomość wymaga istniejącej zalogowanej sesji autora na telefonie. Nie obchodzono uwierzytelnienia, nie odczytywano cookie ani hasła i nie oznaczono tego etapu fałszywie jako PASS.
- Produkcyjne commity bloku: `0bf2464`, `812398e`, `90fee4e`, `01e5b09`. Produkcyjny HEAD po bloku: `01e5b09`.

## BW-2026-07-16-041 — Domknięcie latency prawdziwej sesji bez wzrostu renderów

- Czas Europe/Warsaw: 2026-07-16 10:17–10:50; czas UTC: 08:17–08:50.
- Końcowy audyt wykrył, że `/api/sessions/search` był poprawny semantycznie, ale miał interwał 60 s. Krótki realny stream mógł zostać zauważony zbyt późno albo pominięty, mimo poprawnych testów statycznych.
- Naprawa `b600192`: scheduler ma lekki tick 1 s, ale każdy endpoint zachowuje własny budżet; sesje są odświeżane co 1 s, metryki co 5 s, zwykłe domeny co 15 s, wolne domeny co 60 s. Snapshot jest publikowany progresywnie tylko po rzeczywistym odczycie lub błędzie, nie dziewięć razy dla cache na każdy tick.
- Nie zmieniono serwera, API, portów, Tailscale ani procesu 24/7. Koszt sieciowy poprawki to jeden mały, uwierzytelniony odczyt sesji na sekundę w aktywnej karcie; ukryta karta nadal podlega istniejącym ograniczeniom przeglądarki.
- Walidator został uniezależniony od kolejności rosteru i wyszukuje Kowala po `profile`, dzięki czemu pełne 12 ról z Offline nie psuje dowodów FSM.
- Walidacja po poprawce: test fokusowy 26/26 PASS, pełny zestaw 136/136 PASS, lint/targeted lint PASS, `validate:world-life` PASS, build PASS (872 moduły, 8,20 s). Finalny main JS 421,21 kB / 129,12 kB gzip.
- Serwowany artifact po buildzie: `index-ClaSbR_q.js`; `all_profiles=1` i `hermes-session` obecne; dokładnie jeden listener 4175.

## BW-2026-07-16-042 — Stabilizacja spójnego live snapshotu po teście telefonu

- Czas Europe/Warsaw: 2026-07-16 10:50–11:18; czas UTC: 08:50–09:18.
- Ręczny test autora ujawnił rzeczywistą regresję produkcyjną: 12 agentów pojawiało się na chwilę, następnie roster znikał, globalny status przechodził przez `Uwaga` do `Offline`, a dwie warstwy ukośnych pasów pogodowych wyglądały jak wadliwy deszcz i obniżały czytelność oraz płynność. Test telefonu był **FAIL** i nie został przedstawiony jako udany mimo wcześniejszych zielonych testów kontraktowych.
- Przyczyna danych: `WorldBridge` podczas równoległego odświeżania zaczynał od pustego zestawu domen i publikował szybki, częściowy snapshot metryk zanim wróciły profile. Hook uznawał taki snapshot za użyteczny i chwilowo zastępował nim poprawny roster. Ponadto błąd dowolnej opcjonalnej domeny — np. logów lub cronów — obniżał globalne połączenie całej Cytadeli, mimo że profile i metryki nadal były live.
- Naprawa `27bf29a`: każde odświeżenie zaczyna się od ostatniego spójnego cache domen; nowe odpowiedzi zastępują wyłącznie własną domenę; chwilowo nieużyteczny snapshot nie usuwa ostatniego wiarygodnego świata. Globalne `Online/Degraded/Offline` opiera się na domenach rdzeniowych `profiles` i `metrics`, natomiast awarie logów, cronów, skills lub models pozostają jawnie lokalne w `lifecycle.domains`. Pierwszy metrics-only snapshot nie jest publikowany do UI przed rozstrzygnięciem domeny profili. Offline agenci pozostają widoczni, lecz nadal są jednoznacznie wyszarzeni i nie udają pracy.
- Naprawa wizualna `c9a3205`: usunięto obie kosztowne warstwy `telemetry-rain`, które tworzyły ukośne pasy po bokach mapy. Pozostała semantyczna korekcja pogody i istniejące spokojne elementy atmosferyczne; nie dodano nowego efektu ani timera.
- Zakres bezpieczeństwa: bez zmian w Hermes OS CAT, Hermes WebUI, `server.js`, API, portach, Tailscale i zadaniu 24/7. Nie uruchomiono serwera demo, nowego serwera produkcji ani przeglądarki. Istnieje jeden listener Cytadeli 4175, backend Hermesa 8787 i istniejący listener Tailscale 10000.
- Walidacja: testy fokusowe 55/55 PASS; pełny zestaw 139/139 PASS; lint PASS; `validate:world-life` PASS; build PASS, 872 moduły, 4,52 s po ponowieniu poza sandboxem z powodu znanego Windows/Vite `EPERM` na pliku tymczasowym. Finalny main JS `index-DTndlvuC.js`: 421,49 kB / 129,24 kB gzip; CSS 77,25 kB / 16,61 kB gzip.
- Runtime: lokalny root 4175 podaje `index-DTndlvuC.js`; publiczny root Tailscale HTTP 200, `Cache-Control: no-store, max-age=0, must-revalidate`; publiczny asset HTTP 200, 421 496 B; publiczny auth HTTP 200. Manualny ponowny test zalogowanego telefonu pozostaje **MANUAL ACTION REQUIRED**.

## BW-2026-07-16-043 — Demo: czytelna narracja, ciągła woda i odporny lifecycle mobile

- Czas Europe/Warsaw: 2026-07-16 11:24–12:04; czas UTC: 09:24–10:04.
- Zakres: wyłącznie branch demo `build-week/hermes-world`. Produkcyjny `main`, proces 4175, Tailscale, Hermes WebUI, API i konfiguracja 24/7 pozostały nietknięte.
- Punkt wejścia zabezpieczono snapshotem `20260716T092411Z-git-snapshot.txt` i commitem `ca8e4e9`.
- Rozdzielono dwa kanały informacji. Górny ticker pokazuje wyłącznie surowe logi techniczne. Dolny feed pokazuje krótkie, polskie komunikaty operacyjne z prawdziwych zdarzeń: agent, czynność, cel, rezultat i alert. Surowa treść pozostaje dostępna jako detal techniczny, lecz nie zanieczyszcza narracji świata. Commit: `67b03c8`.
- Dodano ciągły przepływ wody na istniejących powierzchniach wodnych bez zmiany geometrii mapy. Osiem masek mobile i sześć desktop wykorzystuje jeden lekki raster RGBA przesuwany wyłącznie przez `transform`; kierunki, fazy i czasy są rozłożone, a pełna pętla nie zatrzymuje się i nie odwraca. Usunięte wcześniej ukośne pasy `telemetry-rain` nie wróciły. Commit: `5aa7e22`.
- Finalny asset `hermes-water-current-ribbon.user-v2.png` został wygenerowany przez autora w ChatGPT specjalnie dla Hermes World, a następnie dostarczony jako obraz z wizualnym checkerboardem. Lokalna obróbka była deterministyczna: wyodrębnienie luminancji, utworzenie prawdziwego kanału alfa, crop 4:1, resize i oczyszczenie RGB przezroczystych pikseli. Nie wykorzystano zewnętrznego assetu. Pierwszy testowy wariant wygenerowany narzędziem obrazowym został odrzucony i nie znajduje się w finalnym zakresie.
- Ograniczono koszt lifecycle: dwa konsumenty świata współdzielą jeden fizyczny EventSource, równoległe żądania pełnej synchronizacji korzystają z jednego in-flight Promise, polling jest wstrzymywany w ukrytej karcie i natychmiast odświeżany po `visibilitychange`, `pageshow` albo odzyskaniu sieci. Monitor FPS próbuje przez 2 s, odpoczywa 4 s i czyści RAF/timer przy unmount. Commit: `6d0e073`.
- Zachowano istniejącą optymalizację wnętrz: po otwarciu pokoju animacje całej mapy są pauzowane, a zegar prezentacji zatrzymuje się w ukrytej karcie. Nie przebudowano sprawnych mechanizmów.
- Walidacja: `npm.cmd test` **PASS 136/136**; `npm.cmd run lint` **PASS**; `npm.cmd run validate:world-life` **PASS**; build produkcyjny **PASS**, Vite 8.0.16, 875 modułów, 2,77 s. Główny JS: 420,45 kB / 129,06 kB gzip; CSS: 76,73 kB / 16,48 kB gzip; asset wody: 35,08 kB. Pierwszy build w sandboxie napotkał znany Windows/Vite `EPERM`; identyczna komenda poza sandboxem przeszła bez zmiany kodu lub konfiguracji.
- Automaty potwierdzają semantykę, cleanup, singleton SSE i zakres assetu. Manualna ocena widoczności ruchu wody, hierarchii dwóch feedów, wejść do wnętrz oraz płynności na realnym telefonie pozostaje **MANUAL ACTION REQUIRED** przed jakąkolwiek promocją.

## BW-2026-07-16-044 — RL przybliżonej wody i pixel-aligned rebuild

- Czas Europe/Warsaw: 2026-07-16 12:15–13:10; czas UTC: 10:15–11:10.
- Autor ocenił pierwszą wersję ciągłej wody na realnym telefonie przez LTE jako **RL**: zamysł był poprawny, lecz przybliżone regiony nie były dopasowane do prawdziwych koryt i efekt nie przypominał płynącej wody.
- Przyczyna została usunięta, a nie zamaskowana większą opacity. Skasowano tablicę ośmiu prostokątnych regionów mobile i sześciu desktop wraz z ręcznymi `clipPath`.
- Nowe maski wyprowadzono deterministycznie z pikseli bazowych map i ograniczono ręcznie do obszarów, które rzeczywiście są wodą. Segmentacja używa relacji kanałów RGB, morfologicznego domknięcia oraz odrzucenia małych komponentów, aby nie animować kryształów, okien, dróg i murów.
- Mobile maskuje zewnętrzne rzeki/koryta i wodospady; desktop maskuje zatokę. Maski runtime są połową natywnej rozdzielczości, nadal powyżej docelowej rozdzielczości telefonu, i ważą 43 967 B oraz 8 479 B.
- Ruch składa się z dwóch warstw CSS transform: głębokiego nurtu oraz refleksów o innej skali i czasie. Mobile używa pionowej tekstury zgodnej z odpływem ku wodospadom, desktop poziomej zgodnej z zatoką. Nie dodano timera JS ani ciężkiego filtra.
- Commit funkcjonalny: `539144663bf789e1e5ad71d25cb4f40458222e25` (`fix(build-week): align flowing water to map geometry`).
- Walidacja: fokus 24/24 PASS; pełne testy 136/136 PASS; lint PASS; world-life validator PASS; build PASS, 878 modułów, 6,31 s. Main JS zmalał do 417,70 kB / 128,09 kB gzip; CSS 77,47 kB / 16,58 kB gzip.
- Produkcja pozostała nietknięta. Nowa woda czeka na percepcyjny RL/GL autora na realnym telefonie.
- Dodatkowy feedback z produkcyjnej obserwacji został zapisany jako przyszły zakres, nie jako wykonana funkcja: prawdziwy event uruchamia Kowala i powrót, lecz całemu lifecycle brakuje czytelnego łańcucha wejście → Cytadela → worker/budynek → Archiwum, a idle wymaga uczciwego ambientu niezmieniającego operational state.

## BW-2026-07-16-045 — RL teksturowanej maski i animacja z pikseli mapy

- Czas Europe/Warsaw: 2026-07-16 13:10–13:45; czas UTC: 11:10–11:45.
- Autor ocenił wariant maska + powtarzana tekstura na telefonie jako **RL**: nadal przypominał drobne kreski deszczu, a nie wodę fizycznie należącą do mapy. Produkcja pozostała nietknięta.
- Z aktywnego renderera usunięto importy ribbonu, osobnej pionowej tekstury, CSS `mask-image`, dwa przesuwane poziomy i cztery dawne keyframes. Nie zwiększano opacity błędnego efektu.
- Nowy renderer korzysta z trzech animowanych nakładek wygenerowanych deterministycznie z pikseli zamrożonych map: dwóch zewnętrznych koryt mobile oraz zatoki desktopowej. Stała alfa blokuje ruch granic; ośmioklatkowe cykliczne przemieszczenie dotyczy tylko wnętrza wyciętej wody.
- Nakładki są zwykłymi obrazami WebP z alfa renderowanymi w natywnej warstwie przeglądarki. Brak nowego canvasu, timera JS, particles, SVG turbulence, pełnej linii lub generycznej tekstury. Używają filtra tonalnego mapy, a reduced motion pozostawia czystą mapę bazową.
- Budżet nowych assetów: lewy mobile 166 652 B, prawy mobile 184 130 B, port desktop 33 570 B; łącznie 384 352 B. Build nadal ładuje wnętrza osobnym lazy chunkem.
- Prawdziwy lifecycle Kowala zaobserwowany przez autora pozostaje bez zmian. Kolejny plan po GL wody to evidence-backed łańcuch realnego eventu oraz uczciwy ambient oddzielony od `operationalState`; nie został wdrożony w tym bloku.
- Commit funkcjonalny: `97fb9ff` (`fix(build-week): animate water from exact map pixels`). Snapshot i commit dokumentacyjny domykają blok osobno.
- Manualna ocena percepcyjna 393×852 pozostaje **MANUAL ACTION REQUIRED**; wynik automatyczny nie jest przedstawiany jako GL.

## BW-2026-07-16-046 — RL unoszącej się wody i stabilizacja architektury

- Czas Europe/Warsaw: 2026-07-16 13:45–14:06; czas UTC: 11:45–12:06.
- Autor potwierdził poprawę geometrii, ale nadał `97fb9ff` **RL**: cała warstwa kołysała się zamiast płynąć, a razem z nią przesuwały się fragmenty murów objęte zbyt szeroką maską.
- Usunięto globalny sinusoidalny displacement obrazu. Każda klatka zachowuje identyczne współrzędne źródłowych pikseli; ruch tworzy wyłącznie jednokierunkowa fala luminancji przesuwająca się w dół kanałów mobile lub w poprzek portu desktop.
- Maskę mobile ograniczono do wąskich, pewnych kanałów i odrzucono niejednoznaczne fragmenty przy architekturze. Mniejszy zakres jest świadomą decyzją: nieruchome mury mają wyższy priorytet niż animowanie całego obrysu.
- Koszt trzech assetów spadł z 384 352 B do 71 666 B. Nie zmieniono CSS, renderera operacyjnego, agentów, mapy, geometrii, API ani produkcji.
- Commit: `c10f531` (`fix(build-week): keep water banks and architecture stationary`).
- Manualna ocena telefonu po korekcie pozostaje **MANUAL ACTION REQUIRED**.

## BW-2026-07-16-047 — Ostatnia korekta wody: subtelne refleksy VFX

- Czas Europe/Warsaw: 2026-07-16 15:35–15:53; czas UTC: 13:35–13:53.
- Autor nadał poprzedniej wersji **RL**: mimo nieruchomych brzegów woda nie była czytelna, a trzy krótkie sygnały infrastruktury wyglądały jak przypadkowe komety przechodzące przez środek mapy.
- Zamknięto kierunek animowania wycinków mapy. Usunięto z bundla trzy rasteryzowane animacje WebP wody o łącznym koszcie 71 666 B.
- Ostatnia próba nie udaje pełnego przepływu rzeki. Dodaje wyłącznie małe, nieregularne refleksy VFX zakotwiczone ręcznie na istniejących bocznych korytach mobile i porcie desktop. Każdy refleks ma odmienny kształt, fazę i krótki dryf 7–11 px; nie istnieje pełna linia, sprite, maska całej rzeki ani displacement mapy.
- Warstwa używa wyłącznie `transform` i `opacity`, nie dodaje timera JavaScript, canvasa, biblioteki animacji ani pliku graficznego. `prefers-reduced-motion` nadal wyłącza efekt.
- Trzy techniczne pakiety przewodów `HermesInfrastructureLayer` zostały ukryte. Evidence-backed przepływy prawdziwej wiadomości/delegacji pozostają w odrębnej warstwie `WorldOperationsLayer` i zachowują `evidenceEventId`.
- Produkcja pozostała nietknięta. Wynik na realnym telefonie pozostaje **MANUAL ACTION REQUIRED**; GL nie jest wnioskowane z testów automatycznych.
- Następny osobny etap po decyzji RL/GL: przygotować strategię „żywego demo observability”. Demo ma natychmiast komunikować użyteczność produktu przy większej liczbie agentów, lecz aktywność demonstracyjna musi być jawnie oznaczona i oddzielona od prawdziwego `operationalState`, liczników oraz eventów Hermesa.

## BW-2026-07-16-048 — Evidence-backed fala reakcji świata i audyt telemetrii pomieszczeń

- Czas Europe/Warsaw: 2026-07-16 15:53–16:53; czas UTC: 13:53–14:53.
- Zakres: wyłącznie demo na branchu `build-week/hermes-world`. Produkcyjny `main`, proces 4175, Tailscale, Hermes WebUI i deployment pozostały nietknięte.
- Prawdziwy event SSE uruchamia teraz cztery krótkie, rozłożone w czasie fale reakcji agentów. Kasztelan zachowuje istniejącą choreografię, rzeczywisty worker wykonuje prawdziwy lifecycle, a pozostali agenci wyłącznie przerywają idle i wykonują krótki ruch `acknowledge` po swoich istniejących drogach. Każdy ruch niesie prawdziwy `evidenceEventId`, nie ustawia `Working`, nie emituje `Success` i ustępuje realnemu stanowi operacyjnemu.
- Audyt źródeł wykazał: Kuźnia używa prawdziwego CPU, temperatury i tasków; Cytadela prawdziwych agentów, sesji oraz kosztu API; Watcher prawdziwych cronów, wyników ostatnich wykonań i alertów; Sanctum host RAM oraz jawnie lokalnie wyliczony health score. Archiwum wcześniej nie czytało realnej pamięci/RAG — pokazywało aktywność/logi.
- Demo podłączono do istniejącego `/api/memory`. Do store i UI trafia wyłącznie bezpieczne podsumowanie obecności/rodzaju/liczby sekcji, nigdy surowa treść pamięci. Archiwum pokazuje sekcje pamięci, zdarzenia i aktywne zadania. Brak dedykowanych statystyk indeksu/retrieval oznacza, że interfejs nie nazywa tego fałszywie pełnym „RAG health”.
- Etykietę Sanctum skorygowano z niejednoznacznego `PAMIĘĆ` na `RAM`. Watcher otrzymał rzeczywisty procent sukcesu cronów, a Cytadela rzeczywisty zagregowany koszt API.
- Kontrolowany fixture demo zawiera jedynie syntetyczny, jawny tekst pamięci; produkcyjny runtime korzysta wyłącznie z endpointu. Nie zmieniono API serwera ani event pipeline.
- Walidacja: testy fokusowe 46/46 PASS; pełny zestaw 137/137 PASS; lint PASS; `validate:world-life` PASS; build PASS, 874 moduły, 5,28 s. Main JS 419,83 kB / 128,96 kB gzip; CSS 76,41 kB / 16,48 kB gzip. Istniejący serwer demo przyjął unikalny testowy event i podał nowy fingerprint bundla; nie uruchomiono drugiego serwera.
- Rzeczywista jakość percepcyjna fali reakcji i czytelność metryk w pięciu wnętrzach na telefonie pozostają **MANUAL ACTION REQUIRED** przed GL i jakąkolwiek promocją.

## BW-2026-07-16-049 — Domknięcie odpornego lifecycle’u prawdziwej wiadomości

- Czas Europe/Warsaw: 2026-07-16 16:58–17:22; czas UTC: 14:58–15:22.
- Zakres: wyłącznie demo `build-week/hermes-world`. Produkcyjny katalog, `main`, proces 4175, Tailscale, Hermes WebUI i API pozostały nietknięte.
- Audyt pełnego łańcucha wykrył cztery konkretne problemy: pakiet danych kończył animację później niż jego faza prezentacji, fallback powrotu agenta pomijał czas ekspozycji Success, publikator oznaczał edge jako wysłany przed potwierdzeniem HTTP, a zerwane SSE mogło pozostawić historyczne `Working` mimo zakończonej sesji.
- Zsynchronizowano długość tranzytu z czasem operacji i wydłużono sygnał Archiwum tak, aby pakiet faktycznie docierał do celu. Powrót agenta bez jawnego `returnUntil` obejmuje teraz Success hold oraz pełny marsz do domu.
- Publikator prawdziwych edge’y czatu ma kolejkę zachowującą kolejność, ograniczone ponowienia oraz ten sam `eventId`/`seq` przy retry. Edge jest zapamiętywany dopiero po potwierdzonym przyjęciu; trwała awaria publikacji nie przerywa samego czatu i nie tworzy fałszywego Success.
- Historia zdarzeń jest uzgadniana z rzeczywistym inventory sesji. Jeżeli API jednoznacznie potwierdza `is_streaming: false`, a terminalny edge nie dotarł, transient overlay danego runu jest usuwany i kontrolę odzyskuje live snapshot. Nie jest syntetyzowany `Success` ani `Idle`.
- Równoległe runy wybierają najświeższą aktywną sekwencję, ale terminal starszego prawdziwego runu nadal może dotrzeć do Archiwum.
- Benchmark CPU czystej derivacji lifecycle: 20 000 przebiegów w 1412,7 ms, średnio około 70,635 µs na przebieg na tym laptopie. To pomiar logiki, nie FPS ani paint telefonu.
- Ograniczenia zapisane jawnie: aktualny worker delegacji pochodzi z wybranego profilu czatu, nie z dowodu wewnętrznego delegowania upstream; animacja zapisu Archiwum przedstawia prawdziwy terminalny event, ale sama nie dowodzi zapisu do pamięci/RAG.
- Walidacja: testy celowane 75/75 PASS; pełne testy 144/144 PASS; ESLint PASS; `validate:world-life` PASS; build PASS, 874 moduły, 3,65 s. Main JS 420,47 kB / 129,21 kB gzip; CSS 76,41 kB / 16,48 kB gzip.
- Następny gate: manualny real-phone test jednego prawdziwego lifecycle’u na istniejącym demo 4176. Produkcja nadal wymaga osobnego GL i osobnej promocji.

## BW-2026-07-16-050 — Naturalny krok i ciągłe przejęcie ruchu przez realny event

- Czas Europe/Warsaw: 2026-07-16 17:27–18:00; czas UTC: 15:27–16:00.
- Zakres: wyłącznie demo na branchu `build-week/hermes-world`. Produkcja `main`, serwer 4175, API, Tailscale, Hermes WebUI i event pipeline pozostały nietknięte.
- Autor zaakceptował istniejący cykl reakcji i zamroził jego zakres, aby nie dodawać fake reakcji. Aktywnym problemem był ruch agentów: postacie przesuwały się jak po lodzie, a przejęcie przez prawdziwy event mogło przestawić agenta z bieżącego punktu na początek trasy operacyjnej.
- Renderer otrzymał wspólną czterofazową pozę kroku: naprzemienny nacisk stóp, subtelne przesunięcie boczne i pochylenie sylwetki oraz zsynchronizowaną kompresję cienia kontaktowego. Jest to wyłącznie prezentacja istniejącego `isMoving`; nie zmienia FSM ani operational state.
- Dodano evidence-backed handoff ambient → operational. W chwili prawdziwego eventu zapisywana jest dokładna pozycja stóp, punkt jest rzutowany na istniejącą trasę agenta, a dalszy ruch biegnie do prawdziwego celu po semantycznych waypointach. Handoff obowiązuje wyłącznie dla tego samego runu i tylko podczas dojścia; nigdy nie nadpisuje `Working`, alertu ani terminalnego stanu.
- Nie rozszerzono choreografii, nie dodano crona/watchdoga, nie wygenerowano ruchu bez eventu i nie zmieniono tras ani mapy.
- Walidacja: testy fokusowe 44/44 PASS; pełny zestaw 146/146 PASS; lint PASS; `validate:world-life` PASS; build PASS, 874 moduły, 4,80 s. Main JS 423,05 kB / 129,98 kB gzip; CSS 76,69 kB / 16,56 kB gzip.
- Mikrobenchmark czystego utworzenia i próbkowania handoffu: 50 000 iteracji, 1 338,470 ms, średnio 26,769 µs/iterację. To pomiar logiki bez DOM, nie pomiar FPS telefonu.
- Serwer demo 4176 podaje `index-Cm90ARzU.js`; bundle zawiera kontrakty gait oraz `operational-handoff`. Manualna ocena rytmu kroku na realnym telefonie pozostaje **MANUAL ACTION REQUIRED**.

## BW-2026-07-16-051 — Drugi pass biomechaniki chodu po pozytywnym kierunku

- Czas Europe/Warsaw: 2026-07-16 18:05–18:23; czas UTC: 16:05–16:23.
- Autor potwierdził poprawę i poprosił o dalsze dopracowanie, aby przesunięcie jeszcze wyraźniej przypominało chód. Zakres pozostał ograniczony do demo i warstwy prezentacji.
- Cztery klatki chodu nie mają już równego czasu. Fazy kontaktu stopy trwają dłużej niż fazy przeniesienia, co ogranicza wrażenie stałego ślizgu przy zachowaniu tej samej prędkości i trasy świata.
- Dodano kierunkowy mikrokrok zgodny z ruchem NE/NW/SE/SW, wyraźniejszy transfer ciężaru, minimalny docisk/wyprost sylwetki i zmianę opacity/kompresji cienia podczas fazy lotnej. Amplitudy pozostają subpikselowe lub bliskie 1 px, aby agent nie wyglądał kreskówkowo.
- Transformacje obracają się i skalują względem rzeczywistego `footAnchorY` konkretnego sprite’a, a nie umownego środka. Nie zmieniono logicznej pozycji stóp, waypointów, prędkości, FSM ani event pipeline.
- Walidacja: testy fokusowe 44/44 PASS; pełny zestaw 146/146 PASS; lint PASS; `validate:world-life` PASS; build PASS, 874 moduły, 5,00 s. Main JS 423,69 kB / 130,30 kB gzip; CSS 76,91 kB / 16,61 kB gzip.
- Runtime demo 4176 podaje `index-dUUrp4or.js` i `index-DqtBZKb-.css`; kontrakty kadencji oraz anchoru stóp są obecne. Produkcja pozostała nietknięta.

## BW-2026-07-16-052 — Finalna mikroregulacja rytmu ruchu przed przygotowaniem patcha

- Czas Europe/Warsaw: 2026-07-16 18:24–18:36; czas UTC: 16:24–16:36.
- Autor nadał GL kierunkowi biomechaniki i zezwolił wyłącznie na lekkie dopracowanie ruchu przed przygotowaniem patcha produkcyjnego.
- Interpolacja translacji poruszającego się agenta kończy się teraz po 116 ms przy wspólnym zegarze prezentacji 120 ms. Pozostawia to krótki, czytelny moment kontaktu stopy z podłożem zamiast utrzymywać sylwetkę w nieprzerwanej interpolacji.
- Nie zmieniono waypointów, prędkości świata, FSM, operational state, choreografii, mapy ani API. Produkcja `c9a3205` pozostała nietknięta.
- Walidacja: testy fokusowe 44/44 PASS; pełny zestaw 146/146 PASS; ESLint PASS; `validate:world-life` PASS; build PASS przez istniejący lokalny Vite z `--configLoader runner`, 874 moduły, 3,80 s. Pierwsza standardowa próba builda została zablokowana przez chwilowy Windows `EPERM` w `.vite-temp`; nie zmieniano kodu ani konfiguracji, a alternatywny oficjalny loader Vite zakończył ten sam build poprawnie.
- Decyzja autora: przed jakąkolwiek zmianą produkcji ma powstać selektywny patch, manifest, hash oraz dry-run względem czystego produkcyjnego HEAD. Patch nie może zawierać dokumentacji, dowodów, `server.js`, API ani artefaktów demo.

## BW-2026-07-16-053 — Kontrolowana promocja zatwierdzonego demo na produkcję

- Czas Europe/Warsaw: 2026-07-16 18:55–19:24; czas UTC: 16:55–17:24.
- Autor nadał jednoznaczne **GL** kompletnemu, wcześniej ocenionemu zakresowi demo i zezwolił wyłącznie na promocję przygotowanego patcha 1:1. Zabronił samowolnych poprawek produkcji.
- Przed wdrożeniem zweryfikowano czysty produkcyjny `main`, HEAD `c9a32051a3367990ceae266adeed16366cbd4738`, integralność patcha SHA-256 `8CFEF0DC878D646E2FCCEA4721B1DB84B3D8923A97A3317957EF7040CE5B729D` oraz poprawny `git apply --check`.
- Patch objął dokładnie 37 zatwierdzonych plików (`src/**` i `package.json`), 864 dodane oraz 210 usuniętych linii. Nie zawierał `server.js`, API backendu, konfiguracji Tailscale, portów, PWA/service workera, dokumentacji, screenshotów ani odrzuconych assetów wody.
- Wdrożony zakres: wspólny SSE i odporny lifecycle prawdziwej wiadomości, kolejność/retry bez fake Success, uzgadnianie utraconego SSE z prawdziwym inventory sesji, evidence-backed reakcje miasta, realna telemetria pięciu wnętrz, oddzielny surowy ticker i semantyczny feed, zatwierdzona biomechanika chodu oraz subtelne refleksy wody bez dawnych linii technicznych.
- Commit produkcyjny: `83937de` (`feat(build-week): promote approved living world pass`). Produkcyjny working tree po commicie jest czysty.
- Walidacja przed uruchomieniem: **PASS 152/152**, ESLint **PASS**, `validate:world-life` **PASS**, build **PASS** przez oficjalny `--configLoader runner` po środowiskowym Windows/Vite `EPERM`. Build: 874 moduły, 5,42 s; main JS 429,41 kB / 132,10 kB gzip; CSS 76,98 kB / 16,63 kB gzip; lazy interior JS 13,87 kB / 5,41 kB gzip.
- Produkcyjny runtime pozostał na istniejącym porcie 4175 i istniejącym Funnelu `:10000`. Publiczny root zwrócił HTTP 200 i dokładny nowy fingerprint `index-BwVrGPEq.js` / `index-BE6fnGPj.css`.
- Audyt procesów wykrył, że pierwotny watchdog 24/7 nadal działał. Jedna dodatkowa pętla uruchomiona podczas diagnostyki została natychmiast zatrzymana; finalnie działa jeden listener 4175, PID 6764, pod pierwotnym watchdogiem.
- SSE: **PASS** — stream zwrócił `retry: 3000` i event `snapshot`; snapshot oraz prawdziwa telemetria CPU/RAM/temperatury zwracają HTTP 200. Publiczny Funnel jest aktywny i wskazuje dokładnie `http://127.0.0.1:4175`.
- Chronione endpointy bez cookie zwracają oczekiwane HTTP 401. Ich kontrakty i mapowanie są objęte testami, lecz pełne wartości zalogowanej sesji oraz percepcyjny test wnętrz/agentów pozostają **MANUAL ACTION REQUIRED**; nie zapisano fałszywego PASS bez autoryzowanej sesji przeglądarki.

## BW-2026-07-16-054 — Krytyczna regresja React #185 po promocji i naprawa produkcyjna

- Czas Europe/Warsaw: 2026-07-16 19:32–19:43; czas UTC: 17:32–17:43.
- Autor zgłosił w produkcji komunikat `Minified React error #185`. Kod błędu zweryfikowano lokalnie w `react-dom` jako `Maximum update depth exceeded`.
- Przyczyną był wyłącznie nowy selector surowego tickera: `state.raw?.logs ?? []`. W live production przed pierwszym snapshotem `raw` chwilowo nie istnieje, więc selector tworzył nową tablicę przy każdym odczycie Zustand/React. Demo nie ujawniało błędu, ponieważ posiada `raw.logs` od pierwszej klatki.
- Naprawa jest atomowa: modułowa, zamrożona stała `EMPTY_RAW_LOGS` zastępuje niestabilny literal. Nie zmieniono SSE, API, agentów, mapy, telemetrii, renderera ani zachowania tickera po otrzymaniu danych.
- Dodano test regresyjny, który wymaga stabilnego fallbacku i zabrania powrotu `?? []`.
- Walidacja: test fokusowy 5/5 PASS; pełne testy 153/153 PASS; ESLint PASS; `validate:world-life` PASS; build PASS, 874 moduły, 3,78 s.
- Commit demo: `3e39fd8`; commit produkcyjny: `958b9da` (`fix(build-week): stabilize live raw log selector`).
- Lokalny i publiczny root zwracają HTTP 200 oraz wyłącznie nowy bundle `index-tYcI17tU.js`; poprzedni `index-BwVrGPEq.js` nie jest już wskazywany. Listener produkcyjny pozostał jeden, PID 6764.

## BW-2026-07-16-055 — Audyt brakującego źródła zdarzeń WSL/iMessage i bezpieczny most demo

- Czas Europe/Warsaw: 2026-07-16 19:43–21:04; czas UTC: 17:43–19:04.
- Autor wykazał, że dotychczasowa walidacja produkcyjna była niepełna: testowała hub przez bezpośredni POST i odziedziczony publisher czatu panelu, ale nie dowodziła reakcji świata na rzeczywistą wiadomość wysłaną przez WSL/iMessage. Produkcja nie została w tym bloku zmieniona.
- Odrzucono pierwszą próbę pobierania pełnego inventory sesji przez klienta mobilnego, ponieważ powodowała około 10 sekund opóźnienia wejścia i chwilowe znikanie agentów. Zmiana została całkowicie wycofana przed dalszą pracą.
- W demo dodano lekki, jednokierunkowy most: read-only watcher SQLite `/home/filip/.hermes/state.db` → pozbawiony treści spool JSONL → istniejący adapter Node → lokalny hub zdarzeń świata → istniejące SSE. Telefon nie odpytuje ciężkich endpointów sesji.
- Watcher ignoruje `cron` i `webui`, nie kopiuje tekstu wiadomości i emituje wyłącznie metadane lifecycle: prawdziwy wpis użytkownika tworzy `assigned`/`thinking`, rzeczywisty tool call może utworzyć `working`, a finalna odpowiedź asystenta tworzy `success`.
- Pełny dowód E2E na prawdziwej parze wpisów z bazy: trzy eventy `gateway-…:0/1/2`, źródło `hermes-gateway-state-db`, kolejno `assigned` → `thinking` → `success`. Po teście hub został wyczyszczony przez restart dokładnie jednego serwera demo.
- Runtime końcowy: jeden serwer demo 4176 PID 10924, jeden watcher WSL PID 29626 i jeden forwarder Node PID 6408. Hub jest pusty i gotowy na nową wiadomość autora; bundle `index-DQoq9Imv.js`.
- Build: **PASS**, 874 moduły, 37,52 s, main JS 423,72 kB / 130,28 kB gzip. Test kontraktu SSE: **PASS**. Pełny percepcyjny test nowej wiadomości z WSL/iMessage na telefonie pozostaje **MANUAL ACTION REQUIRED** przed promocją.

## BW-2026-07-17-001 — Diagnoza lagów cold startu i niezależne ładowanie agentów

- Poprzedni blok pracy zakończył się 2026-07-16 o 21:14 Europe/Warsaw.
- Dzisiejszy blok rozpoczął się 2026-07-17 o 10:13 Europe/Warsaw; wpis dokumentacyjny i diagnoza zostały rozpoczęte o tej godzinie.
- Autor zgłosił na demo 5–10 sekund opóźnienia wejścia oraz chwilowe znikanie całego rosteru agentów.
- Przyczyna: `WorldFallback` ukrywał całą warstwę agentów przez globalny `agentAnimationReady` do czasu załadowania wszystkich sprite’ów albo safety timeoutu 3 s. Jeden wolny/dekodowany asset blokował cały roster.
- Naprawa demo: warstwa agentów staje się widoczna razem z mapą; każdy sprite pozostaje ukryty wyłącznie do własnego `onLoad`. Usunięto globalne `Promise.all` i timeout 3 s. Nie zmieniono tras, FSM, event pipeline’u, API ani produkcji.
- Dodano regresję manifestu wymagającą niezależnego settlingu sprite’ów.
- Walidacja: pełny zestaw **147/147 PASS**, build **PASS**, 874 moduły, 43,34 s; JS `index-CF81z-Ws.js` 423,25 kB / 130,14 kB gzip. Pierwszy build sandboxowy miał EPERM na pliku tymczasowym Vite; rerun poza ograniczeniem przeszedł.
- Produkcja pozostaje nietknięta. Patch do promocji wymaga osobnego manualnego testu telefonu po świeżym cold start.

## BW-2026-07-17-002 — Eliminacja migawki klatek przy starcie cyklu

- Czas Europe/Warsaw: 2026-07-17 14:07–14:13; czas UTC: 12:07–12:13.
- Autor potwierdził, że demo po LTE ładuje się natychmiast i cykl działa; zgłosił jednak około półsekundowe mignięcie agentów przy zmianie stanu na początku cyklu.
- Przyczyna: przy zmianie `src` klatki `<img>` przeglądarka mogła chwilowo wymienić poprzedni obraz przed zakończeniem dekodowania nowego.
- Naprawa demo: `MapAgentSprite` preładuje nową klatkę przez `Image` i utrzymuje poprzedni `renderedSrc` do czasu `onload`; nie zmieniono FSM, SSE, API, tras, skali, mapy ani produkcji.
- Dodano regresję kontraktową wymagającą preloadera i renderowania stabilnej klatki.
- Walidacja: pełny zestaw **147/147 PASS**, build **PASS**, 874 moduły, 19,85 s; main JS `index-j7NL4ctJ.js` 423,46 kB / 130,23 kB gzip.
- Rzeczywisty test LTE autora: **PASS** dla szybkiego wejścia i cyklu; końcowy percepcyjny retest mignięcia po nowym buildzie pozostaje **MANUAL ACTION REQUIRED**.
- Do następnego authenticated smoke testu dopisano kontrolę: wywołanie konkretnego workera z Hermesa ma pojawić tego samego agenta na mapie i poprowadzić go do zadania, bez fake Working.
- Produkcja pozostaje nietknięta. Patch do promocji zostanie wygenerowany ponownie po tej zmianie, ale nie zostanie zastosowany bez osobnego GL.

## BW-2026-07-17-003 — Ograniczenie regresji dekodowania klatek agentów

- Czas Europe/Warsaw: 2026-07-17 14:13–14:55; czas UTC: 12:13–12:55.
- Po pierwszym wdrożeniu hold-frame autor zgłosił lagi i okresowe znikanie agentów jeszcze przed rozpoczęciem cyklu.
- Diagnoza: preloader tworzył osobny obiekt `Image` przy każdej zmianie klatki; przy 12 agentach i cyklu prezentacji powodowało to powtarzane dekodowanie i presję na mobile.
- Naprawa demo: współdzielony cache `loadedAgentAssets`/`pendingAgentAssets`; każdy URL klatki jest preładowywany maksymalnie raz, poprzednia klatka pozostaje widoczna do czasu zakończenia preloadu, a cache przeżywa remount pojedynczego sprite’a.
- Nie zmieniono event pipeline’u, FSM, SSE, API, tras, mapy, telemetrii ani produkcji.
- Walidacja: pełny zestaw **147/147 PASS**, build **PASS**, 874 moduły, 7,26 s; main JS `index-BiCTeMjE.js` 423,80 kB / 130,37 kB gzip. Root demo HTTP 200.
- Nowy test LTE/cold start i obserwacja bez cyklu pozostają **MANUAL ACTION REQUIRED**; jeżeli znikanie nadal wystąpi, następny krok to izolacja snapshotu prezentacji, bez dalszego zwiększania preloadu.

## BW-2026-07-17-004 — Pełny roster, czytelna choreografia i separacja agentów na demo

- Czas Europe/Warsaw: 2026-07-17 18:31–19:05; UTC: 16:31–17:05. Zakres: wyłącznie branch demo `build-week/hermes-world`; produkcja pozostała nietknięta na `main` `958b9da08bee9613900e902b3da558aadef826e8`.
- Punktem wyjścia było zgłoszenie autora, że widzi siedem postaci na mapie, jednego Kowala i jednego agenta we wnętrzu. Audyt rozdzielił trzy różne wartości: nagłówek `7/12` oznacza liczbę aktywnych agentów, pełny roster zawiera 12 prezentacji, a prawidłowy układ sceny w chwili testu obejmował 10 sprite'ów na mapie oraz 2 agentów we wnętrzach.
- Przyczyny percepcyjnego braku postaci: Kasztelan stał pod mobilną maską fasady Cytadeli, a trzy role w dolnym dziedzińcu miały zbyt bliskie pozycje ekranowe. Nie brakowało profili, assetów ani danych rosteru.
- Naprawa prezentacyjna: Kasztelan w bezruchu i podczas command/thinking/success otrzymał właściwą warstwę fasady; role dolnego dziedzińca dostały centralnie skonfigurowane mikro-offsety renderowania. Nie zmieniono logicznych waypointów, tras, pozycji stóp, mapy ani FSM.
- Choreografia prawdziwego runu może teraz sterować widocznym przejściem wyłącznie wtedy, gdy jej `runId` jest równy prawdziwemu `taskId`. Niepowiązany stan operacyjny nadal ma bezwzględny priorytet. Krótka fala awareness pokonuje zauważalny odcinek istniejącej trasy, lecz nie emituje fake Working ani Success.
- Pierwszy repaint po odebraniu realnego eventu jest jawnie wyzwalany przez wspólny presentation clock, co skraca opóźnienie reakcji bez dodawania kolejnego timera, połączenia SSE ani pollingu.
- Dodano diagnostyczne atrybuty sceny: całkowity roster, liczba agentów na mapie, we wnętrzach i z nieprawidłową occupancy. Są to metadane weryfikacyjne, niewidoczne w UI.
- Walidacja mobilna 393×852: **12/12**, 10 na mapie, 2 we wnętrzach, 0 invalid, 10/10 asset-ready, 0 istotnych kolizji prostokątów. Próbka ruchu 12 s: 19 próbek ruchu, 3,926 jednostki świata, największy krok 0,411 — brak teleportu. Desktop 1366×768: ten sam bilans 12/12. Konsola: 0 błędów i 0 ostrzeżeń.
- Testy końcowe: **150/150 PASS**; ESLint **PASS**; world-life validator **PASS**; build **PASS**, 874 moduły, 22,95 s, main JS 424,46 kB / 130,58 kB gzip. `git diff --check`: **PASS**.
- Nie wykonywano zmian produkcyjnych, backendowych, API, `server.js`, Tailscale, portów ani mapowania telemetrii. Nagłówek `7/12` pozostaje semantycznie licznikiem aktywnych, a nie liczbą renderowanych postaci.

## BW-2026-07-17-005 — Korekta błędnej separacji agentów po realnym screenie Safari

- Czas Europe/Warsaw: 2026-07-17 19:19–19:44; UTC: 17:19–17:44. Autor dostarczył screen z telefonu pokazujący rozbite/nakładające się prezentacje przy prawym dolnym budynku.
- Korekta dowodowa do wpisu BW-2026-07-17-004: wcześniejsza walidacja pełnego viewportu 393×852 nie odtworzyła krótszej powierzchni roboczej Safari z widocznym paskiem adresu. Na 393×700 zmierzono klaster Zwiadowca–DevOps–Herold; największe nakładanie Zwiadowca–DevOps wynosiło 914 px².
- Pierwszy stały mechanizm `stationaryCrowdOffset` został uznany za wadliwy i usunięty: przesuwał Herolda na fasadę oraz działał także poza faktyczną kolizją.
- Zastąpiono go deterministycznym, ekranowym torem mijania aktywowanym wyłącznie, gdy właściwe role rzeczywiście tworzą klaster w dolnym dziedzińcu. Offset istnieje tylko w rendererze, ma jednostki px i znika po rozdzieleniu agentów. Współrzędne świata, foot anchory, waypointy i trasy pozostają niezmienione.
- Po poprawce największe nakładanie pary Zwiadowca–DevOps spadło z 914 px² do 96 px² (2 px styku pionowego); wszystkie trzy sprite’y są osobno widoczne i mają `assetReady=true`.
- Walidacja: krótszy mobile viewport 393×700 **PASS**, build **PASS** (875 modułów, 12,50 s, main 424,87 kB / 130,69 kB gzip), pełne testy **150/150 PASS**, ESLint **PASS**, world-life validator **PASS**, `git diff --check` **PASS**.
- Zakres pozostał demo-only. Produkcja, SSE, FSM, API, `server.js`, mapowanie telemetrii i procesy 24/7 nie zostały dotknięte.
## BW-2026-07-18-001 — Wycofanie niezatwierdzonej korekty ekranowego rozmieszczenia

- Czas Europe/Warsaw: 2026-07-18 00:03–00:13; czas UTC: 2026-07-17 22:03–22:13.
- Autor wskazał na screenie mobilnym, że po korekcie separacji tłumu dwie postacie zostały przesunięte na dach/fasadę.
- Ustalono, że źródłem regresji była wyłącznie nowa prezentacyjna warstwa `mapAgentCrowdLanes`, a nie waypointy, trasy ani semantic nodes.
- Wycofano tylko tę ostatnią warstwę i przywrócono dokładny kod renderowania rozmieszczenia sprzed commita `52527cb`; porównanie Git zwróciło `EXACT_PREVIOUS_CODE_RESTORED`.
- Nie zmieniono mapy, waypointów, routingu, FSM, SSE, API ani kodu produkcyjnego.
- Walidacja: testy `150/150 PASS`, build `PASS`, World Life validator `PASS`, `git diff --check` `PASS`; pełny lint: `TIMEOUT` bez zgłoszonego błędu.

## BW-2026-07-18-002 — Naprawa marszu w deterministycznym cyklu demo

- Czas Europe/Warsaw: 2026-07-18 00:13–00:45; czas UTC: 2026-07-17 22:13–22:45.
- Zakres: wyłącznie demo na branchu `build-week/hermes-world`; produkcja `main` pozostała nietknięta.
- Audyt runtime potwierdził pełny roster: 12 prezentacji, w tym 10 agentów na mapie, 2 we wnętrzach i 0 nieprawidłowych occupancy. Nagłówek `7/12` nadal oznacza liczbę aktywnych agentów.
- Wykryto konkretną regresję ruchu skryptowego: Zwiadowca miał `walk` i aktywną animację kroków, lecz stałe współrzędne. Przyczyną był stary timestamp zadania z fixture, który miał wyższy priorytet niż postęp bieżącego beatu demo.
- Naprawa dotyczy wyłącznie `WorldSceneScript`: skrypt wylicza postęp trwającego beatu marszu i nadaje sklonowanemu zadaniu stabilny `transitionStartedAt` równy początkowi tego beatu. Nie zmieniono waypointów, tras, pozycji bazowych, mapy, FSM, SSE, API ani produkcji.
- Test napisany przed poprawką odtworzył błąd jako `presentation.routeProgress=1`; po poprawce wymaga wartości pośredniej `0 < progress < 1`.
- Pomiar prawdziwego DOM po świeżym buildzie: Zwiadowca przeszedł kolejno `52.539/35.237 → 54.588/34.236 → 56.666/33.221 → 58.795/32.181 → 60.993/31.332`; roster przez cały pomiar pozostał `10 map + 2 interior`.
- Prawdziwy cykl wiadomości autora został uchwycony jako `otrzymał zadanie → analizuje → zakończył i przekazuje rezultat`, ze wspólnym rzeczywistym evidence ID. Inni agenci nie otrzymali fake Working.
- Walidacja: test regresyjny i kontrakt ruchu **28/28 PASS**; pełny zestaw **151/151 PASS**; World Life validator **PASS**; build **PASS**, 874 moduły, 2,83 s, main JS 424,96 kB / 130,73 kB gzip; `git diff --check` **PASS**.

## BW-2026-07-18-003 — Rozpoczęcie audytu release i zabezpieczenie demo/produkcji

- Czas rozpoczęcia Europe/Warsaw: 2026-07-18 05:56; czas UTC: 2026-07-18 03:56.
- Cel bloku: bezpiecznie doprowadzić działające demo do stabilnego release candidate, a dopiero po pełnej walidacji i osobnym GL autora przygotować selektywną promocję na produkcję. Zakres nie obejmuje nowych funkcji ani szerokiego refaktoru.
- Zweryfikowany stan demo: worktree `hermes-os-living-world-demo`, branch `build-week/hermes-world`, HEAD `01df5476a77988f0ed9f6d03c11f295b32093ba8`, working tree czysty.
- Zweryfikowany stan produkcji: worktree `hermes-os-living-world`, branch `main`, HEAD `958b9da08bee9613900e902b3da558aadef826e8`, working tree czysty.
- Utworzono dwa niezależne annotated safety tagi: `demo-release-audit-start-2026-07-18` wskazuje dokładnie `01df5476a77988f0ed9f6d03c11f295b32093ba8`; `production-release-audit-start-2026-07-18` wskazuje dokładnie `958b9da08bee9613900e902b3da558aadef826e8`.
- Produkcja pozostaje zamrożona. Nie zmieniono kodu, konfiguracji, buildu, procesu 24/7, Tailscale, portów, danych ani sekretów produkcyjnych.
- Zapisane problemy do diagnozy: lifecycle i reconnect SSE, pełny resync po reconnect, świeżość danych wnętrz, rozdzielenie transportu klienta od autorytatywnego statusu Hermesa, kompletność historii eventów/cronów oraz ciągłość evidence-backed ruchu agentów.
- Wstępny audyt źródeł wskazał: wspólny singleton SSE w `src/world/events/worldEventStream.js`; transport i heartbeat w `server/worldEventHub.js`; polling, cache domen i snapshot w `src/world/WorldBridge.js` oraz `src/hooks/useWorldBridge.js`; stan UI w `src/world/store/worldStore.js`; wnętrza w `src/world/WorldFallback.jsx` i `src/components/building-interiors/BuildingInteriorScene.jsx`.
- Pierwsze potwierdzone luki: transport klienta nie wystawia stanów `connecting/live/reconnecting/disconnected` ani jawnej obsługi heartbeat/error/open; wejście do budynku nie żąda świeżego snapshotu; progresywne publikowanie częściowego snapshotu może czasowo stworzyć model bez wszystkich domen.
- Następny krok: zakończyć read-only FAZĘ 1, dopisać testy odtwarzające każdą potwierdzoną regresję, a następnie wdrażać minimalne poprawki wyłącznie na demo, po jednym logicznym zakresie i commicie.

## BW-2026-07-18-004 — Read-only diagnoza stabilności demo przed release

- Zakres: analiza kodu i testów; bez zmian zachowania aplikacji, produkcji lub runtime.
- Baseline testów: `npm test` — **PASS 151/151**, 7 suites, 0 fail, 0 skipped.
- Potwierdzono poprawny fundament: jeden współdzielony EventSource, cleanup po ostatnim subskrybencie, deduplikację eventId/run seq, cache ostatnich poprawnych domen i jedno współdzielone `syncPromise`.
- Potwierdzono blockery release: brak obserwowalnego lifecycle/heartbeat/backoff SSE; brak wymuszonego resync po reconnect; permanentne wymuszanie online po pierwszym evencie; możliwość publikacji częściowego snapshotu bez rosteru; brak fetchu przy wejściu do budynku; fałszywe wiązanie transport-offline z Hermes/worker-offline; historia world-eventów wyłącznie w RAM; brak pełnego mapowania trwałych cron completions.
- Ruch agentów nie zostanie zmieniony bez nieudanego testu akceptacyjnego. Obecne kontrakty oraz ostatni realny pomiar pozostają zaakceptowanym baseline'em.
- Pełny raport z liniami kodu, minimalnymi zmianami, ryzykami i rollbackiem: `docs/build-week/evidence/tests/20260718_DEMO_RELEASE_DIAGNOSIS_PL.md`.
- Produkcja nadal wskazuje `958b9da08bee9613900e902b3da558aadef826e8` i pozostaje nietknięta.

## BW-2026-07-18-005 — Stabilny lifecycle jednego współdzielonego SSE w demo

- Zakres: wyłącznie FAZA 2.1 na `build-week/hermes-world`; produkcja, trasy, pozycje, FSM, dane i UI nie zostały zmienione.
- Test-first: trzy nowe przypadki najpierw odtworzyły brak lifecycle, brak obsługi tła/sieci i nieobserwowalny heartbeat jako 3 EXPECTED FAIL.
- Istniejący singleton `worldEventStream` został zachowany i utwardzony: dokładnie jedno aktywne źródło, jeden reconnect timer, jeden heartbeat watchdog, kontrolowany backoff 1–15 s, cursor `after`, odrzucenie callbacków zamkniętej instancji i pełny cleanup.
- Dodano jawne przejścia i logi: CONNECTING, LIVE, HEARTBEAT RECEIVED, CONNECTION LOST, RECONNECT SCHEDULED, RECONNECTING, DISCONNECTED i CONNECTION CLEANUP.
- Serwer wysyła teraz heartbeat jako nazwany event SSE z timestampem ISO zamiast komentarza niewidocznego dla JavaScriptu.
- Lifecycle przeglądarki: karta ukryta zatrzymuje transport i timery; foreground/pageshow oraz odzyskanie sieci otwierają jedno świeże źródło bez retry storm.
- Walidacja: 5/5 kontrolowanych reconnectów PASS; 1 aktywne źródło po każdym cyklu; 0 timerów i 0 listenerów po cleanup; heartbeat timeout PASS; hidden/foreground i offline/online PASS.
- Pełny zestaw: 155/155 PASS; ESLint PASS; World Life validator PASS; build PASS — 874 moduły, 13,15 s, main JS 428,55 kB / 132,06 kB gzip.
- Produkcja pozostaje zamrożona na `958b9da08bee9613900e902b3da558aadef826e8`.

## BW-2026-07-18-006 — Autorytatywny resync bez znikania rosteru

- Zakres: FAZA 2.2 wyłącznie na demo; bez zmian UI wizualnego, ruchu, pozycji, tras, FSM, produkcji lub infrastruktury.
- Test-first odtworzył dwa błędy: progresywny snapshot po szybkiej domenie metryk usuwał wcześniej potwierdzony roster oraz `sync()` nie obsługiwał wymuszonego, atomowego odczytu po reconnect.
- `WorldBridge` zachowuje teraz ostatnie potwierdzone domeny podczas progresywnego odświeżania. Szybka telemetria może pojawić się natychmiast, ale wolniejszy profil/tasks nie zostaje zastąpiony pustą kolekcją.
- Dodano `sync({ force: true, atomic: true })`: po reconnect wszystkie domeny są odczytywane ponownie i publikowany jest jeden kompletny snapshot. Jeśli zwykły poll już trwa, resync czeka na niego, a następnie wykonuje własny świeży odczyt.
- `useWorldBridge` odbiera stan transportu z jednego SSE, pokazuje `resyncing`, zachowuje ostatni poprawny snapshot i po zakończeniu nakłada eventy, które nadeszły podczas odczytu. Stary/niepełny payload nie czyści już świata.
- Dodano logi RESYNC STARTED i RESYNC COMPLETE oraz generacyjny guard, który nie pozwala starszemu resyncowi wygrać po kolejnym zerwaniu.
- Testy: event odebrany w trakcie resync zachowany; forced atomic read wszystkich domen; brak emisji częściowych; force po in-flight poll; roster zachowany w każdej emisji — PASS.
- Pełny zestaw: 158/158 PASS; ESLint PASS; World Life validator PASS; build PASS po jednym środowiskowym retry `EPERM` — 874 moduły, 2,99 s, main JS 430,66 kB / 132,59 kB gzip.
- Produkcja pozostaje nietknięta.

## BW-2026-07-18-007 — Świeże dane wnętrz przy każdym wejściu

- Zakres: Faza 2.3 wyłącznie na demo; produkcja pozostaje zamrożona na `958b9da08bee9613900e902b3da558aadef826e8`.
- Diagnoza: hotspot tylko otwierał wnętrze i nie uruchamiał fetchu, więc dane mogły pochodzić z cache ważnego 15–60 sekund.
- Dodano centralne mapowanie budynek→domeny i selektywny `sync({ forceDomains, atomic: true })`. Wejście zachowuje poprawny widok, pobiera tylko potrzebne dane i publikuje jeden kompletny wynik.
- Pięć kolejnych wejść do Archiwum: 5/5 PASS; cztery właściwe domeny odczytane pięć razy, pozostałe bez dodatkowych żądań, dokładnie jedna emisja na wejście.
- Walidacja: 160/160 testów PASS; ESLint PASS; World Life validator PASS; `git diff --check` PASS; build PASS — 874 moduły, 2,45 s, main 431,20 kB / 132,77 kB gzip.
- Nie zmieniono wnętrz, agentów, mapy, ruchu, routingu, FSM, event pipeline'u ani produkcji. Dowód: `docs/build-week/evidence/tests/20260718_PHASE_2_3_BUILDING_REFRESH_PL.md`.

## BW-2026-07-18-008 — Transport klienta nie fałszuje statusu offline

- Czas zakończenia etapu Europe/Warsaw: 2026-07-18 07:07; zakres: wyłącznie demo na `build-week/hermes-world`.
- Potwierdzono, że wcześniejsza prezentacja mieszała błąd transportu EventSource z autorytatywnym stanem Hermesa i workerów.
- Rozdzielono kanały informacji: `lifecycle.transport` opisuje połączenie aplikacji, a offline Hermesa/workera wymaga jawnego dowodu z runtime (`hermesStatus`, `runtimeStatus`, `presence`, `online` albo `state`).
- Podczas reconnect UI pokazuje „Łączenie”/„Rozłączono” i ostatni potwierdzony stan zamiast fałszywego system-wide offline. Snapshot, roster i aktywne zadania nie są czyszczone.
- Nie zmieniono mapy, tras, waypointów, ruchu, FSM, event pipeline'u, backendu ani produkcji.
- Walidacja: **161/161 PASS**, ESLint **PASS**, World Life validator **PASS**, `git diff --check` **PASS**, build **PASS** — 874 moduły, 2,18 s, main JS 431,96 kB / 132,97 kB gzip.
- Dowód: `docs/build-week/evidence/tests/20260718_PHASE_2_4_STATUS_SEPARATION_PL.md`.

## BW-2026-07-18-009 — Trwała historia eventów i kompletne ukończenia cronów

- Czas zakończenia etapu Europe/Warsaw: 2026-07-18 10:03; zakres: wyłącznie demo na `build-week/hermes-world`.
- Test-first potwierdził dwa źródła utraty: world-eventy istniały wyłącznie w RAM i znikały po restarcie, a historia cronów wybierała jeden nieuporządkowany completion na job.
- Hub zapisuje teraz zaakceptowane eventy atomowo do lokalnego magazynu JSON, odtwarza historię, deduplikację oraz guardy sekwencji po restarcie i nie publikuje eventu, jeżeli trwały zapis się nie udał.
- Bridge zachowuje wszystkie autorytatywne ukończenia cronów, deduplikuje je po stabilnym ID i sortuje chronologicznie. Nie wykonano fikcyjnego backfillu.
- Rzeczywisty izolowany restart serwera na porcie 4198 zachował event i cursor; proces oraz plik testowy zostały usunięte po weryfikacji.
- Walidacja: focused 11/11 PASS; pełny zestaw 163/163 PASS; ESLint, `node --check server.js`, world-life validator i `git diff --check` PASS; build PASS — 874 moduły, 10,07 s, main 432,61 kB / 133,21 kB gzip.
- Chroniony endpoint cronów bez sesji zwraca 401 zgodnie z kontraktem. Pełny prawdziwy cron E2E pozostaje kontrolowanym testem FAZY 3; nie uruchomiono nieznanego joba bez potwierdzenia jego bezpieczeństwa.
- Produkcja pozostała nietknięta. Dowód: `docs/build-week/evidence/tests/20260718_PHASE_2_5_EVENT_HISTORY_PL.md`.

## BW-2026-07-18-010 — Pięciokrotny release gate ruchu bez zmian implementacji

- Zakres: wyłącznie walidacja demo. Zgodnie z release freeze nie zmieniono ruchu, waypointów, tras, pozycji, mapy ani FSM bez odtworzonego błędu.
- Pięć deterministycznych przebiegów Kowala objęło: właściwy worker i task, droga, wejście do Kuźni, Working, wyjście, Success, powrót i końcowy Idle w home. Wynik 5/5 PASS, 0 teleportów i 0 błędnych przypisań.
- Świeży pomiar DOM Zwiadowcy pokazał ciągłe przejście 54.348/34.353 → 67/31.5; przez 15 próbek roster pozostawał 12/12 (10 mapa + 2 wnętrza, 0 invalid), wszystkie assety były gotowe, konsola 0 errors/0 warnings.
- Walidacja: focused 39/39 PASS; pełny zestaw 164/164 PASS; ESLint zmienionego testu, world-life validator i `git diff --check` PASS; build PASS, 874 moduły, main 432,61 kB / 133,21 kB gzip.
- Produkcja pozostała nietknięta. Dowód: `docs/build-week/evidence/tests/20260718_PHASE_2_6_MOVEMENT_RELEASE_GATE_PL.md`.

## BW-2026-07-18-011 — Automatyczna część macierzy odbioru demo

- Zakres: FAZA 3 na branchu `build-week/hermes-world`; bez zmian kodu aplikacji i bez dotykania produkcji.
- Pełna regresja: 164/164 testów PASS; ESLint PASS; World Life validator PASS; build PASS (874 moduły, main 432,61 kB / 133,21 kB gzip).
- Pięć kontrolowanych połączeń SSE: 5/5 HTTP 200, identyczny replay 47 454 B, jeden listener 4176 po testach.
- Pięć wejść do Archiwum na 393×852: 5/5 odczytów z Hermes runtime, spójne metryki 1/40/0, konsola bez błędów.
- Cold start kontrolowanego demo: 1903 ms do gotowej mapy i agentów; roster 12/12 (10 mapa + 2 wnętrza, 0 invalid).
- Lokalny HTTP: HTML 3,2–3,9 ms, main JS 5,0–7,5 ms, CSS 4,0–6,1 ms, mapa mobile 5,3–8,3 ms. Nie przedstawiać tych wartości jako benchmarku LTE/Safari.
- 30-minutowy soak jednego streamu SSE: PASS — HTTP 200 przez 1800 s, 120 chunków, 50 667 B, regularny heartbeat; po teście jeden listener, 13 wątków, private memory +0,10 MB i uchwyty 238→235. Brak oznaki wycieku.
- Ręczne testy telefonu, Wi‑Fi/LTE, tła i pięciu prawdziwych lifecycle'ów pozostają BLOCKEREM; produkcja nie może zostać zmieniona przed ich PASS oraz osobnym GL autora.
- Pełna macierz: `docs/build-week/evidence/tests/20260718_PHASE_3_DEMO_RELEASE_MATRIX_PL.md`.

## BW-2026-07-18-012 — Korekta realnej telemetrii wnętrz po teście telefonu

- Ręczna walidacja autora zaliczyła cold start, cykl, pięć powtórzeń, powrót z tła oraz Wi-Fi/LTE, ale ujawniła `CRONY 0` / `SUKCES 0` w Obserwatorium i pozornie nieruchomą telemetrię Kuźni.
- Dwa kolejne realne odczyty demo potwierdziły, że metryki backendu są live: CPU 44,1% / 69°C → CPU 44,8% / 73°C. Nie zmieniono źródła CoreTemp ani częstotliwości backendu.
- Znaleziono pierwszy rzeczywisty punkt utraty cronów: Hermes WebUI zwraca `completed_at` jako Unix seconds, a normalizator oczekiwał ISO i odrzucał wszystkie prawdziwe ukończenia. Fixture ISO wcześniej maskował błąd kontraktu.
- Dodano obsługę Unix seconds/milliseconds/ISO, przekazanie trwałej historii przez snapshot/store do wnętrza oraz liczenie Watchera z realnych wykonań również wtedy, gdy inventory scheduler jest chwilowo puste.
- Nie przedstawiono endpointu pamięci Hermesa jako RAG/Obsidian health. To realna pamięć runtime, ale osobna integracja RAG wymaga osobnego źródła prawdy.
- Walidacja: 167/167 testów PASS, ESLint PASS, World Life validator PASS, `git diff --check` PASS, build PASS (874 moduły, 3,52 s, main 432,80 kB / 133,27 kB gzip). Produkcja pozostała nietknięta.
- Dowód: `docs/build-week/evidence/tests/20260718_PHASE_3_REAL_INTERIOR_TELEMETRY_PL.md`.

## BW-2026-07-18-013 — Semantyczna historia realnych tasków i atomowe progi budynków

- Zakres: wyłącznie demo na `build-week/hermes-world`; produkcja pozostała zamrożona.
- Dolny feed przywraca teraz timestampowane, bieżące taski z autorytatywnego Hermes Kanban także po cold starcie i resync. Wpisy mają stabilne ID i korelację, ale nie generują ruchu bez rzeczywiście zaobserwowanej zmiany statusu.
- Narracja cronów rozpoznaje `error`, `failed` oraz `fail`; surowe logi nadal pozostają osobnym górnym kanałem, a dolny feed pokazuje wyłącznie semantyczne taski, crony, alerty i trwałe eventy.
- Potwierdzono przyczynę pikselozy przy wejściu: przejęcie warstwy fasady następowało przy arbitralnym 96% całej trasy. Teraz pełny sprite przechodzi nad fasadę na ostatnim zmapowanym odcinku dojścia i wraca do normalnego depth sortingu dopiero po oczyszczeniu pierwszego odcinka wyjścia.
- Nie zmieniono waypointów, współrzędnych, geometrii mapy, FSM, statusów ani źródeł danych.
- Focused contract suite: **45/45 PASS**; pełny zestaw **168/168 PASS**; ESLint, World Life validator i `git diff --check` **PASS**; build **PASS** — 874 moduły, 3,05 s, main JS 433,05 kB / 133,34 kB gzip.
- Dowód: `docs/build-week/evidence/tests/20260718_PHASE_3_SEMANTIC_HISTORY_AND_ATOMIC_ENTRY_PL.md`.
- Serwer demo `127.0.0.1:4176` podaje dokładnie aktualny hash buildu `index-BkzoAeZ2.js`; root, manifest, Service Worker, JS, CSS i auth status zwracają HTTP 200. Produkcyjny `main` nadal jest czysty na `958b9da08bee9613900e902b3da558aadef826e8`.
- Snapshot po commitach: `docs/build-week/evidence/git-snapshots/20260718T120201Z-git-snapshot.txt`.
