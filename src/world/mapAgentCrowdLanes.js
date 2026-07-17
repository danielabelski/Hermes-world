const freeze = Object.freeze

const LOWER_COURTYARD_LANES = freeze({
  prospecting: freeze({ x: -10, y: -8 }),
  devops: freeze({ x: -8, y: 12 }),
  outreach: freeze({ x: 4, y: -8 }),
})

const ZERO_OFFSET = freeze({ x: 0, y: 0 })

export function resolveMapAgentCrowdLaneOffset(model, presentations = []) {
  const lane = LOWER_COURTYARD_LANES[model?.profileId]
  const x = Number(model?.worldX)
  const y = Number(model?.worldY)
  if (!lane || !Number.isFinite(x) || !Number.isFinite(y) || x < 58 || y < 66) return ZERO_OFFSET

  const isCrowded = presentations.some((candidate) => {
    if (!candidate || candidate.profileId === model.profileId || candidate.isInside) return false
    const candidateX = Number(candidate.worldX)
    const candidateY = Number(candidate.worldY)
    return Number.isFinite(candidateX)
      && Number.isFinite(candidateY)
      && Math.abs(candidateX - x) <= 9
      && Math.abs(candidateY - y) <= 7
  })

  return isCrowded ? lane : ZERO_OFFSET
}
