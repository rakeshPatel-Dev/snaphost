import { NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/lib/server/auth-user'
import { getAuthUserFromRequest } from '@/lib/server/auth-server'
import {
  countBundlesForUser,
  createBundleForUser,
  listBundlesForUser,
} from '@/lib/server/bundle-admin'
import { CONFIG } from '@/lib/config'
import { limitBundleCreations } from '@/lib/server/upload-rate-limit'

async function getUser(request: Request) {
  const authUser = await getAuthUserFromRequest(request)
  if (!authUser) return null
  return getCurrentAppUser({
    authUserId: authUser.id,
    email: authUser.email,
    usernameHint: authUser.usernameHint,
  })
}

export async function GET(request: Request) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ bundles: await listBundlesForUser(user.id) })
}

export async function POST(request: Request) {
  const user = await getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const creationLimit = await limitBundleCreations(user.id)
  if (!creationLimit.success) {
    if (creationLimit.unavailable) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Too many bundle creations. Try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((creationLimit.reset - Date.now()) / 1000))),
          'X-RateLimit-Remaining': String(creationLimit.remaining),
          'X-RateLimit-Reset': String(creationLimit.reset),
        },
      }
    )
  }

  const maxBundles = user.tier === 'premium' ? CONFIG.MAX_BUNDLES_PREMIUM : CONFIG.MAX_BUNDLES_FREE
  if ((await countBundlesForUser(user.id)) >= maxBundles) {
    return NextResponse.json({ error: 'Bundle limit reached' }, { status: 403 })
  }

  let name: string | undefined
  try {
    const body = (await request.json()) as { name?: unknown }
    if (
      body.name !== undefined &&
      (typeof body.name !== 'string' || body.name.trim().length > 120)
    ) {
      return NextResponse.json({ error: 'Invalid bundle name' }, { status: 400 })
    }
    name = body.name
  } catch {
    name = undefined
  }

  return NextResponse.json(
    { success: true, bundle: await createBundleForUser(user.id, name) },
    { status: 201 }
  )
}
