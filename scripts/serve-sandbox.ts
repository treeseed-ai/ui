import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const valueAfter = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = valueAfter('--host', '127.0.0.1');
const port = Number(valueAfter('--port', process.env.PORT ?? '4322'));
const root = resolve(process.cwd(), 'sandbox/dist');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
};

const json = (res, payload, statusCode = 200) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolveBody) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const metric = (value, fallback) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const drift = (value, fallback, variance, min, max) =>
  Number(clamp(metric(value, fallback) + (Math.random() - 0.5) * variance, min, max).toFixed(1));

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

async function readJson(req) {
  try {
    return JSON.parse(await readBody(req) || '{}');
  } catch {
    return {};
  }
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/monitoring/snapshot') {
    const body = req.method === 'POST' ? await readJson(req) : {};
    const previous = body.previous ?? {};
    return json(res, {
      timestamp: Date.now(),
      cpu: drift(previous.cpu, 42, 15, 0, 100),
      memory: drift(previous.memory, 63, 9, 0, 100),
      latency: drift(previous.latency, 92, 48, 20, 300),
    });
  }
  if (pathname === '/api/project-activity/events') {
    const types = ['questions', 'objectives', 'notes', 'proposals', 'decisions'];
    const now = Date.now();
    return json(res, {
      generatedAt: now,
      events: Array.from({ length: 1 + Math.floor(Math.random() * 5) }, (_, index) => ({
        id: `${now}-${index}-${Math.random().toString(16).slice(2)}`,
        timestamp: now,
        type: types[Math.floor(Math.random() * types.length)],
        action: Math.random() > 0.28 ? 'created' : 'deleted',
      })),
    });
  }
  if (pathname === '/api/markdown/preview') {
    const body = await readJson(req);
    const html = String(body.markdown ?? '')
      .split(/\n{2,}/u)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line).replace(/\*\*([^*]+)\*\*/gu, '<strong>$1</strong>')}</p>`)
      .join('\n');
    return json(res, { ok: true, payload: { html } });
  }
  return false;
}

function assetPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const direct = join(root, decoded);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const index = join(root, decoded, 'index.html');
  if (existsSync(index)) return index;
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${host}:${port}`);
  if (url.pathname.startsWith('/api/')) {
    const handled = await handleApi(req, res, url.pathname);
    if (handled !== false) return;
  }
  const filePath = assetPath(url.pathname);
  if (!filePath) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const type = contentTypes[extname(filePath)] ?? 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  res.end(readFileSync(filePath));
}).listen(port, host, () => {
  console.log(`TreeSeed UI sandbox listening on http://${host}:${port}`);
});
