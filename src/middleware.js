import { defineMiddleware } from "astro:middleware";
import { getLocaleFromUrl } from "@/i18n/routing";

export const onRequest = defineMiddleware(({ url, locals }, next) => {
  locals.lang = getLocaleFromUrl(url);
  return next();
});
