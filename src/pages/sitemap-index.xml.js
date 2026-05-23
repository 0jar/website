import { siteUrl as constantSiteUrl } from "@/lib/constants";

export const GET = async ({ site }) => {
  const siteUrl = (site?.toString() || constantSiteUrl).replace(/\/$/, "");

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteUrl}/sitemap.xml</loc></sitemap></sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
