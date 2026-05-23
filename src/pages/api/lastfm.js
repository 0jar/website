import { services, author } from "@/lib/constants";

export const prerender = false;

const lastFmApiUrl = `${services.lastFm.apiUrl}?method=user.getrecenttracks&user=${author.lastFmUsername}&api_key=${services.lastFm.apiKey}`;

const upstreamTimeoutMs = 5000;
const maxXmlBytes = 256 * 1024;

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "error",
      headers: { Accept: "application/xml, text/xml;q=0.9, */*;q=0.8" },
    });
  } finally {
    clearTimeout(timer);
  }
}

export const GET = async () => {
  try {
    const response = await fetchWithTimeout(lastFmApiUrl, upstreamTimeoutMs);
    if (!response.ok) {
      return Response.json({ error: "Unable to fetch Last.fm data" }, { status: 502 });
    }

    const xml = await response.text();
    if (new TextEncoder().encode(xml).length > maxXmlBytes) {
      return Response.json({ error: "Last.fm response too large" }, { status: 502 });
    }

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("lastfm:", error);
    return Response.json({ error: "Unable to fetch Last.fm" }, { status: 502 });
  }
};
