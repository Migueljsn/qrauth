"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseLocal, toInputLocal } from "@/lib/datetime";
import { validateValidUntil } from "@/lib/validation";

const optStr = z.string().trim().optional().transform((v) => v || null);
const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);

export async function generateQr(fd: FormData) {
  await requireRole("super_admin", "admin");
  const p = z.object({
    product_id: z.uuid(), batch_id: z.string().optional().transform((v) => v || null),
    kind: z.enum(["batch", "unit"]), flow: z.enum(["direct", "camera"]).default("camera"), quantity: z.coerce.number().int().min(1).max(10000),
    max_scans: z.coerce.number().int().min(1).optional(),
    custom_message: optStr, label_prefix: optStr,
  }).parse(Object.fromEntries(fd));
  const unlimited = fd.get("unlimited") === "on";
  const sb = await createClient();

  let validUntil: string | null = null;
  if (fd.get("no_expiry") !== "on") {
    const value = String(fd.get("valid_until") ?? "");
    const batchExpires = p.batch_id
      ? (await sb.from("batches").select("expires_at").eq("id", p.batch_id).maybeSingle()).data?.expires_at ?? null
      : null;
    const err = validateValidUntil(value, batchExpires);
    if (err) fail("/admin/qr", err);
    validUntil = parseLocal(value)!.toISOString();
  }

  const { error } = await sb.rpc("generate_qr_codes", {
    p_product_id: p.product_id, p_batch_id: p.batch_id, p_kind: p.kind,
    p_quantity: p.kind === "batch" ? 1 : p.quantity, // QR de lote = 1 código para o lote todo
    p_max_scans: unlimited ? null : (p.max_scans ?? 1),
    p_valid_until: validUntil,
    p_custom_message: p.custom_message, p_label_prefix: p.label_prefix, p_flow: p.flow,
  });
  if (error) fail("/admin/qr", error.message);
  revalidatePath("/admin/qr");
  redirect("/admin/qr");
}

export async function updateQr(fd: FormData) {
  await requireRole("super_admin", "admin");
  const id = z.uuid().parse(fd.get("id"));
  const unlimited = fd.get("unlimited") === "on";
  const p = z.object({
    status: z.enum(["active", "disabled", "revoked"]), label: optStr, custom_message: optStr,
    max_scans: z.coerce.number().int().min(1).optional(),
  }).parse(Object.fromEntries(fd));
  const sb = await createClient();

  let validUntil: string | null = null;
  if (fd.get("no_expiry") !== "on") {
    const value = String(fd.get("valid_until") ?? "");
    const { data: qr } = await sb.from("qr_codes").select("valid_until, batches(expires_at)").eq("id", id).maybeSingle();
    const unchanged = qr?.valid_until && toInputLocal(qr.valid_until) === value; // não bloqueia salvar outros campos de QR já vencido
    if (!unchanged) {
      const batchExpires = (qr?.batches as unknown as { expires_at: string | null } | null)?.expires_at ?? null;
      const err = validateValidUntil(value, batchExpires);
      if (err) fail(`/admin/qr/${id}`, err);
    }
    validUntil = parseLocal(value)!.toISOString();
  }

  await sb.from("qr_codes").update({
    status: p.status, label: p.label, custom_message: p.custom_message,
    valid_until: validUntil, max_scans: unlimited ? null : (p.max_scans ?? 1),
  }).eq("id", id);
  revalidatePath("/admin/qr");
  redirect("/admin/qr");
}

export async function resetScans(fd: FormData) {
  await requireRole("super_admin", "admin");
  const id = z.uuid().parse(fd.get("id"));
  const sb = await createClient();
  await sb.from("qr_codes").update({ scan_count: 0, status: "active" }).eq("id", id);
  revalidatePath(`/admin/qr/${id}`);
}

export async function deleteQr(fd: FormData) {
  await requireRole("super_admin", "admin");
  const sb = await createClient();
  await sb.from("qr_codes").delete().eq("id", z.uuid().parse(fd.get("id")));
  revalidatePath("/admin/qr");
  redirect("/admin/qr");
}
