<template>
  <div>
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Featured Products</h2>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Ditampilkan di homepage sebagai produk unggulan</p>
      </div>
      <span class="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {{ featuredProducts.length }} produk
      </span>
    </div>

    <!-- Info Hint -->
    <p class="mb-4 sm:mb-5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <i class="bi bi-info-circle mr-1.5"></i>
      Buka tab
      <strong>All Products</strong>
      → toggle
      <strong>Featured</strong>
      untuk menambah produk.
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600 text-sm">Memuat featured products...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="featuredProducts.length === 0" class="text-center py-16 text-gray-400">
      <i class="bi bi-star text-5xl mb-3 block"></i>
      <p class="font-medium text-gray-500">Belum ada produk featured</p>
      <p class="text-xs sm:text-sm mt-1">Buka tab "All Products" untuk menandai produk sebagai featured.</p>
    </div>

    <!-- Featured Products Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      <div
        v-for="product in paginatedProducts"
        :key="product.id"
        class="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col"
      >
        <!-- Image -->
        <div class="relative h-48 bg-gray-100">
          <img
            :src="product.thumbnail_image || product.images?.[0] || '/img/placeholder.jpg'"
            :alt="product.title"
            class="w-full h-full object-cover"
          />
          <!-- Badges -->
          <div class="absolute top-1.5 left-1.5 flex flex-col gap-1">
            <span
              class="px-1.5 py-0.5 bg-blue-600/90 text-white text-[10px] rounded-full leading-none backdrop-blur-sm"
            >
              <i class="bi bi-star-fill"></i>
            </span>
            <span
              v-if="product.is_best_seller"
              class="px-1.5 py-0.5 bg-yellow-500/90 text-white text-[10px] rounded-full leading-none backdrop-blur-sm"
            >
              <i class="bi bi-trophy-fill"></i>
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-2 sm:p-2.5 flex flex-col flex-1 gap-1">
          <h3 class="font-semibold text-xs sm:text-sm truncate leading-tight text-gray-900">
            {{ product.title }}
          </h3>
          <p class="text-xs text-gray-600 font-medium">{{ formatPrice(product.price) }}</p>
          <p class="text-[10px] text-gray-400 truncate">
            {{ product.category?.name }}
            <span v-if="product.subcategory?.name">› {{ product.subcategory?.name }}</span>
          </p>

          <!-- Remove button -->
          <button
            @click="removeFeatured(product)"
            class="mt-auto w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-gray-600 rounded-lg text-xs transition-colors"
          >
            <i class="bi bi-star"></i>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && featuredProducts.length > 0"
      class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
    >
      <div class="text-sm text-gray-600">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
          Math.min(currentPage * itemsPerPage, totalItems)
        }}
        dari {{ totalItems }} produk
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <div class="flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors"
            :class="
              page === currentPage
                ? 'bg-yellow-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
            "
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const { getFeaturedProducts, toggleProductFeatured } = useCatalogManager();

// State
const featuredProducts = ref<any[]>([]);
const loading = ref(true);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(15);
const totalItems = ref(0);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return featuredProducts.value.slice(start, start + itemsPerPage.value);
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

const goToPage = (page: number | string) => {
  if (typeof page === "string") return;
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
const nextPage = () => goToPage(currentPage.value + 1);
const prevPage = () => goToPage(currentPage.value - 1);

// Load featured products
const loadFeaturedProducts = async () => {
  loading.value = true;
  const result = await getFeaturedProducts();
  if (result.success) {
    featuredProducts.value = result.data;
    totalItems.value = result.data.length;
    currentPage.value = 1;
  } else {
    const errorMsg = "error" in result ? result.error : "Unknown error";
    emit("alert", "Failed to load featured products: " + errorMsg, "error");
  }
  loading.value = false;
};

// Remove from featured
const removeFeatured = async (product: any) => {
  if (!confirm(`Remove "${product.title}" from featured products?`)) return;

  const result = await toggleProductFeatured(product.id);
  if (result.success) {
    emit("alert", "Product removed from featured!", "success");
    loadFeaturedProducts();
  } else {
    const errorMsg = "error" in result ? result.error : "Unknown error";
    emit("alert", "Failed to update product: " + errorMsg, "error");
  }
};

// Helper
const formatPrice = (price: number) => {
  if (!price) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Initialize
onMounted(() => {
  loadFeaturedProducts();
});
</script>
