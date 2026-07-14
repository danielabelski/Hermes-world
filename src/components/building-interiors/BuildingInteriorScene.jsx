import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import archiveRunesStrip from '../../assets/world-effects/archive-data-runes-strip.runtime.png'
import archiveWindowsStrip from '../../assets/world-effects/archive-window-glow-strip.runtime.png'
import citadelCoreStrip from '../../assets/world-effects/citadel-core-pulse-strip.runtime.png'
import citadelRuneStrip from '../../assets/world-effects/citadel-rune-ring-strip.runtime.png'
import forgeFireStrip from '../../assets/world-effects/forge-fire-strip.runtime.png'
import forgeSmokeStrip from '../../assets/world-effects/forge-smoke-strip.runtime.png'
import sanctumOrbitStrip from '../../assets/world-effects/sanctum-energy-orbit-strip.runtime.png'
import watcherLensStrip from '../../assets/world-effects/watcher-lens-pulse-strip.runtime.png'
import watcherScanStrip from '../../assets/world-effects/watcher-scan-beam-strip.runtime.png'
import { BUILDING_INTERIOR_CONFIG } from '../../world/buildingEntryConfig.js'
import { deriveBuildingInteriorPresentation } from '../../world/buildingInteriorPresentation.js'
import './BuildingInteriorScene.css'

const PHASE_LABEL = Object.freeze({ standby: 'CZUWANIE', working: 'PRACA', warning: 'OSTRZEŻENIE', critical: 'KRYTYCZNY', offline: 'OFFLINE' })
const INTERIOR_META = Object.freeze({
  forge: Object.freeze({ eyebrow: 'SUBSYSTEM · BUILD / EXECUTION', idle: 'Kuźnia jest gotowa na następny prawdziwy build.', working: 'Mechanizm wykonuje zadanie zarejestrowane przez Hermes runtime.', taskLabel: 'AKTUALNY PRZEBIEG' }),
  archive: Object.freeze({ eyebrow: 'SUBSYSTEM · LOGS / MEMORY / RECORDS', idle: 'Archiwum oczekuje na kolejne prawdziwe zdarzenie.', working: 'Archiwum przetwarza aktywny raport lub analizę.', taskLabel: 'OSTATNI ZAPIS' }),
  citadel: Object.freeze({ eyebrow: 'SUBSYSTEM · ORCHESTRATION / COMMAND', idle: 'Rdzeń dowodzenia utrzymuje spójność świata.', working: 'Cytadela koordynuje aktywny workflow Hermesa.', taskLabel: 'BIEŻĄCA DYREKTYWA' }),
  watcher: Object.freeze({ eyebrow: 'SUBSYSTEM · MONITORING / OBSERVATION', idle: 'Watcher utrzymuje spokojny skan infrastruktury.', working: 'Obserwatorium śledzi aktywny sygnał lub patrol.', taskLabel: 'BIEŻĄCY ODCZYT' }),
  sanctum: Object.freeze({ eyebrow: 'SUBSYSTEM · HEALTH / RECOVERY', idle: 'Sanctum utrzymuje stabilny obieg energii systemu.', working: 'Sanctum wspiera aktywny proces regeneracji.', taskLabel: 'BIEŻĄCY PROCES' }),
})

const formatMetric = ({ value, suffix = '' }) => value === null || value === undefined ? '—' : `${Math.round(value)}${suffix}`
const SpriteStrip = ({ className, src }) => <span className={className}><img src={src} alt="" /></span>

function ForgeChamber() {
  return <div className="interior-chamber forge-chamber">
    <div className="forge-chamber__backwall" aria-hidden="true"><i /><i /><i /></div>
    <div className="forge-chamber__arch forge-chamber__arch--left" aria-hidden="true" />
    <div className="forge-chamber__arch forge-chamber__arch--right" aria-hidden="true" />
    <div className="forge-chamber__conduit" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="forge-chamber__floor" aria-hidden="true"><i /><i /><i /></div>
    <div className="forge-workbench" aria-hidden="true">
      <div className="forge-machine"><i className="forge-machine__housing" /><i className="forge-machine__wheel forge-machine__wheel--rear" /><i className="forge-machine__wheel forge-machine__wheel--front" /><i className="forge-machine__hammer" /><i className="forge-machine__pivot" /></div>
      <div className="forge-furnace"><SpriteStrip className="forge-furnace__smoke" src={forgeSmokeStrip} /><SpriteStrip className="forge-furnace__mouth" src={forgeFireStrip} /><i className="forge-furnace__rim" /><i className="forge-furnace__crown" /></div>
      <div className="forge-anvil"><i /></div>
    </div>
    <div className="forge-chamber__foreground" aria-hidden="true"><i /><i /></div>
  </div>
}

function ArchiveChamber() {
  return <div className="interior-chamber archive-chamber" aria-hidden="true">
    <div className="archive-chamber__vault"><i /><i /><i /><i /><i /><i /></div>
    <div className="archive-chamber__ribbon"><SpriteStrip className="archive-chamber__runes" src={archiveRunesStrip} /></div>
    <div className="archive-chamber__core"><SpriteStrip className="archive-chamber__windows" src={archiveWindowsStrip} /><i /><i /></div>
    <div className="archive-chamber__desk"><i /><i /><i /></div>
    <div className="archive-chamber__foreground" />
  </div>
}

function CitadelChamber() {
  return <div className="interior-chamber citadel-chamber" aria-hidden="true">
    <div className="citadel-chamber__vault"><i /><i /><i /></div>
    <div className="citadel-chamber__dais"><SpriteStrip className="citadel-chamber__ring" src={citadelRuneStrip} /><SpriteStrip className="citadel-chamber__core" src={citadelCoreStrip} /><i className="citadel-chamber__pedestal" /></div>
    <div className="citadel-chamber__console citadel-chamber__console--left"><i /><i /><i /></div>
    <div className="citadel-chamber__console citadel-chamber__console--right"><i /><i /><i /></div>
    <div className="citadel-chamber__foreground" />
  </div>
}

function WatcherChamber() {
  return <div className="interior-chamber watcher-chamber" aria-hidden="true">
    <div className="watcher-chamber__dome"><i /><i /><i /><i /></div>
    <div className="watcher-chamber__horizon" />
    <SpriteStrip className="watcher-chamber__scan" src={watcherScanStrip} />
    <div className="watcher-chamber__lens"><SpriteStrip className="watcher-chamber__lens-pulse" src={watcherLensStrip} /><i /></div>
    <div className="watcher-chamber__console"><i /><i /><i /></div>
    <div className="watcher-chamber__foreground" />
  </div>
}

function SanctumChamber() {
  return <div className="interior-chamber sanctum-chamber" aria-hidden="true">
    <div className="sanctum-chamber__vault"><i /><i /><i /></div>
    <div className="sanctum-chamber__pool"><i /><i /></div>
    <div className="sanctum-chamber__focus"><SpriteStrip className="sanctum-chamber__orbit" src={sanctumOrbitStrip} /><i /></div>
    <div className="sanctum-chamber__channels"><i /><i /><i /></div>
    <div className="sanctum-chamber__foreground" />
  </div>
}

const CHAMBERS = Object.freeze({ forge: ForgeChamber, archive: ArchiveChamber, citadel: CitadelChamber, watcher: WatcherChamber, sanctum: SanctumChamber })

export default function BuildingInteriorScene({ buildingId, system, lifecycle, agent, building, tasks, alerts, activityItems, tokenRiver, crons, modelSources, onExitComplete, returnFocusRef }) {
  const [closing, setClosing] = useState(false)
  const sceneRef = useRef(null)
  const backButtonRef = useRef(null)
  const presentation = useMemo(() => deriveBuildingInteriorPresentation(buildingId, { system, lifecycle, agent, building, tasks, alerts, activityItems, tokenRiver, crons, modelSources }), [activityItems, agent, alerts, building, buildingId, crons, lifecycle, modelSources, system, tasks, tokenRiver])
  const config = BUILDING_INTERIOR_CONFIG[buildingId]
  const meta = INTERIOR_META[buildingId]
  const Chamber = CHAMBERS[buildingId]
  const phaseLabel = PHASE_LABEL[presentation?.phase] ?? PHASE_LABEL.standby
  const detail = presentation?.phase === 'working' ? meta?.working : presentation?.phase === 'warning' ? 'Lokalny proces wymaga uwagi.' : presentation?.phase === 'critical' ? 'Lokalny incydent wymaga szybkiej reakcji.' : presentation?.phase === 'offline' ? 'Brak aktualnego połączenia z Hermes runtime.' : meta?.idle

  const requestClose = useCallback(() => setClosing(true), [])
  useEffect(() => {
    const appRoot = document.getElementById('root')
    const returnFocusTarget = returnFocusRef?.current
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden')
    if (appRoot) { appRoot.inert = true; appRoot.setAttribute('aria-hidden', 'true') }
    backButtonRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); requestClose(); return }
      if (event.key !== 'Tab') return
      const focusable = [...(sceneRef.current?.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])') ?? [])]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      if (appRoot) { appRoot.inert = false; if (previousAriaHidden === null) appRoot.removeAttribute('aria-hidden'); else appRoot.setAttribute('aria-hidden', previousAriaHidden) }
      window.requestAnimationFrame(() => returnFocusTarget?.focus())
    }
  }, [requestClose, returnFocusRef])
  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(onExitComplete, 260)
    return () => window.clearTimeout(timer)
  }, [closing, onExitComplete])

  if (!config || !presentation || !Chamber) return null
  return createPortal(<section ref={sceneRef} className={`building-interior building-interior--${buildingId}${closing ? ' is-closing' : ''}`} data-building-interior={buildingId} data-operational-phase={presentation.phase} role="dialog" aria-modal="true" aria-labelledby={`${buildingId}-interior-title`} onPointerDown={(event) => event.stopPropagation()}>
    <div className="building-interior__ambient" aria-hidden="true"><i /><i /><i /></div>
    <header className="building-interior__header">
      <button ref={backButtonRef} type="button" className="building-interior__back" onClick={requestClose} aria-label="Wróć do mapy Cytadeli"><span aria-hidden="true">‹</span> CYTADELA</button>
      <div><p>{meta.eyebrow}</p><h1 id={`${buildingId}-interior-title`}>{config.title}</h1></div>
      <span className="building-interior__phase" data-phase={presentation.phase}>{phaseLabel}</span>
    </header>
    <Chamber />
    <div className="building-interior__readout">
      <div className="building-interior__summary"><span className="building-interior__status-dot" data-phase={presentation.phase} aria-hidden="true" /><div><strong>{phaseLabel}</strong><p>{detail}</p></div></div>
      <dl className="building-interior__metrics">{presentation.metrics.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{formatMetric(item)}</dd></div>)}</dl>
      <p className="building-interior__task"><span>{meta.taskLabel}</span>{presentation.taskTitle ?? 'Brak aktywnego zadania w tym subsystemie'}</p>
      <p className="building-interior__source">Źródło: {lifecycle?.source === 'demo' ? 'kontrolowane dane demo' : presentation.connected ? 'Hermes runtime' : 'brak połączenia'}</p>
    </div>
  </section>, document.body)
}
