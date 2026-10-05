"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveCategory(fd: FormData) {
  await requireRole("super_admin", "admin");
  const id = fd.get("id") ? z.uuid().parse(fd.get("id")) : null;
  const row = {
    name: z.string().trim().min(2).max(80).parse(fd.get("name")),
    description: String(fd.get("description") ?? "").trim() || null,
  };
  const sb = await createClient();
  await (id ? sb.from("categories").update(row).eq("id", id) : sb.from("categories").insert(row));
  revalidatePath("/admin/categories");
}

export async function deleteCategory(fd: FormData) {
  await requireRole("super_admin", "admin");
  const sb = await createClient();
  await sb.from("categories").delete().eq("id", z.uuid().parse(fd.get("id")));
  revalidatePath("/admin/categories");
}
