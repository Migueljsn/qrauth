import type { ReactNode } from "react";

export const btn = "rounded-lg bg-[#4a3f8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b3270] disabled:opacity-50";
export const btnGhost = "rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50";
export const btnDanger = "rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700";
export const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#4a3f8a] focus:outline-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:placeholder:text-slate-300";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-3 font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "green" | "red" | "amber" | "slate" }) {
  const t = { green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800", amber: "bg-amber-100 text-amber-800", slate: "bg-slate-100 text-slate-700" }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

export const statusTone = (s: string) =>
  s === "active" || s === "authentic" ? "green" : s === "exhausted" || s === "expired" ? "amber" : "red";
