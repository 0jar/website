import { domainHashes } from "@/lib/constants";

export const prerender = false;

const textHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

const normalizeHost = (hostHeader) => hostHeader.split(",")[0].trim().toLowerCase().split(":")[0];

const matchesHost = (host, domain) => host === domain || host.endsWith(`.${domain}`);

export const GET = async ({ request }) => {
  const host = normalizeHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "");

  const discordHash = Object.entries(domainHashes).find(([domain]) => matchesHost(host, domain))?.[1];

  if (discordHash) {
    return new Response(discordHash, { status: 200, headers: textHeaders });
  }

  return new Response("File does not exist.", { status: 404, headers: textHeaders });
};
