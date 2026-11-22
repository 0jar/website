import { getPublishedPosts } from "@/lib/blog";
import { siteUrl, localePages } from "@/lib/constants";
import { localePath, locales } from "@/i18n/routing";
import { escapeXml } from "@/lib/utils/escape";

export async function GET({ site }) {
  const pages = Object.keys(import.meta.glob("/src/pages/**/*.astro"))
    .filter(path => !path.includes("[") && !path.endsWith("/404.astro"))
    .map(path => path.slice("/src/pages".length).replace(/(?:\/index)?\.astro$/, "") || "/")
    .map(path => path.endsWith("/") ? path : `${path}/`);
  const localised = pages.filter(path => path === "/" || path.startsWith("/tools/") || localePages.includes(path.slice(1, -1)));
  const posts = await getPublishedPosts();
  const paths = [
    ...pages,
    ...locales.flatMap(lang => localised.map(path => localePath(lang, path))),
    ...posts.map(post => `/blog/${post.id}/`),
    ...posts.filter(post => locales.includes(post.data.language)).map(post => `/${post.data.language}/blog/${post.id}/`),
  ];
  const urls = paths.map(path => `  <url><loc>${escapeXml(new URL(path, site ?? siteUrl).href)}</loc></url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
