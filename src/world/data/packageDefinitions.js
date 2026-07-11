/**
 * Renderer-neutral presentation contract for Kanban work items.
 *
 * A package is deliberately a physical, readable object in the Citadel rather
 * than a miniature card. Renderers can use these tokens for colour, size,
 * iconography and motion without knowing Hermes-specific statuses.
 */

const freeze = (value) => Object.freeze(value);

export const PACKAGE_PRIORITY_VISUALS = freeze({
  low: freeze({ size: 'small', color: '#BCA77D', glow: 'none', badge: 'scroll', weight: 0.7 }),
  normal: freeze({ size: 'medium', color: '#A66A3F', glow: 'soft', badge: 'crate', weight: 1 }),
  medium: freeze({ size: 'medium', color: '#A66A3F', glow: 'soft', badge: 'crate', weight: 1 }),
  high: freeze({ size: 'large', color: '#B94E42', glow: 'warm', badge: 'sealed-crate', weight: 1.35 }),
  urgent: freeze({ size: 'large', color: '#D44339', glow: 'strong', badge: 'priority-crate', weight: 1.65 }),
  critical: freeze({ size: 'large', color: '#D44339', glow: 'strong', badge: 'priority-crate', weight: 1.65 }),
});

export const PACKAGE_STATUS_VISUALS = freeze({
  triage: freeze({ packageState: 'queued', icon: 'question-seal', motion: 'still', destination: 'keep' }),
  todo: freeze({ packageState: 'stored', icon: 'paper-stack', motion: 'still', destination: 'keep' }),
  ready: freeze({ packageState: 'ready', icon: 'sealed-scroll', motion: 'pulse', destination: 'keep' }),
  running: freeze({ packageState: 'carried', icon: 'parcel', motion: 'carried', destination: 'assigned-work' }),
  review: freeze({ packageState: 'under-review', icon: 'inspection-seal', motion: 'still', destination: 'inspection-hall' }),
  blocked: freeze({ packageState: 'blocked', icon: 'alert-crate', motion: 'shake', destination: 'keep' }),
  scheduled: freeze({ packageState: 'scheduled', icon: 'clock-scroll', motion: 'clock-pulse', destination: 'clock-tower' }),
  done: freeze({ packageState: 'delivered', icon: 'success-parcel', motion: 'celebrate', destination: 'keep' }),
});

const normalise = (value, fallback) => String(value ?? fallback).trim().toLowerCase() || fallback;

/**
 * Returns a stable visual description for an API task. Unknown values fall
 * back to the normal stored crate so new backend values never break the map.
 */
export function getPackageVisual(task = {}) {
  const priority = normalise(task.priority, 'normal');
  const status = normalise(task.status, 'todo');
  const priorityVisual = PACKAGE_PRIORITY_VISUALS[priority] ?? PACKAGE_PRIORITY_VISUALS.normal;
  const statusVisual = PACKAGE_STATUS_VISUALS[status] ?? PACKAGE_STATUS_VISUALS.todo;

  return freeze({
    priority: PACKAGE_PRIORITY_VISUALS[priority] ? priority : 'normal',
    status: PACKAGE_STATUS_VISUALS[status] ? status : 'todo',
    ...priorityVisual,
    ...statusVisual,
    isAlert: status === 'blocked' || priority === 'urgent' || priority === 'critical',
    isTerminal: status === 'done',
  });
}
