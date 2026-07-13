# Hermes World — Persistent Environmental Life

Status: implemented on `pre-build-week/environmental-world-life`; demo only.

## Locked boundaries

- Production Correct v1 is untouched.
- BASELINE remains default and LIGHT remains fallback.
- No map geometry, routes, agent count, event pipeline, FSM or operational state is changed.
- Environmental presentation cannot create `Working`, `Success`, `Warning`, `Critical`, tasks or active-agent counts.

## Product rule

The map must remain visibly alive without pretending that an agent is working. Two distinct layers enforce this:

1. `PersistentWorldLifeLayer` — continuous low-intensity infrastructure life.
2. `WorldOperationsLayer` — finite ambient operations or evidence-backed reactions to real events.

Persistent life never unmounts during the 48-second operation cycle. Real events may increase a building's intensity, but they do not create a second copy of its base asset.

## Continuous map life

- Forge: permanent furnace fire, continuously drifting chimney smoke; production adds sparks and intensity instead of mounting another fire.
- Water core: two asynchronous clipped reflection bands remain mounted continuously.
- Citadel: continuous crystal/core cycle; distribution adds the energy wave and rune ring.
- Archive: four independently phased window lights; ingestion adds facade runes.
- Watcher: continuous lens pulse; a sweep operation adds the large scan beam.
- Sanctum: continuous slow orbit; circulation accelerates and strengthens the same asset.
- Gate: continuous restrained energy lock; a gate cycle strengthens the same asset.
- Atmosphere: two irregular fog bands move at different speeds and directions.

The effects use the same mobile and desktop semantic points as the accepted operation layer. Legacy geometric site effects and the duplicate legacy core were removed from the rendered tree.

## Data-flow semantics

- Ambient data routes were removed. Idle never displays a line that can be mistaken for an agent path or GPS overlay.
- Data transit is reserved for choreography backed by a real `evidenceEventId`.
- A real transit renders only a moving packet, short wake and nearby energized segments; the full navigation path is not visible.
- Existing Hermes conduits remain operational observability: dormant lines are invisible, waiting lines are nearly invisible, and true working/problem flows remain readable.

## Priority and alert behavior

- Ordinary work no longer reduces opacity of the entire environment; fire and water remain alive.
- Warning dims unrelated persistent landmarks to `0.68`.
- Critical/error dims unrelated landmarks to `0.42`, while the affected building remains at full intensity.
- Operational response and event choreography still outrank ambient scheduling.

## Performance budget

- Seven persistent landmarks, twelve small sprite nodes and two fog bands on mobile.
- No new animation library and no per-effect JavaScript timer.
- Sprite animation uses CSS transforms with eight-frame RGBA strips.
- Persistent nodes remain stable across the full ambient cycle; operations are capped at two.
- Hidden/reduced-motion behavior remains supported; heavy smoke and fog are suppressed under reduced motion.
- Ambient DataPulse rendering and its unused module were removed from the active bundle.

## Validation

- `72/72` unit and integration tests pass.
- ESLint passes.
- Production build passes (`844` modules).
- Mobile DOM validation at `393×852`: seven persistent landmarks, twelve sprite nodes, two fog bands, zero legacy site placeholders, zero duplicate legacy core and zero idle data transits.
- Desktop DOM validation at `1366×768`: all seven landmarks remain inside the viewport and no error boundary is present.
- One full 48-second runtime cycle keeps exactly seven persistent landmarks and twelve sprite nodes; fire and both water bands remain mounted; browser console has no warnings or errors.
- Critical scenario validation: only the affected Forge remains at full intensity while unrelated ambient landmarks dim to `0.42`.
- Ten simulated minutes remain bounded and cannot fabricate operational fields.

## Checkpoints

- `a436ad1 feat: replace world operation placeholders with alpha sprites` — safe pre-persistent checkpoint containing all accepted RGBA strips.
- The persistent-life pass is committed separately so it can be reverted without touching the accepted asset checkpoint.

## Demo

- Mobile/default: `http://100.69.167.105:4176/?demo=1`
- Working: `http://100.69.167.105:4176/?demo=1&focus=working`
- Critical priority: `http://100.69.167.105:4176/?demo=1&focus=critical`
- Visual developer mode remains opt-in through `?worldDebug=visual`.
