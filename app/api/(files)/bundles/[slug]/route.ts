import { NextResponse } from 'next/server'
import { getPublicBundle } from '@/lib/server/bundle-admin'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const username = new URL(request.url).searchParams.get('username') ?? undefined
  const bundle = await getPublicBundle(slug, username)
  if (!bundle) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
  return NextResponse.json(bundle, { headers: { 'Cache-Control': 'no-store' } })
}
