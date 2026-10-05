import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { clientIp } from "@/lib/ip";
import { createAdminClient } from "@/lib/supabase/admin";

export type VerifyResult =
  | { result: "authentic"; code: string; kind: "batch" | "unit"; scan_count: number;
      remaining_scans: number | null; unlimited: boolean; first_scan: boolean;
      custom_message: string | null;
      product: { name: string; description: string | null; image_url: string | null;
                 category: string | null; attributes: Record<string, string> };
      batch: { number: string; manufactured_at: string | null; expires_at: string | null } | null }
  | { result: "not_found" | "exhausted" | "expired" | "disabled" | "revoked" | "rate_limited"; code?: string };

/** Verifica um código chamando a função atômica do banco (service role, só no servidor). */
export async function verifyCode(code: string): Promise<VerifyResult> {
  const h = await headers();
  const ip = await clientIp();
  const salt = process.env.IP_HASH_SALT ?? "";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("verify_qr", {
    p_code: code, p_ip_hash: ipHash, p_user_agent: h.get("user-agent") ?? "",
  });
  if (error) throw new Error("verify_failed");
  return data as VerifyResult;
}
