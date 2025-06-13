/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We are using Biome
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
