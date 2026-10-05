"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { VerifyResult } from "@/lib/verify";
import { Turnstile } from "@/components/turnstile";

type State = { status: "loading" } | { status: "done"; data: VerifyResult } | { status: "error" };

const FAIL: Record<string, { title: string; text: string }> = {
  not_found: { title: "NÃO AUTÊNTICO", text: "Este código não existe em nossa base. O produto pode ser falsificado. Não consuma e denuncie ao fabricante." },
  exhausted: { title: "ATENÇÃO — LIMITE EXCEDIDO", text: "Este QR Code já atingiu o número máximo de leituras. O produto pode ter sido copiado ou reutilizado." },
  expired: { title: "CÓDIGO EXPIRADO", text: "A validade deste QR Code terminou." },
  disabled: { title: "CÓDIGO DESATIVADO", text: "Este QR Code foi desativado pelo fabricante." },
  revoked: { title: "CÓDIGO REVOGADO", text: "Este QR Code foi revogado pelo fabricante. Não use o produto." },
  rate_limited: { title: "MUITAS TENTATIVAS", text: "Aguarde um minuto e tente novamente." },
};

export function VerifyView({ code }: { code: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [token, setToken] = useState("");
  const fired = useRef(false);

  useEffect(() => {
    if (!token || fired.current) return; // espera o Turnstile; evita leitura dupla (StrictMode)
    fired.current = true;
    fetch("/api/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, token }),
    })
      .then(async (r) => (r.status === 500 || r.status === 403 ? setState({ status: "error" }) : setState({ status: "done", data: await r.json() })))
      .catch(() => setState({ status: "error" }));
  }, [code, token]);

  if (state.status === "loading")
    return <Shell><p className="pt-24 pb-4 text-center text-slate-500">Verificando…</p><Turnstile onToken={setToken} /></Shell>;
  if (state.status === "error")
    return <Shell><p className="py-24 text-center text-red-600">Erro ao verificar. Tente novamente.</p></Shell>;

  const d = state.data;
  if (d.result !== "authentic") {
    const f = FAIL[d.result];
    return (
      <Shell>
        <div className="m-4 rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <p className="text-xl font-extrabold text-red-700">✖ {f.title}</p>
          {d.code && <p className="mt-1 text-sm text-slate-600">Código: {d.code}</p>}
          <p className="mt-3 text-sm text-slate-700">{f.text}</p>
        </div>
        <ScanAgain />
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="py-4 text-center text-xl font-bold">{d.product.name}</h1>
      <div className="flex items-center gap-3 border-y bg-slate-50 px-4 py-3">
        <span className="text-3xl">🛡️</span>
        <div className="flex-1">
          <p className="font-extrabold text-green-700">AUTÊNTICO</p>
          <p className="text-sm">CÓDIGO: {d.code}</p>
        </div>
      </div>
      {!d.first_scan && !d.unlimited && (
        <p className="mx-4 mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Este código já foi lido {d.scan_count - 1}x antes. Restam {d.remaining_scans} leitura(s).
        </p>
      )}
      {d.product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={d.product.image_url} alt={d.product.name} className="mx-auto mt-4 max-h-72 object-contain" />
      )}
      <div className="space-y-3 p-4 text-sm leading-relaxed">
        {d.product.description && <p>{d.product.description}</p>}
        {Object.entries(d.product.attributes ?? {}).map(([k, v]) => (
          <p key={k} className="text-slate-500"><b className="capitalize">{k}:</b> {v}</p>
        ))}
        {d.batch && (
          <p className="text-slate-500">
            Lote <b>{d.batch.number}</b>
            {d.batch.expires_at && <> · Validade {new Date(d.batch.expires_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</>}
          </p>
        )}
        {d.custom_message && <p className="rounded-lg bg-slate-100 p-3">{d.custom_message}</p>}
      </div>
      <ScanAgain />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-dvh max-w-md bg-white text-slate-900">{children}</main>;
}
function ScanAgain() {
  return (
    <div className="p-4">
      <Link href="/scan" className="block rounded-xl bg-[#4a3f8a] py-3 text-center font-bold text-white">
        Verificar outro produto
      </Link>
    </div>
  );
}
