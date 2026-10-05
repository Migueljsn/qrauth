import { Field, input, btn } from "@/components/ui";
import { saveProduct } from "./actions";

type P = { id?: string; name?: string; sku?: string | null; category_id?: string | null; description?: string | null;
  image_url?: string | null; attributes?: Record<string, string>; active?: boolean };

export function ProductForm({ product, categories }: { product?: P; categories: { id: string; name: string }[] }) {
  const attrs = Object.entries(product?.attributes ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n");
  return (
    <form action={saveProduct} className="grid gap-3 md:grid-cols-2">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <Field label="Nome"><input name="name" required defaultValue={product?.name} className={input} /></Field>
      <Field label="SKU"><input name="sku" defaultValue={product?.sku ?? ""} className={input} /></Field>
      <Field label="Categoria">
        <select name="category_id" defaultValue={product?.category_id ?? ""} className={input}>
          <option value="">— sem categoria —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="URL da imagem (https)"><input name="image_url" defaultValue={product?.image_url ?? ""} className={input} /></Field>
      <div className="md:col-span-2"><Field label="Descrição (exibida ao consumidor)"><textarea name="description" rows={3} defaultValue={product?.description ?? ""} className={input} /></Field></div>
      <div className="md:col-span-2"><Field label="Atributos" hint='Um por linha, "chave: valor". Ex.: dosagem: 15 mg'><textarea name="attributes" rows={3} defaultValue={attrs} className={input} /></Field></div>
      <div className="flex items-center gap-4 md:col-span-2">
        {product?.id && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={product.active} /> Ativo</label>}
        <button className={btn}>Salvar produto</button>
      </div>
    </form>
  );
}
