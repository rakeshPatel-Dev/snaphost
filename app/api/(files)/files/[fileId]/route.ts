import { NextRequest, NextResponse } from 'next/server'
import { getFileMetadata } from '@/lib/server/database'
import { getBundleForHistoricalSlug, getPublicBundle } from '@/lib/server/bundle-admin'
import { buildPublicBundleUrl } from '@/lib/public-file-url'
import { CONFIG } from '@/lib/config'

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    if (!fileId || !SLUG_PATTERN.test(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }

    const username = request.nextUrl.searchParams.get('username')
    const bundle = await getPublicBundle(fileId, username ?? undefined)
    if (bundle)
      return NextResponse.json(bundle, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    const historical = await getBundleForHistoricalSlug(fileId)
    if (historical && (!username || historical.username === username)) {
      return NextResponse.json({
        redirectUrl: buildPublicBundleUrl(
          CONFIG.BASE_URL,
          historical.username ?? null,
          historical.slug
        ),
      })
    }
    const metadata = await getFileMetadata(fileId, username)

    if (!metadata) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json(metadata, { status: 200 })
  } catch (error) {
    console.error('File metadata route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
