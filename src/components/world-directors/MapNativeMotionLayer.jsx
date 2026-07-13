import { memo } from 'react'
import desktopMapUrl from '../../assets/hermes-citadel-hd-v2.webp'
import mobileMapUrl from '../../assets/hermes-citadel-mobile-v2.webp'
import { getMapNativeRegions } from '../../world/data/mapNativeMotionConfig.js'
import './MapNativeMotionLayer.css'

function cropStyle(region) {
  const { x, y, width, height } = region.geometry
  const left = x - width / 2
  const top = y - height / 2
  return {
    '--native-left': `${left}%`,
    '--native-top': `${top}%`,
    '--native-width': `${width}%`,
    '--native-height': `${height}%`,
    '--native-image-width': `${10_000 / width}%`,
    '--native-image-height': `${10_000 / height}%`,
    '--native-image-left': `${-(left / width) * 100}%`,
    '--native-image-top': `${-(top / height) * 100}%`,
    '--native-intensity': region.intensity,
    '--native-delay': `${region.timingOffset}s`,
  }
}

function MapNativeMotionLayer({ presentation }) {
  const layout = presentation?.layout === 'mobile' ? 'mobile' : 'desktop'
  const regions = getMapNativeRegions(layout, presentation?.operations ?? [])
  const mapUrl = layout === 'mobile' ? mobileMapUrl : desktopMapUrl
  return <div className={`map-native-motion-layer layout-${layout}${presentation?.running ? '' : ' is-paused'}`} data-map-native-regions={regions.length} aria-hidden="true">
    {regions.map((region) => <span
      className={`map-native-region map-native-region--${region.id} motion-${region.motion} shape-${region.shape} mode-${region.operation.mode} phase-${region.operation.phase}`}
      data-map-native-region={region.id}
      data-world-operation={region.operationType}
      data-evidence-event-id={region.operation.evidenceEventId ?? ''}
      style={cropStyle(region)}
      key={`${region.operation.id}-${region.id}`}
    >
      <img src={mapUrl} alt="" draggable="false" />
      <i />
    </span>)}
  </div>
}

export default memo(MapNativeMotionLayer)
