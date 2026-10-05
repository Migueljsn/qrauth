/** Conteúdo gravado no QR: URL pública. Funciona na câmera nativa e no scanner do site. */
export function qrPayload(code: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return `${base}/v/${code}`;
}

/** Extrai o código de uma URL /v/CODE ou de um código cru. */
export function extractCode(raw: string): string | null {
  const text = raw.trim();
  const m = text.match(/\/v\/([A-Za-z0-9]{6,32})\/?(?:[?#].*)?$/);
  const code = (m ? m[1] : text).toUpperCase();
  return /^[A-Z0-9]{6,32}$/.test(code) ? code : null;
}

export const STATUS_LABEL: Record<string, string> = {
  active: "Ativo", disabled: "Desativado", exhausted: "Esgotado", expired: "Expirado", revoked: "Revogado",
};
