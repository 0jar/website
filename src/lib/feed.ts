import { getCollection, type CollectionEntry } from "astro:content";
import { hrefLangLanguages, supportedLanguages, siteDescription, getSiteName, siteUrl, author, type SupportedLanguage } from "@/lib/constants";
import { escapeXml } from "@/lib/utils/escape";

export function feedStaticPaths() {
  return supportedLanguages.map((lang) => ({ params: { lang: lang.code } }));
}

const validLangCodes = new Set(supportedLanguages.map((l) => l.code));

export function validateFeedLang(lang: string | undefined): lang is SupportedLanguage {
  return !!lang && validLangCodes.has(lang as SupportedLanguage);
}

function getLanguageName(code: string): string {
  const lang = supportedLanguages.find((l) => l.code === code);
  return lang ? lang.name : code.toUpperCase();
}

export interface FeedPost {
  slug: string;
  title: string;
  excerpt: string;
  date: Date;
  tags: string[];
  language: string;
}

let allFeedPostsPromise: Promise<FeedPost[]> | null = null;

async function getAllFeedPosts(): Promise<FeedPost[]> {
  const posts = await getCollection("blog", (entry: CollectionEntry<"blog">) => !entry.data.draft);

  return posts
    .map((post: CollectionEntry<"blog">) => ({
      slug: post.id,
      title: post.data.title,
      excerpt: post.data.excerpt ?? "",
      date: post.data.date,
      tags: post.data.tags ?? [],
      language: post.data.language ?? "en",
    }))
    .sort((a: FeedPost, b: FeedPost) => b.date.getTime() - a.date.getTime());
}

function getAllFeedPostsCached(): Promise<FeedPost[]> {
  return (allFeedPostsPromise ??= getAllFeedPosts());
}

type FeedMode = "all" | "en-only";

function postsForLanguage(allPosts: FeedPost[], language: string | undefined, mode: FeedMode): FeedPost[] {
  if (language) return allPosts.filter((p) => p.language === language);
  return mode === "en-only" ? allPosts.filter((p) => p.language === "en") : allPosts;
}

function feedMeta(language: string | undefined) {
  const suffix = language && language !== "en" ? ` - ${getLanguageName(language)}` : "";
  const resolvedSiteName = getSiteName(language);
  return { title: `${resolvedSiteName}${suffix}`, description: `${siteDescription}${suffix}` };
}

interface FeedOptions {
  posts: FeedPost[];
  title: string;
  description: string;
  language: string;
  feedUrl: string;
}

export function generateRSSFeed({ posts, title, description, language, feedUrl }: FeedOptions): string {
  const languageLinks = hrefLangLanguages
    .filter((l) => l.code !== language)
    .map(
      (l) =>
        `  <atom:link href="${siteUrl}/rss/${l.code}.xml" rel="alternate" type="application/rss+xml" hreflang="${l.code}" />`,
    )
    .join("\n");

  const items = posts
    .map(
      (post) => `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${siteUrl}/blog/${post.slug}/</link>
    <guid isPermaLink="true">${siteUrl}/blog/${post.slug}/</guid>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description>${escapeXml(post.excerpt)}</description>
    ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n    ")}
  </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="/rss.xsl" type="text/xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(title)}</title>
  <link>${siteUrl}</link>
  <description>${escapeXml(description)}</description>
  <language>${language}</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${languageLinks}${items}
</channel>
</rss>`;
}

export function generateAtomFeed({ posts, title, description, language, feedUrl }: FeedOptions): string {
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

export function generateJSONFeed({ posts, title, description, language, feedUrl }: FeedOptions) {
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

function cacheHeaders(contentType?: string) {
  const headers: Record<string, string> = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

async function feedResponse(
  format: "rss" | "atom" | "json",
  language?: string,
): Promise<Response> {
  const allPosts = await getAllFeedPostsCached();
  const mode: FeedMode = format === "json" ? "en-only" : "all";
  const posts = postsForLanguage(allPosts, language, mode);

  if (language && posts.length === 0) {
    return new Response("No posts found for this language", { status: 404 });
  }

  const { title, description } = feedMeta(language);
  const lang = language || "en";
  const pathMap = { rss: "rss", atom: "atom", json: "feed" } as const;
  const extMap = { rss: ".xml", atom: ".xml", json: ".json" } as const;
  const feedUrl = language
    ? `${siteUrl}/${pathMap[format]}/${language}${extMap[format]}`
    : `${siteUrl}/${pathMap[format]}${extMap[format]}`;
  const opts: FeedOptions = { posts, title, description, language: lang, feedUrl };

  if (format === "json") {
    return Response.json(generateJSONFeed(opts), { headers: cacheHeaders() });
  }
  const contentTypes = { rss: "application/xml", atom: "application/atom+xml" } as const;
  const generators = { rss: generateRSSFeed, atom: generateAtomFeed } as const;
  return new Response(generators[format](opts), { headers: cacheHeaders(contentTypes[format]) });
}

export const getRSSResponse = (language?: string) => feedResponse("rss", language);
export const getAtomResponse = (language?: string) => feedResponse("atom", language);
export const getJSONFeedResponse = (language?: string) => feedResponse("json", language);
