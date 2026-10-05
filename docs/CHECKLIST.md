# Checklist de configuração

## Já feito
- [x] Migration `0001_init.sql` aplicada no Supabase
- [x] Cadastro público (signup) desativado no Supabase Auth
- [x] Super admin criado: `migueljsncc@gmail.com`
- [x] Chaves do Supabase em `.env.local` (local, fora do git)
- [x] Cloudflare: domínio `clubeimpulso.com.br` ativo; registro `qr` → 76.13.161.147 (proxied); `@` e `www` em DNS only
- [x] Cloudflare: Turnstile `qrauth` (hosts: qr.clubeimpulso.com.br e amevit-qrauth.hqzrjv.easypanel.host)
- [x] Cloudflare: Bot Fight Mode ligado; rate limit `qrauth-verify-login` (15 req/10s por IP em /api/verify e /admin/login → bloqueio 10s)
- [x] EasyPanel: fonte GitHub `Migueljsn/qrauth` (main) + build por Dockerfile

## Pendente
1. **Trocar a senha do super admin** no primeiro login (painel → Usuários → sua linha → nova senha).
2. **Cloudflare Turnstile:** dash.cloudflare.com → Turnstile → Add widget (Managed) para o domínio de produção. Copie *Site key* e *Secret key*.
3. **EasyPanel:** criar serviço App a partir do GitHub `Migueljsn/qrauth` (Dockerfile). Preencher:
   - Build args: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - Env (secretos): `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `IP_HASH_SALT` (`openssl rand -hex 32`)
   - Porta 3000 + domínio com HTTPS
4. **Cloudflare DNS/WAF:** apontar o domínio (proxied), SSL *Full (strict)*, Bot Fight Mode, regra de rate limit em `/api/verify` e `/admin/login`.
5. **Supabase → Auth → URL Configuration:** Site URL = domínio de produção.
6. **Opcional:** MFA para admins; reduzir JWT expiry; domínio próprio nos QR (`NEXT_PUBLIC_SITE_URL` define o link impresso — defina antes de imprimir etiquetas reais!).
7. Apagar os dados de demonstração (categoria "Teste", produto "Produto Demo 15 mg", QR `DEMO123456`).
