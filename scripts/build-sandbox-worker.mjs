import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outputDir = resolve(process.cwd(), 'sandbox/dist');

const workerSource = String.raw`
const json = (payload, init = {}) =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers ?? {}),
    },
  });

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const metric = (value, fallback) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const drift = (value, fallback, variance, min, max) =>
  Number(clamp(metric(value, fallback) + (Math.random() - 0.5) * variance, min, max).toFixed(1));

const activityTypes = ['questions', 'objectives', 'notes', 'proposals', 'decisions'];
const activityEvents = () => {
  const now = Date.now();
  return Array.from({ length: 1 + Math.floor(Math.random() * 5) }, (_, index) => ({
    id: String(now) + '-' + String(index) + '-' + Math.random().toString(16).slice(2),
    timestamp: now,
    type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
    action: Math.random() > 0.28 ? 'created' : 'deleted',
  }));
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const markdownPreview = (markdown) => {
  const lines = String(markdown ?? '').split(/\n{2,}/u).map((line) => line.trim()).filter(Boolean);
  return lines.length > 0
    ? lines.map((line) => '<p>' + escapeHtml(line).replace(/\*\*([^*]+)\*\*/gu, '<strong>$1</strong>') + '</p>').join('\n')
    : '';
};

async function allocationPayload(request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    return String(formData.get('capacity_allocation') ?? '[]');
  }
  if (contentType.includes('application/json')) {
    const payload = await request.json().catch(() => ({}));
    return typeof payload.capacity_allocation === 'string'
      ? payload.capacity_allocation
      : JSON.stringify(payload.capacity_allocation ?? payload.allocation ?? []);
  }
  const body = await request.text();
  return new URLSearchParams(body).get('capacity_allocation') ?? body;
}

function allocationValidity(allocation) {
  const total = Array.isArray(allocation)
    ? allocation.reduce((sum, entry) => sum + (Number(entry?.percentage) || 0), 0)
    : 0;
  return { valid: Math.abs(total - 100) <= 1, total };
}

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);

    if (url.pathname === '/api/monitoring/snapshot') {
      const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
      const previous = body.previous ?? {};
      return json({
        timestamp: Date.now(),
        cpu: drift(previous.cpu, 42, 15, 0, 100),
        memory: drift(previous.memory, 63, 9, 0, 100),
        latency: drift(previous.latency, 92, 48, 20, 300),
      });
    }

    if (url.pathname === '/api/project-activity/events') {
      return json({ generatedAt: Date.now(), events: activityEvents() });
    }

    if (url.pathname === '/api/markdown/preview') {
      const body = await request.json().catch(() => ({}));
      return json({ ok: true, payload: { html: markdownPreview(body.markdown) } });
    }

    if (url.pathname === '/api/submit-allocation') {
      const raw = await allocationPayload(request);
      const allocation = JSON.parse(raw || '[]');
      const validity = allocationValidity(allocation);
      return json({ valid: validity.valid, total: validity.total, allocation });
    }

    return env.ASSETS.fetch(request);
  },
};
`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, '_worker.js'), `${workerSource.trim()}\n`);
