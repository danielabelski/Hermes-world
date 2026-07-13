const freeze = Object.freeze
const anchor = (x, y, offsetX = 0, offsetY = 0) => freeze({ x, y, offsetX, offsetY })

// Visual landmarks are deliberately separate from navigation entrances.
// Routing remains anchored to WORLD_OPERATION_POINTS; effects sit on the
// actual furnace, facade, lens, basin, core and gate artwork.
export const WORLD_VISUAL_ANCHORS = freeze({
  mobile: freeze({
    citadel: anchor(50, 43),
    forge: anchor(23.5, 44.5),
    watcher: anchor(65.5, 71.2),
    archive: anchor(24.5, 65.5),
    sanctum: anchor(72, 80),
    gate: anchor(50, 88.5),
    water: anchor(50, 56),
  }),
  desktop: freeze({
    citadel: anchor(46, 34),
    forge: anchor(84, 46.5),
    watcher: anchor(67, 31.5),
    archive: anchor(27, 31),
    sanctum: anchor(39, 76),
    gate: anchor(50, 88.5),
    water: anchor(50, 47),
  }),
})

export const WORLD_AMBIENT_WINDOW_ANCHORS = freeze({
  mobile: freeze([
    freeze({ id: 'citadel-west', x: 43, y: 31.5, delay: '-1.2s' }),
    freeze({ id: 'citadel-east', x: 57, y: 31.5, delay: '-4.8s' }),
    freeze({ id: 'east-tower', x: 84, y: 46.5, delay: '-2.6s' }),
    freeze({ id: 'south-east-hall', x: 79, y: 63, delay: '-6.1s' }),
  ]),
  desktop: freeze([
    freeze({ id: 'library-facade', x: 26, y: 23, delay: '-1.2s' }),
    freeze({ id: 'citadel-facade', x: 46, y: 19, delay: '-4.8s' }),
    freeze({ id: 'observatory-facade', x: 70, y: 22, delay: '-2.6s' }),
    freeze({ id: 'east-hall', x: 71, y: 58, delay: '-6.1s' }),
  ]),
})

export function getWorldVisualAnchors(layout = 'desktop') {
  return WORLD_VISUAL_ANCHORS[layout === 'mobile' ? 'mobile' : 'desktop']
}

export function getAmbientWindowAnchors(layout = 'desktop') {
  return WORLD_AMBIENT_WINDOW_ANCHORS[layout === 'mobile' ? 'mobile' : 'desktop']
}
