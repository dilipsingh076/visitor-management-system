import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid double useEffect in dev (dashboard stats called twice in Network tab)
  reactStrictMode: false,
};

export default nextConfig;
