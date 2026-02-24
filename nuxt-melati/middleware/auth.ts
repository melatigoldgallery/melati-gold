// Authentication middleware (updated for Supabase Auth)
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  // Check authentication using Supabase Auth session
  const isAuthenticated = await auth.checkAuth();

  if (!isAuthenticated) {
    return navigateTo("/login");
  }
});
