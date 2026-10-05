import QRCode from "qrcode";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { qrPayload } from "@/lib/qr";

export default async function PrintPage({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  await requireStaff();
  const { batch } = await searchParams;
  const sb = await createClient();
  let q = sb.from("qr_codes").select("code, label").order("created_at").limit(2000);
  if (batch) q = q.eq("batch_id", batch);
  const { data } = await q;
  const items = await Promise.all((data ?? []).map(async (r) => ({
    ...r, svg: await QRCode.toString(qrPayload(r.code), { type: "svg", margin: 1, errorCorrectionLevel: "M" }),
  })));
  return (
    <div className="bg-white p-4 text-black">
      <p className="mb-3 text-sm print:hidden">{items.length} etiquetas — use Ctrl/Cmd+P para imprimir.</p>
      <div className="grid grid-cols-4 gap-3 print:gap-2">
        {items.map((i) => (
          <div key={i.code} className="break-inside-avoid border p-2 text-center">
            <div className="mx-auto w-28 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: i.svg }} />
            <p className="font-mono text-[10px]">{i.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
