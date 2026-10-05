import "server-only";

// Rate limit em memória (janela deslizante). Suficiente para 1 container no EasyPanel;
// para múltiplas réplicas, mover para Redis/Upstash. Camada extra: limite no banco (verify_qr)
// e regras de rate limit da Cloudflare na frente.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return false; }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}
