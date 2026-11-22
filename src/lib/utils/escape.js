/** Escape special characters for safe HTML/XML embedding. */
export function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const scriptJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
