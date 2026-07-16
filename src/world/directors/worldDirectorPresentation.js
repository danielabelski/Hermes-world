import { sampleMapAgentRoute, sortMapAgentPresentations } from '../mapAgentPresentation.js'

const operationalPresentationWins = (model) => Boolean(
  model.active
  || model.isActive
  || model.visualState === 'offline'
  || model.phase !== 'resting'
  || ['warning', 'critical'].includes(model.severity)
  || model.signalState !== 'none',
)

function applyMotion(model, motion, source) {
  return {
    ...model,
    worldX: motion.worldX,
    worldY: motion.worldY,
    sortY: motion.sortY ?? motion.worldY,
    direction: motion.direction ?? model.direction,
    visualState: motion.visualState ?? model.visualState,
    isMoving: Boolean(motion.isMoving),
    isInside: false,
    occupancyMode: 'world',
    presentationSource: source,
    choreographyState: source === 'choreography' ? motion.phase : null,
    ambientState: source === 'ambient' ? motion.behavior : null,
    evidenceEventId: motion.evidenceEventId ?? null,
  }
}

export function applyWorldDirectorPresentation(presentations, { choreography, ambient, handoff } = {}) {
  const motionByAgent = choreography?.motionByAgent ?? {}
  const ambientByAgent = ambient?.actionByAgent ?? {}
  const handoffByAgent = handoff?.actionByAgent ?? {}
  return Object.freeze(sortMapAgentPresentations(presentations.map((model) => {
    const routeHandoff = handoffByAgent[model.profileId]
    const sameRun = !routeHandoff?.runId || !model.taskId || routeHandoff.runId === model.taskId
    if (routeHandoff && sameRun && ['walking-to-work', 'arriving'].includes(model.phase)) {
      const sampled = sampleMapAgentRoute(routeHandoff.route, routeHandoff.progress)
      return Object.freeze(applyMotion(model, {
        ...sampled,
        visualState: 'walk',
        isMoving: true,
        evidenceEventId: routeHandoff.evidenceEventId,
      }, 'operational-handoff'))
    }
    const choreographyMotion = motionByAgent[model.profileId]
    if (choreographyMotion && !operationalPresentationWins(model)) return Object.freeze(applyMotion(model, choreographyMotion, 'choreography'))
    const ambientAction = ambientByAgent[model.profileId]
    if (!ambientAction || operationalPresentationWins(model)) return model
    const sampled = sampleMapAgentRoute(ambientAction.route, ambientAction.progress)
    return Object.freeze(applyMotion(model, {
      ...sampled,
      sortY: sampled.worldY,
      visualState: ambientAction.moving ? 'walk' : 'idle',
      isMoving: ambientAction.moving,
      behavior: ambientAction.behavior,
    }, 'ambient'))
  })))
}
