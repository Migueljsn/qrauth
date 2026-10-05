"use client";
import { useState } from "react";
import { Field, input, btn } from "@/components/ui";
import { LimitFields } from "@/components/limit-fields";
import { generateQr } from "./actions";

type Opt = { id: string; label: string; product_id?: string };

export function GenerateForm({ products, batches }: { products: Opt[]; batches: Opt[] }) {
  const [kind, setKind] = useState<"batch" | "unit">("unit");
  const [flow, setFlow] = useState<"direct" | "camera">("camera");
  const [product, setProduct] = useState(products[0]?.id ?? "");
  return (
    <form action={generateQr} className="grid gap-3 md:grid-cols-3">
      <Field label="Tipo">
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value as "batch" | "unit")} className={input}>
          <option value="unit">Unitário (1 QR por produto do lote)</option>
          <option value="batch">Lote (1 QR para o lote inteiro)</option>
        </select>
      </Field>
      <Field label="Fluxo de leitura" hint={flow === "camera" ? "QR grava só o código; valida só na câmera do site (use também o QR de entrada)" : "QR grava a URL; a câmera do celular já mostra o resultado"}>
        <select name="flow" value={flow} onChange={(e) => setFlow(e.target.value as "direct" | "camera")} className={input}>
          <option value="camera">Com câmera do site (QR de entrada + QR único)</option>
          <option value="direct">Direto (1 QR com link)</option>
        </select>
      </Field>
      <Field label="Produto">
        <select name="product_id" required value={product} onChange={(e) => setProduct(e.target.value)} className={input}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </Field>
      <Field label="Lote" hint="Obrigatório para QR unitário">
        <select name="batch_id" required={kind === "unit"} className={input}>
          <option value="">—</option>
          {batches.filter((b) => b.product_id === product).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </Field>
      {kind === "unit" && <Field label="Quantidade de QR (máx. 10.000)" hint="Padrão: 1 por vez"><input name="quantity" type="number" min={1} max={10000} defaultValue={1} className={input} /></Field>}
      <LimitFields defaultMax={3} defaultValidUntil="" />
      <Field label="Prefixo do rótulo"><input name="label_prefix" placeholder="Caixa 3" className={input} /></Field>
      <Field label="Mensagem ao consumidor"><input name="custom_message" className={input} /></Field>
      <div className="md:col-span-3"><button className={btn}>Gerar QR Codes</button></div>
    </form>
  );
}
