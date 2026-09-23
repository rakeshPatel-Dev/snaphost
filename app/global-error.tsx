'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          backgroundColor: '#ffffff',
          color: '#09090b',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div style={{ maxWidth: '28rem', padding: '2rem', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred while loading this page. Please try again in a moment.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '9999px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#050505',
                color: '#fafafa',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
