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

    <!-- Info Card -->
    <div class="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
      <div class="flex items-start gap-2 sm:gap-3">
        <i class="bi bi-info-circle text-blue-600 text-base sm:text-lg mt-0.5 flex-shrink-0"></i>
        <ul class="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
          <li>
            • Buka tab
            <strong>All Products</strong>
            → toggle
            <strong>Featured</strong>
            untuk menambah produk
          </li>
          <li>
            • Klik
            <strong>Remove</strong>
            pada card di bawah untuk menghapus dari featured
          </li>
        </ul>
      </div>
    </div>

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
        v-for="product in featuredProducts"
        :key="product.id"
        class="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col"
      >
        <!-- Image -->
        <div class="relative aspect-[3/4] bg-gray-100">
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
        <div class="p-2 sm:p-3 flex flex-col flex-1">
          <h3 class="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight mb-1 text-gray-900">
            {{ product.title }}
          </h3>
          <p class="text-xs text-gray-600 font-medium mb-1">{{ formatPrice(product.price) }}</p>
          <p class="text-[10px] sm:text-xs text-gray-400 truncate mb-1.5">
            {{ product.category?.name }}
            <span v-if="product.subcategory?.name">› {{ product.subcategory?.name }}</span>
          </p>
          <p class="text-[10px] sm:text-xs text-gray-400 line-clamp-2 mb-2 hidden sm:block">
            {{ product.description || "" }}
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
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const { getFeaturedProducts, toggleProductFeatured } = useCatalogManager();

// State
const featuredProducts = ref<any[]>([]);
const loading = ref(true);

// Load featured products
const loadFeaturedProducts = async () => {
  loading.value = true;
  const result = await getFeaturedProducts();
  if (result.success) {
    featuredProducts.value = result.data;
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
