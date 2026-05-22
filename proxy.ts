// import { clerkMiddleware } from '@clerk/nextjs/server'

// Temporarily disabled for development to test theme toggler
// Re-enable when Clerk is properly configured for localhost
export default function middleware() {
  return undefined
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
