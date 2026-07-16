import { getWorldLifeJourney } from '../data/roadGraph.js'
import { sampleMapAgentRoute } from '../mapAgentPresentation.js'

const freeze = Object.freeze
export const AMBIENT_BEHAVIORS = freeze(['patrol', 'inspect', 'train', 'rest', 'converse'])
export const AMBIENT_MAX_ACTIONS = 3
export const AMBIENT_SELECTION_MIN_MS = 20_000
export const AMBIENT_SELECTION_MAX_MS = 40_000
const FIRST_SELECTION_MS = 2_400
const OPENING_PROFILES = freeze(['coder', 'researcher', 'prospecting'])
const point = (source) => ({ x: Number(source?.x) || 0, y: Number(source?.y) || 0 })

const BEHAVIORS_BY_PROFILE = freeze({
  default: freeze(['converse', 'patrol', 'rest']),
  coder: freeze(['train', 'rest', 'inspect']),
  developer: freeze(['inspect', 'rest', 'converse']),
  devops: freeze(['inspect', 'patrol', 'rest']),
  komandos: freeze(['patrol', 'train', 'rest']),
  orchestrator: freeze(['inspect', 'converse', 'rest']),
  outreach: freeze(['converse', 'patrol', 'rest']),
  prospecting: freeze(['patrol', 'inspect', 'rest']),
  researcher: freeze(['inspect', 'converse', 'rest']),
  reviewer: freeze(['inspect', 'patrol', 'rest']),
  synthesizer: freeze(['inspect', 'rest', 'converse']),
  verifier: freeze(['inspect', 'patrol', 'rest']),
})

const hash = (value) => {
  let result = 2166136261
  for (const char of String(value)) result = Math.imul(result ^ char.charCodeAt(0), 16777619)
  return result >>> 0
}
const unit = (seed) => hash(seed) / 0xffffffff
const choose = (items, seed) => items[Math.min(items.length - 1, Math.floor(unit(seed) * items.length))]
const durationFor = (behavior, seed) => {
  const ranges = { patrol: [22_000, 30_000], inspect: [20_000, 28_000], train: [18_000, 25_000], rest: [12_000, 18_000], converse: [20_000, 28_000] }
  const [min, max] = ranges[behavior]
  return Math.round(min + unit(seed) * (max - min))
}

export function createAmbientDirectorState({ now = Date.now(), seed = 'hermes-citadel' } = {}) {
  return freeze({ seed, cycle: 0, actions: freeze([]), history: freeze({}), nextSelectionAt: now + FIRST_SELECTION_MS })
}

const operationallyIdle = (agent) => {
  const operational = String(agent.operationalState ?? agent.state ?? '').toLowerCase()
  const present = agent.presence !== 'offline' && agent.online !== false && agent.state !== 'offline'
  return present && !agent.active && !agent.isActive && ['idle', 'resting', ''].includes(operational)
}

function routeFor(profile, behavior, layout) {
  const journey = getWorldLifeJourney(profile, layout)
  if (!journey) return []
  const home = journey.homePoint
  const safe = journey.safeBlockedPoint ?? journey.dispatchPoint
  const approach = journey.approachPoint ?? safe
  const outward = journey.outboundWaypoints.slice(0, -1)
  const excursion = outward.length > 1 ? outward : [home, safe, approach]
  const visibleJourney = [...excursion, ...excursion.slice(0, -1).reverse()]
  const route = behavior === 'rest' ? [home] : visibleJourney
  return route.map((point) => freeze({ x: point.x * 10, y: point.y * 10 }))
}

function converseRoutes(leftProfile, rightProfile, layout) {
  const left = getWorldLifeJourney(leftProfile, layout)
  const right = getWorldLifeJourney(rightProfile, layout)
  if (!left || !right) return null
  const leftSafe = left.safeBlockedPoint ?? left.dispatchPoint
  const rightSafe = right.safeBlockedPoint ?? right.dispatchPoint
  const meeting = { x: (leftSafe.x + rightSafe.x) / 2, y: (leftSafe.y + rightSafe.y) / 2 }
  const build = (journey, safe) => [journey.homePoint, safe, meeting, safe, journey.homePoint].map((point) => freeze({ x: point.x * 10, y: point.y * 10 }))
  return freeze({ left: freeze(build(left, leftSafe)), right: freeze(build(right, rightSafe)) })
}

function nextDelay(seed) {
  return Math.round(AMBIENT_SELECTION_MIN_MS + unit(seed) * (AMBIENT_SELECTION_MAX_MS - AMBIENT_SELECTION_MIN_MS))
}

export function interruptAmbientAgent(state, profileId, now = Date.now()) {
  const actions = state.actions.filter((action) => action.profileId !== profileId && action.partnerId !== profileId)
  if (actions.length === state.actions.length) return state
  return freeze({ ...state, actions: freeze(actions), interruptedAt: now })
}

function projectToSegment(origin, from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared > 0
    ? Math.max(0, Math.min(1, ((origin.x - from.x) * dx + (origin.y - from.y) * dy) / lengthSquared))
    : 0
  const projected = { x: from.x + dx * t, y: from.y + dy * t }
  return { projected, t, distance: Math.hypot(origin.x - projected.x, origin.y - projected.y) }
}

function buildRouteContinuation(origin, route) {
  if (route.length < 2) return [origin]
  let best = null
  route.slice(1).forEach((target, index) => {
    const candidate = { ...projectToSegment(origin, route[index], target), index }
    if (!best || candidate.distance < best.distance) best = candidate
  })
  const continuation = [origin]
  if (best.distance > 0.08) continuation.push(best.projected)
  if (best.t < 0.999) continuation.push(route[best.index + 1])
  continuation.push(...route.slice(best.index + 2))
  return continuation.filter((candidate, index, points) => index === 0 || Math.hypot(candidate.x - points[index - 1].x, candidate.y - points[index - 1].y) > 0.01)
}

/** Preserve the visible foot position when a real event interrupts ambient movement. */
export function createAmbientRouteHandoff(action, { now = Date.now(), layout = 'desktop', runId = null, evidenceEventId = null } = {}) {
  if (!action?.profileId || action.route?.length < 2) return null
  const journey = getWorldLifeJourney(action.profileId, layout)
  if (!journey) return null
  const ambientProgress = Math.max(0, Math.min(1, (now - action.startedAt) / Math.max(1, action.durationMs)))
  const sampled = sampleMapAgentRoute(action.route, ambientProgress)
  const origin = point({ x: sampled.worldX, y: sampled.worldY })
  const outbound = journey.outboundWaypoints.map((candidate, index, points) => point({
    x: (candidate.x + (index === 0 || index === points.length - 1 ? 0 : journey.laneOffset)) * 10,
    y: (candidate.y - (index === 0 || index === points.length - 1 ? 0 : journey.laneOffset * 0.45)) * 10,
  }))
  const route = buildRouteContinuation(origin, outbound)
  const durationMs = Math.max(1_200, journey.walkDurationMs)
  return freeze({
    profileId: action.profileId,
    route: freeze(route.map((candidate) => freeze(candidate))),
    startedAt: now,
    endsAt: now + durationMs,
    durationMs,
    runId,
    evidenceEventId,
  })
}

export function deriveAmbientHandoffPresentation(handoffs = [], { now = Date.now() } = {}) {
  const active = handoffs.filter((handoff) => handoff.endsAt >= now).map((handoff) => freeze({
    ...handoff,
    progress: Math.max(0, Math.min(1, (now - handoff.startedAt) / Math.max(1, handoff.durationMs))),
  }))
  return freeze({ actions: freeze(active), actionByAgent: freeze(Object.fromEntries(active.map((handoff) => [handoff.profileId, handoff]))) })
}

export function advanceAmbientDirector(state, { agents = [], now = Date.now(), layout = 'desktop', interruptedAgentIds = [] } = {}) {
  const interrupted = new Set(interruptedAgentIds)
  const agentById = new Map(agents.map((agent) => [agent.profile ?? agent.id, agent]))
  let actions = state.actions.filter((action) => action.endsAt > now && !interrupted.has(action.profileId) && operationallyIdle(agentById.get(action.profileId) ?? {}))
  if (now < state.nextSelectionAt) return actions.length === state.actions.length ? state : freeze({ ...state, actions: freeze(actions) })

  const occupied = new Set(actions.map((action) => action.profileId))
  const eligible = agents.filter((agent) => operationallyIdle(agent) && (agent.profile ?? agent.id) !== 'orchestrator' && !occupied.has(agent.profile ?? agent.id) && !interrupted.has(agent.profile ?? agent.id))
  const availableSlots = Math.max(0, AMBIENT_MAX_ACTIONS - actions.length)
  const additions = Math.min(availableSlots, eligible.length, state.cycle === 0 ? 2 : 1 + Math.floor(unit(`${state.seed}:slots:${state.cycle}`) * 3))
  const history = { ...state.history }

  for (let index = 0; index < additions; index += 1) {
    const remainingEligible = eligible.filter((agent) => !occupied.has(agent.profile ?? agent.id))
    const openingCandidates = state.cycle === 0
      ? remainingEligible.filter((agent) => OPENING_PROFILES.includes(agent.profile ?? agent.id))
      : []
    const remaining = openingCandidates.length ? openingCandidates : remainingEligible
    if (!remaining.length) break
    const agent = choose(remaining, `${state.seed}:agent:${state.cycle}:${index}`)
    const profileId = agent.profile ?? agent.id
    const allowed = BEHAVIORS_BY_PROFILE[profileId] ?? freeze(['rest'])
    const previous = history[profileId]
    const candidates = allowed.filter((behavior) => behavior !== previous)
    const candidatePool = state.cycle === 0
      ? (candidates.length ? candidates : allowed).filter((behavior) => !['rest', 'converse'].includes(behavior))
      : (candidates.length ? candidates : allowed)
    let behavior = choose(candidatePool.length ? candidatePool : allowed, `${state.seed}:behavior:${state.cycle}:${profileId}`)
    const partnerCandidates = remaining.filter((candidate) => {
      const candidateId = candidate.profile ?? candidate.id
      return candidateId !== profileId && (BEHAVIORS_BY_PROFILE[candidateId] ?? []).includes('converse')
    })
    const canConverse = AMBIENT_MAX_ACTIONS - actions.length >= 2 && partnerCandidates.length > 0
    if (behavior === 'converse' && !canConverse) behavior = choose((candidates.length ? candidates : allowed).filter((item) => item !== 'converse'), `${state.seed}:fallback:${state.cycle}:${profileId}`) ?? 'rest'
    const durationMs = durationFor(behavior, `${state.seed}:duration:${state.cycle}:${profileId}`)
    if (behavior === 'converse' && canConverse) {
      const partner = choose(partnerCandidates, `${state.seed}:partner:${state.cycle}:${profileId}`)
      const partnerId = partner.profile ?? partner.id
      const routes = converseRoutes(profileId, partnerId, layout)
      if (routes) {
        actions.push(freeze({ id: `ambient-${state.cycle}-${profileId}`, profileId, partnerId, behavior, startedAt: now, endsAt: now + durationMs, durationMs, route: routes.left }))
        actions.push(freeze({ id: `ambient-${state.cycle}-${partnerId}`, profileId: partnerId, partnerId: profileId, behavior, startedAt: now, endsAt: now + durationMs, durationMs, route: routes.right }))
        history[profileId] = behavior
        history[partnerId] = behavior
        occupied.add(profileId)
        occupied.add(partnerId)
        continue
      }
    }
    actions.push(freeze({
      id: `ambient-${state.cycle}-${profileId}`,
      profileId,
      behavior,
      startedAt: now,
      endsAt: now + durationMs,
      durationMs,
      route: freeze(routeFor(profileId, behavior, layout)),
    }))
    history[profileId] = behavior
    occupied.add(profileId)
  }

  const nextCycle = state.cycle + 1
  return freeze({
    ...state,
    cycle: nextCycle,
    actions: freeze(actions.slice(0, AMBIENT_MAX_ACTIONS)),
    history: freeze(history),
    nextSelectionAt: now + nextDelay(`${state.seed}:delay:${nextCycle}`),
  })
}

export function deriveAmbientPresentation(state, { now = Date.now() } = {}) {
  const actions = state.actions.filter((action) => action.endsAt > now).map((action) => {
    const progress = Math.max(0, Math.min(1, (now - action.startedAt) / Math.max(1, action.durationMs)))
    return freeze({ ...action, progress, moving: action.route.length > 1 && !['rest'].includes(action.behavior) })
  })
  return freeze({ actions: freeze(actions), actionByAgent: freeze(Object.fromEntries(actions.map((action) => [action.profileId, action]))) })
}

export function getAmbientBehaviors(profileId) {
  return BEHAVIORS_BY_PROFILE[profileId] ?? freeze(['rest'])
}
