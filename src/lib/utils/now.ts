import { author, services } from "@/lib/constants";
import { httpUrl } from "./url";

export async function recentTrack() {
  if (/(^|\.)neocities\.org$/.test(location.hostname)) return;
  const url = new URL(services.lastFm.apiUrl);
  url.search = new URLSearchParams({
    method: "user.getrecenttracks", user: author.lastFmUsername,
    api_key: services.lastFm.apiKey, limit: "1",
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return;
  const doc = new DOMParser().parseFromString(await response.text(), "application/xml");
  const track = doc.querySelector('track[nowplaying="true"]') ?? doc.querySelector("track");
  const text = (selector: string) => track?.querySelector(selector)?.textContent?.trim();
  const title = text("name");
  const artist = text("artist");
  if (!title || !artist) return;
  const live = track?.getAttribute("nowplaying") === "true";
  const timestamp = Number(track?.querySelector("date")?.getAttribute("uts")) * 1000;
  const date = live ? new Date() : new Date(timestamp);
  if (!live && (!timestamp || !Number.isFinite(date.getTime()))) return;
  return { title, artist, live, date, url: httpUrl(text("url")), image: httpUrl(text('image[size="large"]')) };
}
