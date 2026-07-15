import archivePlate from '../../assets/building-interiors/archive-memory-hall.jpg'
import citadelPlate from '../../assets/building-interiors/citadel-command-hall.jpg'
import forgePlate from '../../assets/building-interiors/forge-execution-hall.jpg'
import sanctumPlate from '../../assets/building-interiors/sanctum-recovery-hall.jpg'
import watcherPlate from '../../assets/building-interiors/watcher-observatory.jpg'

const freeze = Object.freeze

export const CINEMATIC_INTERIOR_PLATES = freeze({
  archive: freeze({ src: archivePlate, label: 'Archiwum Wiedzy', focusX: 50, focusY: 50 }),
  citadel: freeze({ src: citadelPlate, label: 'Komnata Dowodzenia', focusX: 50, focusY: 50 }),
  forge: freeze({ src: forgePlate, label: 'Kuźnia Systemowa', focusX: 50, focusY: 50 }),
  sanctum: freeze({ src: sanctumPlate, label: 'Sanctum Regeneracji', focusX: 50, focusY: 49 }),
  watcher: freeze({ src: watcherPlate, label: 'Obserwatorium Watchera', focusX: 58, focusY: 48 }),
})

const pendingPlateLoads = new Map()

export function preloadInteriorPlate(buildingId) {
  const scene = CINEMATIC_INTERIOR_PLATES[buildingId]
  if (!scene || typeof Image === 'undefined') return Promise.resolve()
  if (pendingPlateLoads.has(buildingId)) return pendingPlateLoads.get(buildingId)

  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = 'high'
  image.src = scene.src
  const loaded = (typeof image.decode === 'function'
    ? image.decode()
    : new Promise((resolve) => {
      image.onload = resolve
      image.onerror = resolve
    }))
    .catch(() => {
      pendingPlateLoads.delete(buildingId)
      return undefined
    })

  pendingPlateLoads.set(buildingId, loaded)
  return loaded
}
