import { useWorldStore } from '../../world/store/worldStore.js'
import { mergeWorldActivityItems } from '../../world/worldActivityItems.js'
import { presentWorldActivity } from '../../world/worldActivityPresentation.js'

const DEMO_FIXTURE = Object.freeze([
  {
    id: 'fixture-working',
    type: 'agent',
    severity: 'info',
    message: 'Kowal pracuje w Kuźni · iskry oznaczają aktywne wykonanie',
    createdAt: '2026-07-10T07:05:00.000Z',
  },
  {
    id: 'fixture-package',
    type: 'task',
    severity: 'info',
    message: 'Kasztelan przenosi paczkę · zadanie jest w toku',
    createdAt: '2026-07-10T07:04:00.000Z',
  },
  {
    id: 'fixture-warning',
    type: 'alert',
    severity: 'warning',
    message: 'Żółty znak nad postacią oznacza oczekiwanie na uwagę',
    createdAt: '2026-07-10T07:03:00.000Z',
  },
  {
    id: 'fixture-weather',
    type: 'system',
    severity: 'info',
    message: 'Niebo pokazuje obciążenie systemu · słońce = spokojnie',
    createdAt: '2026-07-10T07:02:00.000Z',
  },
])

const EVENT_META = Object.freeze({
  agent: { icon: '●', label: 'Agent' },
  task: { icon: '▣', label: 'Zadanie' },
  alert: { icon: '!', label: 'Uwaga' },
  system: { icon: '☼', label: 'Świat' },
  cron: { icon: '◷', label: 'Cron' },
  log: { icon: '·', label: 'Zdarzenie' },
})

const SEVERITY_COLOR = Object.freeze({
  info: '#9bd2a0',
  healthy: '#9bd2a0',
  warning: '#efc36a',
  error: '#ef8b68',
  critical: '#ff6e62',
})

function formatTime(value) {
  if (!value) return 'teraz'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'teraz' : new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' }).format(date)
}

/** Textual complement to visual signals; never the primary interface. */
export function ActivityFeed({ limit = 40, showDemoFixture = true }) {
  const activity = useWorldStore((state) => state.activity?.items ?? [])
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const system = useWorldStore((state) => state.system ?? {})
  const scenario = useWorldStore((state) => state.scenario)
  const isDemo = system.temperatureSource === 'demo' || scenario === 'demo'
  const semanticActivity = activity.filter((item) => item?.type !== 'log')
  const liveItems = mergeWorldActivityItems(semanticActivity, alerts, limit)
  const usingFixture = !liveItems.length && showDemoFixture && isDemo
  const items = usingFixture ? DEMO_FIXTURE : liveItems

  if (!items.length) return <p className="activity-feed__empty">Cytadela działa spokojnie.</p>

  return (
    <ol className="activity-feed" data-source={usingFixture ? 'demo-fixture' : 'world'} data-channel="world-narrative" aria-label="Czytelna aktywność świata">
      {items.slice(0, limit).map((item, index) => {
        const severity = item.severity ?? item.level ?? 'healthy'
        const type = item.type ?? (severity === 'warning' || severity === 'error' || severity === 'critical' ? 'alert' : 'system')
        const meta = EVENT_META[type] ?? EVENT_META.system
        const presentation = presentWorldActivity(item)
        const color = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.info
        return (
          <li className="activity-feed__item" data-severity={severity} data-type={type} key={item.id ?? `${item.createdAt ?? item.timestamp ?? 'event'}-${index}`} style={{ display: 'grid', gridTemplateColumns: '20px 42px minmax(0, 1fr)', alignItems: 'start', gap: 7, padding: '8px 0', borderBottom: '1px solid rgba(242, 219, 154, .12)' }}>
            <span aria-hidden="true" title={presentation.label ?? meta.label} style={{ display: 'grid', width: 18, height: 18, placeItems: 'center', border: `1px solid ${color}66`, borderRadius: 6, color, background: `${color}1f`, fontSize: 11, fontWeight: 800 }}>{meta.icon}</span>
            <time dateTime={item.createdAt ?? item.timestamp} style={{ paddingTop: 2, color: 'rgba(245, 234, 214, .57)', fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{formatTime(item.createdAt ?? item.timestamp)}</time>
            <span style={{ display: 'grid', gap: 2, color: severity === 'critical' || severity === 'error' ? '#ffd0c0' : '#e8eadb', fontSize: 11, lineHeight: 1.35 }}>
              <strong style={{ color, fontSize: 9, letterSpacing: '.08em' }}>{presentation.label}</strong>
              <span>{presentation.message}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default ActivityFeed
