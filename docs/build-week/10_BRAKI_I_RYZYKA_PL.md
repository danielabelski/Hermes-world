# 10 — Braki i ryzyka

## Aktualne realne ryzyka

| Priorytet | Ryzyko | Znaczenie | Działanie |
|---|---|---|---|
| WYSOKI | Pierwszy meaningful extension działa na demo, ale nie przeszedł jeszcze pełnego testu z live Hermes runtime | Lokalny test potwierdza UI i kontrakty, nie cały transport produkcyjny | Uruchomić evidence-backed E2E z prawdziwą wiadomością i zachować log/screenshot |
| WYSOKI | Brak off-device backupu i skonfigurowanego remote | Awaria urządzenia może utracić lokalną historię | Utworzyć prywatny remote/backup, bez publikacji |
| WYSOKI | Brak środowiska dostępnego jurorom | Produkt może nie być testowalny | Przygotować stabilny test build/account/URL |
| ŚREDNI | Brak finalnego raportu notices dla faktycznego bundla | Zbiorcze dane lockfile nie wystarczą do dystrybucji | Wygenerować raport z finalnego artefaktu i sprawdzić MPL/CC-BY |
| ŚREDNI | Brak pełnych historycznych logów testów baseline w evidence | Część wyniku pre-build opiera się na handoffie/sesji | Zachować wszystkie nowe logi; odnaleźć stare, jeśli istnieją |
| ŚREDNI | Sesja kontynuacyjna przecina granicę 18:00 | Można pomylić pracę pre/post | Wiązać każdą tezę z timestampem i commitem |

## Normalne przyszłe etapy submission

Nie są błędami obecnej dokumentacji:

1. finalny `/feedback` Session ID,
2. udostępnienie prywatnego repo adresom jurorskim,
3. środowisko testowe dostępne jurorom,
4. finalny raport notices produkcyjnego bundla,
5. finalne materiały angielskie,
6. film demonstracyjny,
7. zgłoszenie Devpost,
8. wybór tracku i końcowa kontrola dostępu.

## Ryzyka zamknięte

- Brak licencji open-source własnego prywatnego kodu — **nie jest blockerem**.
- Pochodzenie maskotek, ikon i map — potwierdzone jako AI-generated original project assets.
- Hermes Agent jako vendored dependency — brak dowodów vendoringu; zewnętrzny runtime/CLI.
- Hermes OS CAT jako cudzy projekt — własny pre-existing projekt autora.
- Prywatne screenshoty w stage — oryginały są w ignorowanym katalogu, commitowane mogą być tylko kopie po redakcji.
