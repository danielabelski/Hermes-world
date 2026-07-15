import { memo } from 'react'
import MapAgentSprite from '../map-agents/MapAgentSprite.jsx'
import { usePresentationClock } from '../../world/usePresentationClock.js'
import { getInteriorReviewEntry } from '../../world/interiorRosterReview.js'

function InteriorRosterReviewPresence({ profileId, visualState = 'work' }) {
  const entry = getInteriorReviewEntry(profileId)
  const now = usePresentationClock(true)
  const cycleMs = visualState === 'walk' ? 720 : 3_200
  const frameIndex = Math.floor(now / Math.max(120, cycleMs / 4)) % 4
  const animationPhase = (now % cycleMs) / cycleMs

  return <div className="cinematic-interior__agent-layer interior-roster-review__presence" data-interior-agent={entry.profileId} data-interior-stage="review" data-evidence-source="visual-review">
    <MapAgentSprite
      profileId={entry.profileId}
      visualState={visualState}
      direction={entry.direction}
      worldX={entry.x}
      worldY={entry.y}
      baseScale={entry.scale}
      frameIndex={frameIndex}
      animationPhase={animationPhase}
      label={`${entry.displayName} — kontrolowany przegląd wizualny wnętrza`}
      presentationSource="controlled-interior-review"
      fetchPriority="high"
      renderSurface="interior"
    />
  </div>
}

export default memo(InteriorRosterReviewPresence)
