import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Badge, statusTone } from "@/components/ui";

type Stats = Record<string, number>;

export default async function Dashboard() {
  const supabase = await createClient();
  const [{ data: stats }, { data: recent }] = await Promise.all([
    supabase.rpc("dashboard_stats"),
    supabase.from("scan_events").select("id, code, result, created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const s = (stats ?? {}) as Stats;
  const cards: [string, number][] = [
    ["Produtos ativos", s.products], ["Lotes", s.batches], ["QR Codes", s.qr_total],
    ["QR ativos", s.qr_active], ["QR esgotados", s.qr_exhausted],
    ["Leituras (24h)", s.scans_24h], ["Suspeitas (24h)", s.suspicious_24h],
  ];
  return (
    <>
      <PageHead title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, n]) => (
          <Card key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-3xl font-extrabold">{n ?? 0}</p></Card>
        ))}
      </div>
      <Card title="Últimas leituras" className="mt-6">
        <ul className="divide-y text-sm">
          {(recent ?? []).map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2">
              <span className="font-mono">{e.code}</span>
              <Badge tone={statusTone(e.result)}>{e.result}</Badge>
              <span className="text-slate-400">{new Date(e.created_at).toLocaleString("pt-BR")}</span>
            </li>
          ))}
          {!recent?.length && <li className="py-2 text-slate-400">Nenhuma leitura ainda.</li>}
        </ul>
      </Card>
    </>
  );
}
