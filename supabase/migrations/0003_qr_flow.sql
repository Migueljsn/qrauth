-- Fluxo de leitura do QR:
--   direct : o QR grava a URL; a câmera nativa já abre o resultado (1 QR).
--   camera : o QR grava só o código; só a câmera do site valida (QR de entrada + QR único).
do $$ begin
  create type public.qr_flow as enum ('direct', 'camera');
exception when duplicate_object then null; end $$;

alter table public.qr_codes add column if not exists flow public.qr_flow not null default 'direct';

drop function if exists public.generate_qr_codes(uuid, uuid, public.qr_kind, int, int, timestamptz, text, text);

create or replace function public.generate_qr_codes(
  p_product_id uuid,
  p_batch_id uuid,
  p_kind public.qr_kind,
  p_quantity int,
  p_max_scans int,              -- null = ilimitado
  p_valid_until timestamptz,
  p_custom_message text,
  p_label_prefix text default null,
  p_flow public.qr_flow default 'direct'
) returns int
language plpgsql security invoker set search_path = public, extensions as $$
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
        (code, kind, flow, product_id, batch_id, label, max_scans, valid_until, custom_message, created_by)
      values
        (public.random_code(10), p_kind, p_flow, p_product_id, p_batch_id,
         case when p_label_prefix is null then null
              else p_label_prefix || ' #' || (created + 1) end,
         p_max_scans, p_valid_until, p_custom_message, auth.uid());
      created := created + 1;
    exception when unique_violation then
      null;
    end;
  end loop;
  return created;
end $$;
