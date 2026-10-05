import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com SERVICE ROLE — ignora RLS. Só pode rodar no servidor
 * (o import "server-only" quebra o build se for puxado para o browser).
 * Uso restrito a: verificação pública de QR e CRUD de usuários.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
