-- No Supabase, pgcrypto vive no schema "extensions". Qualifica a chamada e fixa o search_path.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.random_code(len int default 10)
returns text language plpgsql volatile set search_path = public, extensions as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(len);
  out text := '';
  i int;
begin
  for i in 0 .. len - 1 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return out;
end $$;
