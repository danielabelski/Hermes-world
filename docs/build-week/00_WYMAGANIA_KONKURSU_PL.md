# 00 — Wymagania konkursu

Ostatnia weryfikacja: **13 lipca 2026**. Źródła wyłącznie oficjalne: [Official Rules](https://openai.devpost.com/rules), [Overview](https://openai.devpost.com/), [Resources](https://openai.devpost.com/resources), [OpenAI Build Week](https://openai.com/build-week/). W razie rozbieżności pierwszeństwo mają Official Rules. Devpost Hackathons Plugin nie był używany.

## Terminy

- Submission Period: 13 lipca 2026, 09:00 PT → 21 lipca 2026, 17:00 PT.
- Europe/Warsaw: 13 lipca 2026, 18:00 → 22 lipca 2026, 02:00.

## A. Wymagania potrzebne obecnie

| Wymaganie | Źródło / sekcja | Interpretacja dla Hermes World | Status | Dowód | Termin | Blocker | Działanie teraz | Przed submission |
|---|---|---|---|---|---|---|---|---|
| Existing project musi zostać meaningful extended z Codexem/GPT-5.6 podczas Submission Period; oceniana jest nowa praca. | Rules §4, Existing Projects | Baseline zamyka 51 wcześniejszych commitów; nowa funkcja musi mieć post-start commit, sesję i test. | CZĘŚCIOWO | tag baseline, Git, dziennik | okres konkursu | TAK | zbudować extension na branchu konkursowym | wykazać diff od baseline |
| Zachować timestampowane sesje Codexa lub historię commitów i rozdzielić pre-existing od nowego. | Rules §4, Existing Projects | Każdy dowód ma okres, czas i powiązanie z commitem/sesją. | SPEŁNIONE | Git, snapshoty, indeks dowodów | ciągle | TAK | utrzymywać workflow | dołączyć czytelne podsumowanie |
| Projekt wykorzystuje Codex i GPT-5.6. | Rules §4, Submission Requirements | Logi `turn_context` wskazują GPT-5.6 Terra/Luna/Sol; CodexBar GPT-5.5 to miesięczny agregat, nie sesja projektu. | SPEŁNIONE | sesje, screeny 1–5 | submission | TAK | zachowywać nowe Session ID | opisać współpracę po angielsku |
| Produkt ma działać stabilnie na deklarowanej platformie. | Rules §4, Functionality | Mobile i runtime wymagają powtarzalnych testów oraz jurorskiego dostępu. | CZĘŚCIOWO | rejestr testów | submission/judging | TAK | testować każdy blok | końcowy build i dostęp |
| Third-party components muszą być legalnie użyte. | Rules §4, Third Party Integrations; IP | Kod własny pozostaje prywatny; notices dotyczą tylko zewnętrznych elementów. | CZĘŚCIOWO | notices, lockfile, provenance | submission | TAK | utrzymywać audyt | raport faktycznego bundla |
| Uczestnik musi posiadać prawa i chronić prywatność. | Rules §4/§8, IP and Content | Assety są własnymi AI-generated originals; prywatne dowody nie trafiają do jurorskiego repo. | SPEŁNIONE dla bieżącego stanu | oświadczenie autora, redakcje, SHA-256 | ciągle | TAK | scan przed commitami | scan materiałów finalnych |

## B. Wymagania dokumentowane podczas budowania

| Wymaganie | Źródło / sekcja | Interpretacja | Status | Dowód | Termin | Blocker | Teraz | Przed submission |
|---|---|---|---|---|---|---|---|---|
| Udokumentować wkład Codexa i decyzje człowieka. | Rules §4, README | Sesje, decyzje, pliki i commity są rejestrowane append-only. | SPEŁNIONE/proces ciągły | dokumenty 02–04 | każdy blok | NIE | dopisywać | streścić w README EN |
| Zachować testy i dowody działania. | Overview/Resources, judging guidance | Każdy wynik ma komendę, czas, commit i ograniczenia. | SPEŁNIONE/proces ciągły | dokument 06 | każdy blok | NIE | dopisywać | końcowa macierz |
| Nie wybrać błędnego `/feedback` Session ID. | Rules §4, Session ID | Finalny ID dopiero po większości core functionality podczas konkursu. | CZĘŚCIOWO | rejestr sesji | submission | TAK | zbierać kandydatów | wybrać i uruchomić `/feedback` |

## C. Wymagania dopiero przed submission

| Wymaganie | Źródło / sekcja | Interpretacja | Status | Dowód docelowy | Termin | Blocker | Teraz | Przed submission |
|---|---|---|---|---|---|---|---|---|
| Wybrać kategorię i uzupełnić zgłoszenie. | Rules §4 | Nie jest zakresem bieżącej dokumentacji. | BRAK — PLANOWANE | Devpost | 22.07 02:00 Warsaw | TAK | brak | wykonać |
| Publiczny film YouTube <3 min z audio, produktem i użyciem Codexa/GPT-5.6. | Rules §4, Video | Powstanie osobno. | BRAK — PLANOWANE | URL YouTube | jw. | TAK | brak | nagrać/opublikować |
| Repo publiczne z właściwą licencją albo prywatne udostępnione jurorom. | Rules §4, Repository | Wybrano prywatne repo; brak OSS license własnego kodu nie jest blockerem. Zaprosić `testing@devpost.com` i `build-week-event@openai.com`. | CZĘŚCIOWO | prywatny URL i dostęp | jw. | TAK | zachować prywatność | udostępnić i sprawdzić |
| README po angielsku: setup, współpraca z Codexem, decyzje, GPT-5.6. | Rules §4, README; Resources | Finalny README powstanie z polskiego źródła prawdy. | BRAK — PLANOWANE | README EN | jw. | TAK | brak | przygotować |
| Działający bezpłatny dostęp przez judging period. | Rules §4, Access | Lokalny/Tailscale dostęp autora nie jest automatycznie dostępem jurorskim. | BRAK — PLANOWANE | test URL/account/instrukcja | judging | TAK | zaplanować | wdrożyć i zweryfikować |
| Developer Tool: jasne platformy, instalacja i testowalność bez przebudowy. | Rules §4, Developer Tools | Obowiązuje, jeśli ten track zostanie wybrany. | NIEZWERYFIKOWANE | instrukcja/sandbox | submission | warunkowo | wybór tracku później | wykonać jeśli dotyczy |
| Materiały po angielsku lub z tłumaczeniem. | Rules §4, Language | Bieżąca dokumentacja pozostaje po polsku. | BRAK — PLANOWANE | finalne EN | submission | TAK | brak | przetłumaczyć finalne materiały |

Finalny film, Devpost, angielski README, jurorski dostęp i `/feedback` są przyszłymi etapami submission, a nie brakami jakości obecnej polskiej dokumentacji.
