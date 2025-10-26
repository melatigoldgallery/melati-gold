<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Featured Products</h2>
        <p class="text-sm text-gray-600 mt-1">Products yang ditampilkan di homepage sebagai produk unggulan</p>
      </div>
    </div>

    <!-- Info Card -->
    <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <i class="bi bi-info-circle text-blue-600 text-xl mr-3 mt-1"></i>
        <div class="flex-1">
          <h3 class="font-semibold text-blue-900 mb-1">Cara Mengelola Featured Products</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Buka tab "All Products" untuk menambah/edit produk</li>
            <li>• Toggle "Featured" untuk menandai produk sebagai featured</li>
            <li>• Produk featured akan muncul di homepage section "Produk Unggulan"</li>
            <li>• Klik tombol di bawah untuk remove produk dari featured</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Loading featured products...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="featuredProducts.length === 0" class="text-center py-12 text-gray-500">
      <i class="bi bi-star text-4xl mb-2"></i>
      <p>Belum ada produk featured.</p>
      <p class="text-sm mt-1">Buka tab "All Products" untuk menandai produk sebagai featured.</p>
    </div>

    <!-- Featured Products Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="product in featuredProducts"
        :key="product.id"
        class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Image -->
        <div class="aspect-[4/3] bg-gray-100">
          <img
            :src="product.thumbnail_image || product.images?.[0] || '/img/placeholder.jpg'"
            :alt="product.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-lg text-gray-900 line-clamp-1">{{ product.title }}</h3>
            <span
              v-if="product.is_best_seller"
              class="ml-2 flex-shrink-0 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
            >
              <i class="bi bi-star-fill"></i>
              Best
            </span>
          </div>

          <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ product.description || "No description" }}</p>

          <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span v-if="product.category">
              <i class="bi bi-folder mr-1"></i>
              {{ product.category.name }}
            </span>
            <span v-if="product.subcategory">
              <i class="bi bi-tag mr-1"></i>
              {{ product.subcategory.name }}
            </span>
          </div>

          <div class="flex items-center justify-between mb-3">
            <div class="font-semibold text-maroon text-lg">
              {{ formatPrice(product.price) }}
            </div>
            <span v-if="product.weight" class="text-xs text-gray-600">{{ product.weight }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="removeFeatured(product)"
              class="flex-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm transition-colors"
            >
              <i class="bi bi-star mr-1"></i>
              Remove Featured
            </button>
          </div>
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
    emit("alert", "Failed to load featured products: " + result.error, "error");
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
    emit("alert", "Failed to update product: " + result.error, "error");
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
