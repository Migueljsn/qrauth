import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Badge, statusTone } from "@/components/ui";

export default async function ScansPage() {
  await requireStaff();
  const sb = await createClient();
  const { data } = await sb.from("scan_events").select("id, code, result, created_at").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHead title="Leituras" />
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500"><tr><th className="py-2">Código</th><th>Resultado</th><th>Quando</th></tr></thead>
          <tbody className="divide-y">
            {(data ?? []).map((s) => (
              <tr key={s.id}><td className="py-2 font-mono">{s.code}</td><td><Badge tone={statusTone(s.result)}>{s.result}</Badge></td><td className="text-slate-500">{new Date(s.created_at).toLocaleString("pt-BR")}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
