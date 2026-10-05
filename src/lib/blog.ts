import { getCollection, type CollectionEntry } from "astro:content";

let blogCache: Promise<CollectionEntry<"blog">[]> | undefined = undefined;

export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  if (blogCache) return blogCache;
  
  blogCache = getCollection("blog", ({ data }: CollectionEntry<"blog">) => !data.draft)
    .then((posts: CollectionEntry<"blog">[]) => posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()));
    
  return blogCache as Promise<CollectionEntry<"blog">[]>;
}
