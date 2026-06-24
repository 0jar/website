import { getCollection } from "astro:content";
import { hrefLangLanguages, supportedLanguages, siteDescription, getSiteName, siteUrl, author } from "@/lib/constants";
import { locales } from "@/i18n/routing";
import { escapeXml } from "@/lib/utils/escape";
import rss from "@astrojs/rss";

export function feedStaticPaths() {
  return ["en", ...locales].map((code) => ({ params: { lang: code } }));
}

const validLangCodes = new Set(supportedLanguages.map((l) => l.code));

export function validateFeedLang(lang) {
  return !!lang && validLangCodes.has(lang);
}

function getLanguageName(code) {
  const lang = supportedLanguages.find((l) => l.code === code);
  return lang ? lang.name : code.toUpperCase();
}

let allFeedPostsPromise = null;

async function getAllFeedPosts() {
  const posts = await getCollection("blog", (entry) => !entry.data.draft);

  return posts
    .map((post) => ({
      slug: post.id,
      title: post.data.title,
      excerpt: post.data.excerpt ?? "",
      date: post.data.date,
      tags: post.data.tags ?? [],
      language: post.data.language ?? "en",
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function getAllFeedPostsCached() {
  return (allFeedPostsPromise ??= getAllFeedPosts());
}

function postsForLanguage(allPosts, language, mode) {
  if (language) return allPosts.filter((p) => p.language === language);
  return mode === "en-only" ? allPosts.filter((p) => p.language === "en") : allPosts;
}

function feedMeta(language) {
  const suffix = language && language !== "en" ? ` - ${getLanguageName(language)}` : "";
  const resolvedSiteName = getSiteName(language);
  return { title: `${resolvedSiteName}${suffix}`, description: `${siteDescription}${suffix}` };
}

export function generateAtomFeed({ posts, title, description, language, feedUrl }) {
  const languageLinks = hrefLangLanguages
    .filter((l) => l.code !== language)
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
    <published>${new Date(post.date).toISOString()}</published>
    <updated>${new Date(post.date).toISOString()}</updated>
    <summary type="html">${escapeXml(post.excerpt)}</summary>
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
      content_html: post.excerpt,
      summary: post.excerpt,
      date_published: new Date(post.date).toISOString(),
      date_modified: new Date(post.date).toISOString(),
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
  const allPosts = await getAllFeedPostsCached();
  const posts = postsForLanguage(allPosts, language, "all");

  if (language && posts.length === 0) {
    return new Response("No posts found for this language", { status: 404 });
  }

  const { title, description } = feedMeta(language);
  const lang = language || "en";
  const feedUrl = language ? `${siteUrl}/rss/${language}.xml` : `${siteUrl}/rss.xml`;

  const languageLinks = hrefLangLanguages
    .filter((l) => l.code !== language)
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
  const allPosts = await getAllFeedPostsCached();
  const mode = format === "json" ? "en-only" : "all";
  const posts = postsForLanguage(allPosts, language, mode);

  if (language && posts.length === 0) {
    return new Response("No posts found for this language", { status: 404 });
  }

  const { title, description } = feedMeta(language);
  const lang = language || "en";
  const pathMap = { atom: "atom", json: "feed" };
  const extMap = { atom: ".xml", json: ".json" };
  const feedUrl = language
    ? `${siteUrl}/${pathMap[format]}/${language}${extMap[format]}`
    : `${siteUrl}/${pathMap[format]}${extMap[format]}`;
    
  const opts = { posts, title, description, language: lang, feedUrl };

  if (format === "json") {
    return Response.json(generateJSONFeed(opts), { headers: cacheHeaders() });
  }
  
  const contentTypes = { atom: "application/atom+xml" };
  const generators = { atom: generateAtomFeed };
  
  return new Response(generators[format](opts), { headers: cacheHeaders(contentTypes[format]) });
}

export const getAtomResponse = (language) => feedResponse("atom", language);
export const getJSONFeedResponse = (language) => feedResponse("json", language);
