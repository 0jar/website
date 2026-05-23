import { getCollection } from "astro:content";
import { siteUrl as constantSiteUrl, localePages } from "@/lib/constants";
import { locales } from "@/i18n/routing";

export const GET = async ({ site }) => {
  const siteUrl = (site?.toString() || constantSiteUrl).replace(/\/$/, "");

  // Get all blog posts
  const blogPosts = await getCollection("blog", ({ data }) => !data.draft);

  // Get all .astro pages
  const pages = import.meta.glob("/src/pages/**/*.astro", { eager: true });

  const staticPages = [];
  for (const path of Object.keys(pages)) {
    let urlPath = path
      .replace("/src/pages", "")
      .replace(/\.astro$/, "")
      .replace(/\/index$/, "");

    // Skip API routes, 404, dynamic routes, and /records (locale variants added below)
    if (
      urlPath.includes("/api/") ||
      urlPath === "/404" ||
      urlPath.includes("[") ||
      urlPath.includes("]") ||
      urlPath === "/records" ||
      urlPath.startsWith("/records/")
    ) {
      continue;
    }

    urlPath = urlPath || "/";
    staticPages.push(urlPath);
  }

  // Build URLs array
  const urls = [
    // Root (English) static pages
    ...staticPages.map((page) => `  <url>\n    <loc>${siteUrl}${page === "/" ? "/" : `${page}/`}</loc>\n  </url>`),
    // Root (English) blog posts
    ...blogPosts.map((post) => `  <url>\n    <loc>${siteUrl}/blog/${post.id}/</loc>\n  </url>`),
    // Locale homepages
    ...locales.map((l) => `  <url>\n    <loc>${siteUrl}/${l}/</loc>\n  </url>`),
    // Locale static pages
    ...locales.flatMap((l) => localePages.map((p) => `  <url>\n    <loc>${siteUrl}/${l}/${p}/</loc>\n  </url>`)),
    // Locale blog posts
    ...locales.flatMap((l) => blogPosts.map((post) => `  <url>\n    <loc>${siteUrl}/${l}/blog/${post.id}/</loc>\n  </url>`)),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
