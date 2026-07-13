# 02 — Dziennik Build Week

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
