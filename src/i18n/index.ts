// i18n

import en from "./translations/en.json";
import vi from "./translations/vi.json";
import ru from "./translations/ru.json";
import et from "./translations/et.json";
import da from "./translations/da.json";
import zh from "./translations/zh.json";
import pl from "./translations/pl.json";
import tok from "./translations/tok.json";
import viHani from "./translations/vi-Hani.json";

export { supportedLanguages, type SupportedLanguage } from "@/lib/constants";

export const translations: Record<string, Record<string, unknown>> = {
  en, vi, ru, et, da, zh, pl, tok, "vi-Hani": viHani,
};

import { getNestedValue, interpolate } from "@/i18n/utils";

export function t(lang: string, key: string, params?: Record<string, string | number>): string {
  const value = getNestedValue(translations[lang] || translations.en, key)
    ?? (lang !== "en" ? getNestedValue(translations.en, key) : undefined);
  return value ? interpolate(value as string, params) : key;
}
