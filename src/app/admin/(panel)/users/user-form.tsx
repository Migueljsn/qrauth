"use client";
import { useActionState } from "react";
import { createUser } from "./actions";
import { btn, input, Field } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";

export function NewUserForm() {
  const [state, action, pending] = useActionState(createUser, null);
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Field label="Nome"><input name="full_name" required className={input} /></Field>
      <Field label="E-mail"><input name="email" type="email" required className={input} /></Field>
      <Field label="Senha inicial" hint="Mínimo 10 caracteres"><PasswordInput name="password" required minLength={10} autoComplete="new-password" generator /></Field>
      <Field label="Papel">
        <select name="role" className={input} defaultValue="operator">
          <option value="operator">Operador (somente leitura + estoque)</option>
          <option value="admin">Admin (CRUD de produtos e QR)</option>
          <option value="super_admin">Super admin (gerencia usuários)</option>
        </select>
      </Field>
      <div className="md:col-span-2 flex items-center gap-3">
        <button disabled={pending} className={btn}>Criar usuário</button>
        {state && "error" in state && <span className="text-sm text-red-600">{state.error}</span>}
        {state && "ok" in state && <span className="text-sm text-green-700">Usuário criado.</span>}
      </div>
    </form>
  );
}
