# Pochodzenie assetów — Hermes World

## Kompletny zestaw cinematic interior VFX — 2026-07-15

Wszystkie poniższe źródła zostały wygenerowane od zera specjalnie dla Hermes World, pojedynczo i z właściwą cinematic interior plate jako referencją. Są klasyfikowane jako **AI-generated original project assets**. Narzędzie obrazowe nie ujawniło w zapisie dokładnej nazwy modelu, więc jej nie dopisujemy. Integrację, alpha cleanup, despill, fixed-pivot normalization, testy i benchmark wykonał Codex w sesji `019f4f11-14e9-70e0-8d61-26226257864c` z GPT-5.6 Sol.

| Efekt | SHA-256 source chroma-key | SHA-256 runtime 1024×128 | Runtime B |
|---|---|---|---:|
| Forge fire | `6B4FF2111FFA6571E12560B2292B1DC00F47AF638E7911687BEA6F7F593C11B0` | `0E870784D45B26AA35BB66E55EE187F24AFEE637E7D9A0D82BF765C522793AE3` | 65025 |
| Forge smoke | `8A4C947504C158F2459E1C6970B655F92F77CE3267E2B0E434B5E40BE047C8EB` | `790593102611D961ECFF78F7C3DF4696A99B73137B943480E9F84BB5613C37D7` | 46600 |
| Forge impact sparks | `1EEEAB82FCA3A12EDFC1D7D4D50DE16474330AC443A6FFC6CF042B69F3ACEF66` | `731EA63FD50080289D6581E7F9DFE19DBC3D4593D85B969E9ED3FF1B3DABD591` | 16091 |
| Citadel core charge | `A1B6216376FBCA49F92600ABF656E52568D1A798532B83AE0BB2895E82A12372` | `4D870136CE6D6CD1376E921B0C29EC3E5EE04C66B70BD373B47333F5D7B5C3E9` | 57107 |
| Citadel command table | `21942741EC840B2BA3560AA97DBEFB89687F104937B7CB3CDA429AEA665B23C6` | `575D87524CE50837AEA1E19B5DA461C176BBB99606273C09758EACF6021B8D72` | 103640 |
| Archive codex armillary | `931DEAEC8FF674D4B2295F8F8744AA278D3B318C4A2AE52E076C96555FDAA7AA` | `E27658DDB9B1BD2603C222433789B753C6384CB9F12F5A7E797118A3309BDAC5` | 149834 |
| Archive shelf ingestion | `A2B3AFFD0BD5B84FCDDB7C56D1187A1DBDC446A5932A6EFB12DD261DAB777695` | `244CEB76656FA8E333D0464B4C0219A09B37FC2DFE9567ECDE4DE094CE7D7447` | 22039 |
| Watcher lens scan | `0E3BC107745F63C2E5BC0BA3955D03FCA9A73E85996DCDB7C9F8B9DDAF2858B6` | `F03A8425B355E1D46A878A21285DEA0EAF628C2979406982E6148E62D1C7A781` | 153976 |
| Watcher armillary calibration | `36B894A1DA3169F3A3BFEBE60BBE2FB1BFCC5FE4EF790F6BFF2B26C6CFC06184` | `C31D286091133F14A4C654852457B9678BCD9627E7A3B6F3B7D0B7A7A0014EA7` | 119186 |
| Sanctum pool circulation | `CD6C6F2C1BD94C409A80DF21DC09C5F4E9A1C26B59F34E25EEA919595FD179DD` | `7DBF6445B915E37072BAC13864E2A07DC4E5CFBB26A241123D5DFC0E692FEBBC` | 113870 |
| Sanctum energy column | `20A434241C69F2AB217434D2C7D6D1DB502A7E4E674A8E3DE9331FA64ADAA605` | `C5E2F33B6308A2AF2BCBA2879EA317F672C2611C36E0058D1D46D367FE710534` | 22677 |

Źródła chroma-key są zachowane w `artifacts/interior-vfx/source/`, kanoniczne pochodne 2048×256 w `artifacts/interior-vfx/`, a lekkie pliki produktu w `src/assets/building-interior-effects/`. Katalogi roboczego alpha cleanup i montage QA są ignorowane, ponieważ są odtwarzalnymi intermediates.

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

## Dedykowane efekty cinematic wnętrz — 2026-07-15

| Plik | Rola | SHA-256 | Status |
|---|---|---|---|
| `artifacts/interior-vfx/source/forge-interior-fire-chromakey.png` | oryginalny source 4×2 z wbudowanego image generation, referencja `forge-execution-hall.jpg` | `6B4FF2111FFA6571E12560B2292B1DC00F47AF638E7911687BEA6F7F593C11B0` | AI-generated original project asset |
| `artifacts/interior-vfx/forge-interior-fire-strip.png` | oczyszczony i znormalizowany source strip 2048×256 | `D56FDB78BCEBF0153801DCDD0B1177A8ABD5EB70E05D0B0A46A2BE63176797CC` | deterministyczna pochodna własnego źródła |
| `src/assets/building-interior-effects/forge-interior-fire-strip.runtime.png` | lekki runtime 1024×128 | `0E870784D45B26AA35BB66E55EE187F24AFEE637E7D9A0D82BF765C522793AE3` | deterministyczna pochodna własnego źródła |

Prompt i pełny kontekst generowania znajdują się w sesji `019f4f11-14e9-70e0-8d61-26226257864c`. Generowanie wykonało narzędzie wbudowane; nie zapisujemy niepotwierdzonej nazwy modelu obrazu. Projektowy prompt, selekcja, odrzucenie wcześniejszego wariantu, integracja i walidacja zostały wykonane z GPT-5.6 Sol.

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
