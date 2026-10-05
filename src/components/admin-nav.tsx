"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Menu lateral com destaque da aba atual (/admin só é ativo na rota exata). */
export function AdminNav({ links }: { links: [string, string][] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 md:flex-col">
      {links.map(([href, label]) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`rounded-lg border-l-4 px-3 py-2 text-sm transition-colors ${
              active ? "border-emerald-400 bg-white/15 font-bold text-white" : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
            }`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
