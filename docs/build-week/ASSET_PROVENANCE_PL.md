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
