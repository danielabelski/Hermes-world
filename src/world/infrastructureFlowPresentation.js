const ACTIVE_PHASES = new Set(['walking-to-work', 'arriving', 'working', 'carrying', 'observing', 'walking-home'])
const WARNING_PHASES = new Set(['warning', 'stuck', 'blocked'])

export function resolveInfrastructureFlowPresentation(phase = 'resting') {
  if (ACTIVE_PHASES.has(phase)) return Object.freeze({ state: 'flowing', tone: 'normal' })
  if (phase === 'waiting') return Object.freeze({ state: 'waiting', tone: 'normal' })
  if (phase === 'incident') return Object.freeze({ state: 'problem', tone: 'error' })
  if (WARNING_PHASES.has(phase)) return Object.freeze({ state: 'problem', tone: 'warning' })
  return Object.freeze({ state: 'dormant', tone: 'normal' })
}

