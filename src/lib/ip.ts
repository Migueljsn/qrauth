import "server-only";
import { headers } from "next/headers";

/** IP real do cliente (Cloudflare → Traefik/EasyPanel → app). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") || (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
