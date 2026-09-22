import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
  unavailable?: boolean
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

const ipBurstLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'snaphost:upload:ip:burst',
    })
  : null

const anonymousDailyLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, '24 h'),
      prefix: 'snaphost:upload:anonymous:daily',
    })
  : null

const freeAccountDailyLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, '24 h'),
      prefix: 'snaphost:upload:account:free:daily',
    })
  : null

// Premium accounts still need a ceiling to protect shared storage from abuse.
const premiumAccountDailyLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(50, '24 h'),
      prefix: 'snaphost:upload:account:premium:daily',
    })
  : null

function unavailable(): RateLimitResult {
  console.error('Upload rate limiting is unavailable: missing Upstash Redis configuration.')
  return { success: false, limit: 0, remaining: 0, reset: 0, unavailable: true }
}

export function getClientIp(headers: Headers): string {
  // The hosting proxy must overwrite these headers; this app is deployed behind Vercel/Supabase.
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return headers.get('cf-connecting-ip') ?? forwardedFor ?? headers.get('x-real-ip') ?? 'unknown'
}

export async function limitUploadIpBurst(ip: string): Promise<RateLimitResult> {
  return ipBurstLimit ? ipBurstLimit.limit(ip) : unavailable()
}

export async function limitAnonymousUploads(ip: string): Promise<RateLimitResult> {
  return anonymousDailyLimit ? anonymousDailyLimit.limit(ip) : unavailable()
}

export async function limitAccountUploads(
  userId: string,
  tier: 'free' | 'premium'
): Promise<RateLimitResult> {
  const limiter = tier === 'premium' ? premiumAccountDailyLimit : freeAccountDailyLimit
  return limiter ? limiter.limit(userId) : unavailable()
}

export type AccountUploadQuota = {
  remaining: number
  reset: number
  limit: number
}

export async function getAccountUploadQuota(
  userId: string,
  tier: 'free' | 'premium'
): Promise<AccountUploadQuota | null> {
  const limiter = tier === 'premium' ? premiumAccountDailyLimit : freeAccountDailyLimit
  return limiter ? limiter.getRemaining(userId) : null
}
