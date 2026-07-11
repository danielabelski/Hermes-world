import { memo } from 'react'
import desktopMapUrl from '../../assets/hermes-citadel-hd-v2.png'
import mobileMapUrl from '../../assets/hermes-citadel-mobile-v2.png'
import { MAP_FOREGROUND_MASKS } from '../../world/data/mapForegroundMasks.js'
import './MapForegroundOcclusion.css'

const imageStyle = ({ x, y, width, height }) => ({
  width: `${10000 / width}%`,
  height: `${10000 / height}%`,
  left: `${-x * 100 / width}%`,
  top: `${-y * 100 / height}%`,
})

function MapForegroundOcclusion({ layout = 'desktop' }) {
  const normalizedLayout = layout === 'mobile' ? 'mobile' : 'desktop'
  const source = normalizedLayout === 'mobile' ? mobileMapUrl : desktopMapUrl
  return <div className="map-foreground" aria-hidden="true">
    {MAP_FOREGROUND_MASKS[normalizedLayout].map((mask) => <span
      className="map-foreground__mask"
      data-mask-id={mask.id}
      key={mask.id}
      style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: `${mask.width}%`, height: `${mask.height}%` }}
    >
      <img src={source} alt="" style={imageStyle(mask)} draggable={false} />
    </span>)}
  </div>
}

export default memo(MapForegroundOcclusion)
