import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Fix for Node.js module resolution issues
  webpack: (config, { isServer }) => {
    // Fix for Node.js modules not available in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        dgram: false,
        http2: false,
        perf_hooks: false,
        async_hooks: false,
        dns: false,
        worker_threads: false,
        util: false,
        stream: false,
        crypto: false,
        http: false,
        https: false,
      };
    }

    config.plugins.push(
      // @ts-ignore
      {
        apply(compiler: any) {
          compiler.hooks.compilation.tap('ProvidePlugin', (compilation: any) => {
            const { ProvidePlugin } = require('webpack');
            new ProvidePlugin({
              process: 'process/browser',
              Buffer: ['buffer', 'Buffer'],
            }).apply(compiler);
          });
        }
      }
    );
    
    return config;
  },
  // Experimental features to help with module resolution
  serverExternalPackages: [],
  transpilePackages: ['genkit', '@genkit-ai/googleai', '@genkit-ai/core'],
  // Enable Turbopack for faster development builds
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;