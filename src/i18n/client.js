import { getLocaleFromUrl } from "./routing";
import { getNestedValue, interpolate } from "./utils";

export const getPageLocale = () => getLocaleFromUrl(new URL(location.href));

let messages;
export function t(key, params) {
  messages ??= JSON.parse(document.getElementById("client-messages")?.textContent || "{}");
  const value = getNestedValue(messages, key);
  return value === undefined ? key : interpolate(value, params);
}

export function cycleLanguage() {
  const links = Array.from(document.querySelectorAll("#lang-toggle a[hreflang]"));
  if (!links.length) return;
  const current = links.findIndex(link => link.hreflang === document.documentElement.lang);
  links[(current + 1) % links.length].click();
}
