import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@happyview/design-system"],
  // The blog lives on the v3 site, so there's one blog.
  async redirects() {
    return [
      { source: "/blog", destination: "https://happyview.dev/blog/", permanent: true },
      { source: "/blog/:path*", destination: "https://happyview.dev/blog/:path*", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "cdn.bsky.app" },
    ],
  },
};

const withMDX = createMDX();

export default withMDX(config);
