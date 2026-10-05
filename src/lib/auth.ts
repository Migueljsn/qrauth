import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "super_admin" | "admin" | "operator";
export type Staff = { id: string; email: string; full_name: string; role: Role };

/** Garante usuário logado E com perfil ativo. Redireciona caso contrário. */
export async function requireStaff(): Promise<Staff> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles").select("full_name, role, active").eq("id", user.id).single();

  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=inactive");
  }
  return { id: user.id, email: user.email ?? "", full_name: profile.full_name, role: profile.role as Role };
}

/** Exige um dos papéis informados (autorização no servidor, nunca só na UI). */
export async function requireRole(...roles: Role[]): Promise<Staff> {
  const staff = await requireStaff();
  if (!roles.includes(staff.role)) redirect("/admin?error=forbidden");
  return staff;
}

export const canManage = (r: Role) => r === "super_admin" || r === "admin";
