"use client";
import { useEffect, useRef, useState } from "react";
import { Field, input } from "@/components/ui";
import { validateValidUntil } from "@/lib/validation";

/** Regras do QR: limite de leituras e validade. "Ilimitado"/"Sem validade" desativam (e acinzentam) o campo. */
export function LimitFields({ defaultMax, defaultValidUntil, batchExpires, locked = false }:
  { defaultMax: number | null; defaultValidUntil: string; batchExpires?: string | null; locked?: boolean }) {
  const [unlimited, setUnlimited] = useState(defaultMax === null);
  const [noExpiry, setNoExpiry] = useState(!defaultValidUntil);
  const [value, setValue] = useState(defaultValidUntil);
  const ref = useRef<HTMLInputElement>(null);

  // QR já vencido: não acusa erro enquanto a data não for alterada
  const error = noExpiry || locked || (value && value === defaultValidUntil) ? null : (value ? validateValidUntil(value, batchExpires) : null);

  useEffect(() => { ref.current?.setCustomValidity(error ?? ""); }, [error, noExpiry]);

  return (
    <>
      <div className="space-y-2">
        <Field label="Máx. de leituras" hint={unlimited ? "Indisponível: leituras ilimitadas" : "Após esse número o QR é desativado"}>
          <input name="max_scans" type="number" min={1} defaultValue={defaultMax ?? 3} required={!unlimited}
            disabled={locked || unlimited} className={input} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="unlimited" checked={unlimited} disabled={locked} onChange={(e) => setUnlimited(e.target.checked)} />
          Leituras ilimitadas
        </label>
      </div>
      <div className="space-y-2">
        <Field label="Válido até" hint={noExpiry ? "Indisponível: sem validade" : error ? undefined : "Depois dessa data e hora (horário de Brasília) o QR expira"}>
          <input ref={ref} name="valid_until" type="datetime-local" defaultValue={defaultValidUntil} required={!noExpiry}
            onChange={(e) => setValue(e.target.value)} aria-invalid={!!error}
            disabled={locked || noExpiry} className={`${input} ${error ? "border-red-400 focus:border-red-500" : ""}`} />
        </Field>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">⚠ {error}</p>}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="no_expiry" checked={noExpiry} disabled={locked} onChange={(e) => setNoExpiry(e.target.checked)} />
          Sem validade
        </label>
      </div>
    </>
  );
}
