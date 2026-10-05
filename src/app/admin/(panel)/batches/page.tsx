import { requireStaff, canManage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Field, input, btn, btnDanger } from "@/components/ui";
import { createBatch, deleteBatch, addMovement } from "./actions";

export default async function BatchesPage() {
  const staff = await requireStaff();
  const sb = await createClient();
  const [{ data: products }, { data: batches }, { data: stock }, { data: moves }] = await Promise.all([
    sb.from("products").select("id, name").eq("active", true).order("name"),
    sb.from("batches").select("id, batch_number, quantity, expires_at, products(name)").order("created_at", { ascending: false }),
    sb.from("stock_levels").select("*").order("name"),
    sb.from("stock_movements").select("id, type, quantity, note, created_at, products(name)").order("created_at", { ascending: false }).limit(15),
  ]);
  return (
    <>
      <PageHead title="Lotes & Estoque" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Estoque atual">
          <ul className="divide-y text-sm">
            {(stock ?? []).map((s) => <li key={s.product_id} className="flex justify-between py-2"><span>{s.name}</span><b>{s.stock}</b></li>)}
          </ul>
        </Card>
        <Card title="Movimentar estoque">
          <form action={addMovement} className="grid gap-3 sm:grid-cols-2">
            <Field label="Produto"><select name="product_id" required className={input}>{(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Lote (opcional)"><select name="batch_id" className={input}><option value="">—</option>{(batches ?? []).map((b) => <option key={b.id} value={b.id}>{b.batch_number}</option>)}</select></Field>
            <Field label="Tipo"><select name="type" className={input}><option value="in">Entrada</option><option value="out">Saída</option><option value="adjust">Ajuste (+/−)</option></select></Field>
            <Field label="Quantidade"><input name="quantity" type="number" required className={input} /></Field>
            <div className="sm:col-span-2"><Field label="Observação"><input name="note" className={input} /></Field></div>
            <button className={btn}>Registrar</button>
          </form>
        </Card>
      </div>
      {canManage(staff.role) && (
        <Card title="Novo lote" className="mt-6">
          <form action={createBatch} className="grid gap-3 md:grid-cols-3">
            <Field label="Produto"><select name="product_id" required className={input}>{(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Nº do lote"><input name="batch_number" required className={input} /></Field>
            <Field label="Quantidade produzida"><input name="quantity" type="number" min={0} defaultValue={0} className={input} /></Field>
            <Field label="Fabricação"><input name="manufactured_at" type="date" className={input} /></Field>
            <Field label="Validade"><input name="expires_at" type="date" className={input} /></Field>
            <Field label="Notas"><input name="notes" className={input} /></Field>
            <button className={btn}>Criar lote</button>
          </form>
        </Card>
      )}
      <Card title="Lotes" className="mt-6">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500"><tr><th className="py-2">Lote</th><th>Produto</th><th>Qtd</th><th>Validade</th><th /></tr></thead>
          <tbody className="divide-y">
            {(batches ?? []).map((b) => (
              <tr key={b.id}><td className="py-2 font-mono">{b.batch_number}</td>
                <td>{(b.products as unknown as { name: string })?.name}</td><td>{b.quantity}</td>
                <td>{b.expires_at ? new Date(b.expires_at).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"}</td>
                <td className="text-right">{canManage(staff.role) && <form action={deleteBatch}><input type="hidden" name="id" value={b.id} /><button className={btnDanger}>Excluir</button></form>}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Últimas movimentações" className="mt-6">
        <ul className="divide-y text-sm">{(moves ?? []).map((m) => (
          <li key={m.id} className="flex justify-between py-2"><span>{(m.products as unknown as { name: string })?.name} · {m.type} {m.quantity}</span><span className="text-slate-400">{m.note}</span></li>))}</ul>
      </Card>
    </>
  );
}
