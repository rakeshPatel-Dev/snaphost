import { ImageResponse } from 'next/og'
import { OG_IMAGE_ALT, OG_IMAGE_SIZE, SITE_NAME } from '@/lib/seo'

export const alt = OG_IMAGE_ALT
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'

const bullets = ['Images up to 10 MB', 'PDFs up to 10 MB', 'No signup required']

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '72px 80px',
        backgroundColor: '#09090b',
        backgroundImage:
          'radial-gradient(circle at 15% 0%, rgba(16,185,129,0.22) 0%, transparent 45%), radial-gradient(circle at 90% 100%, rgba(16,185,129,0.14) 0%, transparent 40%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: '#10b981',
            color: '#052e21',
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          S
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 600,
            color: '#e4e4e7',
            letterSpacing: '-0.01em',
          }}
        >
          {SITE_NAME}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 78,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Upload a file. Get a link. Share it in seconds.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 34,
            color: '#a1a1aa',
            maxWidth: 880,
          }}
        >
          Instant file sharing for images and PDFs.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {bullets.map((bullet) => (
          <div
            key={bullet}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 26,
              color: '#d4d4d8',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: '#10b981',
              }}
            />
            {bullet}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  )
}
