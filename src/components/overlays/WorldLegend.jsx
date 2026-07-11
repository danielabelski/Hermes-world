import { useState } from 'react'
import { useWorldStore } from '../../world/store/worldStore.js'
import './WorldLegend.css'

const CLUES = [
  { key: 'working', mark: '●', label: 'Światło i ruch', detail: 'Agent pracuje' },
  { key: 'task', mark: '▣', label: 'Paczka', detail: 'Zadanie w drodze' },
  { key: 'alert', mark: '!', label: 'Znak nad postacią', detail: 'Wymaga uwagi' },
  { key: 'weather', mark: '☁', label: 'Niebo', detail: 'Obciążenie systemu' },
]

/**
 * A deliberately small reading key for people meeting the living interface for
 * the first time. It supports the map; it never becomes a second dashboard.
 */
export function WorldLegend() {
  const [expanded, setExpanded] = useState(false)
  const system = useWorldStore((state) => state.system ?? {})
  const alerts = useWorldStore((state) => state.alerts ?? [])
  const openSheet = useWorldStore((state) => state.openSheet)
  const isDemo = system.temperatureSource === 'demo'
  const hasAlert = alerts.some((alert) => ['critical', 'error', 'warning'].includes(alert.severity))

  return (
    <aside className="world-legend" data-expanded={expanded} aria-label="Jak czytać świat Cytadeli">
      <div className="world-legend__row">
        <button className="world-legend__trigger" type="button" onClick={() => setExpanded((open) => !open)} aria-expanded={expanded} aria-controls="world-legend-clues">
          <span aria-hidden="true">✦</span>
          <span>Jak czytać świat</span>
        </button>
        {isDemo && <span className="world-legend__demo" title="Pokazywana scena demonstracyjna; Hermes nadal łączy się z prawdziwym API.">DEMO</span>}
      </div>

      <div className="world-legend__clues" id="world-legend-clues" aria-hidden={!expanded}>
        <p>Stan systemu jest widoczny w ruchu Cytadeli.</p>
        <ul>
          {CLUES.map((clue) => (
            <li key={clue.key} data-tooltip={clue.detail}>
              <span className={`world-legend__mark world-legend__mark--${clue.key}`} aria-hidden="true">{clue.mark}</span>
              <span>{clue.label}</span>
            </li>
          ))}
        </ul>
        {hasAlert && <button className="world-legend__activity" type="button" onClick={() => openSheet?.('activity')}>Zobacz, co wymaga uwagi</button>}
      </div>
    </aside>
  )
}

export default WorldLegend
