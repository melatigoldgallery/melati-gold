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
        v-for="product in paginatedBestSellers"
        :key="product.id"
        class="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col"
      >
        <!-- Image with badges -->
        <div class="relative h-48 bg-gray-100">
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
        <div class="p-2 sm:p-2.5 flex flex-col flex-1 gap-1">
          <h3 class="font-semibold text-xs sm:text-sm truncate leading-tight text-gray-900">
            {{ product.title }}
          </h3>
          <p class="text-xs text-gray-600 font-medium">
            {{ product.price ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : "-" }}
          </p>
          <p class="text-[10px] text-gray-400 truncate">{{ product.category_name }}</p>

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

    <!-- Pagination -->
    <div
      v-if="!loading && bestSellers.length > 0"
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

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(15);
const totalItems = ref(0);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const paginatedBestSellers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return bestSellers.value.slice(start, start + itemsPerPage.value);
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

// Load best sellers
const loadBestSellers = async () => {
  loading.value = true;
  const result = await getBestSellers();
  if (result.success) {
    bestSellers.value = result.data;
    totalItems.value = result.data.length;
    currentPage.value = 1;
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
