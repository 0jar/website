import { defineMiddleware, sequence } from "astro:middleware";
import { getLocaleFromUrl } from "@/i18n/routing";

const locale = defineMiddleware(({ url, locals }, next) => {
  locals.lang = getLocaleFromUrl(url);
  return next();
});

export const onRequest = sequence(locale);
