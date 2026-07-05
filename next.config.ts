import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server's JS/HMR load when the app is opened from another
  // device on the LAN (e.g. testing on a phone) instead of localhost.
  allowedDevOrigins: [
    "192.168.10.50",
    "172.21.48.1",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
};

export default nextConfig;
