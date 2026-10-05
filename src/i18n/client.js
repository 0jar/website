// Client-side i18n helper (intentionally does NOT import from @/i18n to avoid bundling translations)
import { supportedLanguages } from "@/lib/constants";
import { getLocaleFromUrl, stripLocale } from "@/i18n/routing";
export const getPageLocale = () => getLocaleFromUrl(new URL(location.href));
import { getNestedValue, interpolate } from "@/i18n/utils";

export const t = (key, params) => {
  const value = getNestedValue(window._I18N_DICT ?? {}, key);
  return value ? interpolate(value, params) : key;
};

export const cycleLanguage = () => {
  const codes = supportedLanguages.map((l) => l.code);
  const idx = codes.indexOf(getPageLocale());
  const next = codes[(idx + 1) % codes.length];
  location.href =
    next === "en"
      ? stripLocale(location.pathname)
      : `/${next}${stripLocale(location.pathname)}`;
};

export const switchLocale = (locale) => {
  const basePath = stripLocale(location.pathname);
  location.href = locale === "en" ? basePath : `/${locale}${basePath}`;
};
