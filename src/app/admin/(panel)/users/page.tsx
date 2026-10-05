import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHead, input, btn, btnDanger } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";
import { updateUser, deleteUser } from "./actions";
import { NewUserForm } from "./user-form";

export default async function UsersPage() {
  const me = await requireRole("super_admin");
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at");
  return (
    <>
      <PageHead title="Usuários" />
      <Card title="Novo usuário"><NewUserForm /></Card>
      <div className="mt-6 space-y-3">
        {(users ?? []).map((u) => (
          <Card key={u.id}>
            <form action={updateUser} className="grid items-end gap-3 md:grid-cols-[1fr_9rem_1fr_auto_auto]">
              <input type="hidden" name="id" value={u.id} />
              <input name="full_name" defaultValue={u.full_name} className={input} aria-label="Nome" />
              <select name="role" defaultValue={u.role} className={input} aria-label="Papel">
                <option value="operator">operator</option><option value="admin">admin</option><option value="super_admin">super_admin</option>
              </select>
              <PasswordInput name="password" placeholder="Nova senha (opcional)" minLength={10} autoComplete="new-password" generator />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={u.active} /> Ativo</label>
              <button className={btn}>Salvar</button>
            </form>
            {u.id !== me.id && (
              <form action={deleteUser} className="mt-2 text-right">
                <input type="hidden" name="id" value={u.id} />
                <button className={btnDanger}>Remover</button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
