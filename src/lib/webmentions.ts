interface WebmentionAuthor {
  type?: string;
  name?: string;
  url?: string;
  photo?: string;
}

export interface Webmention {
  type?: string;
  author?: WebmentionAuthor;
  url?: string;
  published?: string;
  "wm-received"?: string;
  "wm-id"?: number;
  "wm-property"?: string;
  "wm-source"?: string;
  content?: { text?: string; html?: string };
}

const webmentionsCache = new Map<string, Promise<Webmention[]>>();

export async function fetchWebmentions(target: string): Promise<Webmention[]> {
  if (webmentionsCache.has(target)) return webmentionsCache.get(target)!;
  const promise = fetch(`https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(target)}`, { signal: AbortSignal.timeout(5000) })
    .then(r => r.ok ? r.json() : { children: [] })
    .then(j => (j.children ?? []).sort((a: Webmention, b: Webmention) =>
      new Date(a.published || a["wm-received"] || 0).getTime() - new Date(b.published || b["wm-received"] || 0).getTime()
    ))
    .catch(() => []);
  webmentionsCache.set(target, promise);
  return promise;
}
