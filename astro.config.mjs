import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://jarema.me',
  output: 'static',
  prefetch: true,
  ...(process.env.NETLIFY ? { adapter: netlify() } : {}),

  redirects: {
    '/blog/default-apps-2024': '/blog/2024/07/app-defaults-2024/',
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    preact({ compat: true }),
  ],

  image: {
    remotePatterns: [{ hostname: 'moods.imood.com' }, { hostname: 'ytimg.com' }, { hostname: 'rcd.gg' }],
  },
});
