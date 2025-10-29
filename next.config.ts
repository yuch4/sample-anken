import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    USE_MOCK_DATA: process.env.USE_MOCK_DATA || 'false',
  },
};

export default nextConfig;
