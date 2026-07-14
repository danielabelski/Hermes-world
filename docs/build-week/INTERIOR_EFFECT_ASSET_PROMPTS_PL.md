# Prompty źródłowe — dedykowane efekty wnętrz

## Kontrakt wspólny

Każdy asset generujemy **osobno** w ChatGPT i dołączamy jako referencję dokładny obraz danego wnętrza. Asset ma być oryginalnym elementem przygotowanym wyłącznie dla Hermes World. Nie zmieniamy pięciu bazowych ilustracji.

Wymagania wspólne dla wszystkich promptów:

- jeden poziomy sprite strip z dokładnie 8 równymi klatkami;
- każda klatka 256×256 px, cały strip 2048×256 px;
- stała kamera, stały pivot i identyczne położenie obiektu w każdej klatce;
- prawdziwa przezroczystość alpha; bez białego, czarnego i szachownicowego tła;
- bez napisów, podpisów, ramek, architektury pomieszczenia i prostokątnego glow;
- nic nie może dotykać krawędzi klatki;
- płynna pętla: klatka 8 naturalnie wraca do klatki 1;
- czytelność po zmniejszeniu pojedynczej klatki do około 64–100 px;
- jeden asset = jeden proces wizualny.

Jeśli ChatGPT zwróci inny rozmiar, zachować oryginał bez ręcznego kadrowania. Codex wykona deterministyczną normalizację i runtime export.

## 1. Kuźnia — ogień pieca

Docelowa nazwa: `forge-interior-furnace-fire-strip.png`

> Use the attached Hermes World Forge interior only as a strict style, lighting and perspective reference. Create a production-ready transparent PNG sprite sheet showing ONLY the animated fire burning inside the narrow central furnace opening. One horizontal strip of exactly 8 equal frames, fixed elevated frontal camera, fixed flame base and identical pivot in every frame. The loop progresses: steady low burn, rising flame, elegant curl, brief split, controlled flare, settling motion, return to the starting shape. Bright white-gold core, rich amber and orange body, very subtle cyan reflections from the surrounding fantasy-tech machinery. The fire must stay inside the furnace mouth and must not look like a campfire. No brazier, no stone ring, no floor, no machinery, no smoke, no sparks, no room background, no rectangular glow. True transparent alpha, no checkerboard, no labels, no borders, no cropped flame. Each frame 256×256, total 2048×256. Seamless loop, readable when one frame is displayed at about 80 px.

## 2. Kuźnia — dym z głównego komina

Docelowa nazwa: `forge-interior-chimney-smoke-strip.png`

> Use the attached Hermes World Forge interior only as a strict style, wind direction, lighting and perspective reference. Create a production-ready transparent PNG sprite sheet showing ONLY a controlled plume of smoke emerging from one fixed narrow chimney mouth. One horizontal strip of exactly 8 equal frames with a fixed base and pivot. The smoke rises vertically, bends slightly to the upper right, expands organically and thins out; frame 8 must return naturally to frame 1. Dense warm charcoal at the base, soft graphite grey above, faint amber underside from the furnace, no black opaque blob. No chimney, no architecture, no fire, no sparks, no floor, no rectangular haze. True transparent alpha with soft feathered edges, no checkerboard, no labels, no border. Each frame 256×256, total 2048×256. Seamless slow loop, readable at 70–90 px.

## 3. Kuźnia — iskry punktu uderzenia

Docelowa nazwa: `forge-interior-impact-sparks-strip.png`

> Use the attached Hermes World Forge interior only as a strict material and lighting reference. Create a production-ready transparent PNG sprite sheet showing ONLY one compact mechanical impact spark burst for a bronze fantasy-tech forge. One horizontal strip of exactly 8 equal frames: empty anticipation, first contact, bright compact impact, radial sparks, short hot fragments, fading embers, near-empty recovery, fully settled. Fixed impact point and pivot in every frame. White-gold center, amber sparks, two or three tiny cyan reflections. No hammer, no anvil, no machinery, no smoke, no fire bed, no room background, no circular aura, no rectangular glow. True transparent alpha, no checkerboard, no labels, no borders. Each frame 256×256, total 2048×256. This is a one-shot event animation, not a continuous ambient glow.

## 4. Cytadela — ładowanie rdzenia

Docelowa nazwa: `citadel-interior-core-charge-strip.png`

> Use the attached Hermes World Citadel command hall as a strict perspective, palette and lighting reference. Create a transparent 8-frame horizontal sprite strip showing ONLY the central crystalline command core performing a restrained orchestration charge cycle. The crystal silhouette and pivot remain fixed. Energy climbs from the lower tip through the crystal, illuminates internal facets, reaches one controlled bright peak and settles. Cold cyan and pale blue core with restrained antique-gold reflections matching the room. No replacement crystal body outside the silhouette, no room, no command table, no ring, no beam extending outside the frame, no big aura or rectangle. True transparent alpha, no checkerboard or labels. Exactly 8 frames, each 256×256, total 2048×256, seamless slow loop, readable at 70–90 px.

## 5. Cytadela — przepływ stołu dowodzenia

Docelowa nazwa: `citadel-interior-command-table-strip.png`

> Use the attached Hermes World Citadel command hall as a strict isometric-perspective and material reference. Create a transparent 8-frame horizontal sprite strip showing ONLY a shallow elliptical command-table surface where thin cyan data runes ignite sequentially around antique-gold inlays and converge toward the center. The ellipse, camera and pivot remain identical in all frames. No physical table body, no room, no floating HUD, no thick neon circle, no full disc glow. The sequence must look engraved into glass and metal, not placed above it. True transparent alpha, no checkerboard, labels or borders. Exactly 8 frames, each 256×256, total 2048×256, seamless 6–10 second visual loop when animated.

## 6. Archiwum — kodeks i armilarium

Docelowa nazwa: `archive-interior-codex-armillary-strip.png`

> Use the attached Hermes World Archive interior as a strict perspective, scale, palette and lighting reference. Create a transparent 8-frame horizontal sprite strip showing ONLY the central open codex and the delicate brass armillary mechanism immediately around it. The book and pivot remain fixed. Pages breathe subtly, one line of cyan-gold runes travels across the open pages, then the nearest brass ring turns a small controlled amount and returns. Warm candle-gold dominates, cyan is reserved for data. No shelves, no hall, no pedestal body, no floating UI, no giant beam or aura. True transparent alpha, no checkerboard, labels, borders or cropped rings. Exactly 8 frames, each 256×256, total 2048×256, seamless loop, readable at 90 px.

## 7. Archiwum — przyjęcie pakietu przez regały

Docelowa nazwa: `archive-interior-shelf-ingestion-strip.png`

> Use the attached Hermes World Archive interior as a strict style and lighting reference. Create a transparent 8-frame horizontal sprite strip showing ONLY a compact sequence of warm window-like shelf lights and tiny cyan-gold runic packets moving upward in a narrow vertical architectural rhythm. Fixed camera and fixed baseline. The sequence should read as data being physically archived: one packet arrives, three shelf lights illuminate in order, the packet dissolves, lights settle. Do not draw shelves or a building facade; provide only light and rune content that can be masked onto existing shelves. No rectangle, no HUD, no text, no large glow. True transparent alpha. Exactly 8 frames, each 256×256, total 2048×256. Event-capable but subtle in ambient mode.

## 8. Watcher — soczewka i wiązka skanu

Docelowa nazwa: `watcher-interior-lens-scan-strip.png`

> Use the attached Hermes World Watcher observatory as a strict perspective, lens angle, palette and lighting reference. Create a transparent 8-frame horizontal sprite strip showing ONLY the telescope's circular front lens and a controlled narrow cyan scanning beam emerging from its exact optical center. Fixed lens position and pivot. The lens iris opens slightly, internal rings rotate a few degrees, the beam brightens and sweeps through a restrained arc, then returns to rest. Antique brass reflections, concentrated cyan-white core. No telescope tube, no mount, no room, no moon, no sky, no huge cone, no rectangular glow or HUD. True transparent alpha, no checkerboard or labels. Exactly 8 frames, each 256×256, total 2048×256, seamless slow loop, readable at 80–110 px.

## 9. Watcher — tylne armilarium

Docelowa nazwa: `watcher-interior-armillary-calibration-strip.png`

> Use the attached Hermes World Watcher observatory as a strict material and perspective reference. Create a transparent 8-frame horizontal sprite strip showing ONLY a sparse antique-brass celestial armillary calibration overlay: two thin physical rings, a small cyan marker and subtle engraved ticks. The geometry remains fixed while the rings rotate by small different amounts and the marker locks onto one point before returning. It must look like part of the observatory machinery, not a UI reticle. No sky, moon, telescope, room, text, labels, crosshair HUD, solid disc or large aura. True transparent alpha. Exactly 8 frames, each 256×256, total 2048×256, seamless 10–16 second visual loop.

## 10. Sanctum — obieg w basenie

Docelowa nazwa: `sanctum-interior-pool-circulation-strip.png`

> Use the attached Hermes World Sanctum interior as a strict elevated perspective, pool ellipse, palette and material reference. Create a transparent 8-frame horizontal sprite strip showing ONLY the shallow elliptical water surface of the central recovery pool. The ellipse and pivot remain fixed. Visible turquoise currents circulate clockwise, two soft caustic bands travel across the water, a restrained ripple reaches the rim and settles. It must read as physical liquid contained in the existing pool, not a glowing disc or magic portal. No stone rim, no room, no plants, no platform, no rectangular water texture. True transparent alpha with soft water edges. Exactly 8 frames, each 256×256, total 2048×256, seamless continuous loop, readable at 100–140 px.

## 11. Sanctum — kolumna regeneracyjna

Docelowa nazwa: `sanctum-interior-energy-column-strip.png`

> Use the attached Hermes World Sanctum interior as a strict architecture, palette and lighting reference. Create a transparent 8-frame horizontal sprite strip showing ONLY a narrow vertical regeneration flow inside the rear glass-and-brass energy column. Fixed base, fixed vertical axis and fixed pivot. Small turquoise particles rise, form one elegant spiral, condense into a bright pulse near the top and descend as a faint line back toward the pool. Calm recovery semantics, not an alarm. No glass cylinder, no wall, no vines, no room, no giant aura, no rectangle. True transparent alpha, no checkerboard, labels or borders. Exactly 8 frames, each 256×256, total 2048×256, seamless slow loop, readable at 60–90 px.

## Kolejność dostarczania

1. Kuźnia: ogień, dym, iskry.
2. Cytadela: rdzeń, stół.
3. Archiwum: kodeks, regały.
4. Watcher: soczewka, armilarium.
5. Sanctum: basen, kolumna.

Codex wdraża źródła atomowo per wnętrze, normalizuje je do runtime, mierzy transfer i koszt renderowania, a odziedziczone efekty mapowe usuwa dopiero wtedy, gdy dedykowany komplet danego wnętrza jest gotowy.
