export type QrFlow = "direct" | "camera";

const siteBase = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/**
 * Conteúdo gravado no QR único:
 *  - direct: URL pública (a câmera nativa já abre o resultado);
 *  - camera: só o código (a câmera nativa mostra texto; só o scanner do site valida).
 */
export function qrPayload(code: string, flow: QrFlow = "direct") {
  return flow === "camera" ? code : `${siteBase()}/v/${code}`;
}

/** QR de entrada (igual para todos os produtos): leva o cliente ao site, que abre a câmera de autenticação. */
export const entryUrl = () => `${siteBase()}/`;

export const FLOW_LABEL: Record<QrFlow, string> = {
  direct: "Direto (1 QR)",
  camera: "Com câmera do site",
};

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
