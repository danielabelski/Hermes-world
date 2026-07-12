import { create } from 'zustand';
import { BUILDING_DEFINITIONS } from '../data/buildingDefinitions.js';
import { getAgentDefinition } from '../data/agentDefinitions.js';

const asRecord = (items, key = 'id') => {
  if (!items) return {};
  if (!Array.isArray(items) && typeof items === 'object') return items;
  return Object.fromEntries(items.map((item) => [String(item?.[key] ?? item?.profile ?? ''), item]).filter(([id]) => id));
};

const asArray = (items, key = 'id') => Array.isArray(items) ? items : Object.values(asRecord(items, key));

const colorNumber = (value, fallback = 0x8da8d4) => {
  if (Number.isFinite(value)) return Number(value);
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.replace('#', ''), 16);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const initialAgents = [];
const initialTasks = [];
const initialBuildings = Object.values(BUILDING_DEFINITIONS).map((building) => ({
  ...building,
  state: 'normal',
  activeTaskCount: 0,
  smokeLevel: 0,
  lightLevel: 0.55,
}));

function normalizeAgent(agent, index = 0) {
  const profile = agent?.profile ?? agent?.name ?? agent?.id ?? `unknown-${index}`;
  const definition = getAgentDefinition(profile);
  const fallback = definition ? {
    id: profile,
    profile,
    role: definition.displayName,
    buildingId: definition.buildingId,
    color: definition.accentColor,
    position: definition.spawnAnchor,
    homeAnchor: definition.spawnAnchor,
    workAnchor: definition.workAnchor,
    active: false,
  } : {
    id: profile,
    profile,
    role: profile,
    color: 0x8da8d4,
    position: { x: 5, y: 8.65 },
    homeAnchor: { x: 5, y: 8.65 },
    workAnchor: { x: 5, y: 6.7 },
    active: false,
  };
  const stateActive = agent?.state ? ['working', 'walking', 'carrying'].includes(agent.state) : fallback.active;
  const active = Boolean(agent?.active ?? agent?.isActive ?? stateActive);
  const position = agent?.position ?? agent?.spawnAnchor ?? agent?.homeAnchor ?? fallback.position;
  const workAnchor = agent?.workAnchor ?? fallback.workAnchor;
  return {
    ...fallback,
    ...agent,
    id: agent?.id ?? agent?.profile ?? fallback.id,
    profile: agent?.profile ?? fallback.profile,
    role: agent?.role ?? agent?.displayName ?? agent?.archetype ?? fallback.role,
    color: colorNumber(agent?.color ?? agent?.accentColor, fallback.color),
    cloak: colorNumber(agent?.cloak, fallback.cloak),
    active,
    isActive: active,
    state: agent?.state ?? (active ? 'working' : 'idle'),
    homeAnchor: agent?.homeAnchor ?? agent?.spawnAnchor ?? fallback.homeAnchor,
    workAnchor,
    position,
    targetPosition: agent?.targetPosition ?? (active ? workAnchor : position),
  };
}

function scenarioFor({ scenario, weather, system }) {
  if (scenario && ['healthy', 'warning', 'critical', 'stale', 'unknown'].includes(scenario)) return scenario;
  const kind = weather?.kind ?? system?.weather?.kind;
  if (kind === 'storm') return 'critical';
  if (kind === 'rain' || kind === 'cloudy') return 'warning';
  if (kind === 'sunny') return 'healthy';
  return 'unknown';
}

const initialSystem = {
  activeAgentCount: initialAgents.filter((agent) => agent.active).length,
  totalAgentCount: initialAgents.length,
  severity: 'unknown',
  cpuPercent: null,
  memoryPercent: null,
  temperatureC: null,
  health: { score: null, severity: 'unknown', blockedTaskCount: 0, errorCount: 0, failedCronCount: 0 },
};

export const useWorldStore = create((set) => ({
  // The registry is intentionally iterable rather than tied to a renderer
  // slot. New Hermes profiles can be added without changing this store.
  scenario: 'unknown',
  observabilityFocus: 'auto',
  agents: initialAgents,
  agentsById: asRecord(initialAgents, 'profile'),
  system: initialSystem,
  weather: { kind: 'unknown', intensity: 0, sunIntensity: 0.6, rainRate: 0, lightningEnabled: false },
  lifecycle: { phase: 'booting', source: 'unknown', connection: 'connecting' },
  alerts: [],
  activity: { items: [] },
  tasks: initialTasks,
  tasksById: asRecord(initialTasks),
  buildings: initialBuildings,
  buildingsById: asRecord(initialBuildings),
  crons: [],
  tokenRiver: { totalEstimatedCost: 0, activeSessionCount: 0, flowSpeed: 0, width: 0, glowIntensity: 0, state: 'unknown' },
  modelSources: [],
  skillSummary: { total: 0, enabled: 0, disabled: [] },
  camera: { zoomPreference: 'standard', requestedFocus: null },
  selection: null,

  applySnapshot: (snapshot = {}) => set((state) => {
    const snapshotAgents = asArray(snapshot.agents ?? snapshot.agentsById, 'profile');
    const hasAgents = Object.prototype.hasOwnProperty.call(snapshot, 'agents') || Object.prototype.hasOwnProperty.call(snapshot, 'agentsById');
    const agents = hasAgents ? snapshotAgents.map(normalizeAgent) : state.agents;
    const snapshotTasks = asArray(snapshot.tasks ?? snapshot.tasksById);
    const hasTasks = Object.prototype.hasOwnProperty.call(snapshot, 'tasks') || Object.prototype.hasOwnProperty.call(snapshot, 'tasksById');
    const tasks = hasTasks ? snapshotTasks : state.tasks;
    const snapshotBuildings = asArray(snapshot.buildings ?? snapshot.buildingsById);
    const buildings = snapshotBuildings.length ? snapshotBuildings : state.buildings;
    const systemInput = snapshot.system ?? {};
    const health = systemInput.health ?? state.system.health;
    const severity = systemInput.severity ?? health?.severity ?? state.system.severity;
    const weather = snapshot.weather ?? systemInput.weather ?? state.weather;
    const activityItems = Array.isArray(snapshot.activity) ? snapshot.activity : snapshot.activity?.items;
    return {
      scenario: scenarioFor({ scenario: snapshot.scenario, weather, system: systemInput }),
      observabilityFocus: snapshot.observabilityFocus ?? state.observabilityFocus,
      agents,
      agentsById: asRecord(agents, 'profile'),
      tasks,
      tasksById: asRecord(tasks),
      buildings,
      buildingsById: asRecord(buildings),
      system: {
        ...state.system,
        ...systemInput,
        health,
        severity,
        activeAgentCount: systemInput.activeAgentCount ?? agents.filter((agent) => agent.active || agent.isActive).length,
        totalAgentCount: systemInput.totalAgentCount ?? agents.length,
      },
      weather,
      lifecycle: { ...state.lifecycle, ...(snapshot.lifecycle ?? {}) },
      alerts: snapshot.alerts ?? state.alerts,
      activity: { items: activityItems ?? state.activity?.items ?? [] },
      crons: snapshot.crons ?? state.crons,
      tokenRiver: snapshot.tokenRiver ?? state.tokenRiver,
      modelSources: snapshot.modelSources ?? state.modelSources,
      skillSummary: snapshot.skillSummary ?? state.skillSummary,
      raw: snapshot.raw ?? state.raw,
    };
  }),

  openSheet: (sheet) => set({ selection: { type: sheet, sheet } }),
  closeSheet: () => set({ selection: null }),
  clearSelection: () => set({ selection: null }),
  selectEntity: (type, id) => set({ selection: { type, id } }),
  requestCameraFocus: (type, id) => set((state) => ({ camera: { ...state.camera, requestedFocus: type && id ? { type, id } : null } })),
  setZoomPreference: (zoomPreference) => set((state) => ({ camera: { ...state.camera, zoomPreference } })),
  cycleScenario: () => set((state) => {
    if (state.lifecycle?.source !== 'demo') return state;
    const scenario = state.scenario === 'healthy' ? 'warning' : state.scenario === 'warning' ? 'critical' : 'healthy';
    return {
      scenario,
      system: { ...state.system, severity: scenario, health: { ...state.system.health, severity: scenario } },
      weather: { ...state.weather, kind: scenario === 'healthy' ? 'sunny' : scenario === 'warning' ? 'rain' : 'storm', lightningEnabled: scenario === 'critical' },
      alerts: scenario === 'healthy' ? [] : [{ id: `demo-${scenario}`, severity: scenario === 'critical' ? 'critical' : 'warning', entityType: 'agent', entityId: 'coder', message: scenario === 'critical' ? 'Kuźnia potrzebuje natychmiastowej pomocy.' : 'Kuźnia pracuje pod zwiększonym obciążeniem.' }],
    };
  }),
}));
