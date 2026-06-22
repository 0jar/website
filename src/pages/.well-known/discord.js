import { discordHash } from "@/lib/constants";

const textHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

export const GET = async () => {
  return new Response(discordHash, { status: 200, headers: textHeaders });
};
