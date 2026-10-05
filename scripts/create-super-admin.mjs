// Cria o primeiro super_admin. Uso:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-super-admin.mjs email senha "Nome"
import { createClient } from "@supabase/supabase-js";

const [email, password, name = "Super Admin"] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Uso: node scripts/create-super-admin.mjs <email> <senha(>=10)> ["Nome"]');
  process.exit(1);
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
if (error) { console.error(error.message); process.exit(1); }
const { error: pe } = await sb.from("profiles").insert({ id: data.user.id, full_name: name, role: "super_admin" });
if (pe) { console.error(pe.message); process.exit(1); }
console.log("super_admin criado:", email);
