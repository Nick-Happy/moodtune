/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出用于 Docker 部署
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.music.126.net',
      },
      {
        protocol: 'https',
        hostname: '**.qq.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'http',
        hostname: 'p1.music.126.net',
      },
      {
        protocol: 'http',
        hostname: 'p2.music.126.net',
      },
    ],
  },
}

module.exports = nextConfig
