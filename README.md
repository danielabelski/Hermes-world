# Hermes OS Living World

Mobile-first living observability interface for Hermes OS. This is a separate project that uses a copied technical shell from Hermes OS CAT; the working CAT application is never edited by this project.

## Principles

- React owns authentication, accessible overlays, chat and PWA lifecycle.
- PixiJS renders the Citadel of Hermes.
- Data flows one way: `API → WorldBridge → Zustand → React/PixiJS`.
- The phone is the primary product. Desktop expands the same world with command and editing capabilities; it is not a replacement dashboard.
- Every visual metaphor must have a real API source. The world never invents system activity.
- No copied game assets, UI, map layouts or mechanics are used.

## Capabilities matrix

| World signal | Real source available now | Living-world representation | Fallback |
|---|---|---|---|
| Agent activity and roles | `getProfiles()` | Character, profession, building and activity state | Unknown profiles are not invented |
| Tasks, priorities, blocked/done work | `getKanbanTasks()` | Packages, seals, crates, success and alert effects | Unknown status becomes a normal stored package |
| CPU, RAM and temperature | `getSystemMetrics()` | Weather, light and health pressure | Neutral/calm signal when unavailable |
| Logs | `getLogs()` | Activity feed, warnings, smoke and incidents | No incident effect without a matching log |
| Cron jobs | `getCrons()` + `getCronHistory()` | Clock Tower, bell and failure signal | Idle tower without history |
| Estimated model cost | `getSessions()` | Token river width, flow and glow | Quiet river with no session data |
| Providers and models | `getModels()` + profiles | Source crystals | Neutral quartz when model data is absent |
| Enabled skills | `getSkills()` | Equipped / absent tools and capability summary | No false disabled state if list is absent |

### Requires new Hermes API — intentionally not simulated

| Desired signal | Why it needs API work | Planned metaphor once available |
|---|---|---|
| Queue depth and age | Current task data has no reliable queue length or wait age | Crowded depot and backlog road |
| Retries and retry delay | Logs cannot be safely interpreted as retries | Returning package with retry seal |
| Webhook deliveries | No webhook status endpoint | Messenger at the main gate |
| API latency/error rates | CPU is not endpoint latency | Gate pressure and route speed |
| RAG, memory and vector DB health | No storage/index metrics endpoint | Archive vault and glowing shelves |
| Cache hit/miss and capacity | No cache telemetry endpoint | Storehouse fullness |
| Traces and distributed observability | No span/topology endpoint | Signal beacons and trace paths |

The canonical product mapping is in [`src/world/data/worldMetaphorDictionary.js`](src/world/data/worldMetaphorDictionary.js). New effects must be added there before render work begins.

## Status

Current work: isolated world foundation and mobile vertical slice.
