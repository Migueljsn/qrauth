-- QRAuth — schema inicial
-- Rode no SQL Editor do Supabase (ou via `supabase db push`).

create extension if not exists pgcrypto;

-- ───────────────────────── Tipos ─────────────────────────
create type public.user_role as enum ('super_admin', 'admin', 'operator');
create type public.qr_kind as enum ('batch', 'unit');
create type public.qr_status as enum ('active', 'disabled', 'exhausted', 'expired', 'revoked');
create type public.stock_move_type as enum ('in', 'out', 'adjust');

-- ───────────────────────── Tabelas ─────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        public.user_role not null default 'operator',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories(id) on delete set null,
  name         text not null,
  sku          text unique,
  description  text,
  image_url    text,
  attributes   jsonb not null default '{}'::jsonb,   -- ex.: {"dosagem":"15 mg"}
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.batches (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete restrict,
  batch_number   text not null,
  manufactured_at date,
  expires_at     date,
  quantity       integer not null default 0 check (quantity >= 0),
  notes          text,
  created_at     timestamptz not null default now(),
  unique (product_id, batch_number)
);

create table public.qr_codes (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,                 -- código público único (impresso no QR)
  kind             public.qr_kind not null,
  product_id       uuid not null references public.products(id) on delete restrict,
  batch_id         uuid references public.batches(id) on delete restrict,
  label            text,                                 -- ex.: "Caixa 3 / Frasco 12"
  max_scans        integer check (max_scans is null or max_scans > 0), -- null = ilimitado
  scan_count       integer not null default 0,
  status           public.qr_status not null default 'active',
  valid_until      timestamptz,                          -- null = sem validade
  custom_message   text,                                 -- mensagem extra mostrada ao consumidor
  first_scanned_at timestamptz,
  last_scanned_at  timestamptz,
  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index qr_codes_batch_idx on public.qr_codes(batch_id);
create index qr_codes_product_idx on public.qr_codes(product_id);
create index qr_codes_status_idx on public.qr_codes(status);

create table public.scan_events (
  id          bigserial primary key,
  qr_code_id  uuid references public.qr_codes(id) on delete cascade,
  code        text not null,
  result      text not null,        -- authentic | not_found | exhausted | expired | disabled | revoked | rate_limited
  ip_hash     text,                 -- sha-256(ip + salt); nunca o IP cru
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index scan_events_qr_idx on public.scan_events(qr_code_id, created_at desc);
create index scan_events_ip_idx on public.scan_events(ip_hash, created_at desc);

create table public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete restrict,
  batch_id    uuid references public.batches(id) on delete set null,
  type        public.stock_move_type not null,
  quantity    integer not null,
  note        text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── Helpers de autorização ─────────────────────────
create or replace function public.current_app_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and active
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active)
$$;

create or replace function public.can_manage() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and active and role in ('super_admin','admin'))
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and active and role = 'super_admin')
$$;

-- ───────────────────────── RLS ─────────────────────────
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.batches         enable row level security;
alter table public.qr_codes        enable row level security;
alter table public.scan_events     enable row level security;
alter table public.stock_movements enable row level security;

-- profiles: cada um lê o seu; super_admin lê tudo. Escrita só via service role (server actions).
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_super_admin());

-- catálogo / estoque: staff lê, admin+ escreve
create policy categories_read  on public.categories for select to authenticated using (public.is_staff());
create policy categories_write on public.categories for all    to authenticated using (public.can_manage()) with check (public.can_manage());

create policy products_read  on public.products for select to authenticated using (public.is_staff());
create policy products_write on public.products for all    to authenticated using (public.can_manage()) with check (public.can_manage());

create policy batches_read  on public.batches for select to authenticated using (public.is_staff());
create policy batches_write on public.batches for all    to authenticated using (public.can_manage()) with check (public.can_manage());

create policy qr_read  on public.qr_codes for select to authenticated using (public.is_staff());
create policy qr_write on public.qr_codes for all    to authenticated using (public.can_manage()) with check (public.can_manage());

create policy stock_read   on public.stock_movements for select to authenticated using (public.is_staff());
create policy stock_insert on public.stock_movements for insert to authenticated
  with check (public.is_staff() and created_by = auth.uid());

-- scan_events: só leitura para staff; escrita exclusivamente pela função verify_qr (service role)
create policy scans_read on public.scan_events for select to authenticated using (public.is_staff());

-- anon NÃO tem acesso direto a nenhuma tabela: verificação pública passa pela API do servidor.

-- ───────────────────────── Geração em lote ─────────────────────────
-- Alfabeto sem caracteres ambíguos (0/O, 1/I/L).
create or replace function public.random_code(len int default 10)
returns text language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := gen_random_bytes(len);
  out text := '';
  i int;
begin
  for i in 0 .. len - 1 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return out;
end $$;

create or replace function public.generate_qr_codes(
  p_product_id uuid,
  p_batch_id uuid,
  p_kind public.qr_kind,
  p_quantity int,
  p_max_scans int,              -- null = ilimitado
  p_valid_until timestamptz,
  p_custom_message text,
  p_label_prefix text default null
) returns int
language plpgsql security invoker set search_path = public as $$
declare
  created int := 0;
  attempts int := 0;
begin
  if not public.can_manage() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_quantity < 1 or p_quantity > 10000 then
    raise exception 'quantity must be between 1 and 10000';
  end if;
  if p_kind = 'unit' and p_batch_id is null then
    raise exception 'unit QR codes require a batch';
  end if;

  while created < p_quantity and attempts < p_quantity * 3 loop
    attempts := attempts + 1;
    begin
      insert into public.qr_codes
        (code, kind, product_id, batch_id, label, max_scans, valid_until, custom_message, created_by)
      values
        (public.random_code(10), p_kind, p_product_id, p_batch_id,
         case when p_label_prefix is null then null
              else p_label_prefix || ' #' || (created + 1) end,
         p_max_scans, p_valid_until, p_custom_message, auth.uid());
      created := created + 1;
    exception when unique_violation then
      null; -- colisão de código: tenta outro
    end;
  end loop;
  return created;
end $$;

-- ───────────────────────── Verificação pública (atômica) ─────────────────────────
-- Chamada SOMENTE pela API do servidor com a service role key.
create or replace function public.verify_qr(
  p_code text,
  p_ip_hash text,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  q public.qr_codes;
  prod public.products;
  bat public.batches;
  cat_name text;
  recent int;
  res text;
  remaining int;
begin
  -- rate limit: 30 verificações/min por IP (anti-enumeração)
  if p_ip_hash is not null then
    select count(*) into recent from public.scan_events
      where ip_hash = p_ip_hash and created_at > now() - interval '1 minute';
    if recent >= 30 then
      insert into public.scan_events(code, result, ip_hash, user_agent)
        values (left(coalesce(p_code,''), 32), 'rate_limited', p_ip_hash, left(p_user_agent, 300));
      return jsonb_build_object('result', 'rate_limited');
    end if;
  end if;

  p_code := upper(trim(coalesce(p_code, '')));
  select * into q from public.qr_codes where code = p_code for update;

  if not found then
    insert into public.scan_events(code, result, ip_hash, user_agent)
      values (left(p_code, 32), 'not_found', p_ip_hash, left(p_user_agent, 300));
    return jsonb_build_object('result', 'not_found');
  end if;

  -- decide o resultado
  if q.status = 'revoked' then res := 'revoked';
  elsif q.status = 'disabled' then res := 'disabled';
  elsif q.valid_until is not null and q.valid_until < now() then
    res := 'expired';
    update public.qr_codes set status = 'expired' where id = q.id and status = 'active';
  elsif q.status = 'expired' then res := 'expired';
  elsif q.status = 'exhausted' then res := 'exhausted';
  elsif q.max_scans is not null and q.scan_count >= q.max_scans then
    res := 'exhausted';
    update public.qr_codes set status = 'exhausted' where id = q.id;
  else
    res := 'authentic';
    update public.qr_codes set
      scan_count = scan_count + 1,
      first_scanned_at = coalesce(first_scanned_at, now()),
      last_scanned_at = now(),
      status = case when max_scans is not null and scan_count + 1 >= max_scans
                    then 'exhausted'::public.qr_status else status end
    where id = q.id
    returning * into q;
  end if;

  insert into public.scan_events(qr_code_id, code, result, ip_hash, user_agent)
    values (q.id, q.code, res, p_ip_hash, left(p_user_agent, 300));

  if res <> 'authentic' then
    return jsonb_build_object('result', res, 'code', q.code);
  end if;

  select * into prod from public.products where id = q.product_id;
  select * into bat  from public.batches  where id = q.batch_id;
  select name into cat_name from public.categories where id = prod.category_id;
  remaining := case when q.max_scans is null then null else q.max_scans - q.scan_count end;

  return jsonb_build_object(
    'result', 'authentic',
    'code', q.code,
    'kind', q.kind,
    'scan_count', q.scan_count,
    'remaining_scans', remaining,
    'unlimited', q.max_scans is null,
    'first_scan', q.scan_count = 1,
    'custom_message', q.custom_message,
    'product', jsonb_build_object(
      'name', prod.name, 'description', prod.description,
      'image_url', prod.image_url, 'category', cat_name,
      'attributes', prod.attributes),
    'batch', case when bat.id is null then null else jsonb_build_object(
      'number', bat.batch_number, 'manufactured_at', bat.manufactured_at,
      'expires_at', bat.expires_at) end
  );
end $$;

revoke all on function public.verify_qr(text, text, text) from public, anon, authenticated;
grant execute on function public.verify_qr(text, text, text) to service_role;

-- ───────────────────────── Dashboard ─────────────────────────
create or replace function public.dashboard_stats()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'products',   (select count(*) from products where active),
    'batches',    (select count(*) from batches),
    'qr_total',   (select count(*) from qr_codes),
    'qr_active',  (select count(*) from qr_codes where status = 'active'),
    'qr_exhausted', (select count(*) from qr_codes where status = 'exhausted'),
    'scans_24h',  (select count(*) from scan_events where created_at > now() - interval '24 hours'),
    'suspicious_24h', (select count(*) from scan_events
                       where created_at > now() - interval '24 hours'
                         and result in ('not_found','exhausted','revoked','rate_limited'))
  )
$$;

-- Estoque atual por produto (soma dos movimentos)
create or replace view public.stock_levels with (security_invoker = true) as
  select p.id as product_id, p.name,
         coalesce(sum(case m.type when 'in' then m.quantity
                                  when 'out' then -m.quantity
                                  else m.quantity end), 0)::int as stock
  from public.products p
  left join public.stock_movements m on m.product_id = p.id
  group by p.id, p.name;
