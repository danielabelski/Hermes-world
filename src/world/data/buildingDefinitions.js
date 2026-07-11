/** Stable building semantics and their logical placement in the fortress. */

const point = (x, y) => Object.freeze({ x, y });

const building = ({ id, label, agentProfile = null, kind, anchor, entrance, workAnchor, accentColor }) => Object.freeze({
  id,
  label,
  agentProfile,
  kind,
  anchor: point(...anchor),
  entrance: point(...entrance),
  workAnchor: point(...workAnchor),
  accentColor,
});

export const BUILDING_DEFINITIONS = Object.freeze({
  'scout-lodge': building({ id: 'scout-lodge', label: 'Chata Zwiadowcy', agentProfile: 'prospecting', kind: 'lodge', anchor: [2, 2], entrance: [2.25, 2.7], workAnchor: [1.75, 2.3], accentColor: '#638D68' }),
  keep: building({ id: 'keep', label: 'Zamek Główny', agentProfile: 'orchestrator', kind: 'keep', anchor: [5, 2], entrance: [5, 3.1], workAnchor: [5, 2.45], accentColor: '#D6A646' }),
  'herald-tower': building({ id: 'herald-tower', label: 'Wieża Herolda', agentProfile: 'outreach', kind: 'tower', anchor: [8, 2], entrance: [7.75, 2.7], workAnchor: [8.3, 2.3], accentColor: '#B95578' }),
  library: building({ id: 'library', label: 'Biblioteka', agentProfile: 'researcher', kind: 'library', anchor: [2, 4], entrance: [2.35, 4.65], workAnchor: [2.15, 4.15], accentColor: '#6279CC' }),
  fountain: building({ id: 'fountain', label: 'Fontanna Zdrowia', kind: 'fountain', anchor: [5, 4.25], entrance: [5, 4.75], workAnchor: [5, 4.25], accentColor: '#78BBC7' }),
  'alchemist-lab': building({ id: 'alchemist-lab', label: 'Laboratorium', agentProfile: 'synthesizer', kind: 'lab', anchor: [8, 4], entrance: [7.65, 4.65], workAnchor: [7.85, 4.2], accentColor: '#A060C0' }),
  forge: building({ id: 'forge', label: 'Kuźnia', agentProfile: 'coder', kind: 'forge', anchor: [2, 6], entrance: [2.35, 6.65], workAnchor: [2.2, 6.2], accentColor: '#C45A42' }),
  'inspection-hall': building({ id: 'inspection-hall', label: 'Sala Inspekcyjna', agentProfile: 'reviewer', kind: 'hall', anchor: [5, 6], entrance: [5, 6.7], workAnchor: [5.15, 6.2], accentColor: '#A37353' }),
  'assay-office': building({ id: 'assay-office', label: 'Urząd Probierczy', agentProfile: 'verifier', kind: 'office', anchor: [8, 6], entrance: [7.65, 6.65], workAnchor: [7.85, 6.2], accentColor: '#48A2A2' }),
  'builders-yard': building({ id: 'builders-yard', label: 'Plac Budowy', agentProfile: 'developer', kind: 'yard', anchor: [2, 8], entrance: [2.35, 8.65], workAnchor: [2.2, 7.85], accentColor: '#B98C4B' }),
  'clock-tower': building({ id: 'clock-tower', label: 'Wieża Zegarowa', kind: 'clock-tower', anchor: [5, 8], entrance: [5, 8.65], workAnchor: [5, 8], accentColor: '#7B89B0' }),
  barracks: building({ id: 'barracks', label: 'Koszary', agentProfile: 'komandos', kind: 'barracks', anchor: [8, 7], entrance: [7.65, 7.65], workAnchor: [7.8, 6.8], accentColor: '#438A62' }),
  'siege-workshop': building({ id: 'siege-workshop', label: 'Warsztat Oblężniczy', agentProfile: 'devops', kind: 'workshop', anchor: [5, 9], entrance: [5, 9.55], workAnchor: [5.2, 8.7], accentColor: '#788DA4' }),
  watchtower: building({ id: 'watchtower', label: 'Wieża Wartownicza', agentProfile: 'default', kind: 'watchtower', anchor: [3.75, 8.85], entrance: [4.1, 9.35], workAnchor: [5.25, 7.7], accentColor: '#78A878' }),
});

export const getBuildingDefinition = (id) => BUILDING_DEFINITIONS[id] ?? null;
export const getBuildingForProfile = (profile) =>
  Object.values(BUILDING_DEFINITIONS).find((item) => item.agentProfile === profile) ?? null;
