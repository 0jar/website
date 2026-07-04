import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import netlify from '@astrojs/netlify';
import copy from './src/lib/plugins/copy.js';
import captions from './src/lib/plugins/captions.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://jarema.me',
  output: 'static',
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

  markdown: {
    rehypePlugins: [copy, captions],
  },

  // Image optimization
  image: {
    domains: ['moods.imood.com', 'ytimg.com', 'rcd.gg'],
  },

  // Build output optimization
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
