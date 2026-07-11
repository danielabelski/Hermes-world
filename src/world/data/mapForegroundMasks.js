const freeze = Object.freeze

export const MAP_FOREGROUND_MASKS = freeze({
  desktop: freeze([
    freeze({ id: 'citadel-gate', x: 43, y: 29, width: 6, height: 8 }),
    freeze({ id: 'library-entrance', x: 26, y: 29, width: 5.5, height: 8 }),
    freeze({ id: 'forge-entrance', x: 80, y: 43, width: 7, height: 8 }),
    freeze({ id: 'observatory-threshold', x: 64, y: 27, width: 5, height: 5 }),
  ]),
  mobile: freeze([
    freeze({ id: 'citadel-gate', x: 46, y: 37, width: 8, height: 7 }),
    freeze({ id: 'library-entrance', x: 31, y: 65, width: 8, height: 7 }),
    freeze({ id: 'forge-entrance', x: 27, y: 44, width: 8, height: 7 }),
    freeze({ id: 'observatory-threshold', x: 62, y: 66, width: 7, height: 7 }),
  ]),
})

