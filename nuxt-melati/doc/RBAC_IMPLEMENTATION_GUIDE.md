# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## 📋 Role & Permissions

### Database CRUD Permissions (Sama)

| Role           | Create | Read | Update | Delete |
| -------------- | ------ | ---- | ------ | ------ |
| **Supervisor** | ✅     | ✅   | ✅     | ✅     |
| **Admin**      | ✅     | ✅   | ✅     | ✅     |
| **Public**     | ❌     | ✅   | ❌     | ❌     |

### UI/Feature Access (Berbeda)

| Feature                  | Supervisor      | Admin            |
| ------------------------ | --------------- | ---------------- |
| **Catalog Management**   | ✅ Full Access  | ✅ Full Access   |
| **User Management**      | ✅ Can Access   | ❌ Cannot Access |
| **Custom Product Links** | ✅ Can See/Edit | ❌ Hidden        |
| **Dashboard**            | ✅              | ✅               |
| **Gold Price Config**    | ✅              | ✅               |

**Kesimpulan:**

- Kedua role bisa CRUD catalog (products, categories, dll)
- Perbedaan hanya di akses menu Users dan visibility form custom links

---

## 🗄️ Database Setup

### 1. Update admin_users Table

```sql
-- Add auth_uid column to link with Supabase Auth
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure role column exists
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin'
CHECK (role IN ('admin', 'supervisor'));

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_uid
ON admin_users(auth_uid);

CREATE INDEX IF NOT EXISTS idx_admin_users_username
ON admin_users(username);

CREATE INDEX IF NOT EXISTS idx_admin_users_role
ON admin_users(role, is_active);
```

### 2. Enable RLS on Catalog Tables

```sql
-- Enable Row Level Security
ALTER TABLE catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_services ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies

```sql
-- ============================================
-- PUBLIC: Read-only access to active items
-- ============================================

CREATE POLICY "public_read_categories"
ON catalog_categories FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREAUTHENTICATED USERS (Supervisor & Admin): Full CRUD access
-- ============================================

-- Categories: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_categories"
ON catalog_categories FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
);

-- Subcategories: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_subcategories"
ON catalog_subcategories FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
);

-- Products: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_products"
ON catalog_products FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
);

-- Custom Services: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_services"
ON custom_services FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role IN ('supervisor', 'admin') AND is_active = true
  )
);

-- ============================================
-- ADMIN_USERS: Only Supervisor can manage users
-- ============================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Supervisor can view all users
CREATE POLICY "supervisor_read_users"
ON admin_users FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role = 'supervisor' AND is_active = true
  )
);

-- Supervisor can create/update/delete users
CREATE POLICY "supervisor_manage_users"
ON admin_users FOR INSERT, UPDATE, DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role = 'supervisor' AND is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role = 'supervisor' AND is_active = true
  )
);

-- Admin can only view their own data
CREATE POLICY "admin_read_own_data"
ON admin_users FOR SELECT
TO authenticated
USING (
  auth_uid = auth.uid() AND role = 'admin' AND is_active = true
);

CREATE POLICY "admin_read_update_services"
ON custom_services FOR SELECT, UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role = 'admin' AND is_active = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_uid FROM admin_users
    WHERE role = 'admin' AND is_active = true
  )
);
```

---

## 🔑 Authentication Setup

### 1. Update useAuth Composable

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const { $supabase } = useNuxtApp();
  const user = useState<any>("auth_user", () => null);
  const isAuthenticated = useState<boolean>("is_authenticated", () => false);
  const userRole = useState<string>("user_role", () => "");

  /**
   * Login dengan username (supervisor atau admin)
   * Bukan email, tapi lookup email dari username
   */
  const signIn = async (username: string, password: string) => {
    try {
      // 1. Get email from username
      const { data: adminUser, error: lookupError } = await $supabase
        .from("admin_users")
        .select("email, role, full_name, is_active")
        .eq("username", username)
        .eq("is_active", true)
        .single();

      if (lookupError || !adminUser) {
        throw new Error("Username tidak ditemukan atau tidak aktif");
      }

      // 2. Sign in with Supabase Auth using email
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: adminUser.email,
        password: password,
      });

      if (error) throw error;

      // 3. Set user state
      user.value = {
        ...data.user,
        username: username,
        role: adminUser.role,
        full_name: adminUser.full_name,
      };
      isAuthenticated.value = true;
      userRole.value = adminUser.role;

      return { success: true, user: user.value };
    } catch (error: any) {
      console.error("[useAuth] Sign in error:", error);
      return {
        success: false,
        error: error.message || "Login gagal"
      };
    }
  };

  const signOut = async () => {
    try {
      await $supabase.auth.signOut();
      user.value = null;
      isAuthenticated.value = false;
      userRole.value = "";
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Check permissions
  const isSupervisor = computed(() => userRole.value === "supervisor");
  const isAdmin = computed(() => userRole.value === "admin");

  const canCreate = computed(() => isSupervisor.value);
  const canRead = computed(() => isAuthenticated.value);
  const canUpdate = computed(() => isAuthenticated.value);
  const canDelete = computed(() => isSupervisor.value);

  // Initialize auth on mount
  const initAuth = async () => {
    try {
      const { data } = await $supabase.auth.getSession();

      if (data.session?.user) {
        const { data: adminData } = await $supabase
          .from("admin_users")
          .select("username, role, full_name")
          .eq("auth_uid", data.session.user.id)
          .eq("is_active", true)
          .single();

        if (adminData) {
          user.value = {
            ...data.session.user,
            username: adminData.username,
  // Both roles have full CRUD access
  const canCreate = computed(() => isAuthenticated.value);
  const canRead = computed(() => isAuthenticated.value);
  const canUpdate = computed(() => isAuthenticated.value);
  const canDelete = computed(() => isAuthenticated.value);

  // Feature-specific permissions
  const canAccessUserManagement = computed(() => isSupervisor.value);
  const canSeeCustomLinksnticated.value = true;
          userRole.value = adminData.role;
        }
      }
    } catch (error) {
      console.error("[useAuth] Init error:", error);
    }
  };

  return {
    user,
    isAuthenticated,
    userRole,
    isSupervisor,
    isAdmin,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    signIn,
    signOut,
    initAuth,
  };
};
```

### 2. Update Login Page

```vue
<!-- pages/login.vue atau pages/admin/login.vue -->
<template>
  <div class="login-container">
    <h2>Login Admin</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>Username</label>
        canAccessUserManagement, canSeeCustomLinks,
        <input v-model="username" type="text" placeholder="supervisor atau admin" required />
      </div>
      <div>
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Loading..." : "Login" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth();
const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  // Login dengan username (bukan email)
  const result = await auth.signIn(username.value, password.value);

  if (result.success) {
    router.push("/dashboard");
  } else {
    error.value = result.error;
  }

  loading.value = false;
};
</script>
```

---

## 👥 Create Users

### 1. Buat Users di Supabase Authentication

**Via Supabase Dashboard:**

1. Authentication > Users > Add User
2. Buat 2 users:
   - Email: `supervisor@melati.com` | Password: `[password-kuat]`
   - Email: `admin@melati.com` | Password: `[password-kuat]`
3. Copy UUID masing-masing user

### 2. Link Users ke admin_users Table

```sql
-- Link supervisor
UPDATE admin_users
SET auth_uid = '[uuid-dari-supervisor-auth-user]',
    role = 'supervisor',
    email = 'supervisor@melati.com'
WHERE username = 'supervisor';

-- Link admin
UPDATE admin_users
SET auth_uid = '[uuid-dari-admin-auth-user]',
    role = 'admin',
    email = 'admin@melati.com'
WHERE username = 'admin';
```

---

## 🧪 Testing

### Test Login Flow:

```
1. Buka /login
2. Input: username = "supervisor" | password = "[password-supervisor]"
3. ✅ Berhasil login → redirect ke /dashboard
4. ✅ Bisa Create, Read, Update, Delete produk

5. Logout
6. Input: username = "admin" | password = "[password-admin]"
7. ✅ Berhasil login → redirect ke /dashboard
8. ✅ Bisa Read, Update produk
9. ❌ Tidak bisa Create atau Delete produk
```

### Test RLS:

(RLS policy)

// Admin (login sebagai admin)
await $supabase.from('catalog_products').insert({...})
// ✅ Berhasil - bisa create

await $supabase.from('catalog_products').update({...}).eq('id', '...')
// ✅ Berhasil - bisa update

await $supabase.from('catalog_products').delete().eq('id', '...')
// ✅ Berhasil - bisa delete

await $supabase.from('admin_users').select('\*')
// ✅ Berhasil - tapi hanya bisa lihat data diri sendiri

await $supabase.from('admin_users').insert({...})
// ❌ Error - tidak bisa create user (RLS policy)

// Supervisor (login sebagai supervisor)
await $supabase.from('catalog_products').delete().eq('id', '...')
// ✅ Berhasil - bisa delete

await $supabase.from('admin_users').select('\*')
// ✅ Berhasil - bisa lihat semua users

await $supabase.from('admin_users').insert({...})
// ✅ Berhasil - bisa create user

```
1. Logout supervisor
2. Input: username = "admin" | password = "[password]"
3. ✅ Berhasil login → redirect ke /dashboard
4. ✅ Bisa Create, Read, Update, Delete produk
5. ❌ Menu "Users" TIDAK terlihat
6. ❌ Akses /admin/users → redirect ke /dashboard
7. ❌ Form custom links TIDAK terlihat di product modal

await $supabase.from('catalog_products').delete().eq('id', '...')
// ❌ Error - tidak bisa delete

// Supervisor (login sebagai supervisor)
await $supabase.from('catalog_products').delete().eq('id', '...')
// ✅ Berhasil - bisa delete
```

---

## 🎯 UI Implementation

### Conditional Rendering Based on Role:

````vue
<template>
  <div>
    <!-- Tombol Create: Hanya untuk Supervisor -->
    <button v-if="auth.canCreate.value" @click="createProduct">Tambah Produk Baru</button>

    <!-- Tombol Update: Untuk Admin & Supervisor -->
    <button v-if="auth.canUpdate.value" @click="editProduct">Edit Produk</button>

    1. Protect User Management Route ```typescript // middleware/supervisor-only.ts export default
    defineNuxtRouteMiddleware(async (to, from) => { const auth = useAuth(); // Initialize auth if not done if
    (!auth.isAuthenticated.value) { await auth.initAuth(); } - Full CRUD (catalog, products, categories, dll) - User
    Management access - Can see/edit custom product links Username: admin Email: admin@melati.com Permissions: - Full
    CRUD (catalog, products, categories, dll) - NO User Management access - Cannot see custom product links form
  </div>
</template>
````

---

## 🔍 Summary of Changes

### What's Different from Original Plan:

**Original (❌):**

- Supervisor: Full CRUD
- Admin: Read + Update only (no Create/Delete)

**New/Corrected (✅):**

- **Both roles**: Full CRUD access to catalog
- **Difference**: UI/feature level only
  - Supervisor: Can manage users + see custom links
  - Admin: Cannot manage users + cannot see custom links

### Implementation Focus:

1. ✅ **Database RLS**: Both roles have same catalog permissions
2. ✅ **Route Middleware**: Protect `/admin/users` for supervisor only
3. ✅ **UI Conditional**: Hide user menu & custom links form from admin
4. ✅ **Security**: Clear custom links on save if user is admin
   });

````

Apply middleware:
```vue
<!-- pages/admin/users.vue -->
<script setup>
definePageMeta({
  middleware: ['auth', 'supervisor-only']
});
</script>
````

### 2. Hide User Menu for Admin

```vue
<!-- layouts/default.vue or SiteHeader.vue -->
<template>
  <nav>
    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
    <NuxtLink to="/admin/catalog">Catalog</NuxtLink>

    <!-- User Management: Only for Supervisor -->
    <NuxtLink v-if="auth.canAccessUserManagement.value" to="/admin/users">Users</NuxtLink>

    <span class="badge">
      {{ auth.isSupervisor.value ? "Supervisor" : "Admin" }}
    </span>
  </nav>
</template>

<script setup lang="ts">
const auth = useAuth();
</script>
```

### 3. Hide Custom Links Form for Admin

```vue
<!-- components/admin/catalog/CatalogProductModal.vue -->
<template>
  <form>
    <!-- ... product fields ... -->

    <!-- Custom Links: Only visible to Supervisor -->
    <div v-if="auth.canSeeCustomLinks.value" class="custom-links-section">
      <h4>🔗 Link Custom (Opsional)</h4>

      <div>
        <label>Link Shopee Produk Spesifik</label>
        <input v-model="form.custom_shopee_link" type="url" />
      </div>

      <div>
        <label>Nomor WhatsApp Khusus</label>
        <input v-model="form.custom_whatsapp_number" type="text" />
      </div>
    </div>

    <!-- ... other fields ... -->
  </form>
</template>

<script setup lang="ts">
const auth = useAuth();

// Clear custom links if admin tries to submit
const save = async () => {
  // Security: Clear custom links if not supervisor
  if (!auth.isSupervisor.value) {
    form.value.custom_shopee_link = "";
    form.value.custom_whatsapp_number = "";
  }

  // ... rest of save logic
};
</script>
```

### 4. Conditional Button Rendering

```vue
<template>
  <div>
    <!-- All buttons visible for both roles (same CRUD access) -->
    <button v-if="auth.canCreate.value" @click="createProduct">Tambah Produk</button>

    <button v-if="auth.canUpdate.value" @click="editProduct">Edit Produk</button>

    <button v-if="auth.canDelete.value" @click="deleteProduct">Hapus Produk</button>

    <!-- Role indicator -->
    <span class="badge">
      {{ auth.userRole.value 2. ✅ Buat 2 users di Supabase Authentication 3. ✅ Link users ke admin_users table 4. ✅
      Update useAuth.ts composable 5. ✅ Update login page 6. ✅ Test login flow & permissions ### Security Benefits: -
      ✅ RLS enforce permissions di database level - ✅ Username-based login (user-friendly) - ✅ Supabase Auth manage
      sessions - ✅ Role-based access control - ✅ No localStorage vulnerabilities ### Credentials:
    </span>
  </div>
</template>
```

Username: supervisor
Email: supervisor@melati.com
Permissions: Full Access (CRUD)

Username: admin  
Email: admin@melati.com
Permissions: Read + Update only

```

```
