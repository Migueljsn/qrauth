import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, btnDanger } from "@/components/ui";
import { ProductForm } from "../product-form";
import { deleteProduct } from "../actions";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("super_admin", "admin");
  const { id } = await params;
  const sb = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    sb.from("products").select("*").eq("id", id).maybeSingle(),
    sb.from("categories").select("id, name").order("name"),
  ]);
  if (!product) notFound();
  return (
    <>
      <PageHead title={`Editar: ${product.name}`} />
      <Card><ProductForm product={product} categories={categories ?? []} /></Card>
      <form action={deleteProduct} className="mt-4"><input type="hidden" name="id" value={product.id} /><button className={btnDanger}>Excluir produto</button></form>
    </>
  );
}
