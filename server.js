/* global process */
import express from 'express';
import compression from 'compression';
import fs from 'fs';
import http from 'http';
import os from 'os';
import webpush from 'web-push';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { createWorldEventHub } from './server/worldEventHub.js';
import { normalizeHermesWorldEvent, WorldEventValidationError } from './src/world/events/worldEventContract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const execFileAsync = promisify(execFile);

const dataDir = path.join(__dirname, 'data');
const subscriptionsPath = path.join(dataDir, 'push-subscriptions.json');
const vapidPath = path.join(dataDir, 'push-vapid.json');
const cronPushStatePath = path.join(dataDir, 'cron-push-state.json');
const worldEventHistoryPath = process.env.HERMES_WORLD_EVENT_HISTORY || path.join(dataDir, 'world-event-history.json');
const cronLogPath = process.env.HERMES_CRON_LOG || path.join(os.homedir(), '.hermes', 'logs', 'agent.log');
const assetBufferCache = new Map();

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
};

const readJsonFile = (filePath, fallback) => {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[State] Failed to read ${path.basename(filePath)}:`, err?.message || err);
    return fallback;
  }
};

const writeJsonFile = (filePath, value) => {
  ensureDataDir();
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2));
  fs.renameSync(tmpPath, filePath);
};

const loadVapidKeys = () => {
  ensureDataDir();
  const existing = readJsonFile(vapidPath, null);
  if (existing?.publicKey && existing?.privateKey) return existing;
  const generated = webpush.generateVAPIDKeys();
  writeJsonFile(vapidPath, generated);
  return generated;
};

const vapidKeys = loadVapidKeys();
webpush.setVapidDetails('mailto:hermes-os-local@example.invalid', vapidKeys.publicKey, vapidKeys.privateKey);

const loadSubscriptions = () => readJsonFile(subscriptionsPath, []);
const saveSubscriptions = (subscriptions) => writeJsonFile(subscriptionsPath, subscriptions);
let pushSubscriptions = loadSubscriptions();
let cronPushState = readJsonFile(cronPushStatePath, { offset: null, notified: [] });
let pushBackendCookie = '';
if (Object.prototype.hasOwnProperty.call(cronPushState, 'backendCookie')) {
  delete cronPushState.backendCookie;
  writeJsonFile(cronPushStatePath, cronPushState);
}

const latestHashedAsset = (prefix, ext) => {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return null;
  const candidates = fs.readdirSync(assetsDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith(ext))
    .map((name) => {
      const fullPath = path.join(assetsDir, name);
      return { name, fullPath, mtime: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return candidates[0]?.fullPath || null;
};

const app = express();
const PORT = process.env.PORT || 4175;
const worldEventHub = createWorldEventHub({
  storagePath: worldEventHistoryPath,
  logger: (event, detail) => console.info(`[World Events] ${event}`, detail),
});

app.disable('x-powered-by');
app.use(compression({
  filter: (req, res) => req.path === '/api/world/events/stream' ? false : compression.filter(req, res),
}));


app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

// A Home Screen shortcut created while reviewing the demo may retain
// `?demo=1`. Production must never bypass authentication or boot fixtures
// from such a historical launch URL. Keep the demo server (4176) untouched,
// but canonicalize the production entry point before the app shell loads.
app.get('/', (req, res, next) => {
  if (Number(PORT) === 4175 && req.query.demo === '1') {
    return res.redirect(302, '/');
  }
  return next();
});



// Codex panel metrics: lightweight host telemetry + Core Temp CSV reader.
let lastCpuSnapshot = null;
let systemMetrics = {
  cpuPercent: null,
  memoryPercent: null,
  memoryUsedMb: null,
  memoryTotalMb: null,
  loadAvg: null,
  temperatureC: null,
  temperatureSource: 'unavailable',
  updatedAt: null
};

const readCpuSnapshot = () => {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += Object.values(cpu.times).reduce((sum, value) => sum + value, 0);
  }
  return { idle, total };
};

const splitCsvLine = (line) => line.split(',').map((value) => value.trim());

const findLatestCoreTempLog = () => {
  const candidates = [
    process.env.CORE_TEMP_DIR,
    'C:/Program Files/Core Temp',
    'C:/Program Files (x86)/Core Temp'
  ].filter(Boolean);
  let latest = null;
  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) {
        if (!/^CT-Log .*\.csv$/i.test(name)) continue;
        const filePath = path.join(dir, name);
        const stat = fs.statSync(filePath);
        if (!latest || stat.mtimeMs > latest.stat.mtimeMs) latest = { filePath, stat };
      }
    } catch {
      // Telemetry must never break the panel.
    }
  }
  return latest;
};

const readTailText = (filePath, stat, maxBytes = 32768) => {
  const length = Math.min(stat.size, maxBytes);
  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, length, stat.size - length);
    return buffer.toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
};

const readHeadText = (filePath, stat, maxBytes = 32768) => {
  const length = Math.min(stat.size, maxBytes);
  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, length, 0);
    return buffer.toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
};

const readCoreTempTemperature = () => {
  try {
    const latest = findLatestCoreTempLog();
    if (!latest) return null;
    if (Date.now() - latest.stat.mtimeMs > 180000) return null;

    const headerText = readHeadText(latest.filePath, latest.stat).split(/\r?\n/).slice(0, 40);
    const headerLine = headerText.find((line) => line.startsWith('Time,'));
    if (!headerLine) return null;

    const headers = splitCsvLine(headerLine);
    const tempIndexes = headers
      .map((header, index) => (/^Core \d+ Temp/i.test(header) ? index : -1))
      .filter((index) => index >= 0);
    if (!tempIndexes.length) return null;

    const lastDataLine = readTailText(latest.filePath, latest.stat)
      .split(/\r?\n/)
      .reverse()
      .find((line) => /^\d{2}:\d{2}:\d{2} /.test(line));
    if (!lastDataLine) return null;

    const columns = splitCsvLine(lastDataLine);
    const temps = tempIndexes
      .map((index) => Number.parseFloat(columns[index]))
      .filter((value) => Number.isFinite(value) && value > 0 && value < 130);
    if (!temps.length) return null;
    return { value: Math.max(...temps), values: temps, source: 'coretemp' };
  } catch {
    return null;
  }
};

const refreshSystemMetrics = () => {
  const current = readCpuSnapshot();
  let cpuPercent = systemMetrics.cpuPercent;
  if (lastCpuSnapshot && current.total > lastCpuSnapshot.total) {
    const idleDelta = current.idle - lastCpuSnapshot.idle;
    const totalDelta = current.total - lastCpuSnapshot.total;
    cpuPercent = Math.max(0, Math.min(100, (1 - idleDelta / totalDelta) * 100));
  }
  lastCpuSnapshot = current;

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const temp = readCoreTempTemperature();
  systemMetrics = {
    cpuPercent: Number.isFinite(cpuPercent) ? Math.round(cpuPercent * 10) / 10 : null,
    memoryPercent: Math.round((usedMem / totalMem) * 1000) / 10,
    memoryUsedMb: Math.round(usedMem / 1024 / 1024),
    memoryTotalMb: Math.round(totalMem / 1024 / 1024),
    loadAvg: os.loadavg().map((value) => Math.round(value * 100) / 100),
    temperatureC: temp ? Math.round(temp.value * 10) / 10 : null,
    coreTempsC: temp?.values ? temp.values.map((value) => Math.round(value * 10) / 10) : [],
    temperatureSource: temp ? temp.source : 'unavailable',
    updatedAt: new Date().toISOString()
  };
};

refreshSystemMetrics();
setInterval(refreshSystemMetrics, 5000).unref();


const rememberCronNotification = (key) => {
  const notified = Array.isArray(cronPushState.notified) ? cronPushState.notified : [];
  if (notified.includes(key)) return false;
  notified.push(key);
  cronPushState.notified = notified.slice(-200);
  return true;
};

const parseCronNotification = (line) => {
  if (!line.includes('cron.scheduler:')) return null;
  const lower = line.toLowerCase();
  if (lower.includes('completed successfully')) {
    const job = line.match(/Job '([^']+)'/)?.[1] || 'cron job';
    return {
      key: `success:${job}:${line.slice(0, 23)}`,
      title: '[OK] CRON SUCCESS',
      body: `${job} completed successfully.`
    };
  }
  if (lower.includes('failed') || lower.includes(' error') || lower.includes(' error:')) {
    const job = line.match(/Job '([^']+)'/)?.[1] || 'cron job';
    return {
      key: `error:${job}:${line.slice(0, 23)}:${line.slice(-80)}`,
      title: '[ERR] CRON FAILED',
      body: `${job}: ${line.replace(/^.{0,30}cron\.scheduler:\s*/, '').slice(0, 140)}`
    };
  }
  return null;
};

const parseRecentCronNotification = (completion) => {
  if (!completion?.job_id || !completion?.completed_at) return null;
  const name = completion.name || completion.job_id;
  const status = String(completion.status || '').toLowerCase();
  const key = `recent:${completion.job_id}:${status}:${completion.completed_at}`;
  if (status === 'ok' || status === 'success') {
    return {
      key,
      title: '[OK] CRON SUCCESS',
      body: `${name} completed successfully.`
    };
  }
  if (status === 'error' || status === 'failed' || status === 'fail') {
    return {
      key,
      title: '[ERR] CRON FAILED',
      body: `${name} failed.`
    };
  }
  return null;
};

const sendPushToAll = async (payload) => {
  if (!pushSubscriptions.length) return 0;
  const body = JSON.stringify({ ...payload, url: '/?cron_push=1' });
  const kept = [];
  await Promise.all(pushSubscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, body);
      kept.push(subscription);
    } catch (err) {
      if (![404, 410].includes(err?.statusCode)) {
        kept.push(subscription);
        console.warn('[Cron Push] send failed:', err?.statusCode || err?.message || err);
      }
    }
  }));
  if (kept.length !== pushSubscriptions.length) {
    pushSubscriptions = kept;
    saveSubscriptions(pushSubscriptions);
  }
  return kept.length;
};

const initializeCronPushState = () => {
  try {
    const st = fs.statSync(cronLogPath);
    if (cronPushState.offset === null || cronPushState.offset > st.size) {
      cronPushState.offset = st.size;
      writeJsonFile(cronPushStatePath, cronPushState);
    }
  } catch {
    // Log may not exist yet.
  }
};

const pollCronLogForPush = async () => {
  try {
    const st = fs.statSync(cronLogPath);
    if (cronPushState.offset === null || cronPushState.offset > st.size) {
      cronPushState.offset = st.size;
      writeJsonFile(cronPushStatePath, cronPushState);
      return;
    }
    if (st.size === cronPushState.offset) return;
    const stream = fs.createReadStream(cronLogPath, {
      start: cronPushState.offset,
      end: st.size - 1,
      encoding: 'utf8'
    });
    let chunk = '';
    for await (const part of stream) chunk += part;
    cronPushState.offset = st.size;
    const notifications = chunk.split(/\r?\n/).map(parseCronNotification).filter(Boolean);
    for (const notification of notifications) {
      if (rememberCronNotification(notification.key)) await sendPushToAll(notification);
    }
    writeJsonFile(cronPushStatePath, cronPushState);
  } catch (err) {
    if (err?.code !== 'ENOENT') console.warn('[Cron Push] poll failed:', err?.message || err);
  }
};

const pollRecentCronsForPush = async () => {
  if (!pushSubscriptions.length || !pushBackendCookie) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const upstream = await fetch(`${BACKEND_URL}/api/crons/recent`, {
      headers: { accept: 'application/json', cookie: pushBackendCookie },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!upstream.ok) return;
    const payload = await upstream.json();
    const completions = Array.isArray(payload?.completions) ? payload.completions : [];
    for (const completion of completions) {
      if (completion.toast_notifications === false) continue;
      const notification = parseRecentCronNotification(completion);
      if (notification && rememberCronNotification(notification.key)) {
        await sendPushToAll(notification);
      }
    }
    writeJsonFile(cronPushStatePath, cronPushState);
  } catch (err) {
    console.warn('[Cron Push] recent poll failed:', err?.message || err);
  }
};

const pushJsonParser = express.json({ limit: '64kb' });
const panelCookieName = process.env.HERMES_WEBUI_COOKIE_NAME || 'hermes_session';
const hasPanelAuthCookie = (req) => {
  const cookie = typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
  return cookie.split(';').some((part) => part.trim().startsWith(`${panelCookieName}=`));
};
const rememberBackendCookieFromRequest = (req) => {
  if (hasPanelAuthCookie(req)) pushBackendCookie = req.headers.cookie;
};
const requirePanelAuthCookie = (req, res, next) => {
  if (!hasPanelAuthCookie(req)) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  return next();
};

const isLoopbackRequest = (req) => {
  const address = String(req.socket?.remoteAddress ?? '');
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
};
const canIngestWorldEvent = (req) => {
  const token = process.env.HERMES_WORLD_INGEST_TOKEN;
  if (!token) return isLoopbackRequest(req);
  const supplied = req.get('x-hermes-world-token') || String(req.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  return supplied === token;
};

app.get('/api/world/events/snapshot', (req, res) => {
  const events = worldEventHub.snapshot();
  res.json({ ok: true, events, cursor: events.at(-1)?.eventId ?? null });
});

app.get('/api/world/events/stream', (req, res) => {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  res.write('retry: 3000\n\n');
  const unsubscribe = worldEventHub.subscribe(res, req.get('last-event-id') || String(req.query.after ?? ''));
  req.on('close', unsubscribe);
});

app.post('/api/world/events', pushJsonParser, (req, res) => {
  if (!canIngestWorldEvent(req)) return res.status(403).json({ ok: false, error: 'World event ingestion is local-only or requires HERMES_WORLD_INGEST_TOKEN.' });
  return publishWorldEvent(req, res);
});

const publishWorldEvent = (req, res) => {
  try {
    const event = normalizeHermesWorldEvent(req.body);
    const result = worldEventHub.publish(event);
    if (!result.accepted && result.reason === 'persistence_failed') {
      return res.status(503).json({ ok: false, ...result });
    }
    return res.status(result.accepted ? 202 : 200).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof WorldEventValidationError) return res.status(400).json({ ok: false, error: error.code, detail: error.message });
    console.error('[World Events] ingestion failed:', error);
    return res.status(500).json({ ok: false, error: 'world_event_ingestion_failed' });
  }
};

app.post('/api/world/events/panel', requirePanelAuthCookie, pushJsonParser, (req, res) => {
  if (req.get('x-hermes-world-source') !== 'panel-chat') {
    return res.status(403).json({ ok: false, error: 'Invalid world event source.' });
  }
  return publishWorldEvent(req, res);
});


const kanbanJsonCache = new Map();
const kanbanSnapshotCache = new Map();
const kanbanStatuses = new Set(['triage', 'todo', 'ready', 'running', 'review', 'blocked', 'scheduled', 'done']);
const safeKanbanBoard = (value) => typeof value === 'string' && /^[a-zA-Z0-9._-]{1,80}$/.test(value);
const shellQuote = (value) => `'${String(value).replace(/'/g, `'\''`)}'`;
const compactKanbanTask = (task) => ({
  id: task?.id || '',
  title: task?.title || task?.id || 'Untitled task',
  body: typeof task?.body === 'string' ? task.body.slice(0, 420) : '',
  assignee: task?.assignee || 'unassigned',
  status: task?.status || 'todo',
  priority: task?.priority ?? 0,
  created_at: task?.created_at || null,
  started_at: task?.started_at || null,
  completed_at: task?.completed_at || null,
  session_id: task?.session_id || null
});

const execHermesKanbanScript = async (script, timeout = 18000) => {
  const command = process.platform === 'win32' ? 'wsl.exe' : 'bash';
  const commandArgs = process.platform === 'win32' ? ['bash', '-lc', script] : ['-lc', script];
  const { stdout } = await execFileAsync(command, commandArgs, {
    timeout,
    maxBuffer: 4 * 1024 * 1024
  });
  return stdout;
};

const runHermesKanbanJson = async (args, { cacheSeconds = 60 } = {}) => {
  const cacheKey = args.join('\u0000');
  const now = Date.now();
  const cached = kanbanJsonCache.get(cacheKey);
  if (cached && now - cached.ts < cacheSeconds * 1000) return cached.value;

  const command = ['hermes', 'kanban', ...args].map(shellQuote).join(' ');
  const stdout = await execHermesKanbanScript(command);
  const value = JSON.parse(stdout || 'null');
  kanbanJsonCache.set(cacheKey, { ts: now, value });
  if (kanbanJsonCache.size > 50) kanbanJsonCache.delete(kanbanJsonCache.keys().next().value);
  return value;
};

const kanbanBoardArgs = (req) => {
  const args = [];
  const board = req.query?.board;
  if (board) {
    if (!safeKanbanBoard(board)) {
      const err = new Error('Invalid Kanban board slug');
      err.statusCode = 400;
      throw err;
    }
    args.push('--board', board);
  }
  return args;
};

const getKanbanSnapshot = async (req) => {
  const boardArgs = kanbanBoardArgs(req);
  const cacheKey = `snapshot:${boardArgs.join('\u0000')}`;
  const now = Date.now();
  const cached = kanbanSnapshotCache.get(cacheKey);
  if (cached?.value && now - cached.ts < 600000) return cached.value;
  if (cached?.promise) return cached.promise;

  const delimiter = '__HERMES_KANBAN_SPLIT__';
  const commands = [
    ['hermes', 'kanban', 'boards', 'list', '--json'],
    ['hermes', 'kanban', ...boardArgs, 'stats', '--json'],
    ['hermes', 'kanban', ...boardArgs, 'list', '--json', '--sort', 'updated']
  ].map((parts) => parts.map(shellQuote).join(' '));
  const script = commands.join(`; printf '\\n${delimiter}\\n'; `);

  const promise = execHermesKanbanScript(script, 30000).then((stdout) => {
    const parts = stdout.split(delimiter).map((part) => part.trim()).filter(Boolean);
    if (parts.length < 3) throw new Error('Incomplete Kanban snapshot output');
    const boards = JSON.parse(parts[0] || '[]');
    const stats = JSON.parse(parts[1] || '{}');
    const tasks = JSON.parse(parts.slice(2).join(`\n${delimiter}\n`) || '[]');
    const value = {
      boards: Array.isArray(boards) ? boards : [],
      stats: stats || {},
      tasks: Array.isArray(tasks) ? tasks.slice(0, 120).map(compactKanbanTask) : []
    };
    kanbanSnapshotCache.set(cacheKey, { ts: Date.now(), value });
    if (kanbanSnapshotCache.size > 10) kanbanSnapshotCache.delete(kanbanSnapshotCache.keys().next().value);
    return value;
  }).finally(() => {
    const latest = kanbanSnapshotCache.get(cacheKey);
    if (latest?.promise) kanbanSnapshotCache.delete(cacheKey);
  });

  kanbanSnapshotCache.set(cacheKey, { ts: now, promise });
  return promise;
};

app.get('/api/kanban/boards', requirePanelAuthCookie, async (req, res) => {
  try {
    const snapshot = await getKanbanSnapshot(req);
    res.json({ boards: snapshot.boards, current: snapshot.boards.find((b) => b.is_current)?.slug || null });
  } catch (err) {
    res.status(err.statusCode || 502).json({ error: 'Kanban boards unavailable', detail: err.message });
  }
});

app.get('/api/kanban/stats', requirePanelAuthCookie, async (req, res) => {
  try {
    const snapshot = await getKanbanSnapshot(req);
    res.json(snapshot.stats || {});
  } catch (err) {
    res.status(err.statusCode || 502).json({ error: 'Kanban stats unavailable', detail: err.message });
  }
});

app.get('/api/kanban/tasks', requirePanelAuthCookie, async (req, res) => {
  try {
    const status = typeof req.query?.status === 'string' ? req.query.status.toLowerCase() : '';
    if (status && status !== 'all' && !kanbanStatuses.has(status)) return res.status(400).json({ error: 'Invalid Kanban status' });

    const sort = typeof req.query?.sort === 'string' ? req.query.sort : 'updated';
    const useSnapshot = !(req.query?.archived === '1' || req.query?.archived === 'true') && (!sort || sort === 'updated');
    let tasks;

    if (useSnapshot) {
      const snapshot = await getKanbanSnapshot(req);
      tasks = snapshot.tasks;
    } else {
      const args = [...kanbanBoardArgs(req), 'list', '--json'];
      if (status && status !== 'all') args.push('--status', status);
      if (req.query?.archived === '1' || req.query?.archived === 'true') args.push('--archived');
      const allowedSorts = new Set(['assignee', 'created', 'created-desc', 'priority', 'priority-desc', 'status', 'title', 'updated']);
      args.push('--sort', allowedSorts.has(sort) ? sort : 'updated');
      const rawTasks = await runHermesKanbanJson(args, { cacheSeconds: 60 });
      tasks = Array.isArray(rawTasks) ? rawTasks.slice(0, 120).map(compactKanbanTask) : [];
    }

    const filteredTasks = status && status !== 'all'
      ? tasks.filter((task) => String(task.status || '').toLowerCase() === status)
      : tasks;
    res.json({ tasks: filteredTasks, count: filteredTasks.length });
  } catch (err) {
    res.status(err.statusCode || 502).json({ error: 'Kanban tasks unavailable', detail: err.message });
  }
});

setTimeout(() => {
  getKanbanSnapshot({ query: {} }).catch((err) => {
    console.warn('[Kanban] prewarm failed:', err?.message || err);
  });
}, 5000).unref();

app.get('/api/push/vapid', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/push/subscribe', requirePanelAuthCookie, pushJsonParser, (req, res) => {
  rememberBackendCookieFromRequest(req);
  const subscription = req.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ ok: false, error: 'Invalid push subscription' });
  }
  const existing = new Map(pushSubscriptions.map((sub) => [sub.endpoint, sub]));
  existing.set(subscription.endpoint, subscription);
  pushSubscriptions = Array.from(existing.values()).slice(-20);
  saveSubscriptions(pushSubscriptions);
  if (req.headers.cookie) {
    pushBackendCookie = req.headers.cookie;
  }
  initializeCronPushState();
  res.json({ ok: true, subscriptions: pushSubscriptions.length });
});

app.get('/api/push/status', requirePanelAuthCookie, (req, res) => {
  rememberBackendCookieFromRequest(req);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    ok: true,
    subscriptions: pushSubscriptions.length,
    publicKey: vapidKeys.publicKey,
    cronLogExists: fs.existsSync(cronLogPath),
    offset: cronPushState.offset,
    backendCookie: Boolean(pushBackendCookie)
  });
});

app.post('/api/push/test-cron', requirePanelAuthCookie, async (req, res) => {
  rememberBackendCookieFromRequest(req);
  const sent = await sendPushToAll({
    title: '[OK] CRON SUCCESS',
    body: 'Hermes OS test cron notification.'
  });
  res.json({ ok: true, sent, subscriptions: pushSubscriptions.length });
});

initializeCronPushState();
setInterval(pollCronLogForPush, 15000).unref();
setInterval(pollRecentCronsForPush, 30000).unref();

app.get('/api/system/metrics', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({ ok: true, ...systemMetrics });
});

const BACKEND_URL = 'http://127.0.0.1:8787';
const jsonCache = new Map();
const clearJsonCache = (needle) => {
  for (const key of jsonCache.keys()) {
    if (key.includes(needle)) jsonCache.delete(key);
  }
};

const wslProfileConfigCandidates = (profilePath) => {
  if (!profilePath || typeof profilePath !== 'string' || !profilePath.startsWith('/')) return [];
  const winPath = profilePath.replace(/\//g, '\\');
  return [
    `\\\\wsl.localhost\\Ubuntu${winPath}\\config.yaml`,
    `\\\\wsl$\\Ubuntu${winPath}\\config.yaml`
  ];
};

const profileModelConfigCache = new Map();
const PROFILE_MODEL_CONFIG_CACHE_MS = 5 * 60 * 1000;

const readProfileModelConfig = (profilePath) => {
  const now = Date.now();
  const cached = profileModelConfigCache.get(profilePath);
  if (cached && now - cached.ts < PROFILE_MODEL_CONFIG_CACHE_MS) return cached.value;

  let value = null;
  for (const configPath of wslProfileConfigCandidates(profilePath)) {
    try {
      if (!fs.existsSync(configPath)) continue;
      const text = fs.readFileSync(configPath, 'utf8');
      const modelBlock = text.match(/^model:\s*\r?\n([\s\S]*?)(?=^[^\s#]|\Z)/m)?.[1] || '';
      const model = modelBlock.match(/^\s*default:\s*['"]?([^'"#\r\n]+)['"]?/m)?.[1]?.trim() || '';
      const provider = modelBlock.match(/^\s*provider:\s*['"]?([^'"#\r\n]+)['"]?/m)?.[1]?.trim() || '';
      if (model || provider) {
        value = { model, provider };
        break;
      }
    } catch {
      // Profile config enrichment must never break /api/profiles.
    }
  }
  profileModelConfigCache.set(profilePath, { ts: now, value });
  if (profileModelConfigCache.size > 100) profileModelConfigCache.delete(profileModelConfigCache.keys().next().value);
  return value;
};
const dedupeProfiles = (payload) => {
  if (!payload || !Array.isArray(payload.profiles)) return payload;
  const score = (row) => (row?.is_default ? 4 : 0) + (row?.has_env ? 2 : 0) + (row?.visible === false ? 0 : 1);
  const seen = new Map();
  const order = [];
  for (const row of payload.profiles) {
    const name = String(row?.name || '').trim();
    if (!name) continue;
    if (!seen.has(name)) {
      seen.set(name, row);
      order.push(name);
    } else if (score(row) > score(seen.get(name))) {
      seen.set(name, row);
    }
  }
  return {
    ...payload,
    profiles: order.map((name) => {
      const row = seen.get(name);
      if (row?.model && row?.provider) return row;
      const config = readProfileModelConfig(row?.path);
      if (!config) return row;
      return {
        ...row,
        model: row.model || config.model || null,
        provider: row.provider || config.provider || null
      };
    })
  };
};

const applySessionLimit = (payload, req) => {
  if (!payload || !Array.isArray(payload.sessions)) return payload;
  const raw = Number.parseInt(req.query?.limit ?? '50', 10);
  const limit = Number.isFinite(raw) ? Math.max(1, Math.min(200, raw)) : 50;
  return { ...payload, sessions: payload.sessions.slice(0, limit), count: Math.min(payload.count ?? payload.sessions.length, limit) };
};

const panelJsonProxy = ({ cacheSeconds = 0, transform = (payload) => payload } = {}) => async (req, res) => {
  const backendPath = req.originalUrl.startsWith('/api') ? req.originalUrl : `/api${req.originalUrl}`;
  const cacheKey = `${req.headers.cookie || 'anon'} ${backendPath}`;
  const now = Date.now();
  if (cacheSeconds > 0) {
    const cached = jsonCache.get(cacheKey);
    if (cached && now - cached.ts < cacheSeconds * 1000) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(200).send(JSON.stringify(cached.payload));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const upstream = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: 'GET',
      headers: {
        accept: req.headers.accept || 'application/json',
        cookie: req.headers.cookie || '',
      },
      signal: controller.signal,
    });
    const bodyText = await upstream.text();
    if (!upstream.ok) {
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
      return res.send(bodyText);
    }
    let payload = JSON.parse(bodyText || '{}');
    payload = transform(payload, req);
    if (cacheSeconds > 0 && req.headers.cookie) {
      jsonCache.set(cacheKey, { ts: Date.now(), payload });
      if (jsonCache.size > 20) jsonCache.delete(jsonCache.keys().next().value);
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(payload));
  } catch (err) {
    return res.status(502).json({ error: 'Hermes backend panel proxy failed', detail: err.message });
  } finally {
    clearTimeout(timer);
  }
};

app.use('/api/skills', (req, res, next) => {
  if (req.method !== 'GET') clearJsonCache('/api/skills');
  next();
});
app.get('/api/skills', panelJsonProxy({ cacheSeconds: 15 }));
app.get('/api/models', panelJsonProxy({ cacheSeconds: 60 }));
app.get('/api/profiles', panelJsonProxy({ cacheSeconds: 5, transform: dedupeProfiles }));
app.get('/api/sessions', panelJsonProxy({ cacheSeconds: 2, transform: applySessionLimit }));
app.get('/api/sessions/search', panelJsonProxy({ cacheSeconds: 2, transform: applySessionLimit }));
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    agent: new http.Agent({ keepAlive: true, maxSockets: 16, maxFreeSockets: 4, timeout: 30000, freeSocketTimeout: 4000 }),
    changeOrigin: false,
    ws: true,
    timeout: 30000,
    proxyTimeout: 30000,
    pathRewrite: (proxyPath) => proxyPath.startsWith('/api') ? proxyPath : `/api${proxyPath}`,
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.removeHeader('Origin');
        proxyReq.removeHeader('Referer');
        proxyReq.setHeader('Connection', 'keep-alive');
      },
      error: (err, req, res) => {
        if (typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
        }
        if (typeof res.end === 'function') {
          res.end(JSON.stringify({ error: 'Hermes backend proxy failed', detail: err.message }));
        } else if (typeof res.destroy === 'function') {
          res.destroy();
        }
      }
    }
  })
);


// stale hashed asset fallback + RAM cache: keeps old cached HTML from white-screening
// while serving the current hashed bundle without repeated disk scans/reads.
app.use((req, res, next) => {
  const requestPath = (req.originalUrl || req.url || '').split('?')[0];
  const isIndexAsset = requestPath.includes('/assets/index-');
  const isJs = requestPath.endsWith('.js');
  const isCss = requestPath.endsWith('.css');
  if (!isIndexAsset || (!isJs && !isCss)) return next();

  const requestedAssetPath = path.join(distDir, requestPath.replace(/^\//, ''));
  const fallback = isJs
    ? latestHashedAsset('index-', '.js')
    : latestHashedAsset('index-', '.css');
  const targetAssetPath = fs.existsSync(requestedAssetPath) ? requestedAssetPath : fallback;
  if (!targetAssetPath || !fs.existsSync(targetAssetPath)) return next();

  const stat = fs.statSync(targetAssetPath);
  const cacheKey = `${targetAssetPath}:${stat.mtimeMs}:${stat.size}`;
  let cached = assetBufferCache.get(cacheKey);
  if (!cached) {
    cached = fs.readFileSync(targetAssetPath);
    assetBufferCache.clear();
    assetBufferCache.set(cacheKey, cached);
  }

  const requestedAssetExists = fs.existsSync(requestedAssetPath);
  res.setHeader('Cache-Control', requestedAssetExists
    ? 'public, max-age=31536000, immutable'
    : 'no-store, max-age=0, must-revalidate');
  res.type(isJs ? 'application/javascript' : 'text/css');
  res.send(cached);
});
app.use(express.static(distDir, {
  etag: true,
  setHeaders: (res, filePath) => {
    const relativePath = path.relative(distDir, filePath).replaceAll('\\', '/');
    if (relativePath.startsWith('assets/') || /(?:^|\/)citadel-.+-v\d+\./.test(relativePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return;
    }
    if (relativePath.startsWith('map-agents/')) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      return;
    }
    if (relativePath === 'index.html' || relativePath === 'manifest.json' || relativePath === 'sw.js') {
      res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.sendFile(path.join(distDir, 'index.html'));
  } else {
    next();
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Production Server] Hermes OS panel running on http://0.0.0.0:${PORT}`);
});

server.on('connection', (socket) => {
  socket.setMaxListeners(64);
});













