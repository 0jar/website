import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';

const adapter = process.env.LOCAL_PREVIEW ? node({ mode: 'standalone' }) : process.env.NETLIFY ? netlify() : vercel();

// https://astro.build/config
export default defineConfig({
  site: 'https://jarema.me',
  trailingSlash: 'ignore',
  output: 'static',
  adapter,

  redirects: {
    '/blog/default-apps-2024': '/blog/2024/07/app-defaults-2024/',
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    preact({ compat: true }),
  ],

  // Image optimization
  image: {
    domains: ['moods.imood.com', 'ytimg.com', 'rcd.gg'],
  },

  vite: {
    server: {
      proxy: {
        '/api/status.json': {
          target: 'https://status.cafe',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/status\.json/, '/users/jarema/status.json')
        }
      }
    },
    ssr: {
      noExternal: ['lucide-preact'],
    },
  },

  // Build output optimization
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
