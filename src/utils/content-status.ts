export const CONTENT_STATUSES = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
  'planned',
  'live',
  'in progress',
  'exploratory',
  'speculative',
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_STATUS_META: Record<ContentStatus, { label: string; description: string; tone: string }> = {
  draft: {
    label: 'Draft',
    description: 'Working content that is still being shaped.',
    tone: 'border-[color:var(--ts-color-border-strong)] text-[color:var(--ts-color-text-subtle)]',
  },
  review: {
    label: 'Review',
    description: 'Content waiting for editorial or governance review.',
    tone: 'border-[color:var(--ts-color-warning)] text-[color:var(--ts-color-warning-text)]',
  },
  approved: {
    label: 'Approved',
    description: 'Accepted content that is ready to publish.',
    tone: 'border-[color:var(--ts-color-info)] text-[color:var(--ts-color-info-text)]',
  },
  published: {
    label: 'Published',
    description: 'Public content available to readers.',
    tone: 'border-[color:var(--ts-color-success)] text-[color:var(--ts-color-success-text)]',
  },
  archived: {
    label: 'Archived',
    description: 'Historical content retained for reference.',
    tone: 'border-[color:var(--ts-color-border)] text-[color:var(--ts-color-text-muted)]',
  },
  planned: {
    label: 'Planned',
    description: 'Content or work that is expected but not active yet.',
    tone: 'border-[color:var(--ts-color-info)] text-[color:var(--ts-color-info-text)]',
  },
  live: {
    label: 'Live',
    description: 'Active content or work currently visible in the product.',
    tone: 'border-[color:var(--ts-color-success)] text-[color:var(--ts-color-success-text)]',
  },
  'in progress': {
    label: 'In progress',
    description: 'Work that is actively being shaped or implemented.',
    tone: 'border-[color:var(--ts-color-warning)] text-[color:var(--ts-color-warning-text)]',
  },
  exploratory: {
    label: 'Exploratory',
    description: 'Early material used to learn and evaluate direction.',
    tone: 'border-[color:var(--ts-color-accent)] text-[color:var(--ts-color-accent-strong)]',
  },
  speculative: {
    label: 'Speculative',
    description: 'A possibility being considered before commitment.',
    tone: 'border-[color:var(--ts-color-border-strong)] text-[color:var(--ts-color-text-subtle)]',
  },
};

export const PROJECT_STAGE = {
  label: 'Public alpha',
  description: 'TreeSeed components are evolving with the product interface.',
};
