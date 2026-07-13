# 09 — Bezpieczeństwo i prywatność

## Scan 13 lipca 2026

| Typ kontroli | Wynik | Lokalizacja / działanie |
|---|---|---|
| Rozpoznawalne API keys, tokeny, private keys | 0 plików — PASS | scan repo bez `node_modules`, `dist` i prywatnych oryginałów |
| `.env` | `.env.demo` jest śledzony od baseline | zawiera jawny config demo, nie rozpoznany sekret; nie dodawać wartości poufnych |
| Prywatne domeny/Tailscale/IP/ścieżki/e-maile | 9 plików wymagających kontroli przed jurorskim udostępnieniem | `server.js`; `scripts/run-citadel-service.ps1`; `scripts/configure-citadel-remote.ps1`; `NEXT_WINDOW_HANDOFF.md`; cztery historyczne dokumenty w `docs/`; oficjalne adresy jurorskie w dokumencie 00 nie są prywatne |
| Prywatne dane screenshotów | wykryte w 6 oryginałach | oryginały przeniesione do ignorowanego `evidence/private-originals/` |
| Kopie redagowane | 6/6 — PASS wizualny | `evidence/screenshots-redacted/`; osobne PNG i osobne SHA-256 |
| Nowa dokumentacja/stage | 0 wzorców sekretów | przed każdym commitem powtórzyć scan |

Raport nie zapisuje wartości znalezionych adresów ani konfiguracji. Wskazuje wyłącznie typ i lokalizację.

## Oryginały dowodowe

- Oryginały nie zostały zmodyfikowane; ich sześć SHA-256 nadal zgadza się z manifestem.
- `docs/build-week/evidence/private-originals/` jest objęty `.gitignore` i nie może wejść do jurorskiego repo.
- Kopie redagowane używają nieprzezroczystych masek; nie nadpisują oryginałów.
- Screeny 1, 2, 3 i 5 mają najwyższą wartość; 4 jest pomocniczy; 6 pozostaje internal/supporting.

## Przed udostępnieniem jurorom

1. Powtórzyć secret scan całej historii i aktualnego tree.
2. Sprawdzić wskazane historyczne handoffy, skrypty zdalnego dostępu i `server.js` pod kątem prywatnych adresów.
3. Nie publikować `.env`, cookies, haseł, tokenów ani danych prywatnych sesji Hermesa.
4. Użyć syntetycznych danych testowych i czystego profilu jurorskiego.
5. Udostępnić prywatne repo wyłącznie wymaganym adresom; nigdy nie przełączać go publicznie bez osobnej decyzji.
6. Jurorski screenshot może pochodzić wyłącznie z katalogu redacted albo z nowego czystego ujęcia.

## Status

Dokumentacyjny commit jest wolny od wykrytych sekretów i prywatnych oryginałów. Całe repo pozostaje prywatne; zanim zostanie udostępnione jurorom, wymaga manualnej kontroli wymienionych pre-existing plików z adresami/ścieżkami. To ryzyko dystrybucji, nie wyciek w nowej dokumentacji.
