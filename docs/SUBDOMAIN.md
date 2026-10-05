To add app.snaphost.dev, you need to set it up on Vercel, then add host-based routing in code (since Next.js serves one app). Here's a concrete plan.
What is it for?
Put the logged-in/product surface on app.snaphost.dev (separates it from marketing/share on snaphost.dev). Good split: snaphost.dev = marketing + public share links (/f/_, /[username]/_, /anon/*). app.snaphost.dev = product area (/upload, /profile, /anon/links, auth flows if you want them there too).
You can start with just product routes on app subdomain; keep share routes on root so existing shared URLs keep working.

1. Add domain to Vercel
   In Vercel Project → Settings → Domains:

1) Add app.snaphost.dev
2) Add snaphost.dev + www.snaphost.dev (if not already)
3) Vercel gives DNS records (CNAME/A). Add them in your DNS provider.
4) Both point to the same Next.js deployment (Vercel supports multiple custom domains per project).

2. Update auth allowlist (Supabase)
   In Supabase Dashboard → Authentication → URL Configuration:

- Add https://app.snaphost.dev to Site URL (or keep root as site; better to add as additional redirect URL)
- Add redirect URLs: https://app.snaphost.dev/**, https://app.snaphost.dev/auth/callback style if you use OAuth. Also keep existing root URLs.
- If you move auth pages (/sign-in, /sign-up, etc.) to app.snaphost.dev, update those too.

3. Make app host-aware in code
   (a) Convert middleware to handle hostname
   Right now proxy.ts only does CSP nonce. Next 16 treats proxy.ts as middleware (you saw it built). Extend it to detect host and rewrite/redirect.
   Create/replace behavior: read request.nextUrl.hostname. Example approach:
   // proxy.ts (becomes middleware)
   import { NextRequest, NextResponse } from 'next/server'

function buildCSP(nonce: string) { /* existing */ }

export function middleware(request: NextRequest) {
const host = request.headers.get('host') || request.nextUrl.host
const url = request.nextUrl.clone()

// Rewrite: app.snaphost.dev/* -> serve same routes from root
if (host.startsWith('app.')) {
// If you want to scope, you can also redirect root->app for product paths
// but easier to just serve; paths stay same
}

// existing CSP logic...
}
Key: you don't have to move files. Just rewrite host. So visiting app.snaphost.dev/upload hits the same (product)/upload route.
(b) Fix BASE_URL/SITE_URL (important)
Share links are built from CONFIG.BASE_URL/SITE_URL. Right now hardcoded to snaphost.dev. If you want shares to stay on root (recommended so old links still work), keep using root. If you want app-only, that's a bigger breaking change.
So for now: keep share routes on root domain. Product on app.. That avoids changing buildPublicFileUrl for existing shares.
Also app/layout.tsx sets metadataBase: new URL(SITE_URL). For app subdomain pages, you might want correct canonical, but easier to keep root as default unless you split layouts.
(c) Auth redirects
Supabase auth helpers typically redirect to site_url. Update where redirects are computed (look for redirectTo, getURL, etc. in auth code). Also check app/(auth)/** and any server actions that do redirect() after auth.
Search for redirect targets: rg -n "redirectTo|getURL|site_url|NEXT_PUBLIC_BASE_URL|snaphost.dev" app features lib 2>&1 | head -20. Update to respect host or use allowlisted URLs.
(d) CSP / remote patterns
CSP allows Supabase storage and scripts; cross-subdomain requests to same API routes are same-origin relative? If you call /api/* from app.snaphost.dev, it's same app (rewritten) so fine. No new origins needed unless you actually call api.snaphost.dev.
next.config.mjs images.remotePatterns only allows Supabase; fine. HSTS has includeSubDomains so both need HTTPS (Vercel gives it). 4) Local development
Can't use real subdomains locally easily. Options: edit /etc/hosts to add 127.0.0.1 app.snaphost.test snaphost.test and run next dev --hostname snaphost.test --port 3000, or just test on deployed preview. For now, implement and test on Vercel preview.
Quick recommendation
Start minimal: add app.snaphost.dev on Vercel, extend proxy.ts middleware to detect host (no heavy rewrites yet), add to Supabase allowlist, and point product links to app.snaphost.dev. Keep all share/public routes accessible from root. That’s low risk and gives you the separation you asked for.
