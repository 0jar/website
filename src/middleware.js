import { defineMiddleware, sequence } from "astro:middleware";
import { getLocaleFromUrl } from "@/i18n/routing";

const locale = defineMiddleware(({ url, locals }, next) => {
  locals.lang = getLocaleFromUrl(url);
  return next();
});

const imageCaptions = defineMiddleware(async ({ url }, next) => {
  const response = await next();
  if (!url.pathname.startsWith("/blog/") || !response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }
  const html = await response.text();
  const transformed = html.replace(
    /<p>(<img\s[^>]*alt="([^"]+)"[^>]*>)<\/p>/g,
    (_, img, alt) => `<figure>${img}<figcaption>${alt.replaceAll("&amp;", "&")}</figcaption></figure>`,
  );
  return new Response(transformed, {
    status: response.status,
    headers: response.headers,
  });
});

export const onRequest = sequence(locale, imageCaptions);
