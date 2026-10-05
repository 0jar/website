import { getCollection } from "astro:content";
import type { NowItem, Project, UsesCategory, WebringItem } from "@/content.config";

type DataMap = {
  now: NowItem;
  projects: Project;
  uses: UsesCategory;
  webrings: WebringItem;
};

const dataCache = new Map<string, Promise<any[]>>();

export async function getData<C extends keyof DataMap>(name: C): Promise<DataMap[C][]> {
  if (dataCache.has(name)) return dataCache.get(name) as Promise<DataMap[C][]>;
  
  const promise = getCollection(name as any).then((entries: any[]) => 
    entries.map((e: { data: DataMap[C] }) => e.data)
  );
  
  dataCache.set(name, promise);
  return promise;
}
