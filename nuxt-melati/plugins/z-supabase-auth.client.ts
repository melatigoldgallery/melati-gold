// Named with 'z-' prefix to ensure it loads AFTER supabase.client.ts plugin
export default defineNuxtPlugin(async (nuxtApp) => {
  const { $supabase } = nuxtApp;

  if (!$supabase) {
    console.error("[supabase-auth] Supabase client not available");
    return;
  }

  const auth = useAuth();
  await auth.checkAuth();

  const supabaseClient = $supabase as any;
  supabaseClient.auth.onAuthStateChange(async (event: any, session: any) => {
    if (event === "SIGNED_OUT") {
    } else if (event === "TOKEN_REFRESHED") {
    }
  });
});
