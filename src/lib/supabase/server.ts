import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function hasLiveDatabaseConfig() {
  return Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) && process.env.SUPABASE_SECRET_KEY && process.env.DATAPILOT_READONLY_DB_URL);
}
