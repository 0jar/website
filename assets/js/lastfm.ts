const lastfmUser = "jerryvu";
const lastfmApiKey = "c8526c48e3bd3c6f35e365480426f1be";
const lastfmApi = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmUser}&api_key=${lastfmApiKey}&format=json&limit=1`;

async function updateLastFm() {
  try {
    const res = await fetch(lastfmApi);
    if (!res.ok) return;
    const data = await res.json();
    const tracks = data.recenttracks?.track;
    if (!tracks || tracks.length === 0) return;

    // Last.fm can return a single object or array
    const track = Array.isArray(tracks) ? tracks[0] : tracks;

    const container = document.getElementById("now-items-container");
    if (!container) return;

    const isPlaying = track["@attr"]?.nowplaying === "true";
    const name = track.name;
    const artist = track.artist["#text"] || track.artist?.name || track.artist;
    const url = track.url;
    const images = track.image || [];
    const largeImage = images.find((i: any) => i.size === "large") || images[images.length - 1];
    const image = largeImage ? largeImage["#text"] : "";

    const article = document.createElement("article");
    article.className = "border rounded-lg p-4 bg-card card-hover-effect";

    // We assume english fallback for category title
    article.innerHTML = `
      <div class="flex items-center gap-2 font-semibold mb-1">
        <span class="text-lg" aria-hidden="true">🎧</span>
        <span class="now-category capitalize">Listening</span>
        ${isPlaying ? `<span class="ml-2 text-sm font-bold text-red-600 dark:text-white dark:bg-red-600 px-2 py-0.5 rounded">Live</span>` : ''}
      </div>
      <div class="flex items-center gap-3 overflow-hidden">
        ${image ? `<img src="${image}" alt="Cover art" class="w-12 h-12 rounded-lg flex-shrink-0" loading="lazy" decoding="async" />` : ''}
        <div class="flex-1 min-w-0 overflow-hidden">
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="now-text text-sm font-semibold break-words block hover:underline">${name}</a>
          <p class="now-subtext text-sm text-muted-foreground break-words">${artist}</p>
        </div>
      </div>
    `;

    // Overwrite the existing "listening" track from static if present, or prepend
    let appended = false;
    for (const child of Array.from(container.children)) {
      if (child.innerHTML.includes("🎧") || child.innerHTML.includes("Listening") || child.innerHTML.includes("listening")) {
        child.replaceWith(article);
        appended = true;
        break;
      }
    }

    if (!appended) {
      container.prepend(article);
      const items = Array.from(container.querySelectorAll("article"));
      if (items.length > 3) {
        items[items.length - 1].remove();
      }
    }
  } catch (e) {
    console.error("Failed to load Last.fm data:", e);
  }
}

// Execute on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateLastFm);
} else {
  updateLastFm();
}
