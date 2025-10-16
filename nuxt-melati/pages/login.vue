<template>
  <div
    class="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center p-4 sm:p-6 lg:p-8"
  >
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-6 sm:mb-8">
        <img src="public/img/logo.png" alt="Melati Gold Logo" class="mx-auto w-20 h-20 md:w-20 md:h-20" />
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Melati Gold</h1>
        <p class="text-sm sm:text-base text-gray-600">Admin Dashboard</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <form @submit.prevent="handleLogin" class="space-y-5 sm:space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="bi bi-person-fill text-gray-400" style="font-size: 1.25rem"></i>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="block w-full pl-10 pr-3 py-3 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="bi bi-lock-fill text-gray-400" style="font-size: 1.25rem"></i>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full pl-10 pr-10 py-3 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i
                  :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"
                  class="text-gray-400"
                  style="font-size: 1.25rem"
                ></i>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex">
              <i class="bi bi-x-circle-fill text-red-400" style="font-size: 1.25rem"></i>
              <p class="ml-2 text-sm text-red-600">{{ error }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 sm:py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <i class="bi bi-arrow-repeat animate-spin -ml-1 mr-3 text-white" style="font-size: 1.25rem"></i>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 sm:mt-8">
        <p class="text-xs sm:text-sm text-gray-500">© 2025 Melati Gold Gallery. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Disable default layout for login page
definePageMeta({
  layout: false,
});

// Set page title and meta
useHead({
  title: "Login - Melati Gold Admin",
  meta: [{ name: "description", content: "Admin login for Melati Gold Gallery" }],
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    },
  ],
});

// Reactive form data
const form = ref({
  username: "",
  password: "",
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref("");
const { login: authLogin, checkAuth } = useAuth();

// Handle login submission
const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    const result = await authLogin(form.value.username, form.value.password);

    if (result.success) {
      // Redirect to dashboard
      await navigateTo("/dashboard");
    } else {
      error.value = result.message;
    }
  } catch (err) {
    console.error("Login error:", err);
    error.value = "An error occurred during login";
  } finally {
    loading.value = false;
  }
};

// Check if already logged in
onMounted(() => {
  if (checkAuth()) {
    navigateTo("/dashboard");
  }
});
</script>
