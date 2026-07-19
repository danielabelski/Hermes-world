import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..', 'dist-judge')
const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 4190
const MAX_SSE_CLIENTS = 100

const CONTENT_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
])

function setSecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
  ].join('; '))
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(body))
  res.end(body)
}

function resolveStaticPath(rootDir, pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return null
  }
  if (decoded.includes('\0')) return null
  const relative = decoded.replace(/^\/+/, '')
  const resolved = path.resolve(rootDir, relative || 'index.html')
  const boundary = `${path.resolve(rootDir)}${path.sep}`
  if (resolved !== path.resolve(rootDir) && !resolved.startsWith(boundary)) return null
  return resolved
}

function serveFile(req, res, filePath) {
  const stat = statSync(filePath)
  const extension = path.extname(filePath).toLowerCase()
  res.statusCode = 200
  res.setHeader('Content-Type', CONTENT_TYPES.get(extension) || 'application/octet-stream')
  res.setHeader('Content-Length', stat.size)
  if (path.basename(filePath) === 'index.html' || path.basename(filePath) === 'sw.js') {
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
  } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400')
  }
  if (req.method === 'HEAD') return res.end()
  return createReadStream(filePath).pipe(res)
}

export function createJudgeSandboxServer({ rootDir = DEFAULT_ROOT } = {}) {
  const absoluteRoot = path.resolve(rootDir)
  let sseClients = 0

  return createServer((req, res) => {
    setSecurityHeaders(res)
    const method = String(req.method || 'GET').toUpperCase()
    const url = new URL(req.url || '/', 'http://judge-sandbox.local')

    if (url.pathname === '/healthz') {
      if (method !== 'GET' && method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'Method not allowed' })
      return sendJson(res, 200, { ok: true, mode: 'judge-sandbox', data: 'fixture-only', writable: false })
    }

    if (url.pathname === '/api/world/events/snapshot') {
      if (method !== 'GET' && method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'Read-only judge sandbox' })
      return sendJson(res, 200, { ok: true, events: [], cursor: null, source: 'judge-sandbox' })
    }

    if (url.pathname === '/api/world/events/stream') {
      if (method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Read-only judge sandbox' })
      if (sseClients >= MAX_SSE_CLIENTS) return sendJson(res, 503, { ok: false, error: 'Too many sandbox viewers' })
      sseClients += 1
      res.statusCode = 200
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.flushHeaders?.()
      res.write('retry: 5000\n')
      res.write('event: snapshot\n')
      res.write('data: {"events":[],"cursor":null,"source":"judge-sandbox"}\n\n')
      const heartbeat = setInterval(() => {
        res.write('event: heartbeat\n')
        res.write(`data: {"at":"${new Date().toISOString()}","source":"judge-sandbox"}\n\n`)
      }, 15_000)
      req.on('close', () => {
        clearInterval(heartbeat)
        sseClients = Math.max(0, sseClients - 1)
      })
      return
    }

    if (url.pathname.startsWith('/api/')) {
      return sendJson(res, method === 'GET' || method === 'HEAD' ? 404 : 405, {
        ok: false,
        error: method === 'GET' || method === 'HEAD'
          ? 'Private Hermes APIs are not available in the judge sandbox'
          : 'Read-only judge sandbox',
      })
    }

    if (method !== 'GET' && method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'Read-only judge sandbox' })
    const filePath = resolveStaticPath(absoluteRoot, url.pathname)
    if (filePath && existsSync(filePath) && statSync(filePath).isFile()) return serveFile(req, res, filePath)

    const acceptsHtml = String(req.headers.accept || '').includes('text/html')
    const indexPath = path.join(absoluteRoot, 'index.html')
    if (acceptsHtml && existsSync(indexPath)) return serveFile(req, res, indexPath)
    return sendJson(res, 404, { ok: false, error: 'Not found' })
  })
}

export function startJudgeSandbox({
  rootDir = process.env.HERMES_JUDGE_ROOT || DEFAULT_ROOT,
  host = process.env.HERMES_JUDGE_HOST || DEFAULT_HOST,
  port = Number(process.env.HERMES_JUDGE_PORT || DEFAULT_PORT),
} = {}) {
  if (!existsSync(path.join(rootDir, 'index.html'))) {
    throw new Error(`Judge bundle not found at ${rootDir}. Run npm run build:judge first.`)
  }
  const server = createJudgeSandboxServer({ rootDir })
  server.listen(port, host, () => {
    console.log(`[Judge Sandbox] fixture-only, read-only server listening on http://${host}:${port}`)
  })
  return server
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null
if (invokedPath === import.meta.url) startJudgeSandbox()
