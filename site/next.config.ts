import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/swarm-command",
  images: { unoptimized: true },
};

export default nextConfig;
