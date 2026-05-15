---
title: "I made an algorithmic permashortlink for my blog"
excerpt: "I had a short domain doing nothing, so I built a permashortlink system for my blog posts based on Base36. Did it using Next.js middleware and saw one YYMMDD mistake I definitely should have caught earlier."
date: "2026-05-15T10:45:00Z"
mood: "happy"
catApproved: true
readingTime: 5
language: "en"
categories: ["technical", "guides", "personal"]
tags: ["software", "web development", "indieweb", "javascript", "nextjs", "url-shortener", "permashortlink"]
---

So, I have this short domain [jar.tf](https://jar.tf). Have had it for a while, actually. And for a long while, all it's been doing is sitting there to be a link-in-bio page, which tbh barely gets any traffic anyway. I knew I wanted to do something with it eventually, I just hadn't figured out what that'd be.

At some point, I went down an IndieWeb rabbit hole and stumbled onto [permashortlinks](https://indieweb.org/permashortlink). Basically it's a short URL that permanently redirects to a longer one. A link shortener, but one that's gonna be mine and no third party is going to shove ads into it. That clicked instantly, and suddenly `jar.tf` had a new thing to do.

I wanted something brainless enough to use even when my brain is elsewhere, but short enough to actually be a proper link shortener. So eventually I landed on four formats:

- The simplest two are `/b/slug` which just redirects straight to `jarema.me/blog/slug/`, and `/b/YYMM/slug` which extracts the date context from the URL and directs to `jarema.me/blog/20YY/MM/slug/`. Those are the human-readable ones and are effectively just aliases, but they're easy to type.
- Then there are the two timestamp-based ones:
  - A simple 6-digit `/b/YYMMDD` which resolves to `jarema.me/blog/20YY/MM/DD/`, and
  - An alphanumeric format `/b/AAATTT` that expands into `jarema.me/blog/20YY/MM/DD/hh/mm/`.

But I'm gonna regret my choice with YYMMDD soon enough...

For the algorithmic permashortlink, I first thought of [NewBase60](http://tantek.pbworks.com/w/page/19402946/NewBase60), since [Tantek Çelik](https://tantek.com/) originally built for his own link shortener and some people in the indie web community use it too. I'd tested it, it's pretty cool and the concept is perfectly fine, but I didn't feel like it was for me. NewBase60 uses a custom 60-character case-sensitive alphabet with 0-9, A-Z capital, a-z lowercase and an underscore thrown in. It needs custom decoding logic since nothing in standard JS library uses it, and I wasn't about to import yet another dependency.

So I went looking, and at some point I realised I'd somehow glossed over the simplest thing ever: what about Base36? It's native in JS, `n.toString(36)` and `parseInt(n, 36)` works, virtually zero setup needed lol. It's also case-insensitive and purely alphanumeric (0-9 and a-z) with no special characters. Same 6-char structure with NB60 is possible too, AAA encodes the day and TTT encodes the minute of the day. Perfect. There's a catch though. When you count in days from the Unix epoch (1970-01-01), 2099-12-31 overflows 3 characters. Unix day for that is 47,117 but 36^3 is only 46,656. Eh, no biggie then, we'll just shift the epoch to 2000 and voila, problem's gone. Days then run from 0 through 36,524, and that fits in 3 base36 characters with some spare room.

And since we're doing redirects, naturally the best place would be the Next.js middleware. Yes, my link-in-bio site still runs on Next.js for now despite [my opinions on it](/blog/2026/04/welcome-home-astro/). Fiddled a while and now I have something like this:

```js
import { NextResponse } from 'next/server';
const epoch = 10957; // 2000-01-01, in days since Unix epoch

function decodePermashortlink(code) {
  const a = parseInt(code.slice(0, 3), 36);
  const t = parseInt(code.slice(3, 6), 36);
  if (a > 36524 || t >= 1440) return null;
  const date = new Date((epoch + a) * 86400000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return `https://jarema.me/blog/${year}/${month}/${day}/${hh}/${mm}/`;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const parts = pathname.slice(3).split('/').filter(Boolean);
  let dest;
  if (parts.length === 1) {
    const p = parts[0];
    if (/^\d{6}$/.test(p)) {
      // /b/YYMMDD format, not including here for focus
    } else if (/^[0-9a-z]{6}$/i.test(p)) {
      dest = decodePermashortlink(p.toLowerCase());
      if (!dest) return NextResponse.next();
    } else {
      dest = `https://jarema.me/blog/${p}/`;
    }
  } else if (parts.length === 2 && /^\d{4}$/.test(parts[0])) {
    // /b/20YY/MM, not including here for focus
  } else {
    return NextResponse.next();
  }
  return NextResponse.redirect(dest, 302);
}
```

Well, it works, but looking at it again I noticed `decodePermashortlink` was doing a lot of calculation for so many constants, but they're already available in ISO format from `Date.toISOString()`. So I cut that block down:

```js
const iso = new Date((epoch + a) * 86400000 + t * 60000).toISOString();
return `https://jarema.me/blog/${iso.slice(0, 4)}/${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(11, 13)}/${iso.slice(14, 16)}/`;
```

Now we just need to slice the ISO string. That helped with `decodePermashortlink`, but then I looked at the dispatch logic. Wait hold on, why are we executing this for every single request?

```js
const parts = pathname.slice(3).split('/').filter(Boolean);
```

Every single incoming request was calling `.split('/')`, then `.filter(Boolean)` to produce a fresh array allocation each time, followed by multiple `.slice()` calls inside the conditionals to pull out `yy`, `mm`, `dd`, etc. as separate constants. That's a lot of wasted work for basically just pattern matching. So the plan now is to strip the `/b/` prefix right at the start while normalise any trailing slash, then run the string directly against regex patterns using `.exec()`:

```js
export function proxy(request) {
  // Strip the leading '/b/' and remove trailing slash
  const path = request.nextUrl.pathname.slice(3);
  const p = path.endsWith('/') ? path.slice(0, -1) : path;
  if (!p) return NextResponse.next();

  let dest;
  let match;

  if ((match = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(p))) {
    // match[1] through match[5] are yy/mm/dd/hh/nn
    dest = `https://jarema.me/blog/20${match[1]}/${match[2]}/${match[3]}/${match[4]}/${match[5]}/`;
  }
```

There we go, no need to manually call `.slice()` every single time now, the regex did its thing. Oh yeah, while I was at it I also inlined `decodePermashortlink` too, so now the function call overhead is dropped.

Nice, we're done at that. Or so I thought... Remember that I said at the beginning I'm gonna regret my choice with YYMMDD soon enough? So like a day after I deployed this, I was just testing random stuff and I figured why not try the near-max non-letter date code "991130". I wouldn't blame you if you assume that's for 30 October, 2099, because I certainly thought so too. Eeeek, this is also the code generated for 28 October, 2032 at 23:24 UTC. So apparently AAATTT can still cosplay as YYMMDD. The fix was adding the hour and minute into YYMMDD to make it `YYMMDDhhmm`, now it's 10 digits and all is good. Tbh I kind of saw it coming but I didn't do anything about it until it broke on me lol. Typical ¯\\\_(ツ)_/¯

Here's the final file, now with the rest of the shortlinks too:

```js
import { NextResponse } from 'next/server';
const epoch = 10957;
export function proxy(request) {
  const path = request.nextUrl.pathname.slice(3);
  const p = path.endsWith('/') ? path.slice(0, -1) : path;
  if (!p) return NextResponse.next();
  let dest;
  let match;
  // /b/YYMMDDhhmm
  if ((match = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(p))) {
    if (+match[2] < 1 || +match[2] > 12 || +match[3] < 1 || +match[3] > 31 || +match[4] > 23 || +match[5] > 59) return NextResponse.next();
    dest = `https://jarema.me/blog/20${match[1]}/${match[2]}/${match[3]}/${match[4]}/${match[5]}/`;
    // /b/AAATTT
  } else if ((match = /^([0-9a-z]{3})([0-9a-z]{3})$/i.exec(p))) {
    const a = parseInt(match[1], 36);
    const t = parseInt(match[2], 36);
    if (a > 36524 || t >= 1440) return NextResponse.next();
    const iso = new Date((epoch + a) * 86400000 + t * 60000).toISOString();
    dest = `https://jarema.me/blog/${iso.slice(0, 4)}/${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(11, 13)}/${iso.slice(14, 16)}/`;
    // /b/YYMM/slug
  } else if ((match = /^(\d{2})(\d{2})\/([^/]+)$/.exec(p))) {
    if (+match[2] < 1 || +match[2] > 12) return NextResponse.next();
    dest = `https://jarema.me/blog/20${match[1]}/${match[2]}/${match[3]}/`;
    // /b/slug
  } else if (/^[^/]+$/.test(p)) {
    dest = `https://jarema.me/blog/${p}/`;
  } else {
    return NextResponse.next();
  }
  return NextResponse.redirect(dest, 302);
}
export const config = {
  matcher: '/b/:path+',
};
```

Anyway, the code is up on the [link-in-bio site's repo on Codeberg](https://codeberg.org/jartf/links/src/branch/main/proxy.js) if you want to take a look. Nothing too major tbh, but it was a fun little thing to build. Now this blog post has an alternate URL at [https://jar.tf/b/7fj0hx](https://jar.tf/b/7fj0hx) too :3

This is also my fourth post for the [#100DaysToOffload](https://100daystooffload.com/) challenge. Jeez, it's been so long, last time I wrote a blog post was 1 April. I'm back on track now.
