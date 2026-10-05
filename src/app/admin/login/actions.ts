"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clientIp } from "@/lib/ip";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function login(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const ip = await clientIp();
  // anti força-bruta: por IP e por e-mail
  if (!rateLimit(`login-ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`login-email:${email}`, 8, 15 * 60_000))
    return { error: "Muitas tentativas. Aguarde alguns minutos." };

  if (!(await verifyTurnstile(String(formData.get("cf-turnstile-token") ?? ""), ip)))
    return { error: "Falha na verificação humana. Recarregue a página e tente de novo." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha inválidos." }; // genérica (anti-enumeração)
  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
