import { getCollection, type CollectionEntry } from "astro:content";

export async function getData<C extends "now" | "projects" | "uses" | "webrings">(name: C) {
  const entries = await getCollection(name);
  return entries.map((entry): CollectionEntry<C>["data"] => entry.data);
}

export async function getNowItems() {
  return (await getData("now")).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
