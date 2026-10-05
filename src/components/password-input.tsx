"use client";
import { useState } from "react";
import { input } from "@/components/ui";

function strongPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
  const buf = crypto.getRandomValues(new Uint32Array(16));
  return Array.from(buf, (n) => chars[n % chars.length]).join("");
}

/** Campo de senha com mostrar/ocultar (e gerador opcional). */
export function PasswordInput({ name, placeholder, required, minLength, autoComplete = "current-password", generator = false }:
  { name: string; placeholder?: string; required?: boolean; minLength?: number; autoComplete?: string; generator?: boolean }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-1">
      <div className="relative flex-1">
        <input name={name} type={show ? "text" : "password"} value={value} onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder} required={required} minLength={minLength} autoComplete={autoComplete}
          className={`${input} pr-16`} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
          {show ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {generator && (
        <button type="button" onClick={() => { setValue(strongPassword()); setShow(true); }}
          className="rounded-lg border border-slate-300 px-2 text-xs hover:bg-slate-50">Gerar</button>
      )}
    </div>
  );
}
