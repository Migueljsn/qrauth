import Link from "next/link";
import { requireStaff, canManage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, Badge, btn } from "@/components/ui";
import { ProductForm } from "./product-form";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const staff = await requireStaff();
  const { error } = await searchParams;
  const sb = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    sb.from("products").select("id, name, sku, active, categories(name)").order("name"),
    sb.from("categories").select("id, name").order("name"),
  ]);
  return (
    <>
      <PageHead title="Produtos" />
      {error === "in_use" && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Produto possui lotes/QR vinculados. Desative-o em vez de excluir.</p>}
      {canManage(staff.role) && <Card title="Novo produto"><ProductForm categories={categories ?? []} /></Card>}
      <Card className="mt-6">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500"><tr><th className="py-2">Produto</th><th>SKU</th><th>Categoria</th><th>Status</th><th /></tr></thead>
          <tbody className="divide-y">
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <td className="py-2 font-semibold">{p.name}</td><td>{p.sku ?? "—"}</td>
                <td>{(p.categories as unknown as { name: string } | null)?.name ?? "—"}</td>
                <td><Badge tone={p.active ? "green" : "slate"}>{p.active ? "ativo" : "inativo"}</Badge></td>
                <td className="text-right">{canManage(staff.role) && <Link href={`/admin/products/${p.id}`} className={btn}>Editar</Link>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
