import { createAgentLodPlan, getAgentLodTier } from './agentLodPolicy.js';

const createRoster = (count) => Array.from({ length: count }, (_, index) => ({
  id: `agent-${index}`,
  state: index === count - 1 ? 'error' : index % 4 === 0 ? 'working' : 'idle',
  inViewport: index < Math.ceil(count * 0.45),
}));

export function runAgentLodPolicyInvariants() {
  const plan12 = createAgentLodPlan(createRoster(12));
  const plan50 = createAgentLodPlan(createRoster(50));
  const plan100 = createAgentLodPlan(createRoster(100));
  const plan200 = createAgentLodPlan(createRoster(200));
  const offscreenCritical = plan200.byId.get('agent-199');

  const report = Object.freeze({
    tier12: getAgentLodTier(12).id,
    tier50: getAgentLodTier(50).id,
    tier100: getAgentLodTier(100).id,
    tier200: getAgentLodTier(200).id,
    budgetReducesDetail: plan12.fullCount === 12
      && plan50.fullCount < 50
      && plan100.fullCount < 100
      && plan200.fullCount < 200,
    keepsCriticalOffscreen: offscreenCritical?.mode !== 'culled',
    keepsCriticalSignal: offscreenCritical?.critical === true,
    noOverBudgetFull: plan200.fullCount <= plan200.tier.fullBudget,
    hasCullingAt200: plan200.culledCount > 0,
  });

  return Object.freeze({
    ...report,
    passed: report.tier12 === 'slice-12'
      && report.tier50 === 'expanded-50'
      && report.tier100 === 'district-100'
      && report.tier200 === 'large-200'
      && report.budgetReducesDetail
      && report.keepsCriticalOffscreen
      && report.keepsCriticalSignal
      && report.noOverBudgetFull
      && report.hasCullingAt200,
  });
}
