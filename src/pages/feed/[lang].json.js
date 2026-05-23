import { feedStaticPaths, validateFeedLang, getJSONFeedResponse } from "@/lib/feed";

export const getStaticPaths = feedStaticPaths;

export const GET = async ({ params }) => {
  if (!validateFeedLang(params.lang)) return new Response("Not found", { status: 404 });
  return getJSONFeedResponse(params.lang);
};
