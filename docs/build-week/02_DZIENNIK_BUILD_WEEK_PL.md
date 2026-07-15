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
