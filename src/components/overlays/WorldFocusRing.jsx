import { useWorldStore } from '../../world/store/worldStore.js'
import './SelectionTooltip.css'

const TYPE_LABEL = Object.freeze({ agent: 'Agent', building: 'Budynek', task: 'Zadanie' })

const RING_STYLE = {
  position: 'absolute',
  zIndex: 4,
  right: 'max(14px, env(safe-area-inset-right))',
  bottom: 'max(72px, calc(env(safe-area-inset-bottom) + 62px))',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  maxWidth: 'min(300px, calc(100vw - 28px))',
  padding: '7px 9px 7px 7px',
  border: '1px solid rgba(242, 219, 154, .42)',
  borderRadius: 999,
  color: '#f5ead6',
  background: 'rgba(14, 29, 20, .84)',
  boxShadow: '0 8px 24px rgba(1, 8, 4, .3)',
  backdropFilter: 'blur(9px)',
  WebkitBackdropFilter: 'blur(9px)',
}

const listValue = (value) => {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.values(value)
  return []
}

function getEntity(selection, agents, buildings, tasks) {
  if (!selection?.type || !selection?.id) return null
  const source = selection.type === 'agent' ? agents : selection.type === 'building' ? buildings : tasks
  const list = listValue(source)
  return list.find((item) => String(item.id ?? item.profile ?? '') === String(selection.id)) ?? null
}

function entityTitle(type, entity, id) {
  if (!entity) return id ?? TYPE_LABEL[type] ?? 'Element świata'
  return entity.displayName ?? entity.label ?? entity.title ?? entity.role ?? entity.profile ?? id
}

/**
 * Renderer-independent focus metadata. Pixi may draw the physical ring; this
 * companion keeps selection discoverable for screen readers and keyboard users.
 */
export function WorldFocusRing() {
  const selection = useWorldStore((state) => state.selection)
  const agents = useWorldStore((state) => state.agents ?? [])
  const buildings = useWorldStore((state) => state.buildings ?? state.buildingsById ?? {})
  const tasks = useWorldStore((state) => state.tasks ?? state.tasksById ?? {})
  const requestCameraFocus = useWorldStore((state) => state.requestCameraFocus)
  const clearSelection = useWorldStore((state) => state.clearSelection)

  const normalized = selection?.entityType
    ? { type: selection.entityType, id: selection.entityId }
    : selection
  const entity = getEntity(normalized, agents, buildings, tasks)

  if (!normalized?.type || !normalized?.id) return null

  const typeLabel = TYPE_LABEL[normalized.type] ?? 'Element świata'
  const title = entityTitle(normalized.type, entity, normalized.id)
  const missing = !entity
  const description = missing ? 'Dane obiektu pojawią się po synchronizacji.' : `${typeLabel} jest zaznaczony.`

  return (
    <aside className="world-focus-ring" data-focus-state={missing ? 'missing' : 'focused'} data-entity-type={normalized.type} data-entity-id={normalized.id} style={RING_STYLE} aria-label={`Zaznaczono: ${typeLabel} ${title}`} role="status" aria-live="polite">
      <span aria-hidden="true" style={{ display: 'grid', width: 25, height: 25, placeItems: 'center', border: `2px solid ${missing ? '#efc36a' : '#f2db9a'}`, borderRadius: '50%', color: missing ? '#efc36a' : '#f2db9a', background: 'rgba(232, 199, 111, .13)', boxShadow: `0 0 0 3px ${missing ? 'rgba(239, 195, 106, .12)' : 'rgba(242, 219, 154, .16)'}` }}>◎</span>
      <span style={{ display: 'grid', minWidth: 0, gap: 1 }}>
        <strong style={{ overflow: 'hidden', color: '#f5ead6', fontSize: 10, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</strong>
        <span style={{ color: missing ? '#efc36a' : '#b9c7bb', fontSize: 9 }}>{description}</span>
      </span>
      <button type="button" onClick={() => requestCameraFocus?.(normalized.type, normalized.id)} aria-label={`Pokaż ${title} na mapie`} title="Pokaż na mapie" style={{ flex: '0 0 auto', padding: '3px 4px', border: 0, borderRadius: 5, color: '#f2db9a', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>⌖</button>
      <button type="button" onClick={() => clearSelection?.()} aria-label="Wyczyść zaznaczenie" title="Wyczyść zaznaczenie" style={{ flex: '0 0 auto', padding: '3px 4px', border: 0, borderRadius: 5, color: 'rgba(245, 234, 214, .65)', background: 'transparent', cursor: 'pointer', fontSize: 14 }}>×</button>
    </aside>
  )
}

export default WorldFocusRing
