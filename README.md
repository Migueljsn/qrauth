# QRAuth

Sistema de autenticação de produtos por QR Code: painel administrativo multiusuário + verificação pública (leitura por câmera no site).

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + RLS) · Tailwind 4 · Docker (EasyPanel) · Cloudflare Turnstile.

## Rodando localmente
```bash
nvm use            # Node 22+
cp .env.example .env.local   # preencha com as chaves do Supabase
npm i && npm run dev
```
1. Rode `supabase/migrations/0001_init.sql` no SQL Editor do Supabase.
2. Crie o primeiro super admin: `node scripts/create-super-admin.mjs email senha "Nome"` (com as envs carregadas).
3. Acesse `/admin`.

## Documentação
- [`docs/MASTER.md`](docs/MASTER.md) — visão geral do produto / prompt para o Gamma
- [`docs/SECURITY.md`](docs/SECURITY.md) — modelo de segurança
- [`docs/CHECKLIST.md`](docs/CHECKLIST.md) — o que já foi feito e o que falta
- [`docs/DEPLOY-EASYPANEL.md`](docs/DEPLOY-EASYPANEL.md) — deploy + Cloudflare
