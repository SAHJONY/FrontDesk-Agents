/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'picsum.photos'],
    unoptimized: true
  },
  transpilePackages: ['three']
}

module.exports = nextConfig