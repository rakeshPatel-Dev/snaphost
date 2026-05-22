/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // defining images domains for next/image optimization using remotePatterns for the xbywqnrququdipqhqtgn.supabase.co domain

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xbywqnrququdipqhqtgn.supabase.co',
      },
    ],
  },
  
};

module.exports = nextConfig;
