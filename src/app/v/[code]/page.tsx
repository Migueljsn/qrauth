import type { Metadata } from "next";
import { VerifyView } from "./verify-view";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A verificação roda no navegador (POST /api/verify) — assim bots de pré-visualização
// (WhatsApp, Slack…) que só fazem GET da página não consomem leituras do QR.
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <VerifyView code={code} />;
}
