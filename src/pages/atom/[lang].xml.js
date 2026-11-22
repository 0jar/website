import { feedStaticPaths, getAtomResponse } from "@/lib/feed";

export const getStaticPaths = feedStaticPaths;
export const GET = ({ params }) => getAtomResponse(params.lang);
