// Client-side i18n helper (intentionally does NOT import from @/i18n to avoid bundling translations)
import { supportedLanguages } from "@/lib/constants";
import { getLocaleFromUrl, stripLocale } from "@/i18n/routing";
export const getPageLocale = () => getLocaleFromUrl(new URL(location.href));
import { getNestedValue, interpolate } from "@/i18n/utils";

export const t = (key, params) => {
  const value = getNestedValue(window._I18N_DICT ?? {}, key);
  return value ? interpolate(value, params) : key;
};

export function cycleLanguage() {
  const links = Array.from(document.querySelectorAll("#lang-toggle a[hreflang]"));
  if (!links.length) return;
  const current = links.findIndex(link => link.hreflang === document.documentElement.lang);
  links[(current + 1) % links.length].click();
}

export const switchLocale = (locale) => {
  const basePath = stripLocale(location.pathname);
  location.href = locale === "en" ? basePath : `/${locale}${basePath}`;
};
