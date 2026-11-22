import { getCollection, type CollectionEntry } from "astro:content";

import { localePath, locales } from "@/i18n/routing";
import { t } from "@/i18n";

export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postPath(post: CollectionEntry<"blog">, locale: string) {
  const lang = post.data.language === locale && locales.some(code => code === locale) ? locale : "en";
  return localePath(lang, `/blog/${post.id}/`);
}

export function taxonomyLabel(lang: string, raw: string, type: "category" | "tag") {
  const key = raw.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || raw;
  const translationKey = `blog.${type}Labels.${key}`;
  const translated = t(lang, translationKey);
  return { key, label: translated === translationKey ? raw : translated };
}
