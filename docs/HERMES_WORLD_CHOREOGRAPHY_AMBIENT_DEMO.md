# Hermes World — choreography and ambient director demo

Date: 2026-07-12

## Scope lock

This pass exists only on branch `demo`. The accepted real-event pipeline, normalized operational states, map geometry, semantic routes and production repository remain unchanged. Production integration is forbidden until explicit user GL.

## State hierarchy

The presentation uses three independent channels:

1. `operationalState` — only normalized real Hermes events.
2. `choreographyState` — presentation of a real event sequence.
3. `ambientState` — deterministic local life that never represents work.

Precedence is strict: `operational > choreography > ambient`.

Offline, unknown, active, warning, critical, stuck and every non-resting operational presentation cannot be overwritten by either director. Directors never mutate tasks, alerts, agents, presence or `activeAgentCount`.

## Chat choreography

A real chat run produces presentation beats without creating additional operational lifecycle events:

- an inbound message pulse reaches the Citadel;
- Kasztelan follows his existing semantic route to the command interaction point;
- the command crystal responds;
- a real thinking event changes only the evidence-backed thinking cue;
- a real success event triggers a short success cue;
- the Archive receives a local confirmation pulse;
- Kasztelan returns through the existing route.

Concurrent runs preserve the current visual origin, preventing a jump back to home. Late or out-of-order sequences cannot regress a choreography.

## Delegation choreography

For an assigned worker other than `default`/`orchestrator`:

- Kasztelan reacts first;
- an SVG signal runs from the core to the target worker's real building entrance;
- only the target worker moves through the existing operational FSM;
- the target building reacts through the existing infrastructure layer;
- unrelated agents remain idle or continue unrelated ambient actions.

The SVG uses the same 0–100 coordinate space as the map, so endpoints remain correct across mobile and desktop aspect ratios.

## Ambient Director

The director is local, deterministic and does not use an LLM.

- maximum three simultaneous ambient actions;
- first visible movement starts after about 2.4 seconds in the ambient fixture;
- subsequent selection occurs every 20–60 seconds;
- actions last 8–22 seconds;
- behaviors: `patrol`, `inspect`, `train`, `rest`, `converse`;
- the same behavior is not selected twice consecutively for the same profile;
- conversation uses a paired meeting action and interruption removes both partners;
- Kasztelan is reserved for real-event choreography and is not selected for ambient movement;
- real SSE events immediately remove ambient from the target and Kasztelan;
- polling activation also removes stale ambient actions;
- layout changes cancel presentation-only ambient routes and recalibrate against the current map;
- ambient models can only show `walk` or `idle`; never `work`, `success`, status rings or alerts.

## Environmental life

Low-cost neutral life is rendered separately:

- faint runes;
- building window lights;
- sparse path wisps.

Existing Forge ember/smoke and core heartbeat effects are reused instead of duplicated. Mobile reduces the count/opacity and `prefers-reduced-motion` disables motion while retaining static event evidence.

## Honest evaluation fixture

Use:

```text
?demo=1&scenario=ambient
```

The fixture has twelve roles, zero tasks and zero active agents. Any visible movement is therefore presentation-only ambient life or the result of an event ingested through the real demo pipeline.

## Validation

- automated suite covers operational immutability, priority, offline/unknown, event interruption, polling interruption, out-of-order events, concurrency continuity, paired conversation interruption and no repeated ambient behavior;
- ambient fixture asserts 12 agents, 0 tasks, 0 active agents and no working state;
- mobile DOM validation confirmed ambient movement, 12 agents, max 3 ambient actions and zero ambient `work`/`success`;
- real POST → SSE → DOM validation confirmed visible choreography within the 300 ms acceptance window;
- SSE is excluded from compression and flushed per event;
- BASELINE and LIGHT continue to use the same locked map coordinates;
- full lint, tests and Vite production build must pass before checkpoint.

## RL/GL gate

On RL, modify only the demo worktree. On GL, create a separate production integration checkpoint, re-run all production tests and perform a real authenticated Hermes chat/delegation smoke before deployment.
