// Authentication composable with Supabase Auth (RBAC Implementation)
// Uses alias-based login with hardcoded email mapping to avoid RLS recursion
// Aliases: 'adminmelati' → melatigoldshopid@gmail.com (admin)
//          'supervisor' → fattahula98@gmail.com (supervisor)
export const useAuth = () => {
  const { $supabase } = useNuxtApp();
  const user = useState<any>("auth_user", () => null);
  const isAuthenticated = useState<boolean>("is_authenticated", () => false);
  const userRole = useState<string>("user_role", () => "");

  if (!$supabase) {
    throw new Error("Supabase client is not available");
  }

  /**
   * Login dengan alias (adminmelati atau supervisor)
   * Direct mapping to email - No admin_users query to avoid RLS recursion
   */
  const login = async (alias: string, password: string) => {
    try {
      // Alias mapping: adminmelati → melatigoldshopid@gmail.com, supervisor → fattahula98@gmail.com
      const aliasMap: Record<string, { email: string; role: string; fullName: string }> = {
        adminmelati: {
          email: "melatigoldshopid@gmail.com",
          role: "admin",
          fullName: "Admin Melati",
        },
        supervisor: {
          email: "fattahula98@gmail.com",
          role: "supervisor",
          fullName: "Supervisor",
        },
      };

      const userConfig = aliasMap[alias.toLowerCase()];

      if (!userConfig) {
        return {
          success: false,
          message: "Username tidak valid. Gunakan 'adminmelati' atau 'supervisor'",
        };
      }

      // Sign in with Supabase Auth using email
      const { data: authData, error: authError } = await $supabase.auth.signInWithPassword({
        email: userConfig.email,
        password: password,
      });

      if (authError) {
        console.error("[useAuth] Auth error:", authError);
        return {
          success: false,
          message: authError.message === "Invalid login credentials" ? "Password salah" : authError.message,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: "Authentication gagal",
        };
      }

      // Set user state from mapping (no admin_users query)
      user.value = {
        id: authData.user.id,
        username: alias,
        email: userConfig.email,
        role: userConfig.role,
        full_name: userConfig.fullName,
      };
      isAuthenticated.value = true;
      userRole.value = userConfig.role;

      return {
        success: true,
        message: "Login berhasil",
        user: user.value,
      };
    } catch (error: any) {
      console.error("[useAuth] Login error:", error);
      return {
        success: false,
        message: error.message || "Login gagal",
      };
    }
  };

  /**
   * Logout - Sign out from Supabase Auth
   */
  const logout = async () => {
    try {
      const { error } = await $supabase.auth.signOut();

      if (error) {
        console.error("[useAuth] Logout error:", error);
      }

      // Clear state
      user.value = null;
      isAuthenticated.value = false;
      userRole.value = "";

      // Clear localStorage (backward compatibility)
      if (process.client) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("user");
      }

      return { success: true };
    } catch (error: any) {
      console.error("[useAuth] Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Check authentication status
   * Called by middleware and on mount
   * Uses email-based role detection (no admin_users query)
   */
  const checkAuth = async () => {
    try {
      // Get current session from Supabase Auth
      const {
        data: { session },
        error,
      } = await $supabase.auth.getSession();

      if (error) {
        console.error("[useAuth] Session error:", error);
        isAuthenticated.value = false;
        user.value = null;
        return false;
      }

      if (!session || !session.user) {
        isAuthenticated.value = false;
        user.value = null;
        return false;
      }

      // Determine role from email (no admin_users query to avoid recursion)
      const email = session.user.email;
      let role = "";
      let username = "";
      let fullName = "";

      if (email === "fattahula98@gmail.com") {
        role = "supervisor";
        username = "supervisor";
        fullName = "Supervisor";
      } else if (email === "melatigoldshopid@gmail.com") {
        role = "admin";
        username = "adminmelati";
        fullName = "Admin Melati";
      } else {
        // Unknown email - sign out
        console.error("[useAuth] Unknown email:", email);
        isAuthenticated.value = false;
        user.value = null;
        await $supabase.auth.signOut();
        return false;
      }

      // Set authenticated state
      user.value = {
        id: session.user.id,
        username: username,
        email: email,
        role: role,
        full_name: fullName,
      };
      isAuthenticated.value = true;
      userRole.value = role;

      return true;
    } catch (error) {
      console.error("[useAuth] checkAuth error:", error);
      isAuthenticated.value = false;
      user.value = null;
      return false;
    }
  };

  /**
   * Initialize auth state (alias for checkAuth)
   * Used by middleware
   */
  const initAuth = async () => {
    return await checkAuth();
  };

  // Computed properties for role-based permissions
  const isSupervisor = computed(() => userRole.value === "supervisor");
  const isAdmin = computed(() => userRole.value === "admin");

  // Both roles have full CRUD access to catalog
  const canCreate = computed(() => isAuthenticated.value);
  const canRead = computed(() => isAuthenticated.value);
  const canUpdate = computed(() => isAuthenticated.value);
  const canDelete = computed(() => isAuthenticated.value);

  // Feature-specific permissions
  const canAccessUserManagement = computed(() => isSupervisor.value);
  const canSeeCustomLinks = computed(() => isSupervisor.value);

  // Initialize on mount
  onMounted(() => {
    checkAuth();

    // Listen to auth state changes
    $supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state changed:", event);

      if (event === "SIGNED_IN" && session) {
        await checkAuth();
      } else if (event === "SIGNED_OUT") {
        user.value = null;
        isAuthenticated.value = false;
        userRole.value = "";
      }
    });
  });

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    userRole: readonly(userRole),

    // Role checks
    isSupervisor,
    isAdmin,

    // Permission checks
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canAccessUserManagement,
    canSeeCustomLinks,

    // Methods
    login,
    logout,
    checkAuth,
    initAuth,
  };
};
