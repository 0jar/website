// Content Collections
// https://docs.astro.build/en/guides/content-collections/

import { defineCollection, getCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { supportedLanguages } from "@/lib/constants";
type Locale = (typeof supportedLanguages)[number]["code"];
const localeCodes = supportedLanguages.map(l => l.code);

const i18nContent = z.object(Object.fromEntries(localeCodes.map(l => [l, z.string()])) as Record<Locale, z.ZodString>);
const i18nContentOptional = z.object(
  Object.fromEntries(localeCodes.map(l => [l, l === "en" ? z.string() : z.string().optional()])) as
    { en: z.ZodString } & Record<Exclude<Locale, "en">, z.ZodOptional<z.ZodString>>
);

const usesItem = z.object({
  name: z.string(),
  description: z.union([z.string(), i18nContentOptional]).optional(),
  link: z.string().optional(),
});

const projectFields = z.object({
  title: z.string(),
  description: z.string(),
  what: z.string(),
  learned: z.string(),
  why: z.string(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/blog" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    mood: z.string().default("contemplative"),
    catApproved: z.boolean().default(true),
    readingTime: z.number().optional(),
    language: z.string().default("en"),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    category: z.string().nullable().optional(),
    draft: z.boolean().default(false),
    alternates: z.array(z.object({ language: z.string(), slug: z.string() })).optional(),
  }),
});

const scrapbook = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/scrapbook" }),
  schema: z.object({
    hash: z.string(),
    date: z.coerce.date(),
    content: i18nContentOptional,
  }),
});

const aboutCommit = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/about/logs" }),
  schema: z.object({
    hash: z.string(),
    date: z.coerce.date(),
    tree: z.string().optional(),
    parent: z.string().optional(),
    content: i18nContentOptional,
    badges: z.array(z.string()).default([]),
  }),
});

const nowSchema = z.object({
    id: z.number(),
    category: z.string(),
    icon: z.string(),
    image: z.string().optional(),
    content: i18nContent,
    contentSecondary: i18nContentOptional.optional(),
    date: z.string(),
  });

const now = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/now" }),
  schema: nowSchema,
});

const projectsSchema = z.object({
    id: z.number(),
    url: z.string().optional(),
    content: z.record(z.string(), projectFields),
    tags: z.array(z.string()),
    status: z.enum(["completed", "in-progress", "planned"]),
    category: z.enum(["personal", "academic", "activism"]),
    hidden: z.boolean().optional(),
  });

const projects = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/projects" }),
  schema: projectsSchema,
});

const usesSchema = z.object({
    title: z.string(),
    icon: z.string(),
    items: z.array(usesItem),
    subsections: z.array(z.object({
      title: z.string(),
      icon: z.string().optional(),
      items: z.array(usesItem),
    })).optional(),
  });

const uses = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/uses" }),
  schema: usesSchema,
});

const webringsSchema = z.object({
    name: z.string(),
    url: z.string(),
    previous: z.string(),
    random: z.string().nullable(),
    next: z.string(),
    description: z.string().optional(),
    status: z.enum(["active", "pending"]),
  });

const webrings = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/webrings" }),
  schema: webringsSchema,
});

const aboutInterestsSchema = z.object({
    id: z.string(),
    order: z.number(),
    content: i18nContentOptional,
  });

const aboutInterests = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "src/content/about/interests" }),
  schema: aboutInterestsSchema,
});

export const collections = { blog, scrapbook, aboutCommit, now, projects, uses, webrings, aboutInterests };
export type I18nContent = Record<Locale, string>;
export type I18nContentOptional = { en: string } & Partial<Record<Exclude<Locale, "en">, string>>;

// Infer types directly from Zod schemas to avoid duplication
export type NowItem = z.infer<typeof nowSchema>;
export type ProjectFields = z.infer<typeof projectFields>;
export type Project = z.infer<typeof projectsSchema>;
export type UsesItem = z.infer<typeof usesItem>;
export type UsesCategory = z.infer<typeof usesSchema>;
export type WebringItem = z.infer<typeof webringsSchema>;

type DataMap = {
  now: NowItem;
  projects: Project;
  uses: UsesCategory;
  webrings: WebringItem;
};

export async function getData<C extends keyof DataMap>(name: C): Promise<DataMap[C][]> {
  const entries = await getCollection(name);
  return entries.map((e: { data: DataMap[C] }) => e.data);
}
