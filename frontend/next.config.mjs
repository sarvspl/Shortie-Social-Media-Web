// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   devIndicators: {
//     buildActivity: false,
//   },
//   images: {
//     domains: [""], // Add the hostname here
//   },
//   future: {
//     webpack5: true,
//   },
//   webpack(config) {
//     config.optimization.minimize = false; // Temporarily disable CSS minification
//     return config;
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",

  devIndicators: {
    buildActivity: false,
  },

  images: {
    domains: [
      // example:
      // 'example.com',
      // 'cdn.yoursite.com'
    ],
  },

  turbopack: {},
  webpack(config) {
    config.optimization.minimize = false;

    // ❗ Memory + disk save
    config.cache = false;

    // ❗ Browser bundle clean
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
