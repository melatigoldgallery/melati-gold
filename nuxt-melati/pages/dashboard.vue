<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
          <!-- Logo & Title -->
          <div class="flex items-center mb-3 sm:mb-0">
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3"
            >
              <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-bold text-gray-900">Melati Gold</h1>
              <p class="text-xs sm:text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <span class="text-sm text-gray-700">Selamat Datang, Admin</span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <!-- Welcome Section -->
      <div class="mb-6 sm:mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h2>
        <p class="text-sm sm:text-base text-gray-600">Atur galeri perhiasan dan konten situs web Melati</p>
      </div>

      <!-- Main Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <!-- Website Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <div class="flex items-center">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900">Manajemen Website</h3>
                <p class="text-sm text-gray-600">Lihat dan kelola situs web publik Melati</p>
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6">
            <div class="space-y-4">
              <NuxtLink
                to="/"
                target="_blank"
                class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                <div class="flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Lihat Website
                </div>
              </NuxtLink>
              <p class="text-sm text-gray-500 text-center">Membuka situs web langsung di tab baru</p>
            </div>
          </div>
        </div>

        <!-- Admin Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <div class="flex items-center">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900">Admin Panel</h3>
                <p class="text-sm text-gray-600">Kelola konten, produk, dan pengaturan</p>
              </div>
            </div>
          </div>
          <div class="p-4 sm:p-6">
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-1 gap-3">
                <NuxtLink
                  to="/admin/catalog"
                  class="bg-yellow-600 hover:bg-yellow-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <i class="bi bi-grid-3x3-gap mr-2"></i>
                  Manajemen Katalog
                </NuxtLink>
                <NuxtLink
                  to="/admin/users"
                  class="bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors d-none"
                >
                  <i class="bi bi-people-fill mr-2"></i>
                  Admin Users
                </NuxtLink>
              </div>
              <p class="text-sm text-gray-500 text-center">Kelola katalog, produk, layanan, dan konten situs web</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-6 sm:mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">Tindakan Cepat</h3>
          <p class="text-sm text-gray-600">Tugas administratif umum</p>
        </div>
        <div class="p-4 sm:p-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <NuxtLink
              to="/admin/catalog?tab=products"
              class="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
            >
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 group-hover:bg-yellow-200 rounded-lg flex items-center justify-center mb-2"
              >
                <i class="bi bi-box-seam text-yellow-600 text-lg sm:text-xl"></i>
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-yellow-700 text-center">
                Produk
              </span>
            </NuxtLink>

            <NuxtLink
              to="/admin/catalog?tab=best-sellers"
              class="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2"
              >
                <i class="bi bi-trophy-fill text-blue-600 text-lg sm:text-xl"></i>
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-700 text-center">
                Best Sellers
              </span>
            </NuxtLink>

            <NuxtLink
              to="/admin/catalog?tab=services"
              class="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
            >
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mb-2"
              >
                <i class="bi bi-gem text-green-600 text-lg sm:text-xl"></i>
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-700 text-center">
                Layanan Custom
              </span>
            </NuxtLink>

            <NuxtLink
              to="/admin/catalog?tab=categories"
              class="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mb-2"
              >
                <i class="bi bi-grid-3x3-gap-fill text-purple-600 text-lg sm:text-xl"></i>
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-purple-700 text-center">
                Kategori
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Disable default layout for dashboard page
definePageMeta({
  layout: false,
});

// Set page title
useHead({
  title: "Dashboard - Melati Gold Admin",
  meta: [{ name: "description", content: "Admin dashboard for Melati Gold Gallery" }],
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    },
  ],
});

// Handle logout
const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loginTime");
  navigateTo("/login");
};

// Check authentication on mount
onMounted(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    navigateTo("/login");
  }
});
</script>
