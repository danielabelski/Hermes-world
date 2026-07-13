# 08 — Zależności, licencje i IP

## Strategia własnego kodu

Hermes World pozostaje projektem prywatnym, bez udzielania licencji open-source na własny kod. Repozytorium zgłoszeniowe ma zostać udostępnione prywatnie adresom jurorskim wskazanym w regulaminie. Brak `LICENSE` dla własnego kodu nie jest blockerem submission w tym wariancie i nie oznacza porzucenia praw autorskich.

Licencje zewnętrznych zależności nie licencjonują kodu Hermes World. Ich warunki oraz wymagane notice’y są zachowywane oddzielnie w [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

## Bezpośrednie zależności

| Pakiet | Wersja lock | Licencja | Ocena |
|---|---:|---|---|
| compression | 1.8.1 | MIT | bezpieczne przy zachowaniu licencji |
| express | 5.2.1 | MIT | bezpieczne przy zachowaniu licencji |
| http-proxy-middleware | 4.1.1 | MIT | bezpieczne przy zachowaniu licencji |
| pixi.js | 8.19.0 | MIT | bezpieczne przy zachowaniu licencji |
| react / react-dom | 19.2.7 | MIT | bezpieczne przy zachowaniu licencji |
| zustand | 5.0.14 | MIT | bezpieczne przy zachowaniu licencji |
| web-push | 3.6.7 | MPL-2.0 | wymaga zachowania obowiązków MPL dla objętych plików |
| Vite / ESLint / pluginy deweloperskie | wersje z lockfile | głównie MIT | bezpieczne przy zachowaniu licencji |

## Zależności przechodnie wymagające uwagi

- `caniuse-lite` 1.0.30001799: CC-BY-4.0 — sprawdzić wymagane attribution.
- `lightningcss` 1.32.0 i binaria platformowe: MPL-2.0.
- `web-push`: MPL-2.0.
- Pozostały rozkład lockfile: głównie MIT, Apache-2.0, ISC, BSD, 0BSD i BlueOak.

## Oddzielne warstwy prawne i dystrybucyjne

1. **Własny kod Hermes World:** prywatny, wszelkie prawa zastrzeżone; bez MIT/Apache/GPL dla projektu.
2. **Zależności:** pozostają na licencjach ich autorów; wersje wynikają z lockfile.
3. **Hermes OS CAT:** własne pre-existing components autora, nie third-party.
4. **Hermes Agent:** zewnętrzny runtime/CLI, bez wykrytego vendoringu.
5. **Assety:** AI-generated original project assets; transformacje są first-party.
6. **Narzędzia deweloperskie:** np. Pillow/Vite/ESLint; nie wszystkie trafiają do bundla.
7. **Notice’y:** dotyczą tylko faktycznie redystrybuowanych komponentów zewnętrznych.

## Assety

Autor potwierdził, że wszystkie mapy, maskotki, ikony, sprite’y, efekty i pozostałe elementy wizualne Hermes World oraz CAT zostały wygenerowane od zera przez modele AI specjalnie dla jego projektów. Nie znaleziono assetów stockowych, marketplace’owych, z gier, repozytoriów ani paczek zewnętrznych. Dokładny historyczny prompt/model może być niezachowany; nie zmienia to klasyfikacji **AI-generated original project assets**. Grupy i transformacje opisuje [`ASSET_PROVENANCE_PL.md`](ASSET_PROVENANCE_PL.md).

## Hermes Agent / NousResearch

- Oficjalny Hermes Agent jest licencjonowany na MIT przez Nous Research.
- Oficjalne źródło licencji: https://github.com/NousResearch/hermes-agent/blob/main/LICENSE
- Nie znaleziono pakietu `hermes-agent` w `package.json`, submodule, vendor directory ani plików źródłowych oficjalnego projektu.
- Repo nie zawiera charakterystycznych źródeł Python Hermes Agent, takich jak `run_agent.py`, `hermes_state.py`, `toolsets.py`, `pyproject.toml` czy `uv.lock`.
- Integracja polega na wywołaniu zewnętrznego CLI `hermes`, odczycie journal/SSE i własnym adapterze `scripts/hermes-world-event-adapter.mjs`.
- Nie wykryto bezpośrednio skopiowanego fragmentu kodu Hermes Agent, dlatego nie kopiujemy całej jego licencji do kodu aplikacji. Dla przejrzystości Hermes Agent jest wymieniony w `THIRD_PARTY_NOTICES.md` jako zewnętrzny runtime/interoperability dependency.
- Porównanie SHA-256 z lokalnym checkoutem oficjalnego Hermes Agent wykazało 0 identycznych plików źródłowych/tekstowych.

## Własny kod pre-existing: Hermes OS CAT

README projektu jawnie mówi o skopiowaniu technicznego shellu z wcześniejszego Hermes OS CAT. Jest to wcześniejszy projekt tego samego właściciela, a nie kod NousResearch ani innego zewnętrznego projektu. Audyt wykazał 12 identycznych assetów oraz 23 wspólne, następnie zmodyfikowane pliki. Pełna lista znajduje się w `11_POCHODZENIE_KODU_PL.md`.

## Nazwy, znaki i usługi

- `Hermes`, `Hermes OS`, `Hermes World`, `Hermes Heroes`, `Nous` i związane znaki wymagają sprawdzenia pod kątem znaków towarowych, nazw projektów zewnętrznych i braku sugerowania afiliacji.
- Jeżeli runtime Hermes/Nous jest zewnętrznym projektem, trzeba wskazać jego licencję i zakres integracji.
- Materiały wideo nie mogą zawierać nieautoryzowanej muzyki, znaków ani cudzych materiałów.

## Lista działań

- Bezpieczne: typowe zależności MIT/Apache/ISC/BSD przy zachowaniu not.
- Wymaga attribution/notice: `caniuse-lite` CC-BY-4.0, Pillow MIT-CMU oraz pakiety objęte MIT/MPL/Apache/ISC/BSD zgodnie z ich tekstami licencji.
- Wymaga sprawdzenia: MPL-2.0, konkretna paczka CC-BY-4.0, pliki LICENSE wymagane w finalnej dystrybucji oraz nazwy Hermes/Nous.
- Potencjalne ryzyko: usunięcie wymaganych notice’ów przy tworzeniu finalnego bundla; provenance assetów własnych jest rozstrzygnięte.
