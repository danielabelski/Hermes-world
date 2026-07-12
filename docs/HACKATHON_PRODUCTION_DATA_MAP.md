# Hermes Citadel — hackathon production data map

## Source of truth

The production origin is the existing Hermes OS panel server. `server.js` is byte-identical to the working Hermes OS Cat server and proxies the authenticated Hermes backend at `127.0.0.1:8787`. Citadel adds a strict, renderer-neutral client adapter; it does not replace the backend contract.

Plain `/` is live. Demo is explicit through `demo=1`, a non-auto `focus`, or `VITE_DEMO_WORLD=true`. Failed live reads never silently switch to fixtures.

## End-to-end path

`Hermes backend → same-origin server.js → src/api.js strict reads → WorldBridge domain cache/provenance → useWorldBridge → worldStore → shared status/presentation resolvers → map/UI`

## Domain mapping

| Domain | Endpoint / Cat shape | Citadel mapping | Cadence | State |
|---|---|---|---|---|
| CPU/RAM/temperature | `GET /api/system/metrics`: `cpuPercent`, `memoryPercent`, memory MB, `temperatureC`, `coreTempsC`, source | global health/weather, header/insight; null sensor remains unavailable | 5s | ready + real smoke |
| Profiles | `GET /api/profiles`: `{profiles[]}` with name, active, model/provider/env | known profile → role/sprite/building; unknown count exposed, never fabricated | 15s, server cache 5s | ready |
| Kanban tasks | `GET /api/kanban/tasks`: `{tasks[]}` | assignee → agent; running/work, review/thinking, ready/pending/scheduled/waiting, blocked/stuck, done/success | 15s client domain; server may cache snapshot | ready + ownership adapter |
| Logs | `GET /api/logs`: `lines|logs|recent` | activity and fresh warning/error/critical alerts; profile heuristic links agent/subsystem | 15s | ready |
| Crons/history | `/api/crons`, `/api/crons/recent` | schedule inventory; failed completion localizes to Clock Tower | 15s | ready + ownership adapter |
| Sessions/cost | `/api/sessions/search?limit=50`: `{sessions[]}` | total estimated cost; active only when streaming or updated within 5 minutes | 60s | ready + active adapter |
| Models/providers | `/api/models`: `{groups[]}` | provider/model crystals and usage intensity from sessions | 60s | ready; no fake provider-health endpoint |
| Skills | `/api/skills`: `{skills[]}` | global enabled/disabled capability summary | 60s | ready; per-agent ownership intentionally unknown |
| Lifecycle | per-domain `Promise.allSettled` + last good cache | live/stale/offline, domain ages, reconnect/recovery, last successful time | each sync | ready + tested |
| Agent ownership | canonical `agentDefinitions`/`buildingDefinitions` | agent→building, blocked task→agent/building, cron error→Clock Tower | snapshot | ready |

## Explicitly unavailable — never simulate

- queue depth/backlog age,
- retry counts and webhook state,
- API latency/error-rate/throughput,
- memory/RAG health,
- cache health,
- trace/service topology.

These require new API contracts after the hackathon baseline; the UI must not infer them from unrelated metrics.

## Production verification

- Unit/integration suite validates Cat-shaped payloads, ownership, active sessions, state presentation and domain stale→recovery.
- Production `server.js` smoke: root, manifest, Citadel SVG, auth status and real system metrics returned HTTP 200.
- Protected Hermes endpoints returned the expected HTTP 401 before login. After user login, the same cookie-bearing origin is consumed by strict API reads.
- Server count during final smoke: exactly one listener.

## Commands

```powershell
npm.cmd test
npm.cmd run validate:world-life
npm.cmd run lint
npm.cmd run build
npm.cmd run build -- --mode demo
# production artifact must be built last
npm.cmd run build
```
