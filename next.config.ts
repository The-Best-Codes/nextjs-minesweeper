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
    typescript: {
      ignoreBuildErrors: true,
    },
  };

export default nextConfig;
