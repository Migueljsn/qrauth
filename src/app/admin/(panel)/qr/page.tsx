import Link from "next/link";
import { requireStaff, canManage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Badge, statusTone, btn, btnGhost, input } from "@/components/ui";
import { STATUS_LABEL } from "@/lib/qr";
import { GenerateForm } from "./generate-form";

const PAGE = 50;

export default async function QrPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string; batch?: string; page?: string }> }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sb = await createClient();

  let q = sb.from("qr_codes")
    .select("id, code, kind, label, scan_count, max_scans, status, products(name), batches(batch_number)", { count: "exact" })
    .order("created_at", { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.batch) q = q.eq("batch_id", sp.batch);

  const [{ data: rows, count }, { data: products }, { data: batches }] = await Promise.all([
    q,
    sb.from("products").select("id, name").eq("active", true).order("name"),
    sb.from("batches").select("id, batch_number, product_id").order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <PageHead title="QR Codes">
        {sp.batch && <Link href={`/admin/qr/print?batch=${sp.batch}`} className={btn}>Imprimir lote</Link>}
      </PageHead>
      {sp.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>}
      {canManage(staff.role) && (
        <Card title="Gerar QR Codes">
          <GenerateForm
            products={(products ?? []).map((p) => ({ id: p.id, label: p.name }))}
            batches={(batches ?? []).map((b) => ({ id: b.id, label: b.batch_number, product_id: b.product_id }))} />
        </Card>
      )}
      <Card className="mt-6">
        <form className="mb-3 flex flex-wrap gap-2">
          <select name="status" defaultValue={sp.status ?? ""} className={`${input} w-40`}>
            <option value="">Todos status</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select name="batch" defaultValue={sp.batch ?? ""} className={`${input} w-48`}>
            <option value="">Todos os lotes</option>
            {(batches ?? []).map((b) => <option key={b.id} value={b.id}>{b.batch_number}</option>)}
          </select>
          <button className={btnGhost}>Filtrar</button>
        </form>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500"><tr><th className="py-2">Código</th><th>Tipo</th><th>Produto / Lote</th><th>Leituras</th><th>Status</th><th /></tr></thead>
          <tbody className="divide-y">
            {(rows ?? []).map((r) => (
              <tr key={r.id}>
                <td className="py-2 font-mono font-semibold">{r.code}</td>
                <td>{r.kind === "batch" ? "Lote" : "Unitário"}</td>
                <td>{(r.products as unknown as { name: string })?.name} · {(r.batches as unknown as { batch_number: string } | null)?.batch_number ?? "—"}{r.label ? ` · ${r.label}` : ""}</td>
                <td>{r.scan_count}/{r.max_scans ?? "∞"}</td>
                <td><Badge tone={statusTone(r.status)}>{STATUS_LABEL[r.status]}</Badge></td>
                <td className="text-right"><Link href={`/admin/qr/${r.id}`} className={btnGhost}>Abrir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>{count ?? 0} QR Codes</span>
          <span className="flex gap-2">
            {page > 1 && <Link className={btnGhost} href={{ query: { ...sp, page: page - 1 } }}>←</Link>}
            {page * PAGE < (count ?? 0) && <Link className={btnGhost} href={{ query: { ...sp, page: page + 1 } }}>→</Link>}
          </span>
        </div>
      </Card>
    </>
  );
}
