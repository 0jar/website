# Developing Jarema's digital garden

See the [README](README.md) for the site overview.

## Local development

Use Node.js 22.23.4 or newer and pnpm 12. Python 3 runs the static-output tests.

```sh
pnpm install
pnpm dev
```

The development server listens at `http://localhost:4321`. The site builds to `dist/`.

| Command | Purpose |
| --- | --- |
| `pnpm check` | Run Astro and TypeScript checks. |
| `pnpm test` | Run `pnpm check` and `pnpm build:fast`, then validate local links, feeds, the sitemap, and embedded JSON. |
| `pnpm build` | Build the site with Webmentions from webmention.io. |
| `pnpm build:fast` | Build the site without fetching Webmentions. |
| `pnpm astro preview` | Serve the production build locally. |

## Architecture

This is an Astro website using islands architecture, static HTML by default and Preact for interactive components.

- Use `.astro` for static content, layouts, and pages. Tailwind CSS handles styling.
- The games use Preact components (`.tsx`) with `client:only="preact"`. The [command palette listener](src/components/layout/BarListener.astro) loads the palette when someone opens it.
- The [middleware](src/middleware.js) reads the locale from the URL and sets `Astro.locals.lang`.
- The [blog post page](src/pages/blog/%5B...slug%5D.astro) uses a browser script to turn standalone images into figures with captions based on their alt text.

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
├── components/       # .astro (static) and .tsx (Preact islands)
├── content/          # Markdown posts and JSON data
├── content.config.ts # Content collection schemas
├── hooks/game/       # Game hooks
├── i18n/             # Translations and language utilities
├── layouts/          # Main and retro site layouts
├── lib/              # Shared utilities and constants
├── middleware.js     # Locale detection
├── pages/            # Pages, localised routes, feeds, and sitemap
└── styles/           # Global styling
tests/                # Static-output checks
```

## Development

### Configuration

The site is forkable without having to dig through much of the source code. Most of the personal identity details, site metadata, and configuration flags are separated from the UI components.

- Edit site identity, navigation, and public service credentials in the [site constants](src/lib/constants/index.ts). Set your fork’s canonical URL there and in the [Astro configuration](astro.config.mjs).
- Add posts under [the blog collection](src/content/blog). The [content schemas](src/content.config.ts) define the fields for posts and the other collections.
- Put shared static assets in [public](public). Posts can also keep local images alongside their Markdown files.

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
  - language: et
    slug: estonian-article
  - language: vi
    slug: vietnamese-article
---

Your content goes here.
```

Use `src/content/blog/YYYY/MM/slug.md` or `src/content/blog/slug.md`.

### Theming

Dark mode is the default, the site stores the theme preference in local storage. Theme variables live in [the global stylesheet](src/styles/globals.css).

### Internationalisation (i18n)

- Add translations to the [locale dictionaries](src/i18n/translations). Use [`T.astro`](src/components/ui/T.astro) for static translations.
- English routes stay at the root, other languages use prefixes defined by the [routing helpers](src/i18n/routing.js).
- Client-side language helpers are in [`client.js`](src/i18n/client.js).

### Feeds and SEO

- Feed routes include [RSS](src/pages/rss.xml.js), [Atom](src/pages/atom.xml.js) and [JSON Feed](src/pages/feed.json.js).
- The [sitemap route](src/pages/sitemap.xml.js) lists generated pages.

## Deployment

Netlify and Vercel deploy from the [GitHub mirror](https://github.com/0jar/website) using [netlify.toml](netlify.toml) and [vercel.json](vercel.json). Astro generates static output and enables the Netlify adapter when NETLIFY variable is set. The guestbook uses Netlify Forms.

Run `NEOCITIES=1 pnpm build:fast` to build the English interface without localised route prefixes. Posts retain their original languages. `pnpm build:neo` uses the Neocities CLI to publish the build and prune obsolete remote files.

## External integrations

- IndieAuth uses indieauth.com.
- Build-time Webmentions come from webmention.io.
- The homepage loads listening data from Last.fm and status updates from status.cafe. imood provides the mood indicator.
- Netlify and Vercel proxy the Umami analytics script under `/stats/*`.
