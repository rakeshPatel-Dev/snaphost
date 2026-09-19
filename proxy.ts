import { NextRequest, NextResponse } from 'next/server';

function buildContentSecurityPolicy(nonce: string) {
  const developmentScriptSource = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cloud.umami.is https://cdn.vercel-insights.com https://va.vercel-scripts.com${developmentScriptSource}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://xbywqnrququdipqhqtgn.supabase.co",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://cloud.umami.is https://vitals.vercel-insights.com https://*.vercel-insights.com",
    "frame-src https://*.supabase.co",
    "media-src 'self' blob: https://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);

  // Next.js reads this request header to nonce its framework scripts and styles.
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon0.svg|icon1.png|apple-icon.png).*)',
  ],
};
