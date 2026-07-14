import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import forgeFireStrip from '../../assets/world-effects/forge-fire-strip.runtime.png'
import forgeSmokeStrip from '../../assets/world-effects/forge-smoke-strip.runtime.png'
import { deriveForgeInteriorPresentation } from '../../world/buildingInteriorPresentation.js'
import './BuildingInteriorScene.css'

const PHASE_COPY = Object.freeze({
  standby: { label: 'CZUWANIE', detail: 'Kuźnia jest gotowa na następny prawdziwy build.' },
  working: { label: 'PRACA', detail: 'Kuźnia wykonuje zadanie zarejestrowane przez Hermes runtime.' },
  warning: { label: 'OSTRZEŻENIE', detail: 'Lokalny proces Kuźni wymaga uwagi.' },
  critical: { label: 'KRYTYCZNY', detail: 'Lokalny incydent Kuźni wymaga reakcji.' },
  offline: { label: 'OFFLINE', detail: 'Brak aktualnego połączenia z Hermes runtime.' },
})

const formatMetric = (value, suffix) => value === null ? '—' : `${Math.round(value)}${suffix}`

export default function BuildingInteriorScene({ buildingId, system, lifecycle, agent, building, tasks, alerts, onExitComplete, returnFocusRef }) {
  const [closing, setClosing] = useState(false)
  const sceneRef = useRef(null)
  const backButtonRef = useRef(null)
  const presentation = useMemo(() => deriveForgeInteriorPresentation({ system, lifecycle, agent, building, tasks, alerts }), [agent, alerts, building, lifecycle, system, tasks])
  const copy = PHASE_COPY[presentation.phase] ?? PHASE_COPY.standby

  const requestClose = useCallback(() => setClosing(true), [])
  useEffect(() => {
    const appRoot = document.getElementById('root')
    const returnFocusTarget = returnFocusRef?.current
    const previousAriaHidden = appRoot?.getAttribute('aria-hidden')
    if (appRoot) {
      appRoot.inert = true
      appRoot.setAttribute('aria-hidden', 'true')
    }
    backButtonRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        requestClose()
        return
      }
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
      if (appRoot) {
        appRoot.inert = false
        if (previousAriaHidden === null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', previousAriaHidden)
      }
      window.requestAnimationFrame(() => returnFocusTarget?.focus())
    }
  }, [requestClose, returnFocusRef])
  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(onExitComplete, 260)
    return () => window.clearTimeout(timer)
  }, [closing, onExitComplete])

  if (buildingId !== 'forge') return null
  return createPortal(<section
    ref={sceneRef}
    className={`building-interior building-interior--forge${closing ? ' is-closing' : ''}`}
    data-building-interior="forge"
    data-operational-phase={presentation.phase}
    role="dialog"
    aria-modal="true"
    aria-labelledby="forge-interior-title"
    onPointerDown={(event) => event.stopPropagation()}
  >
    <div className="building-interior__ambient" aria-hidden="true"><i /><i /><i /></div>
    <header className="building-interior__header">
      <button ref={backButtonRef} type="button" className="building-interior__back" onClick={requestClose} aria-label="Wróć do mapy Cytadeli"><span aria-hidden="true">‹</span> CYTADELA</button>
      <div><p>SUBSYSTEM · BUILD / EXECUTION</p><h1 id="forge-interior-title">Kuźnia Systemowa</h1></div>
      <span className="building-interior__phase" data-phase={presentation.phase}>{copy.label}</span>
    </header>

    <div className="forge-chamber">
      <div className="forge-chamber__backwall" aria-hidden="true"><i /><i /><i /></div>
      <div className="forge-chamber__arch forge-chamber__arch--left" aria-hidden="true" />
      <div className="forge-chamber__arch forge-chamber__arch--right" aria-hidden="true" />
      <div className="forge-chamber__conduit" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="forge-chamber__floor" aria-hidden="true"><i /><i /><i /></div>
      <div className="forge-workbench" aria-hidden="true">
        <div className="forge-machine">
          <i className="forge-machine__housing" />
          <i className="forge-machine__wheel forge-machine__wheel--rear" />
          <i className="forge-machine__wheel forge-machine__wheel--front" />
          <i className="forge-machine__hammer" />
          <i className="forge-machine__pivot" />
        </div>
        <div className="forge-furnace">
          <span className="forge-furnace__smoke"><img src={forgeSmokeStrip} alt="" /></span>
          <span className="forge-furnace__mouth"><img src={forgeFireStrip} alt="" /></span>
          <i className="forge-furnace__rim" />
          <i className="forge-furnace__crown" />
        </div>
        <div className="forge-anvil"><i /></div>
      </div>
      <div className="forge-chamber__foreground" aria-hidden="true"><i /><i /></div>
    </div>

    <div className="building-interior__readout">
      <div className="building-interior__summary">
        <span className="building-interior__status-dot" data-phase={presentation.phase} aria-hidden="true" />
        <div><strong>{copy.label}</strong><p>{copy.detail}</p></div>
      </div>
      <dl className="building-interior__metrics">
        <div><dt>CPU</dt><dd>{formatMetric(presentation.cpuPercent, '%')}</dd></div>
        <div><dt>TEMP.</dt><dd>{formatMetric(presentation.temperatureC, '°')}</dd></div>
        <div><dt>AKTYWNE BUILDY</dt><dd>{presentation.activeTaskCount}</dd></div>
      </dl>
      <p className="building-interior__task"><span>AKTUALNY PRZEBIEG</span>{presentation.taskTitle ?? 'Brak aktywnego zadania w Kuźni'}</p>
      <p className="building-interior__source">Źródło: {lifecycle?.source === 'demo' ? 'kontrolowane dane demo' : presentation.connected ? 'Hermes runtime' : 'brak połączenia'}</p>
    </div>
  </section>, document.body)
}
