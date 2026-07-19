# Judge Guide

## Fastest evaluation path

1. Open **https://hermes-os-panel.tail03d525.ts.net:8443/**.
2. Confirm the visible **Judge Sandbox / sample data** provenance indicator.
3. Confirm that the representative agent roster and the Citadel are visible together.
4. Observe one complete sample worker operation.
5. Follow the lifecycle: assignment → travel → reasoning/tool work → completion → return.
6. Open **Citadel Activity** and inspect the named task, important runtime events and cron success/error results.
7. Enter subsystem buildings and compare their focused state with the global world.
8. Refresh or reconnect and confirm that the client restores authoritative state.

The public instance is intentionally fixture-only and read-only. It contains no private Hermes profiles, sessions, logs, credentials or writable event transport. The submission video demonstrates the corresponding real end-to-end Hermes lifecycle.

## What proves this is a developer tool

- Every character corresponds to a configured Hermes worker.
- Movement and work are driven by structured runtime events, not a scripted animation loop.
- Activity entries retain operational names, event types, timestamps and outcomes.
- A Python watcher and Node forwarder connect the live Hermes state database to an Express event hub.
- Durable history, SSE replay and reconnect/resync preserve continuity.
- The same normalized state feeds the mobile and desktop presentations.

## Safe test

Open the sandbox and allow its deterministic timeline to complete one worker cycle. Enter each building, inspect Citadel Activity and test desktop/mobile layout. No account, command or write operation is required.

The `/reset-client.html` page is only a recovery tool if a browser has cached an older PWA build.

## Technical review path

- `src/world/WorldBridge.js` — normalized snapshot model
- `src/hooks/useWorldBridge.js` — polling, SSE and resynchronization
- `src/world/events/` — event validation and state transitions
- `src/world/store/worldStore.js` — renderer-facing state
- `server/worldEventHub.js` — bounded history and SSE fan-out
- `scripts/hermes-gateway-world-adapter.py` — source watcher
- `scripts/hermes-world-event-adapter.mjs` — journal forwarder
- `scripts/judge-sandbox-server.mjs` — fixture-only, read-only judge runtime
- `src/**/*.test.js` — contract and regression tests
- `docs/build-week/` — dated engineering and evidence record

## Release identity

- Validated commit: `c18bc52dfde75395549d41ea4cebdcdef745546f`
- Validated tag: `demo-validated-2026-07-18`
- Production tag: `prod-live-20260719`
- Primary Codex Session ID: `019f4f11-14e9-70e0-8d61-26226257864c`
