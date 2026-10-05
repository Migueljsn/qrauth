import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Badge, statusTone } from "@/components/ui";
import { InfoTip } from "@/components/info-tip";

type Stats = Record<string, number>;

export default async function Dashboard() {
  const supabase = await createClient();
  const [{ data: stats }, { data: recent }] = await Promise.all([
    supabase.rpc("dashboard_stats"),
    supabase.from("scan_events").select("id, code, result, created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const s = (stats ?? {}) as Stats;
  const cards: [string, number, string][] = [
    ["Produtos ativos", s.products, "Produtos cadastrados e marcados como ativos. Produtos inativos não entram na contagem."],
    ["Lotes", s.batches, "Total de lotes de produção cadastrados, de todos os produtos."],
    ["QR Codes", s.qr_total, "Total de QR Codes já gerados (de lote e unitários), em qualquer status."],
    ["QR ativos", s.qr_active, "QR Codes que ainda podem ser lidos e confirmados como autênticos: não foram desativados, revogados, esgotados nem expiraram."],
    ["QR esgotados", s.qr_exhausted, "QR Codes que atingiram o limite de leituras definido. Novas leituras mostram alerta ao consumidor, pois o produto pode ter sido copiado."],
    ["Leituras (24h)", s.scans_24h, "Todas as verificações feitas nas últimas 24 horas, incluindo as autênticas e as suspeitas."],
    ["Suspeitas (24h)", s.suspicious_24h, "Leituras das últimas 24 horas que não deram autêntico: código inexistente, limite excedido, QR revogado ou excesso de tentativas bloqueado."],
  ];
  return (
    <>
      <PageHead title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, n, help]) => (
          <Card key={label}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-500">{label}</p>
              <InfoTip text={help} label={label} />
            </div>
            <p className="text-3xl font-extrabold">{n ?? 0}</p>
          </Card>
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
