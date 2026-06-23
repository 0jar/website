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

export function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  let cur: unknown = obj;
  for (const k of path.split(".")) {
    if (cur && typeof cur === "object" && k in cur) cur = (cur as Record<string, unknown>)[k];
    else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

export function t(lang: string, key: string, params?: Record<string, string | number>): string {
  const value = getNestedValue(translations[lang] || translations.en, key)
    ?? (lang !== "en" ? getNestedValue(translations.en, key) : undefined);
  if (!value) return key;
  if (!params) return value;
  return Object.entries(params).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, String(v)), value);
}
