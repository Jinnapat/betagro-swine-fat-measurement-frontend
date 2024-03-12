/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        protocol: "http",
        port: "50505",
      },
    ],
  },
};

module.exports = nextConfig;
