import { memo } from 'react'
import desktopMapUrl from '../../assets/hermes-citadel-hd-v2.png'
import mobileMapUrl from '../../assets/hermes-citadel-mobile-v2.png'
import './MapForegroundOcclusion.css'

const MASKS = Object.freeze({
  desktop: Object.freeze([
    { id: 'citadel-gate', x: 43, y: 29, width: 6, height: 8 },
    { id: 'library-entrance', x: 26, y: 29, width: 5.5, height: 8 },
    { id: 'forge-entrance', x: 80, y: 43, width: 7, height: 8 },
    { id: 'observatory-threshold', x: 64, y: 27, width: 5, height: 5 },
  ]),
  mobile: Object.freeze([
    { id: 'citadel-gate', x: 46, y: 37, width: 8, height: 7 },
    { id: 'library-entrance', x: 31, y: 65, width: 8, height: 7 },
    { id: 'forge-entrance', x: 27, y: 44, width: 8, height: 7 },
    { id: 'observatory-threshold', x: 62, y: 66, width: 7, height: 7 },
  ]),
})

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
    {MASKS[normalizedLayout].map((mask) => <span
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
