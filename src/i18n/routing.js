// Locale-aware routing helpers
import { supportedLanguages } from "@/lib/constants";

/** All non-English locale codes */
export const locales = (typeof process !== 'undefined' && process.env.NEOCITIES) || (import.meta.env && import.meta.env.NEOCITIES) ? [] : supportedLanguages.map((l) => l.code).filter((c) => c !== "en");

/** Reusable getStaticPaths that emits one entry per non-English locale. */
export function localeStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

/** Extract the i18n locale code from a URL pathname. */
export function getLocaleFromUrl(url) {
  const [, segment] = url.pathname.split("/");
  return locales.includes(segment) ? segment : "en";
}

/** Build a locale-prefixed path. English paths stay at root. */
export function localePath(locale, path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === "en" ? clean : `/${locale}${clean}`;
}

/** Strip the locale prefix from a pathname, returning the base path. */
export function stripLocale(pathname) {
  for (const loc of locales) {
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
    if (pathname === `/${loc}`) return "/";
  }
  return pathname;
}
