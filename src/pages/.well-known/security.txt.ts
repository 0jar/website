import { readFile } from "node:fs/promises";

export async function GET() {
  return new Response(await readFile("public/security.txt", "utf8"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
