import type { APIRoute } from 'astro';

export const prerender = false;

type ActivityType = 'questions' | 'objectives' | 'notes' | 'proposals' | 'decisions';

type ProjectActivityEvent = {
  id: string;
  timestamp: number;
  type: ActivityType;
  action: 'created' | 'deleted';
};

const activityTypes: ActivityType[] = [
  'questions',
  'objectives',
  'notes',
  'proposals',
  'decisions',
];

const randomFrom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const createEvents = (): ProjectActivityEvent[] => {
  const now = Date.now();
  const count = 1 + Math.floor(Math.random() * 5);

  return Array.from({ length: count }, (_, index) => ({
    id: `${now}-${index}-${Math.random().toString(16).slice(2)}`,
    timestamp: now,
    type: randomFrom(activityTypes),
    action: Math.random() > 0.28 ? 'created' : 'deleted',
  }));
};

export const GET: APIRoute = async () => Response.json({
  generatedAt: Date.now(),
  events: createEvents(),
});
