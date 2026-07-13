# 11 — Pochodzenie kodu

## Klasyfikacja

| Kategoria | Stan |
|---|---|
| Oryginalny kod Hermes World | Kod tworzony w repo z Codexem/GPT-5.6 |
| Własny kod pre-existing | Techniczny shell odziedziczony z wcześniejszego Hermes OS CAT |
| Zewnętrzny runtime | Hermes Agent / NousResearch, uruchamiany poza repo |
| Zewnętrzne biblioteki | npm oraz Pillow, używane przez import/instalację |
| Vendored/skopiowany kod zewnętrzny | Nie wykryto |

## Hermes Agent — wynik audytu

Oficjalny Hermes Agent jest projektem Python na licencji MIT. Hermes World jest aplikacją JavaScript/React/Node. W repozytorium nie znaleziono:

- zależności `hermes-agent` w `package.json` lub lockfile,
- submodule ani katalogu vendor Hermes Agent,
- `run_agent.py`, `hermes_constants.py`, `hermes_logging.py`, `hermes_state.py`, `hermes_time.py`, `mcp_serve.py`, `toolsets.py`, `trajectory_compressor.py`, `pyproject.toml` ani `uv.lock` z projektu NousResearch,
- nagłówków copyright/SPDX wskazujących na skopiowane źródła Hermes Agent.

Dodatkowo wykonano porównanie SHA-256 plików tekstowych/source: 233 pliki Hermes World porównano z 11869 plikami lokalnego oficjalnego checkoutu Hermes Agent, z wyłączeniem `.git`, `node_modules`, venv, cache i build output. Wynik: **0 identycznych plików**.

Punkty integracji są granicami procesu/danych:

- `server.js`: uruchamia zewnętrzne komendy `hermes kanban ...` i mapuje ich JSON;
- `scripts/hermes-world-event-adapter.mjs`: własny adapter czytający JSONL/SSE i publikujący znormalizowane eventy;
- `docs/HERMES_WORLD_REAL_EVENT_PIPELINE_DEMO.md`: opisuje zewnętrzny journal i SSE;
- `src/hooks/useWorldBridge.js` oraz event contract/reducer: konsumują dane przez lokalne API.

Wniosek: nie wykryto plików wymagających wklejenia notice’u MIT NousResearch do kodu aplikacji. Wystarcza zapis integracji w `THIRD_PARTY_NOTICES.md`, dopóki Hermes Agent nie jest bundlowany ani kopiowany.

## Własny pre-existing shell Hermes OS CAT

README Hermes World jawnie stwierdza, że techniczny shell pochodzi z działającego Hermes OS CAT. Porównano aktualne repo z lokalnym źródłem `hermes-os-panel`.

### Pliki identyczne bajtowo — 12

- `public/favicon.png`
- `public/favicon.svg`
- `public/hermes-os.ico`
- `public/pwa-512x512.png`
- `src/assets/mascot/mascot_alert.webp`
- `src/assets/mascot/mascot_error.webp`
- `src/assets/mascot/mascot_idle.webp`
- `src/assets/mascot/mascot_listening.webp`
- `src/assets/mascot/mascot_sleeping.webp`
- `src/assets/mascot/mascot_success.webp`
- `src/assets/mascot/mascot_thinking.webp`
- `src/assets/mascot/mascot_typing.webp`

### Wspólne pliki, następnie zmodyfikowane — 23

- `.gitignore`
- `eslint.config.js`
- `index.html`
- `package.json`
- `package-lock.json`
- `public/apple-touch-icon.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/icons.svg`
- `public/manifest.json`
- `public/reset-client.html`
- `public/sw.js`
- `README.md`
- `server.js`
- `src/api.js`
- `src/App.jsx`
- `src/components/ChatTab.jsx`
- `src/components/ErrorBoundary.jsx`
- `src/components/HermesMascot.jsx`
- `src/components/LoginScreen.jsx`
- `src/index.css`
- `src/main.jsx`
- `vite.config.js`

Ta lista dokumentuje first-party provenance oraz wcześniejszy baseline. Nie oznacza licencji open-source ani kodu zewnętrznego. Autor potwierdził własne prawa i AI-generated original provenance assetów odziedziczonych z Hermes OS CAT.

## Inne fragmenty z projektów zewnętrznych

Nie znaleziono komentarzy „copied from”, „adapted from”, zewnętrznych URL-i źródłowych, SPDX ani katalogów vendor w kodzie aplikacji. Zależności npm są konsumowane jako pakiety, nie skopiowane fragmenty. Dwa skrypty Python są kodem repo i importują Pillow; nie zawierają źródeł Pillow.

To jest audyt statyczny, nie matematyczny dowód braku podobieństwa do całego publicznego Internetu. Każdy przyszły skopiowany/snippetowany fragment musi otrzymać źródło, licencję i zakres modyfikacji w tej sekcji.
