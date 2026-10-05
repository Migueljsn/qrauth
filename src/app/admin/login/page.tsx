"use client";
import { useActionState, useState } from "react";
import { login } from "./actions";
import { btn, input } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";
import { Turnstile } from "@/components/turnstile";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  const [token, setToken] = useState("");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#4a3f8a] p-5">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-7 shadow-xl">
        <h1 className="text-center text-2xl font-extrabold">QRAuth · Admin</h1>
        <input name="email" type="email" required autoComplete="username" placeholder="E-mail" className={input} />
        <PasswordInput name="password" required placeholder="Senha" />
        <Turnstile onToken={setToken} />
        <input type="hidden" name="cf-turnstile-token" value={token} />
        {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending || !token} className={`${btn} w-full py-3`}>{pending ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
