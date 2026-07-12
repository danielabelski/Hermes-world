# Hermes World — Visual Baseline

Status: accepted and locked on 2026-07-11 after mobile scale comparison and observability-state review.

## Product North Star

> Hermes World nie jest rozbudowaną grą. Hermes World jest ambientową warstwą observability dla systemu agentowego.

Fantasy/AI jest językiem wizualnym. Observability jest produktem. W ciągu maksymalnie dwóch sekund użytkownik powinien rozpoznać health systemu, liczbę aktywnych agentów, idle/waiting/stuck, warning/error, lokalizację problemu i potrzebę reakcji. Kliknięcie służy wyłącznie jako drill-down.

## Accepted baseline

- Aktualna niebiesko-granatowa mapa fantasy/AI pozostaje bazowym assetem.
- Geometria mapy jest zamrożona: layout, crop, proporcje, rozdzielczość bazowa, budynki, drogi, wejścia, waypointy, semantic nodes, trasy, depth zones oraz punkty `home/safe/work` pozostają bez zmian.
- Aktualne waypointy, routing, wejścia i depth sorting są zatwierdzonym baseline'em.
- Aktualna mniejsza skala agentów jest globalnym baseline'em: efektywna wysokość środkowa 40–46 px.
- Dopuszczalne są później wyłącznie indywidualne korekty około ±5–8%, uzasadnione perspektywą, osią Y albo odstającą sylwetką. Globalne powiększenie jest zabronione.
- Nowe, zróżnicowane postacie pozostają. Role są rozpoznawane przez sylwetkę, narzędzie, ubiór i akcent kolorystyczny.
- Postacie są jednostkami mapowymi; duże ilustracje pozostają wyłącznie portretami UI.
- Wspólny foot anchor `y=124/128`, Y-sort po stopach oraz mały per-role contact shadow pozostają baseline'em.
- Globalny health i licznik active/total pozostają głównym kanałem observability.
- Warning jest zaakceptowanym wzorcem: bursztynowy globalny status, lokalna ikona agenta, dolna karta ostrzeżenia, bez przesadnej czerwieni.
- Critical jest zaakceptowany globalnie: czerwony header/status, „Krytycznie”, liczba alertów i informacja o szybkiej reakcji. Lokalizacja konkretnego źródła wymaga dopracowania.
- Stuck działa architektonicznie i ma nowy kandydat wizualny: zatrzymana strzałka `↛`, kwadratowy bursztynowy marker i wolny puls. Wymaga końcowej oceny użytkownika na telefonie.
- Success jest krótkim potwierdzeniem eventu: zielony impuls/karta, automatyczne wygaszenie, brak stałej aury.
- Debug overlay `?debugRoutes=1` jest zachowany jako domyślnie wyłączone narzędzie developerskie.
- Reakcje Kuźni, Biblioteki, Wieży i Core oraz semantyka przepływów pozostają częścią baseline'u.
- Mapa może być poprawiana wyłącznie niedestrukcyjnie przez CSS, compositing, tonalne maski i lokalne overlaye.

## Accepted test findings

- Mniejsza skala wygrywa z wcześniejszą większą skalą: mapa, drogi i centralny plac pozostają czytelne, a ekran wygląda jak observability zamiast galerii bohaterów.
- Warning przechodzi test 2-second observability i nie wymaga zmiany podstawowej gramatyki.
- Globalny critical jest czytelny; kandydat lokalizacji łączy czerwony marker agenta, reakcję subsystemu i pojedynczy problem flow. Wymaga końcowej oceny użytkownika na telefonie.
- Stuck jest nadal wizualnie niejednoznaczny; znak wielokropka nie może być jego docelową identyfikacją.
- Success jest dobrym kierunkiem pod warunkiem krótkotrwałości.
- Widok wszystkich nazw debug jednocześnie jest celowo chaotyczny i nigdy nie jest widokiem użytkownika.

## Rejected directions

- Identyczne kaptury dla wszystkich agentów.
- Pełny rollback nowych postaci.
- Wcześniejsza większa skala agentów i jakiekolwiek ponowne globalne powiększenie.
- Podmiana mapy na wcześniejszą złotą wersję.
- Kolejna całkowicie nowa estetyka albo nowa geometria mapy.
- Nowa mapa, zmiana cropu lub ponowne mapowanie waypointów bez wykrytego błędu.
- Duże hologramy, mapowe portrety, hero cards i wielkie aury statusów.
- Rozwijanie wnętrz, eksploracji, questów, ekonomii, losowych NPC lub mechanik strategicznych kosztem observability.
- Dekoracyjny ruch i animacje sugerujące pracę bez prawdziwego zdarzenia operacyjnego.

## Product test

Na widoku około 390×844 bez klikania:

1. Health jest rozpoznawalny w maksymalnie dwie sekundy.
2. Active/total jest czytelne.
3. Role są rozpoznawalne po sylwetce, narzędziu i kolorze.
4. Warning, error i stuck są lokalizowalne bez polegania na tickerze.
5. Mapa, drogi, wejścia i główne subsystemy pozostają widoczne.
6. Agent nie dominuje nad budynkiem ani nie zasłania przestrzeni operacyjnej.
7. Ogólny stan nie wymaga drill-downu.

## Do not touch

- Asset i geometria aktualnej mapy.
- Crop, proporcje, waypointy, semantic nodes, trasy i depth zones.
- Działający FSM i architektura statusów.
- Nowe zróżnicowane role oraz aktualna mniejsza skala jako globalny baseline.
- `server.js`, `src/api.js`, Hermes OS CAT i kontrakty API.
## Observability polish checkpoint — 2026-07-12

- Główny komunikat respektuje `critical > warning > stuck > success > info`; success nie konkuruje z aktywnym incydentem.
- Domyślny `light` readability pass pozostaje niedestrukcyjny i został dopracowany lokalnymi maskami dróg/placów. `baseline` i `strong` są wyłącznie wariantami porównawczymi; strong wymaga decyzji użytkownika.
- Thinking/waiting/stuck i critical localization zachowują zatwierdzoną gramatykę.
- Debug tras jest dev-only, per agent, numerowany i warstwowy.
- Skala agentów 40–46 px, anchor 124/128, cienie i Y-sort pozostają bez zmian po audycie 12/12.
- Walidacja automatyczna: 29/29 testów, validator, lint i oba buildy zielone. Finalny test 2 sekund należy do użytkownika na telefonie.
