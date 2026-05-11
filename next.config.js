/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable gzip/brotli HTTP response compression
  compress: true,
  // Remove the X-Powered-By: Next.js header (minor perf + security)
  poweredByHeader: false,
  allowedDevOrigins: ['*', 'localhost', '192.168.0.*', '10.147.*.*', '192.168.1.*'],
  experimental: {
    // Tree-shake large libraries — only bundle symbols that are actually imported
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ];
  }
};

module.exports = nextConfig;




