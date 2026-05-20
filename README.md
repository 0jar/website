# Jarema's digital garden, version 6 (Hugo)

A personal website built with [Hugo](https://gohugo.io).

This repository is hosted on [Codeberg](https://codeberg.org/jartf/website) and mirrored on [GitHub](https://github.com/jartf/website) and [GitLab](https://gitlab.com/jartf/website).

See the site in action:

- [https://jarema.me](https://jarema.me)
- [https://z.is-a.dev](https://z.is-a.dev)
- [https://jarema.vercel.app](https://jarema.vercel.app) (backup)
- [https://jarema.netlify.app](https://jarema.netlify.app) (backup)

![Screenshot of the first fold of website's homepage in dark mode.](<salvestamata.png>)

## Architecture

This is a Hugo website relying strictly on static HTML and Hugo's native templates. Tailwind is used for styling.

## Features

- Static site generation with Hugo
- Tailwind CSS for styling
- JSON data directories for now, projects, scrapbook, uses, and webrings (see [`data/`](./data/))
- Dark/light theme support
- Multilingual support
- Accessible (WCAG 2.1 AA)
- Responsive design
- RSS, Atom, JSON feeds per language, sitemap
- IndieWeb conventions (h-card, IndieAuth, Webmention)
- Tools: text counter

## Getting started

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/)

### Commands

| Command        | Action                                                  |
|----------------|---------------------------------------------------------|
| `hugo server`  | Start dev server                                        |
| `hugo`         | Build production output to `public/` directory          |

## Project structure

```text
.
├── archetypes/        # Content templates
├── assets/            # CSS and assets processed by Hugo Pipes
├── content/           # Markdown content files (blog, pages, etc.)
│   ├── about/
│   ├── badges/
│   ├── blog/
│   ├── colophon/
│   ├── contact/
│   ├── guestbook/
│   ├── now/
│   ├── projects/
│   ├── scrapbook/
│   ├── slashes/
│   ├── tools/
│   ├── uses/
│   └── webrings/
├── data/              # JSON data files used across the site
│   ├── about/
│   ├── now/
│   ├── projects/
│   ├── scrapbook/
│   ├── uses/
│   └── webrings/
├── i18n/              # Translation files for 12 languages
├── layouts/           # HTML templates and partials
├── static/            # Static assets (fonts, icons, raw files)
├── themes/            # Configured Hugo themes
├── hugo.toml          # Main Hugo configuration file
└── tailwind.config.js # Tailwind CSS configuration
```

## Development

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

**File naming:** `content/blog/YYYY/MM/slug.md` or `content/blog/slug.md`

### Theming

The site supports dark and light modes:

- Dark mode is the default
- Theme preference stored in `localStorage`
- CSS variables in `:root` / `.light` / `.dark` selectors (see [src/styles/globals.css](./src/styles/globals.css))
- Theme applied via `class` on `<html>` element
- Managed using Tailwind's dark mode classes `dark:`, configured in `tailwind.config.js`

### Internationalization (i18n)

**12 languages** supported: English, Tiếng Việt, Русский, Eesti, Dansk, 中文, Türkçe, Polski, Svenska, Suomi, toki pona, 漢喃

## External integrations

- Deployment: Vercel (default) and Netlify
- IndieAuth: indieauth.com
- Webmentions: webmention.io
- Last.fm: music listening data via API
- imood and status.cafe: mood and status widgets
- Analytics: Umami script proxied under `/stats/*`

## License

**TL;DR: You are free to use, modify, redistribute, and sell the source code and the content on this website, provided proper attribution is given back to me. Attribution should include a link to my website ([https://jarema.me](https://jarema.me)).**

This repository is dual-licensed.

All source code is licensed under the [GNU Affero General Public License v3](LICENSE).

All non-code content, such as text, posts, essays, documentation, photos, videos, and other materials, is licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](http://creativecommons.org/licenses/by/4.0/).

These licenses do not apply to third-party libraries, assets, or content included in the project. Third-party components and assets are subject to their own respective licenses.
