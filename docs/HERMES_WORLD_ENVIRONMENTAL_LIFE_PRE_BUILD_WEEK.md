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

## Final visual integration

- Data transit uses an invisible navigation path. Only the packet, a short fading wake and 3–6 nearby energized segments are rendered; the full route is never exposed as a GPS/debug line.
- Mobile and desktop transit geometry follows the existing road-calibrated navigation nodes and named building targets.
- Operations render below agents and below the existing architectural foreground masks, so packets and machinery can be naturally occluded by people, gates and facades.
- Citadel energy is integrated as segmented ground runes, two masked mechanism rings, a crystal charge and one directional output channel. Editor-like handles and square markers are absent.
- Forge activity is anchored to the furnace, gear, hammer pivot and chimney. The furnace and door use perspective masks; the hammer preserves its isometric angle throughout the strike; smoke exits behind a chimney lip.
- Ambient transit remains cyan and restrained. Evidence-backed transit is faster and brighter and carries `evidenceEventId`; it does not create an operational state.
- The earlier environmental glow and particles remain a low-intensity supporting layer only. They are not the primary source of perceived world activity.
- Normal mobile verification runs without debug labels or controls; `worldDebug=visual` remains an explicit diagnostic mode only.

## Map-native motion pass

- The locked BASELINE and LIGHT map assets remain byte-for-byte unchanged. Motion is created by bounded, cached crops of the same currently rendered WebP, never by repainting or replacing the map.
- Five centrally configured regions cover the Citadel core and threshold, Forge furnace, Watcher lens and Archive facade for both mobile and desktop layouts.
- A native crop is mounted only while its existing world operation is active. It cannot schedule work, change status, increment active agents or emit success.
- Citadel rotates a masked copy of its real central mechanism and charges the real threshold; Forge moves only its furnace region; Watcher pivots its real lens region; Archive brightens its real facade in a stepped sequence.
- All crops stay below the existing operation graphics, agents and foreground occlusion. Each region is capped at 14% by 12% of the stage and is clipped to an irregular architectural shape.
- Atmosphere now uses one shared wind vector and cadence for Forge smoke, fog and directional air movement. A broad irregular cloud shadow crosses the map slowly, providing large-scale motion without a global glow.
- The existing perception budget remains locked: at most two major scheduled operations, one map-native building response per corresponding operation and one bounded atmospheric composition.
- Reduced-motion mode disables cloud travel, wind threads and native animation while retaining a subdued static landmark.
