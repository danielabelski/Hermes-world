# Hermes World — Environmental World Life Pass

Status: implemented on `pre-build-week/environmental-world-life`; demo only.

## Locked boundaries

- Production Correct v1 is untouched.
- BASELINE remains default and LIGHT remains fallback.
- No map geometry, routes, agent count, event pipeline, FSM, operational state or production deployment is changed.
- Environment is presentation-only and cannot write `Working`, `Success`, `Warning`, `Critical` or active-agent counts.

## Architecture

- `environmentalDirector.js`: centralized building configuration, bounded data routes, ambient scheduling and priority resolution.
- `useEnvironmentalDirector.js`: one visibility/reduced-motion controller; reuses the existing presentation clock and adds no per-element timers.
- `BuildingLifeLayer`: individual rhythms for Citadel, Forge, Watcher, Archive and Sanctum.
- `DataPulseLayer`: 1–3 ambient packets plus evidence-backed real-event packets.
- `AtmosphereLayer`: bounded water reflections, forge smoke, fog and road reflections.
- `EnvironmentalDebugPanel`: demo-only `?worldDebug=1` diagnostics.

Priority is operational alert/work → evidence-backed choreography → ambient. Operational data is read but never mutated.

## Performance budget

- Mobile presentation budget: 8 particles; desktop: 10.
- At most two ambient buildings are active concurrently.
- At most three ambient data packets are scheduled.
- Resting buildings pause their internal animation loops.
- Hidden tabs pause CSS animation and schedule zero moving particles.
- Reduced motion hides travel effects and retains only subdued static landmarks.
- Keyframes animate transform and opacity; no animation library or per-particle JavaScript timer is used.

## Validation

- 57/57 unit and integration tests pass, including ten simulated minutes of bounded idle life.
- Mobile 393×852: BASELINE and LIGHT, no overflow, 5 configured buildings, director running, bounded packet/particle counts, no console warnings/errors.
- Desktop 1366×768: BASELINE, no overflow, bounded packet/particle counts, no console warnings/errors.
- Live local SSE validation: delegation targets only Forge with its event evidence ID; Critical suppresses ambient intensity and dominates the Forge response.
- Two navigational remounts leave exactly one environment, building, data and atmosphere layer.

## Demo URLs

- Ambient: `/?demo=1&scenario=ambient`
- Debug: `/?demo=1&scenario=ambient&worldDebug=1`
- LIGHT fallback: `/?demo=1&scenario=ambient&mapVariant=light`
- Visual verification: `/?demo=1&scenario=ambient&worldDebug=visual` (15 seconds, eight labeled existing effects).

## Mobile visibility calibration

- The first five seconds now expose Citadel pulse, an inbound data packet, Forge wake/smoke and directional water/fog movement at the same time.
- Ambient packets use a larger 0.7 world-unit core, higher-contrast dashed trail and a 6.8 second opening route.
- Forge smoke is attached to the real Forge anchor and travels more than 50 CSS pixels; neutral Forge sparks remain hidden unless real work or an alert provides evidence.
- Watcher sweep spans roughly 100 degrees, Archive windows sequence at four distinct luminance steps, and Sanctum uses a larger local turquoise breath.
- Local dark backplates improve contrast only beneath each landmark; there is no global map glow.
- Global Healthy plus a local Critical is rendered as `System stabilny · 1 incydent lokalny`, while the global severity remains Healthy and the local marker remains Critical.

## Visible World Operations

The main source of perceived life is now a bounded operations scheduler rather than pulses and local particles.

- Opening: a bright packet traverses gate → main road → Citadel → district → Archive while the Citadel rings rotate and distribute energy.
- Forge: furnace door, piston, gear, crane, finite sparks and chimney smoke form one eight-second mechanical cycle.
- Watcher: dome calibration plus a long beam sweep with a hold and return.
- Archive: four facade window stages, moving rune tape and a finite seal; real record mode requires event evidence.
- Sanctum: two directional orbit points, contracting spiral and channel discharge.
- Infrastructure: gate panels and a water turbine alternate in the quiet bridge windows.
- Ambient schedule is deterministic over 48 seconds, has no dead window and renders one or two major operations only.
- Real choreography replaces the scheduled operations immediately. A delegation produces evidence-backed transit; the target mechanical cycle starts only when the target has real operational activity.
- The operations layer is presentation-only and cannot write tasks, alerts, statuses or active-agent counts.
