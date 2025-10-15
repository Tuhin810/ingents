import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "d3fyty2h10se9r.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
