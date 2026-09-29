import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

let browserClient: SupabaseClient | undefined;

export function createClient() {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  browserClient ??= createBrowserClient(config.url, config.anonKey);
  return browserClient;
}
