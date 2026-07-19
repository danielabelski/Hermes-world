# Judge Guide

## Fastest evaluation path

1. Open **https://hermes-os-panel.tail03d525.ts.net:10000/**.
2. Authenticate with the credentials supplied privately in Devpost.
3. Confirm that the configured agent roster and the Citadel are visible together.
4. Trigger or observe one real Hermes worker operation.
5. Follow the lifecycle: assignment → travel → reasoning/tool work → completion → return.
6. Open **Citadel Activity** and inspect the named task, important runtime events and cron success/error results.
7. Enter subsystem buildings and compare their focused state with the global world.
8. Refresh or reconnect and confirm that the client restores authoritative state.

Allow a few seconds after authentication for independent telemetry domains and the live-event stream to synchronize. The product distinguishes live, stale and unavailable information rather than inventing activity.

## What proves this is a developer tool

- Every character corresponds to a configured Hermes worker.
- Movement and work are driven by structured runtime events, not a scripted animation loop.
- Activity entries retain operational names, event types, timestamps and outcomes.
- A Python watcher and Node forwarder connect the live Hermes state database to an Express event hub.
- Durable history, SSE replay and reconnect/resync preserve continuity.
- The same normalized state feeds the mobile and desktop presentations.

## Safe test

Send a normal, non-destructive instruction through the configured Hermes channel and ask Hermes to delegate one bounded research or review task to a worker. Observe the worker lifecycle in the Citadel and inspect the corresponding Activity entry.

Do not change server configuration, event bridge settings or service-worker state during ordinary evaluation. The `/reset-client.html` page is only a recovery tool if a browser has cached an older PWA build.

## Technical review path

- `src/world/WorldBridge.js` — normalized snapshot model
- `src/hooks/useWorldBridge.js` — polling, SSE and resynchronization
- `src/world/events/` — event validation and state transitions
- `src/world/store/worldStore.js` — renderer-facing state
- `server/worldEventHub.js` — bounded history and SSE fan-out
- `scripts/hermes-gateway-world-adapter.py` — source watcher
- `scripts/hermes-world-event-adapter.mjs` — journal forwarder
- `src/**/*.test.js` — contract and regression tests
- `docs/build-week/` — dated engineering and evidence record

## Release identity

- Validated commit: `c18bc52dfde75395549d41ea4cebdcdef745546f`
- Validated tag: `demo-validated-2026-07-18`
- Production tag: `prod-live-20260719`
- Primary Codex Session ID: `019f4f11-14e9-70e0-8d61-26226257864c`
