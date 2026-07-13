# 07 — Indeks dowodów

Każdy oryginał jest zachowany bez modyfikacji. Publiczne użycie wymaga osobnej kopii po redakcji. Wszystkie screeny poniżej noszą oznaczenie:

> Stan przed rozpoczęciem Submission Period — materiał nie jest przedstawiany jako praca wykonana podczas Build Week.

## Screenshoty 10–12 lipca

| ID | Oryginał lokalny / kopia redagowana | Data widoczna / źródło | Co udowadnia | Okres | SHA-256 oryginału | Prywatność / anonimizacja | Siła |
|---|---|---|---|---|---|---|---|
| PRE-IMG-001 | `private-originals/PRE-IMG-001-…jpg` / `screenshots-redacted/PRE-IMG-001-redacted.png` | 10.07.2026 23:40; autor | GPT-5.6 Sol, długi cel i audyty mapy/renderera/tras | przed | `3356A610…46AC135` | oryginał ignorowany; kopia zredagowana, hash `34A4B4A0…BF9A27` | BARDZO SILNA |
| PRE-IMG-002 | `private-originals/PRE-IMG-002-…jpg` / `screenshots-redacted/PRE-IMG-002-redacted.png` | 10.07.2026 17:07; autor | GPT-5.6 Terra, vertical slice, 12 agentów i subtaski | przed | `F6E24A6A…97529F` | oryginał ignorowany; kopia zredagowana, hash `36342983…8644C` | BARDZO SILNA |
| PRE-IMG-003 | `private-originals/PRE-IMG-003-…jpg` / `screenshots-redacted/PRE-IMG-003-redacted.png` | 10.07.2026 17:52; autor | Fizyczny datowany ekran, GPT-5.6 Terra i subtaski | przed | `A8A47343…91EF4CB` | oryginał ignorowany; lokalny port/PID zamaskowany, hash `BAEDFE3A…CD3702` | SILNA |
| PRE-IMG-004 | `private-originals/PRE-IMG-004-…jpg` / `screenshots-redacted/PRE-IMG-004-redacted.png` | 10.07.2026; autor | GPT-5.6 Sol i audyty subagentów | przed | `C6BA0CB8…E55BB22` | oryginał ignorowany; kopia zredagowana, hash `50F7A9C4…96C29F` | POMOCNICZA |
| PRE-IMG-005 | `private-originals/PRE-IMG-005-…jpg` / `screenshots-redacted/PRE-IMG-005-redacted.png` | 11.07.2026 23:55; autor | GPT-5.6 Sol, implementacja tras i macierzy stanów | przed | `36780E8E…371581B` | oryginał ignorowany; dane CodexBar i nazwa zasłonięte, hash `4730446B…A0144` | BARDZO SILNA |
| PRE-IMG-006 | `private-originals/PRE-IMG-006-…jpg` / `screenshots-redacted/PRE-IMG-006-redacted.png` | 12.07.2026 17:33; autor | Wyłącznie supporting evidence intensywności użycia konta | przed | `39CEF594…D11D20` | oryginał ignorowany; pulpit i koszty zasłonięte, hash `AAD20B05…D4A0E3` | WEWNĘTRZNA |

### Ważna interpretacja PRE-IMG-006

Widoczny napis „Top model: gpt-5.5” jest agregatem ostatnich 30 dni. Nie oznacza, że GPT-5.5 był użyty przy Hermes World. Strukturalne logi obu głównych sesji wykazują wyłącznie GPT-5.6. Screen 6 nie powinien służyć do dowodzenia wersji modelu.

## Sesje i Git

| ID | Typ | Data | Co udowadnia | Okres | Powiązania | Siła |
|---|---|---|---|---|---|---|
| PRE-SESSION-001 | log Codexa | od 10.07.2026 04:44:26 Europe/Warsaw | Geneza projektu, użycie GPT-5.6 i Codexa do architektury, implementacji, testów i iteracji | przed | pierwszy commit `3b6754a`, PRE-IMG-001–004 | BARDZO SILNA |
| PRE-SESSION-002 | log Codexa | od 11.07.2026 04:45:52; przecina granicę | Kontynuacja implementacji do `b80b89d`; po granicy dokumentacja | mieszany | PRE-IMG-005, commity do `b80b89d` | BARDZO SILNA |
| PRE-GIT-001 | graf Git | 11–13.07.2026 | 51 datowanych commitów i zakres baseline | przed | `3b6754a`…`b80b89d` | BARDZO SILNA |
| PRE-SESSIONS-INDEX-001 | manifest CSV | 13.07.2026 | 83 pełne identyfikatory powiązanych sesji i subagentów | przed/mieszany | `ALL_SESSIONS_MANIFEST.csv`, SHA-256 `483E2FCBD7D44CEFCEC77DE3B0D2E103CC8FC5427EB4E5F0859FA2098901685B` | SILNA |
| GIT-SNAPSHOT-001 | snapshot Git | 13.07.2026 18:51:15 UTC | Pierwszy udokumentowany working tree po starcie | podczas | `20260713T185115Z-git-snapshot.txt`; pierwsze uruchomienie skryptu | ŚREDNIA |
| GIT-SNAPSHOT-002 | snapshot Git | 13.07.2026 18:51:55 UTC | Pełna lista nieśledzonych dokumentów i dowodów | podczas | `20260713T185155Z-git-snapshot.txt`; pole Warsaw błędnie użyło UTC, plik zachowany jako dowód korekty | ŚREDNIA |
| GIT-SNAPSHOT-003 | snapshot Git | 13.07.2026 18:53:01 UTC / 20:53:01 Europe/Warsaw | Kompletne metadane z prawidłowym Europe/Warsaw | podczas | `20260713T185301Z-git-snapshot.txt` | SILNA |
| GIT-SNAPSHOT-004 | snapshot Git | 13.07.2026 19:25:57 UTC / 21:25:57 Europe/Warsaw | Korekta strategii prywatnego repo, audyt Hermes Agent i provenance assetów | podczas | `20260713T192557Z-git-snapshot.txt` | SILNA |

## Metadane oryginałów

- Wymiary i rozmiary plików zapisano podczas audytu.
- Żaden z sześciu plików nie zawierał użytecznego EXIF DateTime; czasy systemowe plików odpowiadają transferowi załączników 13 lipca, a nie wykonaniu screenów.
- Datowanie opiera się na czasie widocznym na ekranie, powiązanych logach sesji i Git. To ograniczenie należy jawnie zachować.
- Oryginały znajdują się wyłącznie lokalnie w ignorowanym `private-originals/`; ich pełne hashe są w `pre-submission/SHA256SUMS.txt` i w historii audytu.
- Kopie redagowane utworzono jako osobne PNG i zweryfikowano wizualnie. Nie są jeszcze finalną selekcją jurorską.
