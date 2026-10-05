import QRCode from "qrcode";
import { requireStaff } from "@/lib/auth";
import { entryUrl } from "@/lib/qr";
import { Card, PageHead, btn, btnGhost } from "@/components/ui";

export default async function EntryQrPage() {
  await requireStaff();
  const url = entryUrl();
  const opts = { margin: 2, errorCorrectionLevel: "H" as const };
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { ...opts, type: "svg" }),
    QRCode.toDataURL(url, { ...opts, width: 1200 }),
  ]);
  const svgHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return (
    <>
      <PageHead title="QR de entrada" />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card>
          <div className="w-full [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-2 break-all text-center font-mono text-xs">{url}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 print:hidden">
            <a href={png} download="qr-entrada.png" className={btn}>Baixar PNG</a>
            <a href={svgHref} download="qr-entrada.svg" className={btnGhost}>Baixar SVG</a>
          </div>
        </Card>
        <Card title="Como usar">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Imprima <b>este QR (o mesmo em todos os produtos)</b> na embalagem, com a chamada &quot;Escaneie para autenticar&quot;.</li>
            <li>O cliente lê com a câmera do celular e abre o site, com o botão <b>Autenticar</b>.</li>
            <li>Ele toca em Autenticar, o site abre a câmera e ele lê o <b>QR único</b> do produto.</li>
            <li>Só então aparece &quot;Autêntico&quot; (ou o alerta).</li>
          </ol>
          <p className="mt-4 text-sm text-slate-500">
            Vale para QR Codes gerados com o fluxo <b>&quot;Com câmera do site&quot;</b>. No fluxo <b>&quot;Direto&quot;</b> o QR único já abre o resultado e este QR não é necessário.
            O endereço vem de <code>NEXT_PUBLIC_SITE_URL</code>.
          </p>
        </Card>
      </div>
    </>
  );
}
