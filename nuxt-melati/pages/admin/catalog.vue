<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Catalog Management</h1>
            <p class="mt-1 text-sm text-gray-600">Kelola katalog produk, best sellers, dan layanan custom</p>
          </div>
          <NuxtLink
            to="/dashboard"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Dashboard
          </NuxtLink>
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

      <!-- Tabs Navigation -->
      <div class="mb-6">
        <nav class="flex space-x-4 border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <!-- Categories Tab -->
        <div v-if="activeTab === 'categories'" class="p-6">
          <CatalogCategoryManager :key="`cat-${componentKey}`" @alert="showAlert" />
        </div>

        <!-- Subcategories Tab -->
        <div v-else-if="activeTab === 'subcategories'" class="p-6">
          <CatalogSubcategoryManager :key="`sub-${componentKey}`" @alert="showAlert" />
        </div>

        <!-- All Products Tab -->
        <div v-else-if="activeTab === 'all-products'" class="p-6">
          <CatalogProductManager :key="`prod-${componentKey}`" @alert="showAlert" />
        </div>

        <!-- Featured Products Tab -->
        <div v-else-if="activeTab === 'featured'" class="p-6">
          <CatalogFeaturedManager :key="`feat-${componentKey}`" @alert="showAlert" />
        </div>

        <!-- Best Sellers Tab -->
        <div v-else-if="activeTab === 'best-sellers'" class="p-6">
          <CatalogBestSellerManager :key="`best-${componentKey}`" @alert="showAlert" />
        </div>

        <!-- Custom Services Tab -->
        <div v-else-if="activeTab === 'services'" class="p-6">
          <CatalogServiceManager :key="`svc-${componentKey}`" @alert="showAlert" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: false,
});

useHead({
  title: "Catalog Management - Melati Gold Admin",
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    },
  ],
});

// Check for tab parameter in URL
const route = useRoute();
const activeTab = ref(route.query.tab?.toString() || "all-products");
const componentKey = ref(0); // Force component re-render

// Watch for tab changes in URL
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab.toString();
      componentKey.value++; // Force re-render on tab change
    }
  }
);

// Watch activeTab changes
watch(activeTab, (newTab) => {
  console.log("[Catalog] Tab changed to:", newTab);
  componentKey.value++; // Force component re-mount
});

// Debug: Log Supabase connection on mount
onMounted(() => {
  const { $supabase } = useNuxtApp();
  console.log("[Catalog] Supabase client available:", !!$supabase);
  if (!$supabase) {
    console.error("[Catalog] ERROR: Supabase client is NULL. Check your .env configuration!");
    showAlert("Supabase not configured. Please check .env file.", "error");
  }
});

const tabs = [
  { key: "categories", label: "Categories", icon: "bi bi-grid-3x3-gap" },
  { key: "subcategories", label: "Subcategories", icon: "bi bi-diagram-3" },
  { key: "all-products", label: "All Products", icon: "bi bi-box-seam" },
  { key: "featured", label: "Barang Pilihan", icon: "bi bi-star" },
  { key: "best-sellers", label: "Best Sellers", icon: "bi bi-star-fill" },
  { key: "services", label: "Custom Services", icon: "bi bi-tools" },
];

// Alert system
const alert = ref({
  show: false,
  type: "success",
  message: "",
});

const alertClass = computed(() => {
  return alert.value.type === "success"
    ? "bg-green-50 border border-green-200 text-green-700"
    : "bg-red-50 border border-red-200 text-red-700";
});

const showAlert = (message: string, type: "success" | "error" = "success") => {
  alert.value = { show: true, type, message };

  // Log to console for debugging
  if (type === "error") {
    console.error("[Catalog Alert]", message);
  } else {
    console.log("[Catalog Alert]", message);
  }

  setTimeout(() => {
    alert.value.show = false;
  }, 5000);
};
</script>
