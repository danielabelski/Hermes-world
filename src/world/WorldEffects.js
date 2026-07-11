/**
 * Converts a renderer-neutral WorldBridge snapshot into visual effect
 * descriptors. This module deliberately does not import PixiJS: the scene can
 * consume it, test it, or replace its renderer without changing data meaning.
 */

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const hash = (value) => [...String(value)].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7);
const colorHex = (value, fallback = '#D6A646') => {
  if (typeof value === 'string' && value.trim()) return value.startsWith('#') ? value : `#${value}`;
  if (Number.isFinite(value)) return `#${Math.max(0, Math.min(0xffffff, value)).toString(16).padStart(6, '0')}`;
  return fallback;
};
const pointFor = (entity, buildings) => {
  if (entity?.position) return entity.position;
  const building = buildings.find((item) => item.id === entity?.buildingId || item.id === entity?.entityId);
  return building?.workAnchor ?? building?.anchor ?? { x: 5, y: 5 };
};
const offset = (point, x = 0, y = 0) => ({ x: point.x + x, y: point.y + y });

// Logical map-space path. The Canvas projects it to isometric screen space.
const TOKEN_RIVER_PATH = Object.freeze([
  { x: 0.65, y: 9.6 }, { x: 2.2, y: 8.35 }, { x: 3.65, y: 7.4 },
  { x: 5.0, y: 6.55 }, { x: 6.55, y: 5.45 }, { x: 8.1, y: 4.2 }, { x: 9.45, y: 2.7 },
]);

function riverInstructions({ color, widthScale, glowIntensity, flowSpeed, visible }) {
  const width = 0.09 + widthScale * 0.18;
  return [
    { kind: 'polyline', layer: 'river-base', points: TOKEN_RIVER_PATH, color, alpha: visible ? 0.62 : 0.16, lineWidth: width, blendMode: 'normal' },
    { kind: 'polyline', layer: 'river-glow', points: TOKEN_RIVER_PATH, color, alpha: visible ? 0.12 + glowIntensity * 0.3 : 0, lineWidth: width * 2.4, blendMode: 'add' },
    { kind: 'flow-particles', layer: 'river-particles', path: TOKEN_RIVER_PATH, color: '#E9D89A', alpha: visible ? 0.38 + flowSpeed * 0.32 : 0, speed: 0.18 + flowSpeed * 0.82, size: 0.025 + widthScale * 0.025 },
  ];
}

function crystalInstructions(crystal) {
  const { position, color, intensity, pulseSpeed } = crystal;
  const r = 0.11 + intensity * 0.06;
  return [
    { kind: 'diamond', layer: 'crystals', position, radius: r, color, alpha: 0.8 + intensity * 0.2, rotation: Math.PI / 4 },
    { kind: 'circle', layer: 'crystal-glow', position, radius: r * (2.4 + intensity), color, alpha: 0.07 + intensity * 0.16, blendMode: 'add', pulseSpeed },
    { kind: 'label-anchor', layer: 'world-labels', position: offset(position, 0, -0.2), text: crystal.modelId, visible: false },
  ];
}

function alertInstructions(alert) {
  const bubble = offset(alert.position, 0, -0.28);
  const instructions = [
    { kind: 'circle', layer: 'alert-glow', position: bubble, radius: 0.13 * alert.scale, color: alert.color, alpha: 0.14, blendMode: 'add', pulsePhase: alert.phase },
    { kind: 'alert-icon', layer: 'alert-icons', position: bubble, icon: alert.icon, color: '#FFF4D6', backgroundColor: alert.color, scale: alert.scale, bobPhase: alert.phase },
  ];
  if (alert.visualEffect === 'smoke') instructions.push({ kind: 'smoke-emitter', layer: 'ambient-effects', position: offset(alert.position, 0, -0.1), color: '#4A4A52', alpha: 0.55, particleBudget: alert.particleBudget, rise: 0.35 });
  if (alert.visualEffect === 'storm-pulse') instructions.push({ kind: 'lightning-flash', layer: 'weather-effects', position: bubble, color: alert.color, alpha: 0.16, intervalSeconds: 4 + (hash(alert.id) % 5) });
  return instructions;
}

const WORKING_STATES = new Set(['working', 'carrying-package', 'carrying', 'inspecting']);
const SUCCESS_STATES = new Set(['done', 'delivered']);

function workEffectFor(agent, now) {
  const position = pointFor(agent, []);
  const color = colorHex(agent.accentColor ?? agent.color, '#D6A646');
  const phase = ((now / 1000) + (hash(agent.id ?? agent.profile) % 100) / 100) % 1;
  const carrying = agent.state === 'carrying-package' || agent.state === 'carrying' || Boolean(agent.carryingTaskId);
  const effect = {
    id: `work-${agent.id ?? agent.profile}`,
    kind: carrying ? 'agent-carrying' : 'agent-working',
    agentId: agent.id ?? agent.profile,
    profile: agent.profile,
    position,
    color,
    phase,
    tool: agent.tool ?? null,
    animationKey: agent.animationKeys?.working ?? agent.workingAnimation ?? null,
    intensity: carrying ? 0.9 : clamp(agent.isActive ?? agent.active, 0.45, 1),
  };

  const instructions = [
    {
      kind: 'work-aura', layer: 'agent-effects', position, color,
      radius: carrying ? 0.21 : 0.17, alpha: carrying ? 0.2 : 0.12,
      pulsePhase: phase, blendMode: 'add',
    },
    {
      kind: carrying ? 'package-carried' : 'work-spark', layer: 'agent-effects',
      position: offset(position, carrying ? 0.12 : 0, -0.13), color,
      alpha: carrying ? 1 : 0.68, bobPhase: phase, tool: effect.tool,
    },
  ];
  return { ...effect, instructions };
}

function completionAgeSeconds(task, now) {
  const timestamp = task.completedAt ?? task.completed_at ?? task.updatedAt ?? task.updated_at;
  const parsed = timestamp ? Date.parse(timestamp) : Number.NaN;
  return Number.isFinite(parsed) ? Math.max(0, now - parsed) / 1000 : null;
}

function successEffectFor(task, agents, buildings, now) {
  const agent = agents.find((item) => item.id === task.ownerAgentId || item.profile === task.assignee);
  const destination = buildings.find((item) => item.id === task.destinationBuildingId);
  const position = pointFor(agent ?? destination ?? task, buildings);
  const ageSeconds = completionAgeSeconds(task, now);
  // A backend can omit completed_at. Keep a quiet seal in that case, rather
  // than pretending a fresh celebration occurs on every polling cycle.
  const fresh = ageSeconds !== null && ageSeconds <= 14;
  const phase = ((now / 1000) + (hash(task.id) % 100) / 100) % 1;
  const effect = {
    id: `success-${task.id}`,
    kind: fresh ? 'task-success-burst' : 'task-delivered-seal',
    taskId: task.id,
    agentId: agent?.id ?? agent?.profile ?? null,
    position,
    color: '#F4D77A',
    phase,
    fresh,
    ageSeconds,
    priority: fresh ? 30 : 5,
  };
  const instructions = [
    {
      kind: fresh ? 'success-spark-burst' : 'success-seal', layer: 'agent-effects',
      position: offset(position, 0, -0.18), color: effect.color,
      alpha: fresh ? 0.88 : 0.38, scale: fresh ? 1 : 0.72,
      phase, particleBudget: fresh ? 9 : 0, blendMode: 'add',
    },
  ];
  return { ...effect, instructions };
}

/**
 * Agents are intentionally addressed by id/profile instead of by a renderer
 * index. This keeps the visual contract safe when a later Hermes deployment
 * has 50+ profiles.
 */
export function createAgentActivityEffects(agents = [], tasks = [], buildings = [], now = Date.now()) {
  const working = agents
    .filter((agent) => WORKING_STATES.has(String(agent.state ?? '').toLowerCase()) || Boolean(agent.isActive ?? agent.active))
    .map((agent) => workEffectFor(agent, now));
  const success = tasks
    .filter((task) => SUCCESS_STATES.has(String(task.status ?? task.packageState ?? '').toLowerCase()))
    .map((task) => successEffectFor(task, agents, buildings, now))
    .sort((a, b) => b.priority - a.priority);
  return { working, success };
}

function buildingEffectFor(building, now) {
  const position = building.workAnchor ?? building.anchor ?? { x: 5, y: 5 };
  const state = String(building.state ?? 'normal').toLowerCase();
  const smokeLevel = clamp(building.smokeLevel, 0, 1);
  const seed = hash(building.id);
  const phase = ((now / 1000) + (seed % 100) / 100) % 1;
  const color = colorHex(building.accentColor, '#A37353');
  const active = state === 'active' || Number(building.lightLevel) > 0.7;
  const error = state === 'error' || smokeLevel > 0;
  const warning = state === 'warning';
  const instructions = [];

  if (active) instructions.push({
    kind: 'building-work-light', layer: 'building-effects', position,
    color, radius: 0.28, alpha: 0.08 + clamp(building.lightLevel, 0, 1) * 0.12,
    pulsePhase: phase, blendMode: 'add',
  });
  if (error) {
    instructions.push({
      kind: 'smoke-emitter', layer: 'ambient-effects', position: offset(position, 0, -0.14),
      color: '#45404A', alpha: 0.36 + smokeLevel * 0.42,
      particleBudget: Math.round(8 + smokeLevel * 16), rise: 0.42,
    });
    instructions.push({
      kind: 'alert-icon', layer: 'alert-icons', position: offset(position, 0, -0.36),
      icon: 'alert', color: '#FFF4D6', backgroundColor: '#D45B4D', scale: 1.1, bobPhase: phase,
    });
  } else if (warning) instructions.push({
    kind: 'alert-icon', layer: 'alert-icons', position: offset(position, 0, -0.34),
    icon: 'exclamation', color: '#FFF4D6', backgroundColor: '#D7A846', scale: 0.92, bobPhase: phase,
  });

  return {
    id: `building-${building.id}`,
    kind: 'building-signal', buildingId: building.id, state, position, phase,
    active, warning, error, smokeLevel, instructions,
  };
}

/** Building state remains meaningful even if an upstream alert is absent. */
export function createBuildingSignalEffects(buildings = [], now = Date.now()) {
  return buildings
    .map((building) => buildingEffectFor(building, now))
    .filter((effect) => effect.instructions.length > 0);
}

export function createTokenRiverEffect(tokenRiver = {}) {
  const width = clamp(tokenRiver.width, 0.16, 1);
  const speed = clamp(tokenRiver.flowSpeed, 0, 1);
  const effect = {
    id: 'token-river',
    kind: 'token-river',
    visible: (tokenRiver.activeSessionCount ?? 0) > 0,
    color: tokenRiver.color ?? '#5E9CC3',
    widthScale: width,
    flowSpeed: speed,
    glowIntensity: clamp(tokenRiver.glowIntensity, 0, 1),
    state: tokenRiver.state ?? 'still',
    // A renderer may turn these into tiled sprites or a single animated path.
    waveCount: Math.round(3 + width * 7),
    particleBudget: Math.round(8 + speed * 24),
  };
  return { ...effect, instructions: riverInstructions(effect) };
}

export function createCrystalEffects(modelSources = []) {
  const sources = modelSources.length ? modelSources : [];
  return sources.map((source, index) => {
    const slot = index % 6;
    const ring = Math.floor(index / 6);
    const angle = (Math.PI * 2 * slot) / 6 - Math.PI / 2;
    const radius = 3.75 + ring * 0.8;
    const crystal = {
      id: `crystal-${source.provider}-${source.modelId}`,
      kind: 'model-crystal',
      provider: source.provider,
      modelId: source.modelId,
      crystalType: source.crystalType ?? 'quartz',
      color: source.color ?? '#91A2AC',
      intensity: clamp(source.intensity, 0.1, 1),
      pulseSpeed: source.sessionsUsingModel > 0 ? 1.25 : 0.35,
      isProfileDefault: Boolean(source.isProfileDefault),
      position: { x: 5 + Math.cos(angle) * radius, y: 5 + Math.sin(angle) * radius * 0.52 },
    };
    return { ...crystal, instructions: crystalInstructions(crystal) };
  });
}

export function createAlertEffects(alerts = [], agents = [], buildings = [], now = Date.now()) {
  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  return alerts.map((alert, index) => {
    const agent = alert.entityType === 'agent' ? agentsById.get(alert.entityId) : null;
    const target = agent ?? (alert.entityType === 'task' ? agents.find((item) => item.carryingTaskId === alert.entityId) : null);
    const seed = hash(alert.id);
    const effect = alert.effect ?? 'caution-pulse';
    const descriptor = {
      id: `effect-${alert.id}`,
      kind: 'alert',
      alertId: alert.id,
      severity: alert.severity ?? 'warning',
      icon: alert.icon ?? 'exclamation',
      color: alert.color ?? '#D7A846',
      visualEffect: effect,
      position: pointFor(target ?? alert, buildings),
      phase: ((now / 1000) + (seed % 100) / 100) % 1,
      scale: effect === 'storm-pulse' ? 1.35 : effect === 'smoke' ? 1.15 : 1,
      particleBudget: effect === 'smoke' ? 12 : effect === 'storm-pulse' ? 8 : 0,
      priority: (alert.severity === 'critical' ? 100 : alert.severity === 'error' ? 75 : 50) - index / 100,
    };
    return { ...descriptor, instructions: alertInstructions(descriptor) };
  }).sort((a, b) => b.priority - a.priority);
}

/** A single scene-facing descriptor tree, safe to regenerate each snapshot. */
export function createWorldEffects(snapshot = {}, now = Date.now()) {
  const agents = Array.isArray(snapshot.agents) ? snapshot.agents : [];
  const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : [];
  const buildings = Array.isArray(snapshot.buildings) ? snapshot.buildings : [];
  const alerts = Array.isArray(snapshot.alerts) ? snapshot.alerts : [];
  const tokenRiver = createTokenRiverEffect(snapshot.tokenRiver);
  const crystals = createCrystalEffects(Array.isArray(snapshot.modelSources) ? snapshot.modelSources : []);
  const alertEffects = createAlertEffects(alerts, agents, buildings, now);
  const agentActivity = createAgentActivityEffects(agents, tasks, buildings, now);
  const buildingSignals = createBuildingSignalEffects(buildings, now);
  return {
    tokenRiver,
    crystals,
    alerts: alertEffects,
    agents: agentActivity,
    buildings: buildingSignals,
    // Flattened, ordered instructions give Canvas one direct, deterministic
    // render queue. Layers preserve the world depth contract.
    renderInstructions: [
      ...tokenRiver.instructions,
      ...crystals.flatMap((item) => item.instructions),
      ...buildingSignals.flatMap((item) => item.instructions),
      ...agentActivity.working.flatMap((item) => item.instructions),
      ...agentActivity.success.flatMap((item) => item.instructions),
      ...alertEffects.flatMap((item) => item.instructions),
    ],
  };
}
