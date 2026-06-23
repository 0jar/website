// Shared utilities for Now section and Now page
import { t } from "@/i18n/client";
import { formatDate, dateFull } from "@/lib/utils/timezone-utils";
import { escapeHtml } from "@/lib/utils/escape";
import { services, author } from "@/lib/constants";

export interface LastfmTrack { type: "lastfm"; name: string; artist: string; url: string; nowplaying: boolean; image: string; date?: string; dateObj: Date }
export type LiveItem = LastfmTrack;

const badge = '<span class="ml-2 text-sm font-bold text-red-600 dark:text-white dark:bg-red-600 px-2 py-0.5 rounded">Live</span>';

/** Sanitize URL */
function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch {}
  return '';
}

/** Safe img */
function safeImg(src: string, alt: string, cls: string, extra = ''): string {
  const url = safeUrl(src);
  return url ? `<img src="${url}" alt="${escapeHtml(alt)}" class="${cls}" loading="lazy"${extra}/>` : '';
}

// --- Fetching ---

export async function fetchLiveData(): Promise<LiveItem[]> {
  if (typeof window !== "undefined" && window.location.hostname.includes("neocities.org")) return [];
  const lastFmApiUrl = `${services.lastFm.apiUrl}?method=user.getrecenttracks&user=${author.lastFmUsername}&api_key=${services.lastFm.apiKey}`;
  const lfm = await fetch(lastFmApiUrl, { headers: { Accept: "application/xml, text/xml;q=0.9, */*;q=0.8" } }).catch(() => null);
  const items: LiveItem[] = [];
  if (lfm?.ok) { const track = parseLastfm(await lfm.text()); if (track) items.push(track); }
  return items;
}

function parseLastfm(xml: string): LastfmTrack | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return null;
  const tracks = doc.getElementsByTagName("track");
  if (!tracks.length) return null;

  const track = Array.from(tracks).find(t => t.getAttribute("nowplaying") === "true") || tracks[0];
  const tag = (name: string) => track.getElementsByTagName(name)[0]?.textContent || "";
  const [name, artist] = [tag("name"), tag("artist")];
  if (!name || !artist) return null;

  const nowplaying = track.getAttribute("nowplaying") === "true";
  let date: string | undefined, dateObj = new Date();
  if (!nowplaying) {
    const uts = track.getElementsByTagName("date")[0]?.getAttribute("uts");
    if (uts) { dateObj = new Date(+uts * 1000); date = formatDate(dateObj, "en", dateFull); }
  }
  const image = Array.from(track.getElementsByTagName("image")).find(i => i.getAttribute("size") === "large")?.textContent?.trim() || "";
  return { type: "lastfm", name, artist, url: tag("url"), nowplaying, image, date, dateObj };
}

// --- Rendering ---

function liveContent(item: LiveItem, includeIcon = true, compact = false): string {
  const textSm = compact ? "text-sm " : "";
  const coverImg = item.image ? safeImg(item.image, `${item.name} cover art`, "w-12 h-12 rounded-lg flex-shrink-0", ' decoding="async"') : '';
  const trackUrl = safeUrl(item.url);
  const trackLink = trackUrl
    ? `<a href="${trackUrl}" target="_blank" rel="noopener noreferrer" class="${textSm}hover:underline font-semibold break-words block">${escapeHtml(item.name)}</a>`
    : `<span class="${textSm}font-semibold break-words block">${escapeHtml(item.name)}</span>`;
  return `<div class="flex items-center gap-2 font-semibold mb-1">
    ${includeIcon ? '<span class="text-lg" aria-hidden="true">🎧</span>' : ''}<span class="now-category">${t("now.categories.listening") || "Listening"}</span>${item.nowplaying ? badge : ""}
  </div><div class="flex items-center gap-3 overflow-hidden py-1">
    ${coverImg}
    <div class="flex-1 min-w-0 overflow-hidden">
      ${trackLink}
      <p class="text-sm text-muted-foreground break-words">${escapeHtml(item.artist)}</p>
    </div></div>${item.date && !item.nowplaying ? `<time data-date="${item.dateObj.toISOString()}" class="text-xs text-muted-foreground mt-1 block">${item.date}</time>` : ""}`;
}

export const renderCompact = (item: LiveItem, cls: string) =>
  `<article class="${cls} transition-all duration-200 hover:shadow-md hover:scale-[1.02]">${liveContent(item, true, true)}</article>`;

export const renderCard = (item: LiveItem) =>
  `<article class="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"><div class="flex items-start gap-4">
    <span class="text-3xl flex-shrink-0" aria-hidden="true">🎧</span>
    <div class="flex-1 min-w-0">${liveContent(item, false)}</div>
  </div></article>`;

// --- i18n ---

export function updateI18nElements(root: Element, lang: string) {
  // Update multilingual content blocks injected by live data
  root.querySelectorAll("[data-now-content]").forEach(article => {
    try {
      const content = JSON.parse(article.getAttribute("data-now-content")!);
      const text = article.querySelector(".now-text");
      if (text) text.textContent = content[lang] || content.en;
      const secRaw = article.getAttribute("data-now-content-secondary");
      const sub = article.querySelector(".now-subtext");
      if (secRaw && sub) { const sec = JSON.parse(secRaw); sub.textContent = sec[lang] || sec.en; }
    } catch {}
  });
}

/** Conflict map: static category → live type that replaces it */
export const conflictMap: Record<string, string> = { listening: "lastfm" };
