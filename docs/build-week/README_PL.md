# Hermes World — polskie źródło prawdy OpenAI Build Week

Ten katalog dokumentuje stan historyczny, pracę konkursową, decyzje, testy, sesje Codexa i dowody. Nie jest finalnym README, pitch deckiem ani materiałem jurorskim. Granica czasu: **13 lipca 2026, 18:00 Europe/Warsaw**.

Aktualny techniczny checkpoint i dokładne instrukcje wznowienia znajdują się w [NEXT_WINDOW_HANDOFF.md](../../NEXT_WINDOW_HANDOFF.md). Dziennik, rejestr sesji i wyniki testów pozostają źródłem chronologicznym; handoff jest ich bieżącym skrótem operacyjnym.

## Nawigacja

| Dokument | Funkcja |
|---|---|
| [00_WYMAGANIA_KONKURSU_PL.md](00_WYMAGANIA_KONKURSU_PL.md) | Oficjalna macierz wymagań |
| [01_PROVENANCE_I_BASELINE_PL.md](01_PROVENANCE_I_BASELINE_PL.md) | Geneza, Git i zamrożony baseline |
| [02_DZIENNIK_BUILD_WEEK_PL.md](02_DZIENNIK_BUILD_WEEK_PL.md) | Append-only dziennik bloków pracy |
| [03_SESJE_CODEX_PL.md](03_SESJE_CODEX_PL.md) | Sesje, modele i kandydaci `/feedback` |
| [04_REJESTR_DECYZJI_PL.md](04_REJESTR_DECYZJI_PL.md) | Decyzje produktu i architektury |
| [05_ARCHITEKTURA_I_ZMIANY_PL.md](05_ARCHITEKTURA_I_ZMIANY_PL.md) | Stan rzeczywisty warstw systemu |
| [06_TESTY_I_STABILNOSC_PL.md](06_TESTY_I_STABILNOSC_PL.md) | Testy i walidacje |
| [07_INDEKS_DOWODOW_PL.md](07_INDEKS_DOWODOW_PL.md) | Hashe, źródła i redakcja dowodów |
| [08_ZALEZNOSCI_LICENCJE_IP_PL.md](08_ZALEZNOSCI_LICENCJE_IP_PL.md) | Kod własny, zależności, licencje i IP |
| [09_BEZPIECZENSTWO_I_PRYWATNOSC_PL.md](09_BEZPIECZENSTWO_I_PRYWATNOSC_PL.md) | Sekrety i prywatność |
| [10_BRAKI_I_RYZYKA_PL.md](10_BRAKI_I_RYZYKA_PL.md) | Wyłącznie aktualne ryzyka |
| [11_POCHODZENIE_KODU_PL.md](11_POCHODZENIE_KODU_PL.md) | Hermes World, CAT i Hermes Agent |
| [12_PROCEDURA_PRACY_OD_TERAZ_PL.md](12_PROCEDURA_PRACY_OD_TERAZ_PL.md) | Procedura każdego bloku Build Week |
| [13_STATUS_STARTOWY_BUILD_WEEK_PL.md](13_STATUS_STARTOWY_BUILD_WEEK_PL.md) | Jednostronicowy handoff startowy |
| [ASSET_PROVENANCE_PL.md](ASSET_PROVENANCE_PL.md) | AI-generated original project assets |
| [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) | Komponenty zewnętrzne; nie licencjonuje kodu Hermes World |

## Co jest append-only

`02_DZIENNIK_BUILD_WEEK_PL.md`, `03_SESJE_CODEX_PL.md`, `04_REJESTR_DECYZJI_PL.md`, `06_TESTY_I_STABILNOSC_PL.md` i `07_INDEKS_DOWODOW_PL.md`. Błąd historyczny prostujemy nowym wpisem. Nie nadpisujemy oryginałów, commitów ani hashy.

## Rozpoczęcie i zakończenie pracy

Pełna procedura jest w [12_PROCEDURA_PRACY_OD_TERAZ_PL.md](12_PROCEDURA_PRACY_OD_TERAZ_PL.md). W skrócie: sprawdź branch i tree → snapshot → zapisz Session ID/model/cel → pracuj → testy → dziennik/decyzje → snapshot → czytelny commit.

## Snapshot Git

```bash
bash ./scripts/build-week/capture-evidence.sh \
  --session-id SESSION_ID \
  --goal "Krótki cel bloku" \
  --baseline pre-build-week-baseline-2026-07-13
```

Skrypt zapisuje wyłącznie metadane Git w `evidence/git-snapshots/`. Nie czyta `.env`, nie kopiuje diffów, nie łączy się z siecią, nie commituję i nie pushuje.

## Dowody i prywatność

- Oryginały prywatne: `evidence/private-originals/` — lokalne, ignorowane przez Git.
- Kopie po redakcji: `evidence/screenshots-redacted/`.
- Dowody pre-submission mają stałe oznaczenie, że nie dokumentują pracy Build Week.
- Finalne materiały jurorskie powstaną później po angielsku; nie należy ich tworzyć przez modyfikowanie tej historii.
# Dedykowane efekty wnętrz

Prompty, jednolity kontrakt sprite stripów oraz kolejność generowania znajdują się w [INTERIOR_EFFECT_ASSET_PROMPTS_PL.md](./INTERIOR_EFFECT_ASSET_PROMPTS_PL.md). Źródła są generowane pojedynczo w ChatGPT, a ich integracja, provenance, normalizacja i testy są wykonywane przez Codexa na branchu Build Week.
