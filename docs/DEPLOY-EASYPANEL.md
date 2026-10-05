# Deploy no EasyPanel

1. **Serviço App** → origem GitHub `migueljksn-byte/qrauth`, build por **Dockerfile**.
2. **Build args** (públicos): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

3. **Environment** (secretos, só runtime): `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `IP_HASH_SALT`.
4. Porta do container: `3000`. Domínio + HTTPS pelo EasyPanel.
5. **Cloudflare** na frente: DNS em modo proxied (nuvem laranja), SSL "Full (strict)", ative Bot Fight Mode e crie regra de rate limiting para `/api/verify` e `/admin/login`. Crie o widget Turnstile (Managed) para o domínio e use as chaves reais.
6. Supabase → Auth → URL Configuration: Site URL = domínio de produção; desative signups.
