import { getPublishedPosts } from "@/lib/blog";
import { hrefLangLanguages, supportedLanguages, siteDescription, getSiteName, siteUrl, author } from "@/lib/constants";
import { locales } from "@/i18n/routing";
import { escapeXml } from "@/lib/utils/escape";
import rss from "@astrojs/rss";

export function feedStaticPaths() {
  return ["en", ...locales].map((code) => ({ params: { lang: code } }));
}

function getLanguageName(code) {
  const lang = supportedLanguages.find((l) => l.code === code);
  return lang ? lang.name : code.toUpperCase();
}

async function feedPosts(language) {
  const posts = await getPublishedPosts();
  return posts.filter(p => !language || p.data.language === language)
    .map(({ id, data }) => ({ ...data, slug: id, excerpt: data.excerpt ?? "" }));
}

function feedMeta(language) {
  const suffix = language && language !== "en" ? ` - ${getLanguageName(language)}` : "";
  const resolvedSiteName = getSiteName(language);
  return { title: `${resolvedSiteName}${suffix}`, description: `${siteDescription}${suffix}` };
}

export function generateAtomFeed({ posts, title, description, language, feedUrl }) {
  const languageLinks = hrefLangLanguages
    .filter(l => l.code !== language && (l.code === "en" || locales.includes(l.code)))
    .map(
      (l) =>
        `  <link href="${siteUrl}/atom/${l.code}.xml" rel="alternate" type="application/atom+xml" hreflang="${l.code}" />`,
    )
    .join("\n");

  const entries = posts
    .map(
      (post) => `
  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${siteUrl}/blog/${post.slug}/" rel="alternate" type="text/html"/>
    <id>${siteUrl}/blog/${post.slug}/</id>
    <published>${post.date.toISOString()}</published>
    <updated>${(post.updated ?? post.date).toISOString()}</updated>
    <summary type="text">${escapeXml(post.excerpt)}</summary>
    ${post.tags.map((tag) => `<category term="${escapeXml(tag)}"/>`).join("\n    ")}
  </entry>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="/atom.xsl" type="text/xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <link href="${siteUrl}" rel="alternate" type="text/html"/>
  <link href="${feedUrl}" rel="self" type="application/atom+xml"/>
  <updated>${new Date().toISOString()}</updated>
  <author><name>${author.name}</name></author>
  <id>${siteUrl}/</id>
  <subtitle>${escapeXml(description)}</subtitle>
${languageLinks}${entries}
</feed>`;
}

export function generateJSONFeed({ posts, title, description, language, feedUrl }) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title,
    home_page_url: siteUrl,
    feed_url: feedUrl,
    description,
    authors: [{ name: author.name, url: siteUrl }],
    language,
    items: posts.map((post) => ({
      id: `${siteUrl}/blog/${post.slug}/`,
      url: `${siteUrl}/blog/${post.slug}/`,
      title: post.title,
      content_text: post.excerpt,
      summary: post.excerpt,
      date_published: post.date.toISOString(),
      date_modified: (post.updated ?? post.date).toISOString(),
      tags: post.tags || [],
    })),
  };
}

function cacheHeaders(contentType) {
  const headers = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

export async function getRSSResponse(language) {
  const posts = await feedPosts(language);
  const { title, description } = feedMeta(language);
  const lang = language || "en";
  const feedUrl = language ? `${siteUrl}/rss/${language}.xml` : `${siteUrl}/rss.xml`;

  const languageLinks = hrefLangLanguages
    .filter(l => l.code !== language && (l.code === "en" || locales.includes(l.code)))
    .map(
      (l) =>
        `  <atom:link href="${siteUrl}/rss/${l.code}.xml" rel="alternate" type="application/rss+xml" hreflang="${l.code}" />`,
    )
    .join("\n");

  const customData = `  <language>${lang}</language>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${languageLinks}`;

  return rss({
    title,
    description,
    site: siteUrl,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.date,
      description: post.excerpt || "",
      link: `/blog/${post.slug}/`,
      categories: post.tags || [],
    })),
    customData,
    stylesheet: "/rss.xsl",
  });
}

async function feedResponse(format, language) {
  const posts = await feedPosts(language ?? (format === "json" ? "en" : undefined));
  const { title, description } = feedMeta(language);
  const lang = language || "en";
  const base = format === "json" ? "feed" : "atom";
  const ext = format === "json" ? "json" : "xml";
  const feedUrl = `${siteUrl}/${base}${language ? `/${language}` : ""}.${ext}`;

  const opts = { posts, title, description, language: lang, feedUrl };

  if (format === "json") {
    return Response.json(generateJSONFeed(opts), { headers: cacheHeaders() });
  }
  
  return new Response(generateAtomFeed(opts), { headers: cacheHeaders("application/atom+xml") });
}

export const getAtomResponse = (language) => feedResponse("atom", language);
export const getJSONFeedResponse = (language) => feedResponse("json", language);
