import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "hoirqrkdgbmvpwutwuwj.supabase.co" },
      { protocol: "https", hostname: "dzgprvaijyrwprpaytht.supabase.co" },
      { protocol: "https", hostname: "rfqssdpejawljioljrvw.supabase.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
