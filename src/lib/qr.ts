export type QrFlow = "direct" | "camera";

const siteBase = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/**
 * Conteúdo gravado no QR (sempre 1 QR por unidade):
 *  - direct: /v/CODE — a câmera nativa já mostra o resultado e conta a leitura;
 *  - camera: /?c=CODE — a câmera nativa só abre o site (sem verificar nem contar leitura);
 *    o cliente toca em Autenticar e a câmera do site lê o mesmo QR e valida.
 */
export function qrPayload(code: string, flow: QrFlow = "direct") {
  return flow === "camera" ? `${siteBase()}/?c=${code}` : `${siteBase()}/v/${code}`;
}

export const FLOW_LABEL: Record<QrFlow, string> = {
  direct: "Direto",
  camera: "Com câmera do site",
};

/** Extrai o código de uma URL (/v/CODE ou ?c=CODE) ou de um código cru. */
export function extractCode(raw: string): string | null {
  const text = raw.trim();
  let candidate = text;
  if (/^https?:\/\//i.test(text)) {
    try {
      const u = new URL(text);
      candidate = u.searchParams.get("c") ?? u.pathname.match(/\/v\/([A-Za-z0-9]{6,32})\/?$/)?.[1] ?? "";
    } catch { return null; }
  }
  const code = candidate.toUpperCase();
  return /^[A-Z0-9]{6,32}$/.test(code) ? code : null;
}

export const STATUS_LABEL: Record<string, string> = {
  active: "Ativo", disabled: "Desativado", exhausted: "Esgotado", expired: "Expirado", revoked: "Revogado",
};
