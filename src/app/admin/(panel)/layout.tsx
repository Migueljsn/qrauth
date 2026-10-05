import { AdminNav } from "@/components/admin-nav";
import { requireStaff, canManage } from "@/lib/auth";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const links = [
    ["/admin", "Dashboard"],
    ["/admin/products", "Produtos"],
    ["/admin/batches", "Lotes & Estoque"],
    ["/admin/qr", "QR Codes"],
    ["/admin/scans", "Leituras"],
    ...(staff.role === "super_admin" ? [["/admin/users", "Usuários"]] : []),
    ...(canManage(staff.role) ? [["/admin/categories", "Categorias"]] : []),
  ];
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900 md:flex">
      <aside className="bg-[#2e2760] p-4 text-white md:min-h-dvh md:w-56">
        <p className="mb-4 text-lg font-extrabold">QRAuth</p>
        <AdminNav links={links as [string, string][]} />
        <form action={logout} className="mt-6 border-t border-white/20 pt-3 text-xs">
          <p className="truncate">{staff.full_name || staff.email}</p>
          <p className="mb-2 text-white/60">{staff.role}</p>
          <button className="rounded bg-white/10 px-3 py-1 hover:bg-white/20">Sair</button>
        </form>
      </aside>
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
