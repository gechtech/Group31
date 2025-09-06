/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: 'C:\\Users\\Mebratu Cheka\\Documents\\MY-PROJECTS\\INSA_Projects\\Group31',
}

export default nextConfig
