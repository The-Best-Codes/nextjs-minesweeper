import type { NextConfig } from "next";
// import withPWA from "next-pwa";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const nextConfig: NextConfig =
  // withPWA({
  //   dest: "public",
  //   disable: process.env.NODE_ENV === "development",
  // })
  {
    experimental: {
      reactCompiler: true,
      turbo: {},
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  };

export default nextConfig;
