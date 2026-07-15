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
