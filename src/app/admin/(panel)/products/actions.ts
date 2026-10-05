"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const Product = z.object({
  name: z.string().trim().min(2).max(120),
  sku: z.string().trim().max(60).optional(),
  category_id: z.string().optional(),
  description: z.string().trim().max(2000).optional(),
  image_url: z.union([z.url({ protocol: /^https$/ }), z.literal("")]).optional(),
  attributes: z.string().optional(),
});

/** atributos: uma linha por item, formato "chave: valor" */
function parseAttrs(text = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

export async function saveProduct(fd: FormData) {
  await requireRole("super_admin", "admin");
  const id = fd.get("id") ? z.uuid().parse(fd.get("id")) : null;
  const p = Product.parse(Object.fromEntries(fd));
  const row = {
    name: p.name, sku: p.sku || null, category_id: p.category_id || null,
    description: p.description || null, image_url: p.image_url || null,
    attributes: parseAttrs(p.attributes), active: fd.get("active") === "on" || !id,
  };
  const sb = await createClient();
  if (id) await sb.from("products").update(row).eq("id", id);
  else await sb.from("products").insert(row);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(fd: FormData) {
  await requireRole("super_admin", "admin");
  const sb = await createClient();
  const { error } = await sb.from("products").delete().eq("id", z.uuid().parse(fd.get("id")));
  if (error) redirect("/admin/products?error=in_use"); // há lotes/QR vinculados: desative em vez de excluir
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
