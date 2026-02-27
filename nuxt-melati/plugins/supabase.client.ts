import { createClient } from "@supabase/supabase-js";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const url = config.public.supabaseUrl;
  const key = config.public.supabaseAnonKey;

  const client =
    url && key
      ? createClient(url, key, {
          auth: {
            persistSession: true, // Persist session to localStorage
            autoRefreshToken: true, // Auto-refresh JWT before expiry (CRITICAL!)
            detectSessionInUrl: true, // Detect auth redirects
            flowType: "pkce", // More secure auth flow
          },
          global: {
            headers: {
              "x-application-name": "melati-gold-admin",
            },
          },
          db: {
            schema: "public",
          },
        })
      : null;

  return {
    provide: {
      supabase: client,
    },
  };
});

export const useSupabaseClient = () => {
  const { $supabase } = useNuxtApp();
  return $supabase;
};
