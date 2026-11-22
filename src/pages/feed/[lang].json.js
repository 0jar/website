import { feedStaticPaths, getJSONFeedResponse } from "@/lib/feed";

export const getStaticPaths = feedStaticPaths;
export const GET = ({ params }) => getJSONFeedResponse(params.lang);
