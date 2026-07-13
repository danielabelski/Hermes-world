# 01 — Provenance i baseline

## Geneza

Hermes World rozpoczął się jako nowy projekt rozwijany z pomocą Codexa po udostępnieniu GPT-5.6. Najstarsza odnaleziona sesja źródłowa zaczęła się **10 lipca 2026 o 04:44:26 Europe/Warsaw**. Jej identyfikator to `019f49e9-6897-7cb3-b9b9-006c13cebec5`, a tytuł zaczyna się od „Jesteś Senior Product Designer, Game Designer, AI Systems…”.

Strukturalna analiza rekordów `turn_context` tej sesji wykazała wyłącznie modele GPT-5.6:

- `gpt-5.6-terra`: 35 kontekstów,
- `gpt-5.6-luna`: 2 konteksty,
- `gpt-5.6-sol`: 49 kontekstów.

Nie wykryto kontekstu pracy `gpt-5.5`. Widoczny na jednym screenshocie wpis CodexBar „Top model: gpt-5.5” jest zbiorczą statystyką miesięczną konta, a nie oznaczeniem modelu bieżącej sesji ani Hermes World. Jako dowód modelu traktujemy logi strukturalne sesji oraz bezpośredni selektor `5.6` widoczny na ekranach, nie miesięczny agregat CodexBar.

## Historia Git

- Pierwszy commit repozytorium: `3b6754aedf4338997a0b445a4b7fce20f8d89c57` — `feat: establish map-agent vertical slice checkpoint`, 11 lipca 2026, 13:49:42 +02:00.
- Pierwszy commit nie jest dowodem absolutnej chwili utworzenia pierwszego pliku. Sesja Codexa i praca nad vertical slice rozpoczęły się wcześniej, 10 lipca; repozytorium zostało utrwalone w Git po powstaniu działającego zakresu.
- Granica konkursu: 13 lipca 2026, 18:00 Europe/Warsaw.
- Ostatni jednoznacznie potwierdzony commit przed granicą: `b80b89d771457e6d6c515cda51e4d480f85245e1`, 13 lipca 2026, 16:47:03 +02:00 — `pre-build: GPT-5.6 living world checkpoint`.
- Pierwszy commit po granicy: **nie istnieje w chwili audytu**. Pierwszą pracą po starcie jest niezatwierdzona dokumentacja w `docs/build-week/`.
- Wszystkie 51 istniejących commitów były przed Submission Period.

## Zamrożony baseline

`b80b89d771457e6d6c515cda51e4d480f85245e1` jest jednoznacznym pre-Build Week baseline, ponieważ:

1. powstał 1 godzinę 12 minut 57 sekund przed oficjalną granicą,
2. working tree był czysty,
3. po nim nie ma żadnego commita przed ani po 18:00,
4. commit świadomie nosi nazwę pre-build checkpoint,
5. wiąże się z końcowym pre-submission zestawem testów i handoffem.

Annotated tag:

```bash
pre-build-week-baseline-2026-07-13
```

Branch konkursowy utworzony z baseline: `build-week/hermes-world`.

## Pełny audyt repozytorium

- Lokalne branche: `main` (`7f586fe`), `demo` (`fb96466`) oraz bieżący `pre-build-week/environmental-world-life` (`b80b89d`).
- Remote branches: brak.
- Skonfigurowane remotes: brak.
- Worktree produkcyjny: `hermes-os-living-world`, branch `main`, czysty podczas audytu.
- Worktree demo/konkursowy: `hermes-os-living-world-demo`, bieżący branch; był czysty przed utworzeniem dokumentacji.
- Stash: brak.
- Tagi: jeden istniejący lekki tag `checkpoint-agent-integration-start` wskazujący `bdedc3a`; brak poprawnego annotated tagu baseline.
- Merge commity: brak.
- Aktualny HEAD: `b80b89d771457e6d6c515cda51e4d480f85245e1`.
- Rozbieżności dat autora/committera: dwa małe opóźnienia w commitach `87bf21d` (około 86 sekund) i `a8b0a0d` (około 3,5 minuty). Żaden commit nie przecina granicy 18:00 i nie znaleziono podejrzanej zmiany czasu.
- Największy commit to początkowy `3b6754a` (285 plików, 22576 dodanych linii), dlatego należy jawnie zaznaczać, że znaczna część baseline powstała przed konkursową granicą.
- Dalsza praca konkursowa odbywa się na `build-week/hermes-world`; wcześniejszy branch pozostaje niezmienionym punktem historii.

W chwili rozpoczęcia audytu nie było plików śledzonych ani nieśledzonych w working tree. Obecne pliki nieśledzone są wyłącznie zamierzonymi dokumentami, kopiami dowodów i skryptem snapshotu; nie zmieniono kodu aplikacji.

## Stan baseline

Branch: `pre-build-week/environmental-world-life`. Produkcyjny `main` pozostaje na `7f586fe`. Baseline zawiera między innymi, jako pracę **sprzed Submission Period**:

- mobilny vertical slice mapy i 12 agentów,
- semantyczne waypointy, routing, anchory, depth sorting oraz FSM,
- rozróżnione role i stany agentów,
- real event pipeline i izolowany adapter demo,
- choreography i ambient director,
- environmental life oraz visible world operations,
- assety alfa efektów świata,
- mobile UI, statusy observability i testy walidacyjne.

W porównaniu z produkcyjnym `main` baseline ma 20 dodatkowych commitów, 77 zmienionych plików, 3042 dodane i 68 usuniętych linii. To porównanie nie oznacza pracy konkursowej — cały ten diff jest pre-submission.

## Rozdzielenie okresów

### A — Geneza i praca przed Submission Period

10–13 lipca do 17:59:59 Europe/Warsaw: projekt, architektura, mapowanie, role, pipeline, choreografia, życie środowiska i stabilizacja. Dowody: Git, sesje Codexa, screenshoty, handoffy i testy.

### B — Ostatni potwierdzony baseline

Commit `b80b89d` z 13 lipca, 16:47:03 Europe/Warsaw.

### C — Praca od rozpoczęcia Submission Period

Od 13 lipca 2026, 18:00 Europe/Warsaw: na moment audytu wyłącznie zabezpieczenie historii, dokumentacja provenance, katalog dowodów i system snapshotów. Brak post-submission commita i brak nowej funkcji aplikacji.

### D — Dalsza praca

Każdy następny blok musi być udokumentowany przed commitem i powiązany z sesją, testami oraz diffem od baseline. Tylko ta warstwa może być przedstawiana jurorom jako rozszerzenie zbudowane podczas Submission Period.

## Dowody

- `PRE-SESSION-001`: sesja początkowa z 10 lipca.
- `PRE-SESSION-002`: sesja kontynuacyjna od 11 lipca; po granicy obejmuje także audyt dokumentacyjny.
- `PRE-IMG-001`–`PRE-IMG-006`: screenshoty z 10–12 lipca.
- pełny graf Git i commit `b80b89d`.
- `NEXT_WINDOW_HANDOFF.md` oraz dokumenty walidacyjne sprzed granicy.

## Otwarte kwestie operacyjne

- Brak remote oznacza brak off-device kopii historii Git.
- Brak skonfigurowanego prywatnego remote/off-device backupu.
- Finalny raport notices musi zostać wygenerowany dla faktycznie dystrybuowanego bundla.
- Finalny `/feedback` Session ID należy wybrać dopiero po powstaniu większości nowej core functionality podczas Submission Period.
- Deklarację „projekt od zera” wspierają sesja i pierwszy commit, ale nie należy twierdzić, że pierwszy commit jest chwilą powstania pierwszego pliku.
