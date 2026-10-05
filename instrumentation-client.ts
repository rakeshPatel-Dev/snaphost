import posthog from 'posthog-js'
import * as Sentry from '@sentry/nextjs'

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (!posthogToken) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
    )
  }
} else if (!posthogHost) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured'
    )
  }
} else {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: '2026-01-30',
    capture_pageview: false,
    capture_pageleave: true,
  })
}

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
