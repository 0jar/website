import { feedStaticPaths, getRSSResponse } from "@/lib/feed";

export const getStaticPaths = feedStaticPaths;
export const GET = ({ params }) => getRSSResponse(params.lang);
