// Timezone anchor utility + shared date formatting
import { authorTimezone } from "../constants";

// --- Date format presets ---

/**
 * Blog posts, scrapbook, recent posts
 * @type {Intl.DateTimeFormatOptions}
 */
export const dateLong = { year: "numeric", month: "long", day: "numeric" };

/**
 * Now page items (includes time + zone)
 * @type {Intl.DateTimeFormatOptions}
 */
export const dateFull = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
};

// --- Timezone ---
export function getTimezoneOption() {
  if (typeof localStorage === "undefined") return {};
  return localStorage.getItem("timezone-anchor") === "author"
    ? { timeZone: authorTimezone }
    : {};
}

// --- Unified formatter ---
export function formatDate(date, lang = "en", fmt = dateLong) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(lang, { ...fmt, ...getTimezoneOption() });
}

/** Update all `[data-date]` elements under a root with `formatDate`. */
export function updateDateElements(root, lang, fmt = dateLong) {
  root.querySelectorAll("[data-date]").forEach((el) => {
    const d = el.getAttribute("data-date");
    if (d) el.textContent = formatDate(d, lang, fmt);
  });
}
