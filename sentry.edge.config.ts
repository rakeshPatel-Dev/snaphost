import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? '___DSN___',

  debug: process.env.SENTRY_DEBUG === 'true',

  dataCollection: {
    // userInfo: false,
    // httpBodies: [],
  },
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
})