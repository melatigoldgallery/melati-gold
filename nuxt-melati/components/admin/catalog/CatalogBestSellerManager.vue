<template>
  <div>
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Best Sellers</h2>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Manajemen produk terlaris</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {{ bestSellers.length }} produk
        </span>
        <button
          @click="loadBestSellers"
          class="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors text-xs sm:text-sm"
        >
          <i class="bi bi-arrow-clockwise"></i>
          <span class="hidden sm:inline ml-1">Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600 text-sm">Memuat produk terlaris...</p>
    </div>

    <!-- Best Sellers Grid -->
    <div
      v-else-if="bestSellers.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4"
    >
      <div
        v-for="product in bestSellers"
        :key="product.id"
        class="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col"
      >
        <!-- Image with badges -->
        <div class="relative aspect-[3/4] bg-gray-100">
          <img
            :src="product.thumbnail_image || '/img/placeholder.jpg'"
            :alt="product.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-1.5 left-1.5 flex flex-col gap-1">
            <span
              v-if="product.is_featured"
              class="px-1.5 py-0.5 bg-blue-600/90 text-white text-[10px] rounded-full leading-none backdrop-blur-sm"
            >
              <i class="bi bi-star-fill"></i>
            </span>
            <span
              class="px-1.5 py-0.5 bg-yellow-500/90 text-white text-[10px] rounded-full leading-none backdrop-blur-sm"
            >
              <i class="bi bi-trophy-fill"></i>
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="p-2 sm:p-3 flex flex-col flex-1">
          <h3 class="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight mb-1 text-gray-900">
            {{ product.title }}
          </h3>
          <p class="text-xs text-gray-600 font-medium mb-1">
            {{ product.price ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : "-" }}
          </p>
          <p class="text-[10px] sm:text-xs text-gray-400 truncate mb-1.5">{{ product.category_name }}</p>
          <p v-if="product.view_count" class="text-[10px] sm:text-xs text-gray-400 mb-2">
            <i class="bi bi-eye mr-0.5"></i>
            {{ product.view_count }} views
          </p>

          <!-- Remove button -->
          <button
            @click="toggleBestSeller(product.id)"
            class="mt-auto w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-gray-600 rounded-lg text-xs transition-colors"
          >
            <i class="bi bi-trophy"></i>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 text-gray-400">
      <i class="bi bi-trophy text-5xl mb-3 block"></i>
      <p class="font-medium text-gray-500">Tidak ada produk terlaris</p>
      <p class="text-xs sm:text-sm mt-1 mb-4">Buka tab "All Products" untuk menandai produk sebagai terlaris</p>
      <NuxtLink
        to="/admin/catalog?tab=products"
        class="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
      >
        Buka Produk
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const { getBestSellers, toggleProductBestSeller } = useCatalogManager();

// State
const bestSellers = ref<any[]>([]);
const loading = ref(true);

// Load best sellers
const loadBestSellers = async () => {
  loading.value = true;
  const result = await getBestSellers();
  if (result.success) {
    bestSellers.value = result.data;
  } else {
    const errorMsg = "error" in result ? result.error : "Unknown error";
    emit("alert", "Failed to load best sellers: " + errorMsg, "error");
  }
  loading.value = false;
};

// Toggle best seller status
const toggleBestSeller = async (productId: string) => {
  if (!confirm("Remove this product from best sellers?")) return;

  const result = await toggleProductBestSeller(productId);
  if (result.success) {
    emit("alert", "Product removed from best sellers!", "success");
    loadBestSellers();
  } else {
    const errorMsg = "error" in result ? result.error : "Unknown error";
    emit("alert", "Failed to update product: " + errorMsg, "error");
  }
};

// Initialize
onMounted(() => {
  loadBestSellers();
});
</script>
