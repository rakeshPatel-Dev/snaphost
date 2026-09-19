export const DOMAIN = 'snaphost.dev';
export const SITE_URL = `https://${DOMAIN}`;
export const FOUNDER_SITE = 'https://rakeshpatel.me';

const inbox = (name: string) => `${name}@${DOMAIN}`;

export const EMAILS = {
  general: inbox('hello'),
  billing: inbox('billing'),
  support: inbox('support'),
  security: inbox('security'),
  founder: inbox('rakesh'),
} as const;

export type EmailKey = keyof typeof EMAILS;

export const mailto = (to: EmailKey, subject?: string) =>
  `mailto:${EMAILS[to]}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;