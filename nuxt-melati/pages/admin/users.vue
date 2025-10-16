<template>
  <div class="min-h-screen bg-gray-50 py-6 sm:py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Admin Users</h1>
            <p class="mt-1 text-sm text-gray-600">Kelola akun admin yang bisa mengakses dashboard</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <i class="bi bi-person-plus-fill mr-2"></i>
            Tambah Admin
          </button>
        </div>
      </div>

      <!-- Alert Messages -->
      <div v-if="alert.show" :class="alertClass" class="mb-6 rounded-lg p-4">
        <div class="flex items-center">
          <i
            :class="alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'"
            class="text-lg mr-2"
          ></i>
          <span>{{ alert.message }}</span>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-4 sm:px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <i class="bi bi-person-fill text-yellow-600 text-lg"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                      <div class="text-sm text-gray-500">@{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <span
                    :class="user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4">
                  <span
                    :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ user.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(user.last_login) }}
                </td>
                <td class="px-4 sm:px-6 py-4 text-right text-sm font-medium space-x-2">
                  <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900" title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    :class="
                      user.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                    "
                    :title="user.is_active ? 'Deactivate' : 'Activate'"
                  >
                    <i :class="user.is_active ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'"></i>
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-900"
                    title="Delete"
                    :disabled="user.role === 'superadmin'"
                    :class="user.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div
        v-if="showCreateModal || editingUser"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-xl max-w-md w-full p-6 sm:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">
              {{ editingUser ? "Edit Admin User" : "Tambah Admin Baru" }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                v-model="formData.username"
                type="text"
                required
                :disabled="!!editingUser"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Username"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input
                v-model="formData.full_name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <div v-if="!editingUser">
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                v-model="formData.password"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                v-model="formData.role"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {{ loading ? "Menyimpan..." : "Simpan" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="deleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <i class="bi bi-exclamation-triangle-fill text-red-600 text-xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Hapus Admin User</h3>
            <p class="text-sm text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus user
              <strong>{{ deleteConfirm.username }}</strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div class="flex gap-3">
              <button
                @click="deleteConfirm = null"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button @click="deleteUser" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: "auth",
});

useHead({
  title: "Admin Users - Melati Gold",
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    },
  ],
});

const { $supabase } = useNuxtApp();

const users = ref([]);
const showCreateModal = ref(false);
const editingUser = ref(null);
const deleteConfirm = ref(null);
const loading = ref(false);
const alert = ref({ show: false, type: "", message: "" });

const formData = ref({
  username: "",
  full_name: "",
  email: "",
  password: "",
  role: "admin",
});

const alertClass = computed(() => {
  return alert.value.type === "success"
    ? "bg-green-50 border border-green-200 text-green-800"
    : "bg-red-50 border border-red-200 text-red-800";
});

// Load users
const loadUsers = async () => {
  try {
    const { data, error } = await $supabase.from("admin_users").select("*").order("created_at", { ascending: false });

    if (error) throw error;
    users.value = data || [];
  } catch (error) {
    console.error("Error loading users:", error);
    showAlert("error", "Gagal memuat data users");
  }
};

// Create user
const saveUser = async () => {
  loading.value = true;
  try {
    if (editingUser.value) {
      // Update existing user
      const { error } = await $supabase
        .from("admin_users")
        .update({
          full_name: formData.value.full_name,
          email: formData.value.email,
          role: formData.value.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.value.id);

      if (error) throw error;
      showAlert("success", "User berhasil diupdate");
    } else {
      // Create new user using SQL function
      const { error } = await $supabase.rpc("create_admin_user", {
        p_username: formData.value.username,
        p_password: formData.value.password,
        p_full_name: formData.value.full_name,
        p_email: formData.value.email,
        p_role: formData.value.role,
      });

      if (error) throw error;
      showAlert("success", "User berhasil ditambahkan");
    }

    closeModal();
    await loadUsers();
  } catch (error) {
    console.error("Error saving user:", error);
    showAlert("error", error.message || "Gagal menyimpan user");
  } finally {
    loading.value = false;
  }
};

// Edit user
const editUser = (user) => {
  editingUser.value = user;
  formData.value = {
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    password: "",
  };
};

// Toggle user status
const toggleUserStatus = async (user) => {
  try {
    const { error } = await $supabase
      .from("admin_users")
      .update({
        is_active: !user.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;
    showAlert("success", `User berhasil ${!user.is_active ? "diaktifkan" : "dinonaktifkan"}`);
    await loadUsers();
  } catch (error) {
    console.error("Error toggling user status:", error);
    showAlert("error", "Gagal mengubah status user");
  }
};

// Confirm delete
const confirmDelete = (user) => {
  deleteConfirm.value = user;
};

// Delete user
const deleteUser = async () => {
  try {
    const { error } = await $supabase.from("admin_users").delete().eq("id", deleteConfirm.value.id);

    if (error) throw error;
    showAlert("success", "User berhasil dihapus");
    deleteConfirm.value = null;
    await loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    showAlert("error", "Gagal menghapus user");
  }
};

// Close modal
const closeModal = () => {
  showCreateModal.value = false;
  editingUser.value = null;
  formData.value = {
    username: "",
    full_name: "",
    email: "",
    password: "",
    role: "admin",
  };
};

// Show alert
const showAlert = (type, message) => {
  alert.value = { show: true, type, message };
  setTimeout(() => {
    alert.value.show = false;
  }, 5000);
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load users on mount
onMounted(() => {
  loadUsers();
});
</script>
