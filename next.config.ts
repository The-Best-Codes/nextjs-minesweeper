import type { NextConfig } from "next";
import withPWA from 'next-pwa';

// @ts-ignore
const nextConfig: NextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})({
  /* your existing config options here */
});

export default nextConfig;