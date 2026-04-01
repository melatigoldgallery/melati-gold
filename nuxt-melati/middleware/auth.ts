export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  const isAuthenticated = await auth.checkAuth();
  if (!isAuthenticated) {
    return navigateTo(ROUTES.LOGIN);
  }
});
