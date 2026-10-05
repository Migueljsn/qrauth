"use client";
import { useEffect, useId, useRef, useState } from "react";

/** Botão "?" com explicação: abre ao passar o mouse, focar (teclado) ou tocar (celular). */
export function InfoTip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label={`O que é: ${label}`} aria-expanded={open} aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500 hover:border-[#4a3f8a] hover:text-[#4a3f8a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a3f8a]">
        ?
      </button>
      {open && (
        <span role="tooltip" id={id}
          className="absolute right-0 top-6 z-20 w-56 rounded-lg bg-slate-900 p-3 text-left text-xs font-normal leading-relaxed text-white shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
