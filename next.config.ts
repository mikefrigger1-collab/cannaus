/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force trailing slashes on all URLs
  trailingSlash: true,
  
  // Optional: Configure redirects for SEO consistency
async redirects() {
    return [
      // Redirect for Aussie Weed Prices article - from original WordPress URL
      {
        source: '/misc/aussie-weed-prices',
        destination: '/national/aussie-weed-prices',
        permanent: true, // 301 redirect
      },
      {
        source: '/misc/aussie-weed-prices/',
        destination: '/national/aussie-weed-prices/',
        permanent: true, // 301 redirect
      },
      // Redirect for Aussie Weed Prices article - from current act URL
      {
        source: '/act/aussie-weed-prices',
        destination: '/national/aussie-weed-prices',
        permanent: true, // 301 redirect
      },
      {
        source: '/act/aussie-weed-prices/',
        destination: '/national/aussie-weed-prices/',
        permanent: true, // 301 redirect
      },
      // You can add more redirects here as needed
      // {
      //   source: '/old-category/:slug',
      //   destination: '/new-category/:slug',
      //   permanent: true,
      // },
    ]
  },

  // Other existing config options can go here
  experimental: {
    // Add any experimental features you're using
  },
  
  images: {
    // Your existing image configuration
    domains: ['localhost'], // Add your domains here
  }
}

module.exports = nextConfig