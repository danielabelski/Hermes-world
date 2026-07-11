import { useEffect, useRef, useState } from 'react'
import { Application, Container, Graphics, Sprite } from 'pixi.js'
import { useWorldStore } from './store/worldStore.js'
import { CameraSystem } from './CameraSystem.js'
import { resolveWorldVisuals } from './data/visualStateResolver.js'
import { presentWorldSelection } from './worldTapSelectionAdapter.js'
import citadelArtUrl from '../assets/hermes-citadel-hd-v1.webp'
import { getMapAgentFrame } from './data/mapAgentManifest.js'

const BUILDINGS = [
  { id: 'keep', x: 0, y: -210, label: 'KEEP', color: 0x805338, roof: 0x6d2430 },
  { id: 'library', x: -225, y: -30, label: 'LIBRARY', color: 0x6f7964, roof: 0x313f5c },
  { id: 'forge', x: 225, y: -30, label: 'FORGE', color: 0x765b47, roof: 0x8d382b },
  { id: 'research-lab', x: -355, y: 150, label: 'RESEARCH', color: 0x536b79, roof: 0x3b526b },
  { id: 'memory-hall', x: -130, y: 150, label: 'MEMORY', color: 0x665576, roof: 0x403657 },
  { id: 'warehouse', x: 125, y: 150, label: 'STORE', color: 0x836946, roof: 0x60452f },
  { id: 'observatory', x: 350, y: 150, label: 'WATCH', color: 0x607b70, roof: 0x304d49 },
  { id: 'api-port', x: -330, y: 330, label: 'API PORT', color: 0x557b82, roof: 0x294d59 },
  { id: 'webhook-post', x: -110, y: 330, label: 'POST', color: 0x7d5e72, roof: 0x573448 },
  { id: 'agent-camp', x: 110, y: 330, label: 'CAMP', color: 0x6e8157, roof: 0x405334 },
  { id: 'clocktower', x: 330, y: 330, label: 'CLOCK', color: 0x756c58, roof: 0x3f486b },
]

// These bounds cover the playable courtyard rather than the oversized sky
// backdrop. Keeping them in world coordinates makes the camera predictable at
// every screen size and prevents a user from panning into empty space.
const WORLD_BOUNDS = { left: -590, right: 590, top: -390, bottom: 440 }
const DRAG_THRESHOLD_PX = 8
const MAX_RAIN_STREAKS = 64
const EMPTY_TASKS = []
const EMPTY_BUILDINGS = []
const EMPTY_ALERTS = []
const AGENT_POSITIONS = [
  { x: -32, y: -115 }, { x: 170, y: 85 }, { x: -180, y: 80 }, { x: -75, y: 228 },
  { x: 48, y: -210 }, { x: 238, y: -42 }, { x: -260, y: -80 }, { x: 82, y: 204 },
  { x: -228, y: 218 }, { x: 266, y: 184 }, { x: 12, y: 132 }, { x: -5, y: 12 },
]

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value))
}

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function midpoint(first, second) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function diamond(graphics, x, y, width, height, color, alpha = 1) {
  graphics.poly([x, y - height / 2, x + width / 2, y, x, y + height / 2, x - width / 2, y]).fill({ color, alpha })
}

export default function WorldCanvas({ renderAgents = false }) {
  const [runtimeReady, setRuntimeReady] = useState(0)
  const hostRef = useRef(null)
  const appRef = useRef(null)
  const worldRef = useRef(null)
  const interactionRef = useRef({ suppressTapUntil: 0 })
  const reducedMotionRef = useRef(false)
  const cameraApiRef = useRef(null)
  const entityAnchorsRef = useRef({})
  const agents = useWorldStore((state) => state.agents)
  // Keep every selector referentially stable. In particular, do not return an
  // object or an inline array from a Zustand selector: React 19 treats that as
  // a new external-store snapshot and can keep re-rendering indefinitely.
  const tasks = useWorldStore((state) => state.tasks ?? EMPTY_TASKS)
  const buildings = useWorldStore((state) => state.buildings ?? EMPTY_BUILDINGS)
  const alerts = useWorldStore((state) => state.alerts ?? EMPTY_ALERTS)
  const scenario = useWorldStore((state) => state.scenario)
  const selection = useWorldStore((state) => state.selection)
  const zoomPreference = useWorldStore((state) => state.camera?.zoomPreference ?? 'standard')
  const selectEntity = useWorldStore((state) => state.selectEntity)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    let disposed = false
    let app = null
    let initialized = false
    let destroyed = false
    let runtimeDisposed = false
    let disposeRuntime = () => {}

    const destroyApplication = () => {
      // Application.destroy() invokes Pixi's TickerPlugin.destroy(), which
      // expects a ticker to exist. React StrictMode can unmount while init()
      // is still awaiting a renderer, so never destroy a half-initialized app.
      // Once init completes, the async mount below sees `disposed` and tears it
      // down exactly once.
      if (destroyed || !initialized || !app) return
      destroyed = true

      const currentApp = app
      if (appRef.current === currentApp) appRef.current = null
      worldRef.current = null

      try {
        currentApp.ticker?.stop?.()
        currentApp.destroy?.(
          { removeView: true },
          { children: true, texture: true, textureSource: true },
        )
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Hermes world cleanup ignored an already-destroyed renderer.', error)
      }
    }

    async function mount() {
      const nextApp = new Application()
      app = nextApp
      if (import.meta.env.DEV) window.__hermesWorldInit = 'starting'

      try {
        await nextApp.init({
          background: '#10231e',
          backgroundAlpha: 0,
          // ResizePlugin is deliberately not used. A local ResizeObserver is
          // easier to own and cannot outlive this React effect in StrictMode.
          antialias: false,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          preference: 'webgl',
          powerPreference: 'high-performance',
        })
        initialized = true
        if (import.meta.env.DEV) window.__hermesWorldInit = 'ready'
        if (disposed) {
          destroyApplication()
          return
        }
        appRef.current = nextApp
        host.appendChild(nextApp.canvas)

      const root = new Container()
      root.eventMode = 'static'
      root.sortableChildren = true
      nextApp.stage.addChild(root)
      worldRef.current = root
      if (import.meta.env.DEV) window.__hermesWorldRoot = root
      setRuntimeReady((version) => version + 1)

      const canvas = nextApp.canvas
      canvas.style.touchAction = 'none'
      canvas.style.userSelect = 'none'

      const camera = new CameraSystem({ bounds: WORLD_BOUNDS, minScale: 0.5, maxScale: 1.48 })
      const pointers = new Map()
      let dragStart = null
      let pinchStart = null
      let cameraHasBeenPlaced = false

      const minScaleForViewport = () => clamp(
        Math.min(
          nextApp.renderer.width / (WORLD_BOUNDS.right - WORLD_BOUNDS.left + 120),
          nextApp.renderer.height / (WORLD_BOUNDS.bottom - WORLD_BOUNDS.top + 120),
        ),
        0.38,
        0.68,
      )

      const applyCamera = () => {
        const transform = camera.getTransform()
        root.x = transform.x
        root.y = transform.y
        root.scale.set(transform.scale)
      }

      const setZoomAt = (nextScale, focus) => {
        camera.zoomAt(nextScale, focus)
        applyCamera()
      }

      const localPoint = (event) => {
        const rect = canvas.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
      }

      const startSinglePointer = (point) => {
        dragStart = { point, rootX: root.x, rootY: root.y, moved: false }
        pinchStart = null
      }

      const onPointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        const point = localPoint(event)
        pointers.set(event.pointerId, point)
        canvas.setPointerCapture?.(event.pointerId)
        if (pointers.size === 1) {
          startSinglePointer(point)
          return
        }
        if (pointers.size === 2) {
          const [first, second] = [...pointers.values()]
          pinchStart = {
            distance: Math.max(distance(first, second), 1),
            scale: camera.getTransform().scale,
            focus: midpoint(first, second),
          }
          dragStart = null
        }
      }

      const onPointerMove = (event) => {
        if (!pointers.has(event.pointerId)) return
        const point = localPoint(event)
        pointers.set(event.pointerId, point)
        if (pointers.size >= 2 && pinchStart) {
          const [first, second] = [...pointers.values()]
          const focus = midpoint(first, second)
          const factor = distance(first, second) / pinchStart.distance
          setZoomAt(pinchStart.scale * factor, focus)
          interactionRef.current.suppressTapUntil = performance.now() + 180
          event.preventDefault()
          return
        }
        if (!dragStart) return
        const deltaX = point.x - dragStart.point.x
        const deltaY = point.y - dragStart.point.y
        if (!dragStart.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) return
        dragStart.moved = true
        camera.setTransform({ x: dragStart.rootX + deltaX, y: dragStart.rootY + deltaY })
        applyCamera()
        interactionRef.current.suppressTapUntil = performance.now() + 180
        event.preventDefault()
      }

      const onPointerEnd = (event) => {
        const didMove = Boolean(dragStart?.moved || pointers.size > 1)
        pointers.delete(event.pointerId)
        canvas.releasePointerCapture?.(event.pointerId)
        if (didMove) interactionRef.current.suppressTapUntil = performance.now() + 180
        if (pointers.size === 1) startSinglePointer([...pointers.values()][0])
        else if (pointers.size === 0) {
          dragStart = null
          pinchStart = null
        }
      }

      const onWheel = (event) => {
        event.preventDefault()
        const delta = event.deltaY > 0 ? -0.075 : 0.075
        setZoomAt(camera.getTransform().scale + delta, localPoint(event))
      }

      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerup', onPointerEnd)
      canvas.addEventListener('pointercancel', onPointerEnd)
      canvas.addEventListener('wheel', onWheel, { passive: false })

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const applyMotionPreference = () => { reducedMotionRef.current = mediaQuery.matches }
      applyMotionPreference()
      mediaQuery.addEventListener?.('change', applyMotionPreference)

      const layout = () => {
        const width = Math.max(1, Math.round(host.clientWidth))
        const height = Math.max(1, Math.round(host.clientHeight))
        if (nextApp.renderer.width !== width || nextApp.renderer.height !== height) nextApp.renderer.resize(width, height)
        camera.setViewport(nextApp.renderer.width, nextApp.renderer.height)
        camera.setMinScale(minScaleForViewport())
        if (!cameraHasBeenPlaced) {
          camera.setTransform({
            x: nextApp.renderer.width / 2,
            y: nextApp.renderer.height * 0.53,
            scale: Math.max(camera.minScale, 0.78),
          })
          cameraHasBeenPlaced = true
        } else {
          camera.setTransform({ scale: Math.max(camera.minScale, camera.getTransform().scale) })
        }
        applyCamera()
      }
      layout()
      const resizeObserver = new ResizeObserver(layout)
      resizeObserver.observe(host)

      const syncVisibility = () => {
        if (document.visibilityState === 'hidden') nextApp.ticker?.stop?.()
        else nextApp.ticker?.start?.()
      }
      document.addEventListener('visibilitychange', syncVisibility)

      cameraApiRef.current = {
        focusEntity: (entityType, entityId, preference = 'detail') => {
          const transform = camera.focusEntity(entityType, entityId, entityAnchorsRef.current, { zoomPreference: preference })
          if (!transform) return false
          applyCamera()
          return true
        },
        setZoomPreference: (preference) => camera.getPreferredScale(preference),
      }

      disposeRuntime = () => {
        if (runtimeDisposed) return
        runtimeDisposed = true
        mediaQuery.removeEventListener?.('change', applyMotionPreference)
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerup', onPointerEnd)
        canvas.removeEventListener('pointercancel', onPointerEnd)
        canvas.removeEventListener('wheel', onWheel)
        document.removeEventListener('visibilitychange', syncVisibility)
        cameraApiRef.current = null
        resizeObserver?.disconnect?.()
        pointers.clear()
        dragStart = null
        pinchStart = null
      }
      } catch (error) {
        // A failed renderer init must not leave a rejected promise in the
        // console or make StrictMode's second mount unusable.
        if (import.meta.env.DEV) window.__hermesWorldInit = `failed: ${error?.message ?? error}`
        if (!disposed) console.error('Hermes world renderer could not initialize.', error)
      }
    }
    void mount()
    return () => {
      disposed = true
      disposeRuntime()
      destroyApplication()
    }
  }, [])

  useEffect(() => {
    const app = appRef.current
    const root = worldRef.current
    if (!app || !root || root.destroyed || app.renderer?.destroyed) return undefined
    root.removeChildren().forEach((child) => {
      if (!child.destroyed) child.destroy?.()
    })

    // The illustrated citadel is the premium, non-pixelated ground plane.
    // Procedural geometry stays at low opacity for hit areas and live signals.
    const citadelArt = Sprite.from(citadelArtUrl)
    citadelArt.anchor.set(0.5)
    citadelArt.x = 0
    citadelArt.y = 16
    citadelArt.width = 1280
    citadelArt.height = 854
    citadelArt.cullable = true
    citadelArt.zIndex = 0
    root.addChild(citadelArt)

    const sky = new Graphics().rect(-900, -900, 1800, 1800).fill({ color: scenario === 'critical' ? 0x243240 : scenario === 'warning' ? 0x365048 : 0x476f57, alpha: 0 })
    sky.zIndex = 0
    root.addChild(sky)
    const terrain = new Graphics()
    for (let row = -8; row <= 8; row += 1) for (let col = -8; col <= 8; col += 1) diamond(terrain, (col - row) * 48, (col + row) * 24, 96, 48, (col + row) % 2 ? 0x54754d : 0x5d7d52, 0)
    terrain.zIndex = 10
    root.addChild(terrain)

    const atmosphere = new Graphics()
    for (let i = 0; i < 18; i += 1) {
      const x = ((i * 137) % 1060) - 530
      const y = ((i * 83) % 650) - 260
      atmosphere.circle(x, y, 8 + (i % 3) * 2).fill({ color: 0x315b3d, alpha: 0 })
      atmosphere.rect(x - 2, y + 6, 4, 12).fill({ color: 0x5e422d, alpha: 0 })
    }
    for (let i = 0; i < 10; i += 1) {
      const x = -480 + i * 105
      const y = 390 + (i % 2) * 24
      atmosphere.rect(x - 2, y - 18, 4, 28).fill({ color: 0x765234, alpha: 0 })
      atmosphere.poly([x - 2, y - 18, x + 18, y - 10, x - 2, y - 3]).fill({ color: i % 2 ? 0x8e3438 : 0xd09a49, alpha: 0 })
    }
    atmosphere.cullable = true
    atmosphere.zIndex = 5
    root.addChild(atmosphere)

    const road = new Graphics()
    diamond(road, 0, 30, 520, 112, 0xbda778, 0)
    diamond(road, 0, 18, 380, 76, 0xd4bd86, 0)
    road.zIndex = 20
    root.addChild(road)

    const worldVisuals = resolveWorldVisuals({ agents, buildings, tasks, alerts })
    const buildingVisualById = new Map(worldVisuals.buildings.map((visual) => [visual.entityId, visual]))
    const agentVisualById = new Map(worldVisuals.agents.map((visual) => [visual.entityId, visual]))

    BUILDINGS.forEach((building, buildingIndex) => {
      const g = new Graphics()
      const visual = buildingVisualById.get(building.id)
      diamond(g, building.x, building.y + 28, 156, 76, 0x15291e, 0.3)
      g.roundRect(building.x - 56, building.y - 16, 112, 70, 6).fill(building.color)
      g.poly([building.x - 69, building.y - 16, building.x, building.y - 65, building.x + 69, building.y - 16]).fill(building.roof)
      g.rect(building.x - 10, building.y + 15, 20, 39).fill(0x2c1c1b)
      // Small, distinct silhouettes make the settlement scannable without
      // reading labels: each landmark gets a repeatable architectural cue.
      const windowColor = visual?.state === 'error' || scenario === 'critical' ? 0xe7a755 : visual?.state === 'active' ? 0xffe6a1 : 0xf7d581
      g.roundRect(building.x - 42, building.y + 2, 14, 17, 2).fill(windowColor)
      g.roundRect(building.x + 28, building.y + 2, 14, 17, 2).fill(windowColor)
      if (building.id === 'keep' || building.id === 'clocktower') {
        g.rect(building.x - 46, building.y - 90, 20, 74).fill(building.color)
        g.rect(building.x + 26, building.y - 90, 20, 74).fill(building.color)
        g.poly([building.x - 50, building.y - 90, building.x - 36, building.y - 112, building.x - 22, building.y - 90]).fill(building.roof)
        g.poly([building.x + 22, building.y - 90, building.x + 36, building.y - 112, building.x + 50, building.y - 90]).fill(building.roof)
      }
      if (building.id === 'library' || building.id === 'research-lab' || building.id === 'observatory') {
        g.circle(building.x, building.y - 30, 17).fill(0x26394b)
        g.circle(building.x, building.y - 30, 11).fill({ color: 0x9bcbd2, alpha: 0.72 })
      }
      if (building.id === 'forge' || building.id === 'api-port') {
        g.rect(building.x + 33, building.y - 67, 18, 52).fill(0x4a3b35)
        g.circle(building.x + 42, building.y - 77, 12).fill({ color: 0x96736a, alpha: 0.35 })
      }
      if (building.id === 'memory-hall' || building.id === 'webhook-post') {
        g.rect(building.x - 2, building.y - 94, 4, 46).fill(0x6f5436)
        g.poly([building.x + 2, building.y - 94, building.x + 33, building.y - 83, building.x + 2, building.y - 72]).fill(buildingIndex % 2 ? 0xb5d6db : 0xc45c67)
      }
      if (building.id === 'warehouse' || building.id === 'agent-camp') {
        for (let crate = 0; crate < 3; crate += 1) g.rect(building.x - 48 + crate * 15, building.y + 33 - (crate % 2) * 9, 12, 10).fill(0xa87840)
      }
      if (building.id === 'forge' && scenario !== 'healthy') g.circle(building.x + 46, building.y - 48, 16).fill({ color: scenario === 'critical' ? 0x3e3a47 : 0xd29347, alpha: 0.7 })
      if (visual?.state === 'error') {
        g.circle(building.x, building.y - 75, 11).fill(0xe15a47)
        g.rect(building.x - 1.5, building.y - 81, 3, 9).fill(0x3b2523)
        g.circle(building.x, building.y - 69, 1.6).fill(0x3b2523)
      } else if (visual?.state === 'warning') {
        g.circle(building.x, building.y - 75, 9).fill(0xf0bb48)
      } else if (visual?.state === 'active') {
        g.circle(building.x + 52, building.y + 5, 7).fill({ color: 0xf5c75c, alpha: 0.75 })
      }
      g.eventMode = 'static'
      g.cursor = 'pointer'
      g.cullable = true
      // The HD illustration supplies the actual architecture. This graphics
      // object intentionally remains only as an invisible, stable hit area.
      g.alpha = 0
      g.zIndex = 1000 + Math.round(building.y)
      g.on('pointertap', (event) => {
        event.stopPropagation()
        if (performance.now() >= interactionRef.current.suppressTapUntil) {
          presentWorldSelection({ ...building, type: 'building', state: visual?.state }, event)
          selectEntity('building', building.id)
        }
      })
      root.addChild(g)
    })

    const fountain = new Graphics()
    fountain.ellipse(0, 42, 52, 24).fill({ color: 0x719aa2, alpha: 0 })
    fountain.ellipse(0, 39, 35, 14).fill({ color: 0xbbe4e4, alpha: 0 })
    fountain.circle(0, 18, 10).fill({ color: 0xe7d7a2, alpha: 0 })
    fountain.cullable = true
    fountain.zIndex = 1500
    root.addChild(fountain)

    tasks.filter((task) => ['running', 'blocked', 'done'].includes(task.status)).slice(0, 4).forEach((task, index) => {
      const box = new Graphics()
      const x = [-94, 74, 125, -150][index]
      const y = [60, 84, 142, 126][index]
      const visual = task.visual ?? {}
      box.roundRect(x - 10, y - 8, 20, 16, 3).fill(visual.color ?? (task.status === 'blocked' ? 0xd44d45 : 0xbc8b4d))
      if (task.status === 'blocked') box.circle(x, y - 17, 6).fill(0xf1d168)
      box.eventMode = 'static'; box.cursor = 'pointer'
      box.cullable = true
      box.zIndex = 2000 + y
      box.on('pointertap', (event) => { event.stopPropagation(); selectEntity('task', task.id) })
      root.addChild(box)
    })

    const anchors = Object.fromEntries(BUILDINGS.map((building) => [`building:${building.id}`, { x: building.x, y: building.y }]))
    // The DOM MapAgentLayer is the production owner of characters. This
    // renderer-only compatibility branch can never resolve a UI portrait.
    const agentSprites = renderAgents ? agents.map((agent, index) => {
      const g = new Graphics()
      const { x, y } = AGENT_POSITIONS[index] ?? { x: 0, y: 0 }
      anchors[`agent:${agent.profile}`] = { x, y }
      const agentVisual = agentVisualById.get(agent.id ?? agent.profile)
      const state = agentVisual?.state ?? agent.state ?? (agent.active ? 'working' : 'idle')
      const active = agent.active || ['walking', 'working', 'thinking'].includes(state)
      const toolColor = agent.color ?? 0x8da8d4
      g.ellipse(x, y + 18, 17, 7).fill({ color: 0x18251e, alpha: 0.35 })
      // A proper figure: boots, cloak, head and a role prop. These are kept
      // procedural for the vertical slice, so every future profile can be
      // rendered from the same registry rather than from a fixed 12-slot sheet.
      g.rect(x - 9, y + 21, 6, 8).fill(0x27312e)
      g.rect(x + 3, y + 21, 6, 8).fill(0x27312e)
      g.roundRect(x - 12, y + 3, 24, 22, 6).fill(agent.cloak ?? 0x3d5b62)
      g.circle(x, y - 5, 10).fill(0xf2d6b0)
      g.rect(x - 10, y - 17, 20, 7).fill(toolColor)
      g.circle(x + 8, y - 7, 2).fill(0x382821)
      if (agent.profile === 'coder' || agent.profile === 'developer') {
        g.rect(x + 14, y + 3, 3, 18).fill(0x6f5137)
        g.rect(x + 9, y + 1, 13, 5).fill(0xb5bdc1)
      } else if (agent.profile === 'researcher' || agent.profile === 'reviewer' || agent.profile === 'synthesizer') {
        g.roundRect(x + 12, y + 7, 11, 9, 1).fill(0xe5d39a)
        g.lineTo(x + 22, y + 16).stroke({ color: 0x73543a, width: 1 })
      } else {
        g.rect(x + 13, y + 3, 3, 17).fill(0x765234)
        g.circle(x + 15, y + 2, 4).fill(toolColor)
      }
      if (active && ['working', 'walking', 'thinking'].includes(state)) g.circle(x + 15, y - 20, 4).fill(agentVisual?.priority >= 3 ? 0xea6b57 : 0xf5c75c)
      if (state === 'thinking') {
        g.circle(x + 12, y - 30, 6).fill(0xe9e6d3)
        g.circle(x + 6, y - 24, 2).fill(0xe9e6d3)
      }
      if (state === 'success' || state === 'returning') {
        g.poly([x, y - 35, x + 4, y - 27, x + 13, y - 26, x + 6, y - 20, x + 8, y - 11, x, y - 17, x - 8, y - 11, x - 6, y - 20, x - 13, y - 26, x - 4, y - 27]).fill(0xf4d273)
      }
      if (state === 'error' || state === 'blocked' || (scenario !== 'healthy' && agent.profile === 'coder')) {
        g.circle(x, y - 34, 9).fill(scenario === 'critical' || state === 'error' ? 0xe15a47 : 0xf0bb48)
        g.rect(x - 1.5, y - 39, 3, 9).fill(0x3b2523)
        g.circle(x, y - 26, 1.7).fill(0x3b2523)
      }
      if (state === 'sleeping') {
        g.rect(x + 14, y - 28, 8, 3).fill(0xd6e4ea)
        g.rect(x + 19, y - 34, 8, 3).fill(0xd6e4ea)
      }
      // Scale around the agent's own feet, not world origin. On a phone this
      // keeps a character legible as a person (cloak/head/tool), never a dot.
      g.pivot.set(x, y)
      g.position.set(x, y)
      g.scale.set(1.65)
      g.eventMode = 'static'
      g.cursor = 'pointer'
      g.cullable = true
      g.zIndex = 2200 + y
      g.on('pointertap', (event) => {
        event.stopPropagation()
        if (performance.now() >= interactionRef.current.suppressTapUntil) {
          presentWorldSelection({ ...agent, type: 'agent', state }, event, { importance: agentVisual?.urgency === 'high' ? 'critical' : 'normal' })
          selectEntity('agent', agent.profile)
        }
      })
      root.addChild(g)

      const portrait = Sprite.from(getMapAgentFrame(agent.profile, active ? 'work' : 'idle'))
      portrait.anchor.set(0.5, 1)
      portrait.x = x
      portrait.y = y + 32
      portrait.width = active ? 64 : 58
      portrait.height = active ? 64 : 58
      portrait.alpha = 1
      portrait.scale.x *= index % 2 === 0 ? -1 : 1
      portrait.cullable = true
      portrait.zIndex = 2300 + y
      root.addChild(portrait)
      return { g, portrait, x, y, baseX: x, baseY: y, active, phase: index * 0.8, patrolRadius: active ? 38 : 14 }
    }) : []
    entityAnchorsRef.current = anchors

    const rain = scenario === 'healthy' || reducedMotionRef.current ? null : new Graphics()
    if (rain) {
      const viewportArea = app.renderer.width * app.renderer.height
      const rainStreaks = clamp(Math.round(viewportArea / 18000), 28, MAX_RAIN_STREAKS)
      for (let i = 0; i < rainStreaks; i += 1) {
        rain.moveTo((i * 71) % 700 - 350, (i * 97) % 620 - 310)
          .lineTo((i * 71) % 700 - 360, (i * 97) % 620 - 285)
          .stroke({ color: 0xb9d7e8, width: 1, alpha: 0.34 })
      }
      rain.cullable = true
      rain.zIndex = 5000
      root.addChild(rain)
    }
    if (!renderAgents) return undefined
    const tick = (ticker) => {
      if (reducedMotionRef.current) return
      const time = ticker.lastTime / 1000
      agentSprites.forEach((agent) => {
        const pace = agent.active ? 0.55 : 0.22
        const driftX = Math.sin(time * pace + agent.phase) * agent.patrolRadius
        const driftY = Math.sin(time * (agent.active ? 4 : 1.5) + agent.phase) * (agent.active ? 3 : 1)
        agent.g.x = agent.baseX + driftX
        agent.g.y = agent.baseY + driftY
        agent.g.zIndex = 2200 + Math.round(agent.baseY + driftY)
        agent.portrait.x = agent.baseX + driftX
        agent.portrait.y = agent.baseY + driftY + 32
        agent.portrait.zIndex = 2300 + Math.round(agent.baseY + driftY)
      })
    }
    const ticker = app.ticker
    if (!ticker?.add || ticker.destroyed) return undefined
    ticker.add(tick)
    return () => {
      if (!ticker.destroyed) ticker.remove?.(tick)
    }
  }, [agents, alerts, buildings, scenario, selectEntity, tasks, runtimeReady, renderAgents])

  useEffect(() => {
    if (!selection || !['agent', 'building'].includes(selection.type)) return
    cameraApiRef.current?.focusEntity(selection.type, selection.id, zoomPreference)
  }, [selection, zoomPreference, agents])

  return <div ref={hostRef} className="world-canvas" aria-label="Żywy świat Hermes OS" />
}
