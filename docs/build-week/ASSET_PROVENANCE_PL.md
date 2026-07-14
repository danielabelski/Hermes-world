# Pochodzenie assetów — Hermes World

## Wiążące oświadczenie autora

> Autor projektu potwierdza, że wszystkie maskotki, ikony, sprite’y, mapy, efekty i inne elementy wizualne Hermes World oraz Hermes OS CAT zostały wygenerowane od zera przez modele AI na jego polecenie, specjalnie dla jego własnych projektów. Żaden z tych assetów nie został skopiowany, pobrany ani zaadaptowany z zewnętrznego projektu, gry, marketplace’u, repozytorium lub paczki assetów.

Klasyfikacja: **AI-generated original project assets**. Brak zachowanego promptu, dokładnego modelu albo Session ID oznacza wyłącznie słabsze metadane dowodowe, nie „nieustalone źródło” ani podejrzenie zewnętrznego assetu.

## Inwentarz grup

| Grupa | Liczba / zakres | Pochodzenie | Transformacja | Status |
|---|---:|---|---|---|
| `src/assets/hermes-citadel-*` | 8 map i pochodnych | wygenerowane od zera dla Hermes World | PNG → WebP, wariant mobile | własne, potwierdzone oświadczeniem autora |
| `src/assets/agent-*-source/v1` | 9 | wygenerowane role referencyjne | normalizacja i eksport | własne |
| `public/heroes/hero-01..12.webp` | 12 | wygenerowany arkusz dla projektu | deterministyczny crop przez `normalize_hero_assets.py` | własne pochodne |
| `src/assets/agents/*.webp` | 10 | wygenerowane role UI | przygotowanie runtime | własne |
| `artifacts/map-agents/source/*` | 28 | wygenerowane source sheets | źródła zachowane | własne |
| `public/map-agents/<role>/*` | 234 | pochodne source sheets | crop, alpha, anchor i kompresja przez `process-map-agent-sheet.py` | własne pochodne |
| `artifacts/map-agents/*.gif` | 13 | pochodne walidacyjne | preview animacji | wewnętrzne |
| `src/assets/world-effects/*-strip.png` | 13 | wygenerowane dla projektu | source strips zachowane | własne |
| `src/assets/world-effects/*.runtime.png` | 13 | pochodne efektów | optymalizacja runtime | własne pochodne |
| `src/assets/mascot/*.webp` | 8 | wygenerowane dla własnego Hermes OS CAT | odziedziczone bezpośrednio | własne pre-existing |
| stare ikony CAT w `public/` | 4+ | wygenerowane dla własnego Hermes OS CAT | odziedziczone lub zmodyfikowane | własne pre-existing |
| nowe ikony Citadel/PWA | zestaw runtime | wygenerowane dla Hermes World | warianty PWA/cache | własne |
| `artifacts/validation/*.png` | 5 | screenshoty testowe | brak użycia jako asset produktu | dowody wewnętrzne |
| `src/assets/building-interiors/*.jpg` | 5 | wygenerowane od zera dla Hermes World na polecenie autora | bez zmiany kompozycji; import do lazy renderera 4:5 | własne, AI-generated original project assets |

## Cinematic interior plates — 2026-07-14

| Plik runtime | Funkcja | Rozmiar | SHA-256 źródła | Powiązany commit |
|---|---|---:|---|---|
| `citadel-command-hall.jpg` | Cytadela / orchestration | 243623 B | `38D0EABB454E550F5B75662101FD16619E7749ABBD069BF32E960C98D9E40AB1` | `d16969e` |
| `archive-memory-hall.jpg` | Archiwum / memory and records | 299670 B | `9D438A455160E102369E917E91944BD8B4C08AB718285980EA2BD32424C77100` | `d16969e` |
| `watcher-observatory.jpg` | Watcher / observation and cron oversight | 285291 B | `34D161C153C433CD37CCA623BDCCDB1BAF25C5D39533A2BF1D7E11C22F66F348` | `d16969e` |
| `sanctum-recovery-hall.jpg` | Sanctum / recovery and health | 349425 B | `8920101B04D2BB680AF5EAA38E07C08A4296A167AF3D9C24CED1965150E71109` | `d16969e` |
| `forge-execution-hall.jpg` | Kuźnia / execution and workload | 347498 B | `754AE8DA073B8C496292EE8801721436584251F928E829C7335CDF8E77F16950` | `d16969e` |

Wszystkie pięć źródeł ma rozdzielczość 1024×1280 i proporcje 4:5. Autor wygenerował je od zera specjalnie dla Hermes World. Nie pochodzą z gry, marketplace'u, repozytorium ani zewnętrznej paczki assetów. Dokładny model i prompt nie zostały zachowane w repozytorium; nie zmienia to potwierdzonego pochodzenia.

Audyt wykrył 367 plików graficznych/ikon w aktywnym drzewie z pominięciem `node_modules`, `dist` i dowodów Build Week. Wiele plików to formaty i deterministyczne pochodne tych samych źródeł.

## Hermes OS CAT

CAT jest wcześniejszym własnym projektem autora, nie zewnętrzną paczką. Dwanaście identycznych assetów odziedziczonych z CAT klasyfikuje się jako **własne pre-existing components**. Ich pre-submission status jest istotny dla osi czasu, nie dla ryzyka cudzej własności.

## Assety zewnętrzne

Nie zidentyfikowano żadnego assetu stockowego, marketplace’owego, pochodzącego z gry, repozytorium ani paczki zewnętrznej. Kategoria jest pusta według audytu repozytorium i oświadczenia autora. Jeśli w przyszłości zostanie dodany asset zewnętrzny, musi otrzymać osobny rekord źródła, licencji, attribution i zakresu użycia.

## Narzędzia deterministyczne

- `scripts/normalize_hero_assets.py`: crop, usuwanie tła, safety envelope i canvas 256×256.
- `scripts/process-map-agent-sheet.py`: podział arkusza, alpha cleanup, normalizacja foot anchor i eksport.
- Runtime world-effect derivatives: skalowanie i optymalizacja source strips.
- Pillow 12.2.0 (MIT-CMU) jest narzędziem deweloperskim, nie częścią bundla aplikacji.

## Metadane utrzymywane od teraz

Dla nowych źródeł zapisujemy: ścieżkę, datę, model (jeśli znany), prompt/Session ID (jeśli zachowany), transformacje, SHA-256 źródła i pochodnej oraz powiązany commit. Brak historycznego promptu nie otwiera ponownie rozstrzygniętej kwestii pochodzenia.
