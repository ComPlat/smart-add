/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
        jsdom: false,
      }

      // Force paper.js to use the browser version instead of node version
      config.resolve.alias = {
        ...config.resolve.alias,
        'paper/dist/paper-full': 'paper/dist/paper-core',
      }
    }

    // Ignore these modules entirely
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /node_modules\/paper\/dist\/node/,
      use: 'null-loader'
    })

    return config
  },
}

module.exports = nextConfig