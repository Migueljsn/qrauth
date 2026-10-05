import { parseLocal, todayBR, fmtDateBR, fmtDateTimeBR } from "@/lib/datetime";

const MIN_AHEAD_MS = 5 * 60_000;

/** Validade do QR (datetime-local). Retorna a mensagem explicando o problema, ou null se estiver ok. */
export function validateValidUntil(value: string, batchExpires?: string | null, now = new Date()): string | null {
  if (!value) return "Informe a data e a hora de validade, ou marque “Sem validade”.";
  const d = parseLocal(value);
  if (!d) return "Data ou hora inválida. Preencha dia, mês, ano, hora e minuto.";
  if (+d < +now + MIN_AHEAD_MS)
    return `Essa data e hora já passaram (ou faltam menos de 5 minutos): o QR expiraria imediatamente. Agora são ${fmtDateTimeBR(now)} — escolha um momento futuro.`;
  const max = new Date(now); max.setFullYear(max.getFullYear() + 10);
  if (+d > +max) return "Data distante demais: a validade máxima é de 10 anos a partir de hoje.";
  if (batchExpires && +d > +new Date(`${batchExpires}T23:59:59-03:00`))
    return `O QR não pode valer depois da validade do lote (${fmtDateBR(batchExpires)}). Escolha uma data até ${fmtDateBR(batchExpires)}.`;
  return null;
}

/** Datas do lote (YYYY-MM-DD). */
export function validateBatchDates(manufactured: string, expires: string, today = todayBR()) {
  let m: string | null = null;
  let e: string | null = null;
  if (manufactured && manufactured > today) m = `A fabricação não pode ser no futuro (hoje é ${fmtDateBR(today)}).`;
  if (expires) {
    if (expires < today) e = `Essa validade (${fmtDateBR(expires)}) já passou: o lote já nasceria vencido.`;
    else if (manufactured && expires <= manufactured) e = `A validade precisa ser depois da fabricação (${fmtDateBR(manufactured)}).`;
  }
  return { manufactured: m, expires: e };
}
