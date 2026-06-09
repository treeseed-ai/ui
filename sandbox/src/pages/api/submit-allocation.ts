import type { APIRoute } from 'astro';
import { validateAllocations, type PieAllocationSlice } from '../../../../src/lib/pie-allocation/math.ts';

export const prerender = false;

const readAllocationValue = async (request: Request) => {
  const contentType = request.headers.get('content-type') ?? '';

  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await request.formData();
    const raw = formData.get('capacity_allocation');
    return typeof raw === 'string' ? raw : '[]';
  }

  if (contentType.includes('application/json')) {
    const payload = await request.json() as {
      capacity_allocation?: unknown;
      allocation?: unknown;
    };
    const raw = payload.capacity_allocation ?? payload.allocation;
    return typeof raw === 'string' ? raw : JSON.stringify(raw ?? []);
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  return params.get('capacity_allocation') ?? body;
};

export const POST: APIRoute = async ({ request }) => {
  const raw = await readAllocationValue(request);
  const allocation = JSON.parse(raw) as PieAllocationSlice[];
  const validity = validateAllocations(allocation, 1);
  return Response.json({
    valid: validity.valid,
    total: validity.total,
    allocation,
  });
};
