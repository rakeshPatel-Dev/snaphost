import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { cleanUpExpiredUploads } from '@/lib/server/expired-upload-cleanup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function getReceiver() {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

  if (!currentSigningKey || !nextSigningKey) {
    throw new Error('QStash signing keys are not configured')
  }

  return new Receiver({ currentSigningKey, nextSigningKey })
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('upstash-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.text()
    await getReceiver().verify({
      signature,
      body,
      url: request.url,
      upstashRegion: request.headers.get('upstash-region') ?? undefined,
    })
  } catch (error) {
    console.error('Rejected invalid QStash cleanup request', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await cleanUpExpiredUploads()

    if (result.failures > 0) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Expired upload cleanup failed', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
