"use client";
import { useState } from "react";
import { Field, input } from "@/components/ui";

/** Regras do QR: limite de leituras e validade. "Ilimitado"/"Sem validade" desativam (e acinzentam) o campo. */
export function LimitFields({ defaultMax, defaultValidUntil, locked = false }:
  { defaultMax: number | null; defaultValidUntil: string; locked?: boolean }) {
  const [unlimited, setUnlimited] = useState(defaultMax === null);
  const [noExpiry, setNoExpiry] = useState(!defaultValidUntil);

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
        <Field label="Válido até" hint={noExpiry ? "Indisponível: sem validade" : "Depois dessa data o QR expira"}>
          <input name="valid_until" type="datetime-local" defaultValue={defaultValidUntil} required={!noExpiry}
            disabled={locked || noExpiry} className={input} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="no_expiry" checked={noExpiry} disabled={locked} onChange={(e) => setNoExpiry(e.target.checked)} />
          Sem validade
        </label>
      </div>
    </>
  );
}
