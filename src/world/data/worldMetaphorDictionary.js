/**
 * Product contract: technical signals are only rendered when a real Hermes
 * field exists. Unsupported concepts remain explicitly unavailable instead of
 * being simulated as game effects.
 */

const entry = (id, technicalConcept, metaphor, apiSource, state, fallback, interaction) => Object.freeze({
  id, technicalConcept, metaphor, apiSource, state, fallback, interaction,
});

export const WORLD_METAPHOR_DICTIONARY = Object.freeze([
  entry('agent-activity', 'Agent execution state', 'Character works, rests, walks or carries a package', 'getProfiles().profiles[].is_active', 'supported', 'Agent rests if the profile is absent; no invented activity', 'Tap character for profile and tasks'),
  entry('agent-role', 'Hermes profile', 'Named profession, tool and home building', 'getProfiles().profiles[].name', 'supported', 'Unknown profile is excluded from character render and recorded as activity', 'Tap character or building'),
  entry('task-work', 'Kanban task', 'Physical package, scroll or crate', 'getKanbanTasks().tasks[]', 'supported', 'Unknown task status becomes a normal stored crate', 'Tap package for task detail'),
  entry('task-priority', 'Kanban priority', 'Package size, seal colour and glow', 'getKanbanTasks().tasks[].priority', 'supported', 'Missing priority is normal crate', 'Visible without opening detail'),
  entry('task-blocked', 'Blocked work', 'Alert crate and caution signal over owner', 'getKanbanTasks().tasks[].status === blocked', 'supported', 'Unassigned task remains at the Keep', 'Tap alert/package'),
  entry('system-load', 'CPU utilisation', 'Weather: sun, clouds, rain or storm', 'getSystemMetrics().cpuPercent', 'supported', 'Unknown CPU produces calm weather and degraded connection state', 'Status ribbon explains source'),
  entry('system-memory', 'Memory utilisation', 'Agent movement weight and health pressure', 'getSystemMetrics().memoryPercent', 'supported', 'No slowdown when metric is absent', 'System health detail'),
  entry('system-temperature', 'CPU temperature', 'Sunlight warmth / heat warning', 'getSystemMetrics().temperatureC', 'supported', 'Neutral light when absent', 'System health detail'),
  entry('logs', 'Warnings and errors', 'Caution, smoke and incident alerts', 'getLogs().lines[]', 'supported', 'No visual incident without a matching log', 'Activity feed / affected entity'),
  entry('cron', 'Scheduled job', 'Clock Tower and bell / failure signal', 'getCrons().jobs + getCronHistory().completions', 'supported', 'Tower remains idle if history is unavailable', 'Tap Clock Tower'),
  entry('cost', 'Estimated session cost', 'Token river width, speed and glow', 'getSessions().sessions[].estimated_cost', 'supported', 'Quiet river with no session data', 'Tap river for session summary'),
  entry('model', 'Provider and model availability', 'Provider-coloured source crystals', 'getModels().groups + getProfiles().profiles[].model', 'supported', 'Neutral quartz labelled No model data', 'Tap crystal for model/provider'),
  entry('skills', 'Enabled skills', 'Tool equipped or absent on character', 'getSkills().skills[].disabled', 'supported', 'Tools stay visible when API has no skill list; avoids false disabled state', 'Agent detail explains capability summary'),
  entry('queue-depth', 'Queue length and backlog age', 'Growing queue / crowded road', 'No current endpoint', 'new-api-required', 'Do not render a queue count or congestion claim', 'Future: queue detail'),
  entry('retry', 'Retry attempts and retry delay', 'Package returns to depot with retry seal', 'No current endpoint', 'new-api-required', 'Do not imply retry from a warning or error log', 'Future: task history'),
  entry('webhook', 'Webhook delivery and failure', 'Messenger at gate / failed dispatch signal', 'No current endpoint', 'new-api-required', 'Gate remains ambient only', 'Future: webhook detail'),
  entry('api-latency', 'API throughput, error rate and latency', 'Road speed and gate pressure', 'No current endpoint', 'new-api-required', 'Do not slow roads based on CPU alone', 'Future: endpoint detail'),
  entry('memory-rag', 'Memory/RAG/vector database health', 'Archive vault and glowing index shelves', 'No current endpoint', 'new-api-required', 'Library reflects researcher activity only', 'Future: memory detail'),
  entry('cache', 'Cache hit/miss and capacity', 'Storehouse fullness and cache sparks', 'No current endpoint', 'new-api-required', 'No cache state is shown', 'Future: cache detail'),
  entry('observability', 'Trace spans, distributed topology and per-service telemetry', 'Signal beacons and paths', 'No current endpoint', 'new-api-required', 'Only actual logs and system metrics appear', 'Future: trace explorer'),
]);

export const SUPPORTED_METAPHORS = Object.freeze(WORLD_METAPHOR_DICTIONARY.filter((item) => item.state === 'supported'));
export const FUTURE_API_METAPHORS = Object.freeze(WORLD_METAPHOR_DICTIONARY.filter((item) => item.state === 'new-api-required'));

export function getWorldMetaphor(id) {
  return WORLD_METAPHOR_DICTIONARY.find((item) => item.id === id) ?? null;
}
