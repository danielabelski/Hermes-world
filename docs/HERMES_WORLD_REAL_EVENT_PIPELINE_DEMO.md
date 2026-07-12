# Hermes World real event pipeline — demo checkpoint

Date: 2026-07-12
Scope: isolated `demo` worktree only. Production remains frozen until explicit user GL.

## Source of truth audit

The existing Citadel production bridge remains the source for slower snapshots: profiles, tasks, logs, crons, sessions, skills, models and host metrics. It polls those domains at 5/15/60 second cadences.

The authoritative source for a live agent run is the structured Hermes WebUI run journal and its replayable SSE stream, not plain-text log scraping:

- `/home/filip/hermes-webui/api/run_journal.py` stores append-only JSONL run events with stable `event_id`, `run_id` and monotonic `seq`;
- `/home/filip/hermes-webui/api/routes.py` exposes `/api/chat/stream?stream_id=...` with SSE IDs, replay and reconnect;
- `/home/filip/hermes-webui/api/streaming.py` emits reasoning, tool start/completion, approval and terminal events;
- terminal states are completed, interrupted and errored; terminal events include `done`, `stream_end`, `cancel`, `apperror` and `error`.

This lets World consume real lifecycle events without modifying Hermes OS Cat, the Hermes backend, the map, routes or production API.

## Implemented data flow

`Hermes run journal or Hermes SSE → demo sidecar adapter → POST /api/world/events → validation/order/dedupe → SSE /api/world/events/stream → event reducer → existing WorldBridge snapshot → existing FSM/routes/building effects/renderers`

There is no second movement system. Events update the existing agent/task model; `LivingWorldStateMachine` and `mapAgentPresentation` continue to decide movement, work, success and return positions.

## Normalized contract

Canonical operational states:

- `assigned`
- `thinking`
- `working`
- `waiting`
- `stuck`
- `warning`
- `critical`
- `success`
- `idle`

Presence is separate: `online | offline`.

Every accepted event contains version, stable event ID, run ID, sequence, session ID, canonical agent ID, operational state and/or presence, original event type, timestamp, task ID, optional building/severity/message, source and original payload.

Rules:

- duplicate `event_id` is idempotently ignored;
- a sequence not newer than the last accepted sequence for a run is rejected as `out_of_order`;
- unsupported events do not mutate the world;
- unknown workers are rejected;
- `Komandos MoA` maps to `komandos` only for `warning` or `critical` incidents;
- polling snapshots are overlaid with retained live events, so slower polling cannot erase fresher SSE state.

## Demo endpoints

- `POST /api/world/events` — validated ingestion. Without `HERMES_WORLD_INGEST_TOKEN`, only loopback callers may ingest.
- `GET /api/world/events/snapshot` — bounded replay snapshot and cursor.
- `GET /api/world/events/stream` — SSE snapshot, event IDs, `retry: 3000`, heartbeat every 15 seconds and replay from `Last-Event-ID`/`after`.

The in-memory hub retains the latest 500 accepted events. Durable source recovery remains the responsibility of the Hermes run journal; the adapter has a disk-backed delivery queue under ignored `data/*.json`.

## Adapter commands

From the demo worktree:

```powershell
node scripts/hermes-world-event-adapter.mjs --journal "PATH_TO_RUN_JSONL" --profile prospecting --follow
```

Direct upstream SSE:

```powershell
$env:HERMES_WEBUI_COOKIE='hermes_session=...'
node scripts/hermes-world-event-adapter.mjs --stream-url "http://127.0.0.1:8787/api/chat/stream?stream_id=STREAM_ID" --run-id "STREAM_ID" --profile prospecting
```

Optional secured ingestion:

```powershell
$env:HERMES_WORLD_INGEST_TOKEN='LOCAL_SECRET'
```

The same token must be available to the demo server and adapter. Secrets are never committed.

## Watcher vertical slice

`watcher`, `scout` and `zwiadowca` normalize to profile `prospecting`.

Verified flow:

1. `run_started` → assigned task and outbound road movement.
2. `reasoning` → distinct thinking state.
3. `tool.started` → Zwiadowca `observe` at the semantic observation point.
4. `done` → short success at the interaction point.
5. Existing FSM → return route and home, without teleportation.

## Building occupancy and visibility

Semantic journeys now expose separate `approachPoint`, `interactionPoint` and `insidePoint` without changing locked node coordinates or routes.

Accepted demo variant A:

- indoor work for Kowal and Uczony is represented at the exact facade/entrance interaction point;
- the complete sprite remains visible in a dedicated facade layer above the minimal foreground mask;
- all other agents remain in the ground depth-sorted layer;
- the two arrays are a partition, so no agent is rendered twice;
- `isInside` remains false for the visible map unit.

## Validation completed

- automated Watcher full-cycle test;
- normalized contract, MoA restriction, dedupe and out-of-order tests;
- all twelve agents on desktop and mobile: inside world bounds and visibly rendered;
- BASELINE mobile 393×852: 12 agents, online, no browser console errors;
- LIGHT mobile 393×852: 12 agents, online;
- BASELINE desktop 1366×768: 12 agents, online, no browser console errors;
- POST smoke: accepted real-shaped lifecycle sequence;
- duplicate POST: returned `duplicate`;
- SSE smoke: replay snapshot with cursor;
- full test suite, lint and production-mode Vite build.

## RL/GL gate

All changes in this document exist only on branch `demo`. Do not copy, merge or cherry-pick them to production until the user visually evaluates the demo and writes GL. On RL, iterate only in this demo worktree.

After GL, production integration must be a separate checkpoint: re-read production Git state, port the reviewed commit, rerun all tests/builds/smokes, verify real Hermes source connectivity, then update the hackathon handoff.
