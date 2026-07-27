export const CONTACT_TYPES = ['general', 'support', 'partnership', 'security'] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  general: 'General inquiry',
  support: 'Support',
  partnership: 'Partnership',
  security: 'Security',
};

export const SUBSCRIBE_ANCHOR_ID = 'subscribe';
