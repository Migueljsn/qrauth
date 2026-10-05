"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const Role = z.enum(["super_admin", "admin", "operator"]);
const Create = z.object({
  email: z.email(), full_name: z.string().trim().min(2).max(100),
  password: z.string().min(10, "Senha com no mínimo 10 caracteres").max(72), role: Role,
});

export async function createUser(_: unknown, fd: FormData) {
  await requireRole("super_admin");
  const p = Create.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };

  const sb = createAdminClient();
  const { data, error } = await sb.auth.admin.createUser({
    email: p.data.email, password: p.data.password, email_confirm: true,
  });
  if (error || !data.user) return { error: "Não foi possível criar o usuário (e-mail já existe?)." };

  const { error: pe } = await sb.from("profiles").insert({
    id: data.user.id, full_name: p.data.full_name, role: p.data.role,
  });
  if (pe) { await sb.auth.admin.deleteUser(data.user.id); return { error: "Falha ao criar perfil." }; }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUser(fd: FormData) {
  const me = await requireRole("super_admin");
  const id = z.uuid().parse(fd.get("id"));
  const role = Role.parse(fd.get("role"));
  const active = fd.get("active") === "on";
  const full_name = z.string().trim().min(2).max(100).parse(fd.get("full_name"));
  if (id === me.id && (!active || role !== "super_admin")) return; // não se auto-rebaixa/bloqueia

  const sb = createAdminClient();
  await sb.from("profiles").update({ full_name, role, active }).eq("id", id);
  const password = String(fd.get("password") ?? "");
  if (password && password.length < 10) return;
  await sb.auth.admin.updateUserById(id, {
    ...(password ? { password } : {}),
    ban_duration: active ? "none" : "876000h", // inativo = não consegue novo login/refresh
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(fd: FormData) {
  const me = await requireRole("super_admin");
  const id = z.uuid().parse(fd.get("id"));
  if (id === me.id) return;
  await createAdminClient().auth.admin.deleteUser(id);
  revalidatePath("/admin/users");
}
