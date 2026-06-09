import type { APIRoute } from 'astro';

export const prerender = false;

type MetricPoint = {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const readMetric = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const driftMetric = (
  previous: number | undefined,
  fallback: number,
  variance: number,
  min: number,
  max: number
) => {
  const base = previous ?? fallback;
  const drift = (Math.random() - 0.5) * variance;
  return Number(clamp(base + drift, min, max).toFixed(1));
};

const parsePreviousPoint = async (request: Request): Promise<MetricPoint | undefined> => {
  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return undefined;
  }

  try {
    const payload = await request.json() as { previous?: Partial<MetricPoint> };
    const previous = payload.previous;

    if (!previous) {
      return undefined;
    }

    return {
      timestamp: readMetric(previous.timestamp) ?? Date.now(),
      cpu: readMetric(previous.cpu) ?? 42,
      memory: readMetric(previous.memory) ?? 63,
      latency: readMetric(previous.latency) ?? 92,
    };
  } catch {
    return undefined;
  }
};

const createSnapshot = (previous?: MetricPoint): MetricPoint => ({
  timestamp: Date.now(),
  cpu: driftMetric(previous?.cpu, 42, 15, 0, 100),
  memory: driftMetric(previous?.memory, 63, 9, 0, 100),
  latency: driftMetric(previous?.latency, 92, 48, 20, 300),
});

export const GET: APIRoute = async () => Response.json(createSnapshot());

export const POST: APIRoute = async ({ request }) => {
  const previous = await parsePreviousPoint(request);

  return Response.json(createSnapshot(previous));
};
