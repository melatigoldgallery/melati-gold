// Middleware to protect routes that only supervisor can access
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  // Initialize auth if not done
  if (!auth.isAuthenticated.value) {
    await auth.initAuth();
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated.value) {
    return navigateTo(ROUTES.LOGIN);
  }

  // Check if user is supervisor
  if (!auth.isSupervisor.value) {
    return navigateTo(ROUTES.DASHBOARD);
  }
});
