import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireStaff, canManage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { qrPayload, FLOW_LABEL, type QrFlow } from "@/lib/qr";
import { Card, PageHead, Field, input, btn, btnDanger, btnGhost, Badge, statusTone } from "@/components/ui";
import { LimitFields } from "@/components/limit-fields";
import { updateQr, deleteQr, resetScans } from "../actions";

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export default async function QrDetail({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  const { id } = await params;
  const sb = await createClient();
  const [{ data: qr }, { data: scans }] = await Promise.all([
    sb.from("qr_codes").select("*, products(name), batches(batch_number)").eq("id", id).maybeSingle(),
    sb.from("scan_events").select("id, result, created_at").eq("qr_code_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  if (!qr) notFound();
  const flow = qr.flow as QrFlow;
  const svg = await QRCode.toString(qrPayload(qr.code, flow), { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  const can = canManage(staff.role);

  return (
    <>
      <PageHead title={`QR ${qr.code}`} />
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <Card>
          <div className="w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-2 break-all text-center font-mono text-xs">{qrPayload(qr.code, flow)}</p>
          <p className="mt-1 text-center text-xs text-slate-500">Fluxo: {FLOW_LABEL[flow]}</p>
          <p className="mt-2 text-center"><Badge tone={statusTone(qr.status)}>{qr.status}</Badge></p>
        </Card>
        <Card title="Configuração">
          <form action={updateQr} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="id" value={qr.id} />
            <Field label="Status">
              <select name="status" defaultValue={["exhausted", "expired"].includes(qr.status) ? "disabled" : qr.status} disabled={!can} className={input}>
                <option value="active">Ativo</option><option value="disabled">Desativado</option><option value="revoked">Revogado</option>
              </select>
            </Field>
            <Field label="Rótulo"><input name="label" defaultValue={qr.label ?? ""} disabled={!can} className={input} /></Field>
            <LimitFields defaultMax={qr.max_scans} defaultValidUntil={toLocal(qr.valid_until)} locked={!can} />
            <Field label="Mensagem ao consumidor"><input name="custom_message" defaultValue={qr.custom_message ?? ""} disabled={!can} className={input} /></Field>
            {can && <div className="md:col-span-2"><button className={btn}>Salvar</button></div>}
          </form>
          {can && (
            <div className="mt-4 flex gap-2">
              <form action={resetScans}><input type="hidden" name="id" value={qr.id} /><button className={btnGhost}>Zerar leituras e reativar</button></form>
              <form action={deleteQr}><input type="hidden" name="id" value={qr.id} /><button className={btnDanger}>Excluir</button></form>
            </div>
          )}
        </Card>
      </div>
      <Card title="Últimas leituras" className="mt-6">
        <ul className="divide-y text-sm">
          {(scans ?? []).map((s) => <li key={s.id} className="flex justify-between py-2"><Badge tone={statusTone(s.result)}>{s.result}</Badge><span className="text-slate-400">{new Date(s.created_at).toLocaleString("pt-BR")}</span></li>)}
          {!scans?.length && <li className="py-2 text-slate-400">Sem leituras.</li>}
        </ul>
      </Card>
    </>
  );
}
