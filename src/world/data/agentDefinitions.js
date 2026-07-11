/**
 * The canonical profile -> character contract.
 *
 * This module contains no renderer-specific values: map positions are logical
 * coordinates and sprite keys are stable names for a future asset manifest.
 */

const point = (x, y) => Object.freeze({ x, y });

const createAgent = ({ profile, displayName, archetype, buildingId, buildingLabel, tool, accentColor, spawn, work, idle, workAnimation }) =>
  Object.freeze({
    id: profile,
    profile,
    displayName,
    archetype,
    buildingId,
    buildingLabel,
    tool,
    accentColor,
    spriteSet: `agent.${profile}`,
    spawnAnchor: point(...spawn),
    workAnchor: point(...work),
    idlePath: Object.freeze(idle.map(([x, y]) => point(x, y))),
    animationKeys: Object.freeze({
      idle: `agent.${profile}.idle`,
      walk: `agent.${profile}.walk`,
      working: `agent.${profile}.${workAnimation}`,
      carrying: `agent.${profile}.carry`,
      alerted: `agent.${profile}.alert`,
      error: `agent.${profile}.error`,
      celebrate: `agent.${profile}.celebrate`,
    }),
  });

export const VERTICAL_SLICE_AGENT_IDS = Object.freeze([
  'orchestrator',
  'coder',
  'researcher',
  'komandos',
]);

export const AGENT_DEFINITIONS = Object.freeze({
  default: createAgent({ profile: 'default', displayName: 'Paź', archetype: 'page', buildingId: 'watchtower', buildingLabel: 'Wieża Wartownicza', tool: 'tool-bag', accentColor: '#78A878', spawn: [5.2, 8.0], work: [5.25, 7.7], idle: [[5.0, 7.85], [5.5, 7.85]], workAnimation: 'run-package' }),
  coder: createAgent({ profile: 'coder', displayName: 'Kowal', archetype: 'blacksmith', buildingId: 'forge', buildingLabel: 'Kuźnia', tool: 'hammer-and-anvil', accentColor: '#C45A42', spawn: [2.0, 6.0], work: [2.2, 6.2], idle: [[1.75, 6.1], [2.35, 6.1]], workAnimation: 'forge' }),
  developer: createAgent({ profile: 'developer', displayName: 'Mistrz Budowniczy', archetype: 'master-builder', buildingId: 'builders-yard', buildingLabel: 'Plac Budowy', tool: 'plans-and-square', accentColor: '#B98C4B', spawn: [2.0, 8.1], work: [2.2, 7.85], idle: [[1.75, 8.0], [2.35, 8.0]], workAnimation: 'build' }),
  devops: createAgent({ profile: 'devops', displayName: 'Inżynier Oblężniczy', archetype: 'siege-engineer', buildingId: 'siege-workshop', buildingLabel: 'Warsztat Oblężniczy', tool: 'wrench-and-oilcan', accentColor: '#788DA4', spawn: [5.0, 9.0], work: [5.2, 8.7], idle: [[4.75, 8.85], [5.35, 8.85]], workAnimation: 'crank' }),
  komandos: createAgent({ profile: 'komandos', displayName: 'Rycerz Elitarny', archetype: 'champion', buildingId: 'barracks', buildingLabel: 'Koszary', tool: 'sword-and-shield', accentColor: '#438A62', spawn: [8.0, 7.0], work: [7.8, 6.8], idle: [[7.65, 7.05], [8.25, 7.05]], workAnimation: 'charge' }),
  orchestrator: createAgent({ profile: 'orchestrator', displayName: 'Kasztelan', archetype: 'castellan', buildingId: 'keep', buildingLabel: 'Zamek Główny', tool: 'staff-and-seal', accentColor: '#D6A646', spawn: [5.0, 2.0], work: [5.0, 2.45], idle: [[4.7, 2.35], [5.3, 2.35]], workAnimation: 'command' }),
  outreach: createAgent({ profile: 'outreach', displayName: 'Herold', archetype: 'herald', buildingId: 'herald-tower', buildingLabel: 'Wieża Herolda', tool: 'trumpet-and-scrolls', accentColor: '#B95578', spawn: [8.1, 2.0], work: [8.3, 2.3], idle: [[7.85, 2.25], [8.45, 2.25]], workAnimation: 'depart' }),
  prospecting: createAgent({ profile: 'prospecting', displayName: 'Zwiadowca', archetype: 'scout', buildingId: 'scout-lodge', buildingLabel: 'Chata Zwiadowcy', tool: 'spyglass-and-map', accentColor: '#638D68', spawn: [2.0, 2.0], work: [1.75, 2.3], idle: [[1.75, 2.25], [2.35, 2.25]], workAnimation: 'scout-run' }),
  researcher: createAgent({ profile: 'researcher', displayName: 'Uczony', archetype: 'scholar', buildingId: 'library', buildingLabel: 'Biblioteka', tool: 'quill-and-books', accentColor: '#6279CC', spawn: [2.0, 4.0], work: [2.15, 4.15], idle: [[1.75, 4.1], [2.35, 4.1]], workAnimation: 'research' }),
  reviewer: createAgent({ profile: 'reviewer', displayName: 'Inspektor', archetype: 'inspector', buildingId: 'inspection-hall', buildingLabel: 'Sala Inspekcyjna', tool: 'magnifier-and-seal', accentColor: '#A37353', spawn: [5.1, 6.0], work: [5.15, 6.2], idle: [[4.85, 6.1], [5.45, 6.1]], workAnimation: 'stamp' }),
  synthesizer: createAgent({ profile: 'synthesizer', displayName: 'Alchemik', archetype: 'alchemist', buildingId: 'alchemist-lab', buildingLabel: 'Laboratorium', tool: 'retort-and-cauldron', accentColor: '#A060C0', spawn: [8.0, 4.0], work: [7.85, 4.2], idle: [[7.65, 4.1], [8.25, 4.1]], workAnimation: 'synthesize' }),
  verifier: createAgent({ profile: 'verifier', displayName: 'Probierz', archetype: 'assayer', buildingId: 'assay-office', buildingLabel: 'Urząd Probierczy', tool: 'scale-and-monocle', accentColor: '#48A2A2', spawn: [8.0, 6.0], work: [7.85, 6.2], idle: [[7.65, 6.1], [8.25, 6.1]], workAnimation: 'verify' }),
});

export const getAgentDefinition = (profile) => AGENT_DEFINITIONS[profile] ?? null;

export const getVerticalSliceAgentDefinitions = () =>
  VERTICAL_SLICE_AGENT_IDS.map((profile) => AGENT_DEFINITIONS[profile]);
