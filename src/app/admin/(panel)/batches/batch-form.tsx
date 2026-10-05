"use client";
import { useEffect, useRef, useState } from "react";
import { Field, input, btn } from "@/components/ui";
import { validateBatchDates } from "@/lib/validation";
import { createBatch } from "./actions";

export function BatchForm({ products }: { products: { id: string; name: string }[] }) {
  const [manufactured, setManufactured] = useState("");
  const [expires, setExpires] = useState("");
  const mRef = useRef<HTMLInputElement>(null);
  const eRef = useRef<HTMLInputElement>(null);
  const errs = validateBatchDates(manufactured, expires);

  useEffect(() => { mRef.current?.setCustomValidity(errs.manufactured ?? ""); eRef.current?.setCustomValidity(errs.expires ?? ""); },
    [errs.manufactured, errs.expires]);

  const bad = (m: string | null) => (m ? "border-red-400 focus:border-red-500" : "");
  return (
    <form action={createBatch} className="grid gap-3 md:grid-cols-3">
      <Field label="Produto"><select name="product_id" required className={input}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      <Field label="Nº do lote"><input name="batch_number" required className={input} /></Field>
      <Field label="Quantidade produzida"><input name="quantity" type="number" min={0} defaultValue={0} className={input} /></Field>
      <div className="space-y-2">
        <Field label="Fabricação" hint={errs.manufactured ? undefined : "Não pode ser uma data futura"}>
          <input ref={mRef} name="manufactured_at" type="date" value={manufactured} onChange={(e) => setManufactured(e.target.value)}
            aria-invalid={!!errs.manufactured} className={`${input} ${bad(errs.manufactured)}`} />
        </Field>
        {errs.manufactured && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">⚠ {errs.manufactured}</p>}
      </div>
      <div className="space-y-2">
        <Field label="Validade" hint={errs.expires ? undefined : "Precisa ser depois da fabricação e não pode ter passado"}>
          <input ref={eRef} name="expires_at" type="date" value={expires} onChange={(e) => setExpires(e.target.value)}
            aria-invalid={!!errs.expires} className={`${input} ${bad(errs.expires)}`} />
        </Field>
        {errs.expires && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">⚠ {errs.expires}</p>}
      </div>
      <Field label="Notas"><input name="notes" className={input} /></Field>
      <button className={btn}>Criar lote</button>
    </form>
  );
}
