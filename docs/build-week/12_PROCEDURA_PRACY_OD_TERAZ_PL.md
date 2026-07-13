# 12 — Procedura pracy od teraz

## Przed większym blokiem

1. `git branch --show-current` — oczekiwany `build-week/hermes-world`.
2. `git status --short` — rozpoznaj każdą istniejącą zmianę.
3. Uruchom `capture-evidence.sh` z Session ID i celem.
4. Dopisz cel do dziennika Build Week.
5. Zapisz Session ID, model i czas Europe/Warsaw/UTC.
6. Potwierdź, że blok odbywa się po 13 lipca 2026, 18:00 Europe/Warsaw.

## Po bloku

1. Zapisz wyłącznie faktycznie ukończone funkcje i zmienione pliki.
2. Uruchom adekwatny lint, testy, build i test mobile.
3. Dopisz dokładne komendy, wyniki, liczbę testów i ograniczenia do rejestru testów.
4. Dopisz decyzje architektoniczne, rozdzielając propozycję Codexa od decyzji autora.
5. Powiąż sesję Codexa z plikami i commitami.
6. Dodaj istotny screenshot jako nowy dowód; zachowaj oryginał, hash i osobną redakcję.
7. Uruchom snapshot końcowy.
8. Wykonaj czytelny commit i dopisz jego hash do dziennika.
9. Nie squashuj, nie amenduj historycznych commitów i nie przepisuj osi czasu.

## Konwencja commitów

- `feat(build-week): ...`
- `fix(build-week): ...`
- `test(build-week): ...`
- `docs(build-week): ...`
- `chore(build-week): ...`

## Trzyminutowy start

```bash
git branch --show-current
git status --short
bash ./scripts/build-week/capture-evidence.sh --session-id SESSION_ID --goal "CEL" --baseline pre-build-week-baseline-2026-07-13
```

Następnie utwórz wpis z szablonu `templates/WPIS_DZIENNIKA_TEMPLATE.md` i zacznij implementację. Produkcyjnego `main` nie dotykaj bez oddzielnego GL i pełnej walidacji.

## Koniec dnia

- snapshot przed i po pracy,
- wszystkie commity w dzienniku,
- sesje i decyzje powiązane,
- testy z wynikami,
- dowody z SHA-256,
- brak sekretów/prywatnych oryginałów w stage,
- czysty lub dokładnie opisany working tree,
- backup prywatnego brancha, gdy bezpieczny remote będzie dostępny.
