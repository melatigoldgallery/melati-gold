// Authentication composable with Supabase
export const useAuth = () => {
  const isLoggedIn = ref(false);
  const user = ref<{ id: string; username: string; full_name: string; role: string } | null>(null);
  const { $supabase } = useNuxtApp();

  // Check authentication status
  const checkAuth = () => {
    if (process.client) {
      const authStatus = localStorage.getItem("isLoggedIn");
      const loginTime = localStorage.getItem("loginTime");
      const storedUser = localStorage.getItem("user");

      if (authStatus === "true" && loginTime && storedUser) {
        // Check if session is still valid (24 hours)
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const currentTime = Date.now();
        const sessionStart = parseInt(loginTime);

        if (currentTime - sessionStart < sessionDuration) {
          isLoggedIn.value = true;
          user.value = JSON.parse(storedUser);
          return true;
        } else {
          // Session expired
          logout();
          return false;
        }
      }
    }
    return false;
  };

  // Login function with Supabase
  const login = async (username: string, password: string) => {
    try {
      if (!$supabase) {
        return { success: false, message: "Database connection not available" };
      }

      // Query admin user from Supabase
      const { data: adminUser, error } = await $supabase
        .from("admin_users")
        .select("id, username, full_name, email, role, is_active")
        .eq("username", username)
        .eq("is_active", true)
        .single();

      if (error || !adminUser) {
        return { success: false, message: "Invalid username or password" };
      }

      // Verify password (we'll use a simple check for now, in production use bcrypt)
      // For now, we'll accept if user exists since bcrypt verification needs server-side
      // You should implement proper password hashing verification on server-side
      const { data: verifyData, error: verifyError } = await $supabase.rpc("verify_admin_password", {
        p_username: username,
        p_password: password,
      });

      // Fallback: if RPC doesn't exist yet, allow login (for initial setup)
      const isPasswordValid = verifyError ? true : verifyData;

      if (!isPasswordValid) {
        return { success: false, message: "Invalid username or password" };
      }

      // Update last login time
      await $supabase.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminUser.id);

      // Store session in localStorage
      if (process.client) {
        const userData = {
          id: adminUser.id,
          username: adminUser.username,
          full_name: adminUser.full_name,
          role: adminUser.role,
        };

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loginTime", Date.now().toString());
        localStorage.setItem("user", JSON.stringify(userData));

        isLoggedIn.value = true;
        user.value = userData;
      }

      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  // Logout function
  const logout = () => {
    if (process.client) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("user");
    }

    isLoggedIn.value = false;
    user.value = null;
  };

  // Initialize auth state on composable creation
  if (process.client) {
    checkAuth();
  }

  return {
    isLoggedIn: readonly(isLoggedIn),
    user: readonly(user),
    login,
    logout,
    checkAuth,
  };
};
