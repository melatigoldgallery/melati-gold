// Authentication middleware
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.client) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (isLoggedIn !== "true" || !loginTime) {
      return navigateTo("/login");
    }

    // Check if session is still valid (24 hours)
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    const currentTime = Date.now();
    const sessionStart = parseInt(loginTime);

    if (currentTime - sessionStart >= sessionDuration) {
      // Session expired, clear storage and redirect
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("user");
      return navigateTo("/login");
    }
  }
});
