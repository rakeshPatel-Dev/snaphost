import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '___PUBLIC_DSN___',

  debug: process.env.SENTRY_DEBUG === 'true',

  dataCollection: {
    // userInfo: false,
    // httpBodies: [],
  },

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart