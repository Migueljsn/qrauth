"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, requireStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateBatchDates } from "@/lib/validation";

const date = z.string().optional().transform((v) => v || null);

export async function createBatch(fd: FormData) {
  await requireRole("super_admin", "admin");
  const p = z.object({
    product_id: z.uuid(), batch_number: z.string().trim().min(1).max(60),
    manufactured_at: date, expires_at: date,
    quantity: z.coerce.number().int().min(0), notes: z.string().trim().max(500).optional(),
  }).parse(Object.fromEntries(fd));
  const v = validateBatchDates(p.manufactured_at ?? "", p.expires_at ?? "");
  const msg = v.manufactured ?? v.expires;
  if (msg) redirect(`/admin/batches?error=${encodeURIComponent(msg)}`);
  const sb = await createClient();
  const { data: batch } = await sb.from("batches").insert({ ...p, notes: p.notes || null }).select("id").single();
  const { data: { user } } = await sb.auth.getUser();
  if (batch && p.quantity > 0)
    await sb.from("stock_movements").insert({ product_id: p.product_id, batch_id: batch.id, type: "in",
      quantity: p.quantity, note: "Entrada inicial do lote", created_by: user!.id });
  revalidatePath("/admin/batches");
}

export async function deleteBatch(fd: FormData) {
  await requireRole("super_admin", "admin");
  const sb = await createClient();
  await sb.from("batches").delete().eq("id", z.uuid().parse(fd.get("id")));
  revalidatePath("/admin/batches");
}

export async function addMovement(fd: FormData) {
  const staff = await requireStaff();
  const p = z.object({
    product_id: z.uuid(), batch_id: z.string().optional(),
    type: z.enum(["in", "out", "adjust"]), quantity: z.coerce.number().int().refine((n) => n !== 0),
    note: z.string().trim().max(300).optional(),
  }).parse(Object.fromEntries(fd));
  const sb = await createClient();
  await sb.from("stock_movements").insert({
    ...p, batch_id: p.batch_id || null, note: p.note || null,
    quantity: p.type === "adjust" ? p.quantity : Math.abs(p.quantity), created_by: staff.id,
  });
  revalidatePath("/admin/batches");
}
