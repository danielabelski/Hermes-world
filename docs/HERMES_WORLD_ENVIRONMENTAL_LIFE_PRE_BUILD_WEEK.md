# Hermes World — Persistent Environmental Life

Status: implemented on `pre-build-week/environmental-world-life`; demo only.

## Locked boundaries

- Production Correct v1 is untouched.
- BASELINE remains the default map and LIGHT remains the fallback.
- Map geometry, routes, agents, event pipeline, FSM and operational state are unchanged.
- Environmental presentation cannot create tasks, active-agent counts or fake operational states.
- Production port is forbidden until explicit GL after real-phone review.

## Architecture and behavior

The map stays visibly alive without pretending that an agent is working:

1. `PersistentWorldLifeLayer` owns continuous low-intensity infrastructure life.
2. `WorldOperationsLayer` owns finite ambient operations and event reactions.
3. `WorldChoreographyLayer` visualizes real Hermes events.

Persistent landmarks never unmount during the operation schedule. Real events may increase intensity but do not create duplicate assets.

- Forge: permanent furnace fire and chimney smoke; production adds sparks/intensity.
- Water: two asynchronous clipped reflection bands.
- Citadel: continuous core; distribution adds the energy wave and rune ring.
- Archive: four phased facade window lights; ingestion adds facade runes.
- Watcher: continuous lens pulse; sweep adds the scan beam.
- Sanctum: continuous slow orbit; circulation strengthens the same asset.
- Gate: continuous restrained energy lock; a gate cycle strengthens it.
- Atmosphere: two irregular fog bands with independent timing.

Semantic visual anchors are separate from navigation nodes and agent routing. Legacy geometric placeholders, duplicate core rendering and unused duplicate building/data layers are absent from the active tree.

## Operations and event priority

- A deterministic 36-second schedule always keeps at least one readable operation active and never exceeds two large operations.
- Each operation has a beginning, middle and end; processes do not become synchronized permanent pulses.
- Urgent operational state outranks choreography, ordinary work and ambient operations.
- Warning dims unrelated landmarks to `0.68`; critical/error dims them to `0.42`; the affected subsystem remains at full intensity.
- Idle ambient never renders data paths.
- Data transit requires a real `evidenceEventId` and shows only a packet, short wake and nearby segments, never a full GPS-like route.
- Wake/segments run one finite cycle and stop.

## Runtime asset and performance budget

- Accepted source RGBA strips remain unchanged.
- Rendering uses 13 clean mobile-sized `*.runtime.png` derivatives.
- All runtime strips preserve alpha and divide into eight equal frames.
- Combined payload: `795070` bytes; enforced budget: `<800000` bytes.
- Citadel core, Forge fire and water reflection have high fetch priority; other effects use async decoding and low priority.
- Experimental WebP derivatives were rejected after visual inspection exposed alpha/color artifacts.
- No animation library or per-effect JavaScript timer was added.
- Reduced-motion and hidden-tab behavior remain supported.

## Validation — 2026-07-13

- `npm.cmd test`: `75/75` passed.
- `npm.cmd run validate:world-life`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed (`842` modules).
- Tests enforce runtime PNG alpha/dimensions/frame division/payload, 36-second and ten-minute schedule bounds, no dead gaps, no fabricated operational fields, reduced motion and alert priority.
- All runtime assets return HTTP `200` with correct content types from the existing demo server.
- Warm local responses: HTML ~`12 ms`, JS ~`51 ms`, fire ~`161 ms`, smoke ~`95 ms`.
- Final screenshot capture in the in-app preview repeatedly reset during capture. Perceptual acceptance is therefore explicitly a real-phone GL step, not an automated claim.

## Demo and gate

- Phone: `http://100.69.167.105:4176/?demo=1`
- Local: `http://127.0.0.1:4176/?demo=1`
- Warning: append `&focus=warning`.
- Critical: append `&focus=critical`.
- Developer visual mode: append `&worldDebug=visual`.

Next action: user phone review. `GL` freezes this checkpoint as the Build Week visual base; `RL` changes only named demo defects. Never port this pass to production automatically.
