/** Datas e horas do sistema seguem o horário de Brasília (sem horário de verão desde 2019). */
export const TZ = "America/Sao_Paulo";
const OFFSET = "-03:00";

/** "2026-10-05T16:40" (campo datetime-local, horário de Brasília) → Date correto. */
export function parseLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00${OFFSET}`);
  return Number.isNaN(+d) ? null : d;
}

/** ISO (UTC) → valor para o campo datetime-local, em horário de Brasília. */
export function toInputLocal(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(iso)).replace(" ", "T");
}

/** Data de hoje (YYYY-MM-DD) em horário de Brasília. */
export const todayBR = () => new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(new Date());

export const fmtDateBR = (isoDate: string) => isoDate.split("-").reverse().join("/");
export const fmtDateTimeBR = (d: Date) => d.toLocaleString("pt-BR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" });

/** Data e hora com segundos (ISO UTC → horário de Brasília), para históricos de leitura. */
export const fmtDateTimeSecBR = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: TZ, dateStyle: "short", timeStyle: "medium" });
