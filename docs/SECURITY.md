# Segurança

## Segredos
- `SUPABASE_SERVICE_ROLE_KEY` (secret key) e `TURNSTILE_SECRET_KEY` existem **só no servidor** (env do EasyPanel). O cliente Supabase com service role importa `server-only`: o build quebra se for puxado para o browser. Verificado: nenhum `sb_secret` no bundle.
- Apenas `NEXT_PUBLIC_*` (URL, publishable key, site key do Turnstile) vão ao front — protegidos por RLS.
- `.env*` é ignorado pelo git (só `.env.example` versionado). Se alguma chave vazar, rotacione no painel Supabase.

## Banco (Supabase)
- RLS em **todas** as tabelas; `anon` não lê nada. Verificado: `anon` recebe `[]` nas tabelas e `permission denied` em `verify_qr`.
- Papéis: `super_admin` (usuários), `admin` (CRUD produtos/lotes/QR), `operator` (leitura + estoque).
- `verify_qr` é `SECURITY DEFINER`, com `EXECUTE` só para `service_role`; faz lock da linha (leitura atômica, sem corrida no contador), registra o evento e aplica rate limit de 30/min por IP (hash).
- IPs são guardados como `sha256(salt:ip)`, nunca crus.
- Códigos: 10 chars, alfabeto de 31 símbolos (~8×10¹⁴ combinações), gerados com `gen_random_bytes`.

## Aplicação
- Autorização sempre no servidor (`requireRole`), não só na UI; perfil inativo é barrado a cada request.
- CRUD de usuários só via server actions com service role, restrito a `super_admin`; ninguém se rebaixa/bloqueia/exclui sozinho. Usuário inativo recebe `ban` no Supabase Auth.
- Login: mensagem de erro genérica, rate limit por IP e por e-mail, Turnstile.
- `/api/verify`: Turnstile + rate limit por IP + checagem de `Origin` + validação com zod.
- A verificação roda por POST do navegador (não no GET da página): bots de preview (WhatsApp/Slack) não consomem leituras.
- Headers: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.

## Limitações conhecidas / próximos passos
- Rate limit em memória serve a 1 réplica; com mais réplicas, mover para Redis.
- Trocar senha não derruba sessões já abertas até o JWT expirar (1h por padrão). Reduza em Supabase → Auth → JWT expiry se necessário.
- Ative MFA para admins e confirme "Leaked password protection" no Supabase Auth.
- Desative signup público em Supabase → Auth → Sign In / Providers (usuários só são criados pelo super admin).
