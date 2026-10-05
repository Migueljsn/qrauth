import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Field, input, btn, btnDanger } from "@/components/ui";
import { saveCategory, deleteCategory } from "./actions";

export default async function CategoriesPage() {
  await requireRole("super_admin", "admin");
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("name");
  return (
    <>
      <PageHead title="Categorias" />
      <Card title="Nova categoria">
        <form action={saveCategory} className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <Field label="Nome"><input name="name" required className={input} /></Field>
          <Field label="Descrição"><input name="description" className={input} /></Field>
          <button className={btn}>Adicionar</button>
        </form>
      </Card>
      <div className="mt-6 space-y-3">
        {(data ?? []).map((c) => (
          <Card key={c.id}>
            <form action={saveCategory} className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} required className={input} />
              <input name="description" defaultValue={c.description ?? ""} className={input} />
              <button className={btn}>Salvar</button>
            </form>
            <form action={deleteCategory} className="mt-2 text-right"><input type="hidden" name="id" value={c.id} /><button className={btnDanger}>Excluir</button></form>
          </Card>
        ))}
      </div>
    </>
  );
}
