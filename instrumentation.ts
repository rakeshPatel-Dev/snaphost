import * as Sentry from '@sentry/nextjs'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

export const posthogLogsConfigured = Boolean(posthogProjectToken && posthogHost)

export const posthogLoggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ 'service.name': 'snaphost' }),
  processors: posthogLogsConfigured
    ? [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: `${posthogHost!.replace(/\/$/, '')}/i/v1/logs`,
            headers: {
              Authorization: `Bearer ${posthogProjectToken!}`,
              'Content-Type': 'application/json',
            },
          }),
        }),
      ]
    : [],
})

export const posthogLogger = posthogLoggerProvider.getLogger('snaphost.posthog')

function assertPostHogLogsConfiguration() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  if (!posthogProjectToken) {
    throw new Error(
      'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
    )
  }

  if (!posthogHost) {
    throw new Error(
      'NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured'
    )
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    assertPostHogLogsConfiguration()
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Automatically captures all unhandled server-side request errors
// Requires @sentry/nextjs >= 8.28.0
export const onRequestError = Sentry.captureRequestError
