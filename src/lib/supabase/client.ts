import { createBrowserClient } from "@supabase/ssr";

// Fallback values point to Hazil Portfolio Supabase instance
const DEFAULT_SUPABASE_URL = "https://wgxoxghwphbnttwpkkbv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_eOvN1FcFUjxH_iWwO13KWQ_EgQfTeO8";

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function createClient() {
  const { url, anonKey } = getSupabasePublicConfig();

  if (!url || !anonKey) {
    throw new Error(
      "[Supabase Config Error] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Please verify Vercel environment variables."
    );
  }

  return createBrowserClient(url, anonKey);
}
