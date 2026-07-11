# Hermes World — agent normalization report

Zakres jest wyłącznie wizualny. Routing, waypointy, world positions, FSM, statusy, anchory logiczne, depth sorting i reakcje budynków pozostają bez zmian.

## Pomiar

Wszystkie aktywne klatki `idle-se.webp` używają canvasu 128×128 i kończą alpha bounds dokładnie na `y=124`. Logiczną pozycją nadal jest punkt między stopami. Zmiana skali nie przesuwa world position.

| Rola | Przed | Po | Zmiana |
|---|---:|---:|---:|
| Kurier (`default`) | 46.0 px | 46.0 px | 0% |
| Kowal (`coder`) | 54.6 px | 43.7 px | -20% |
| Budowniczy (`developer`) | 53.8 px | 43.7 px | -19% |
| Inżynier (`devops`) | 53.8 px | 43.7 px | -19% |
| Komandos (`komandos`) | 57.1 px | 41.6 px | -27% |
| Kasztelan (`orchestrator`) | 57.1 px | 41.6 px | -27% |
| Herold (`outreach`) | 53.8 px | 42.6 px | -21% |
| Zwiadowca (`prospecting`) | 53.8 px | 43.7 px | -19% |
| Uczony (`researcher`) | 56.0 px | 42.6 px | -24% |
| Inspektor (`reviewer`) | 53.8 px | 44.7 px | -17% |
| Alchemik (`synthesizer`) | 53.8 px | 45.8 px | -15% |
| Probierz (`verifier`) | 53.8 px | 43.7 px | -19% |

Wartości oznaczają wysokość przy środkowej skali perspektywicznej (`baseScale=1`). Istniejące płynne skalowanie Y nadal zmniejsza agentów u góry i delikatnie zwiększa ich na dole.

## Wspólny kontrakt wizualny

- Efektywna wysokość środkowa jest testowana w przedziale 40–46 px.
- Łagodny wspólny profil obrazu uspokaja saturation/contrast bez zmiany kolorów ról.
- Cień kontaktowy korzysta z jednego systemu i per-role szerokości wynikającej z sylwetki.
- Statusy nadal używają osobnego ringu/symbolu; filtr normalizacji nie koduje statusu.
- Offline zachowuje własną, czytelną desaturację.

## Before / after na tym samym buildzie

- Znormalizowany wariant: `/`
- Poprzednia efektywna skala: `/?agentVisual=before`
- Trasy plus normalizacja: `/?debugRoutes=1`

Tryb `before` zmienia wyłącznie wizualną skalę i profil cienia. Dane, pozycje, anchor, routing, statusy i czas sceny pozostają wspólne, dzięki czemu porównanie na telefonie jest bezpośrednie.

## Readability pass mapy

Główny asset mapy nie został zmieniony. Odwracalny CSS:

- lekko podnosi jasność i cienie,
- zmniejsza globalny blue cast,
- zachowuje cyan w rdzeniach i infrastrukturze,
- lokalnie rozjaśnia centralną oś, fontannę, dojścia do Kuźni, Biblioteki i punktu obserwacyjnego,
- nie zmienia kształtu dróg, cropu ani współrzędnych.

## Mobile 2-second scenarios

Scenariusze korzystają z istniejących fixtures o kształcie prawdziwych danych API. Nie zmieniają renderera ani FSM.

- Stabilny + idle/working/success: `/?scenario=healthy`
- Waiting + warning + stuck: `/?scenario=warning`
- Error/critical + aktywna odpowiedź: `/?scenario=critical`
- Before dla dowolnego scenariusza: dopisać `&agentVisual=before`
- Overlay tras dla dowolnego scenariusza: dopisać `&debugRoutes=1`

Checklist przy 390×844:

1. Globalny health i active/total są czytelne bez kliknięcia.
2. Warning/error/stuck wskazuje konkretną postać i subsystem.
3. Rola pozostaje rozpoznawalna po sylwetce, narzędziu i kolorze.
4. Agent nie zasłania drogi ani wejścia i nie dominuje nad budynkiem.
5. Cień pozostaje przy stopach, a status jest osobnym ringiem/symbolem.
6. Ticker pomaga, ale nie jest potrzebny do wykrycia problemu.

### Deterministic focus matrix

Każdy focus zatrzymuje fabularną oś czasu demo i używa tego samego istniejącego FSM/renderera:

- `/?focus=stable`
- `/?focus=working`
- `/?focus=waiting`
- `/?focus=thinking`
- `/?focus=warning`
- `/?focus=critical`
- `/?focus=stuck`
- `/?focus=success`
- `/?focus=offline`

### Map readability variants

- Zaakceptowany lekki default: `/?focus=stable&mapReadability=light`
- Oryginalny ciemniejszy baseline: `/?focus=stable&mapReadability=baseline`
- Mocniejszy wariant wyłącznie do porównania: `/?focus=stable&mapReadability=strong`

`strong` nie jest automatycznie zatwierdzony i nie zmienia assetu mapy.

### Filtered route debug

- Domyślnie jeden agent: `/?debugRoutes=1`
- Wybór roli: `debugAgent=coder|researcher|prospecting|...`
- Pełny legacy audit: `debugAgent=all`
- Warstwy: `debugLayers=route,nodes,labels,entrances,depth`

Przykład: `/?debugRoutes=1&debugAgent=researcher&debugLayers=route,entrances,labels`.
