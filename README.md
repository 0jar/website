# Jarema's digital garden, version 5 (Astro)

A personal website built with [Astro](https://astro.build).

This repository is hosted on [Codeberg](https://codeberg.org/jartf/website) and mirrored on [GitHub](https://github.com/jartf/website) and [GitLab](https://gitlab.com/jartf/website).

See the site in action:

- [https://jarema.me](https://jarema.me)
- [https://z.is-a.dev](https://z.is-a.dev)
- [https://jarema.vercel.app](https://jarema.vercel.app) (backup)
- [https://jarema.netlify.app](https://jarema.netlify.app) (backup)

![Screenshot of the first fold of website's homepage in dark mode. The hero section centers a main heading, a short bio and a flex row of four action buttons. The lower section uses a two column layout. The left column displays three blog post cards with titles, excerpts, dates and read times. The right column displays a dynamic now section.](<salvestamata.png>)

## Architecture

This is an Astro website using islands architecture, static HTML by default and Preact for interactive components.

### Key points

- Static-first, most components are `.astro`
- Interactive islands are implemented with Preact (`.tsx`)
  - `client:only="preact"` is used for client-only UI (for example, games)
  - Some components (like the command bar) are manually lazy-loaded via vanilla scripts for performance
- Locale is inferred in middleware (see lines 5-8 of [src/middleware.ts](./src/middleware.ts)) and injected into `Astro.locals.lang`
- Blog HTML is post-processed in middleware to wrap standalone images into `<figure><figcaption>` using image alt text

### Deployment

The project uses the `@astrojs/netlify` adapter to prevent flashes of unstyled content during transitions.

Both Vercel and Netlify deploy from the [GitHub mirror](https://github.com/jartf/website). Additionally, a build script supports pushing static output to Neocities if you have the CLI installed.

Build output is static (`output: "static"`).

See line 7 of the [astro.config.mjs](./astro.config.mjs) for implementation :)

## Features

- Static site generation with Astro
- Tailwind CSS for styling
- Content collections for blog posts, now, projects, uses, scrapbook, and webrings (see [src/content](./src/content))
- Dark/light theme support
- Multilingual support
- Accessible (WCAG 2.1 AA)
- Responsive design
- RSS, Atom, JSON feeds per language, sitemap
- IndieWeb conventions (h-card, IndieAuth, Webmention)
- Global command bar and keyboard navigation
- Games: 2048, Tetris
- Tools: text counter

## Getting started

### Prerequisites

- Node.js 18+
- pnpm (preferred) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Commands

| Command            | Action                                         |
|--------------------|------------------------------------------------|
| `pnpm dev`         | Start dev server at `localhost:4321`           |
| `pnpm build`       | Build production output to `./dist/`           |
| `pnpm build:fast`  | Build without fetching external webmentions    |
| `pnpm build:prod`  | Build and push to Git and Neocities            |
| `pnpm preview`     | Preview production build                       |
| `pnpm check`       | Run Astro + TypeScript checks                  |

## Project structure

```text
public/
├── fonts/            # Self-hosted web fonts
├── keys/             # Public PGP and SSH keys
├── cursor/           # Custom cursor GIFs
├── robots.txt        # Ask bad robots to go away politely :D
├── site.webmanifest  # Manifest file
└── ...               # Other static assets
src/
├── content.config.ts # Content collections config
├── middleware.ts     # Injects lang into Astro.locals from URL
├── env.d.ts          # TypeScript types
├── components/       # .astro (static) and .tsx (Preact islands)
│   ├── blog/         # Blog components
│   ├── home/         # Homepage components
│   ├── game/         # Game components
│   ├── layout/       # Site layout components
│   ├── KeyboardShortcut.astro  # Keyboard shortcut helper component
│   └── T.astro       # Translation component
├── content/          # Astro content collections data
│   ├── blog/         # Blog posts, in Markdown
│   ├── now/          # Now entries, in JSON
│   ├── projects/     # Project entries, in JSON
│   ├── scrapbook/    # Scrapbook entries, in JSON
│   ├── uses/         # Uses page categories, in JSON
│   └── webrings/     # Webring membership data, in JSON
├── hooks/            # Hooks
│   ├── game/         # Game hooks
│   └── index.ts      # Other hooks
├── i18n/             # Translations and language utilities
│   ├── translations/ # JSON translation files (one per locale)
│   ├── client.js     # Client-side language utilities
│   ├── index.ts      # Server-side i18n utilities
│   └── routing.js    # Locale routing helpers
├── layouts/
│   ├── BaseLayout.astro    # Main site layout
│   └── RetroLayout.astro   # Layout for /retro/* (old style) pages
├── lib/              # Shared utilities and constants
│   ├── utils/        # General utility functions
│   ├── constants.ts  # Site metadata, author info, service config
│   ├── feed.ts       # RSS/Atom/JSON feed helpers
│   └── now-utils.ts  # Helpers for the /now page
├── pages/            # File-based routing
│   ├── [locale]/     # Locale catch-all
│   ├── blog/         # Blog pages
│   ├── api/          # API endpoints
│   ├── ...           # Other pages
│   ├── atom.xml.ts   # Atom feed
│   ├── feed.json.ts  # JSON feed
│   ├── rss.xml.ts    # RSS feed
│   ├── sitemap.xml.ts      # Sitemap
│   ├── sitemap-index.xml.ts
│   └── index.astro   # Homepage
└── styles/           # Global styling
```

## Development

### Configuration

The site is forkable without having to dig through much of the source code. Most of the personal identity details, site metadata, and configuration flags are separated from the UI components.

- **Identity and metadata**: Managed in `src/lib/constants.ts`.
- **Content**: The site takes data from `src/content/data/` for static data and `src/content/[path]` for other site content.
- **Static assets**: All images used by the site are organized in `public/`.

### Blog post frontmatter

```yaml
---
title: "Post title"           # Required
date: "2025-01-08"            # Required
updated: "2025-01-10"         # Optional
excerpt: "Brief description"  # Optional
language: "en"                # Default: "en"
mood: "optimistic"            # Default: "contemplative"
catApproved: true             # Default: true
readingTime: 5                # Optional, in minutes
tags: ["tag1", "tag2"]        # Optional array
categories: ["coding", "guides"]  # Optional array
draft: false                  # Default: false
alternates:                   # Optional, for multilingual posts
  - language: vi
    slug: vietnamese-article
---

Your content goes here.
```

**File naming:** `src/content/blog/YYYY/MM/slug.md` or `src/content/blog/slug.md`

### Theming

The site supports dark and light modes:

- Dark mode is the default
- Theme preference stored in `localStorage`
- CSS variables in `:root` / `.light` / `.dark` selectors (see [src/styles/globals.css](./src/styles/globals.css))
- Theme applied via `class` on `<html>` element
- Respects user's system preference on first visit

### Internationalization (i18n)

**12 languages** supported: English, Tiếng Việt, Русский, Eesti, Dansk, 中文, Türkçe, Polski, Svenska, Suomi, toki pona, 漢喃

- Translations in [`src/i18n/translations/*.json`](./src/i18n/translations)
- Use the [`T.astro`](./src/components/T.astro) component for static translations
- Language state inferred from URL/routing and managed via vanilla JavaScript helpers
- Language detection from browser or localStorage

#### Localization control

For single-language deployments when other languages are in the site, a localization flag is available at build time. Setting the `NEOCITIES=1` environment variable on build restricts the static site to English and turns off other locales' sub-paths.

```bash
# Build only English version
NEOCITIES=1 pnpm build
```

### Feeds and SEO

- RSS endpoint: [`src/pages/rss.xml.ts`](./src/pages/rss.xml.ts)
- Atom endpoint: [`src/pages/atom.xml.ts`](./src/pages/atom.xml.ts)
- JSON feed endpoint: [`src/pages/feed.json.ts`](./src/pages/feed.json.ts)
- Sitemap: [`src/pages/sitemap.xml.ts`](./src/pages/sitemap.xml.ts)
- XML stylesheets are provided in [`public/*.xsl`](./public)

### Component conventions

**When to use `.astro` vs `.tsx`:**

- Use `.astro` (preferred) for static content, layouts, pages
- Use `.tsx` with `client:only="preact"` for interactive features (games) or manually lazy load them via `<script>` tags

**Island hydration examples:**

```astro
<!-- Static component -->
<StaticComponent />

<!-- Client-only interactive island -->
<TetrisGame client:only="preact" />

<!-- Manually initialized Preact component in a script tag -->
<script>
  import { CommandBar } from "@/components/layout/CommandBar";
  import { render, h } from "preact";
  render(h(CommandBar, { initialOpen: true }), document.getElementById("bar-root"));
</script>
```

## External integrations

- Deployment: Netlify (default) and Vercel
- IndieAuth: indieauth.com
- Webmentions: webmention.io
- Last.fm: music listening data via API
- imood and status.cafe: mood and status widgets
- Analytics: Umami script proxied under `/stats/*`

## License

**TL;DR: You are free to use, modify and redistribute the source code and the content on this website, provided proper attribution is given back to me. Attribution should include a link to my website ([https://jarema.me](https://jarema.me)).**

This repository is dual-licensed.

All source code is licensed under the [GNU Affero General Public License v3](LICENSE).

All non-code content, such as text, posts, essays, documentation, photos, videos, and other materials, is licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](http://creativecommons.org/licenses/by/4.0/).

These licenses do not apply to third-party libraries, assets, or content included in the project. Third-party components and assets are subject to their own respective licenses.
