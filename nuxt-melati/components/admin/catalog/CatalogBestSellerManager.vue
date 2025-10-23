<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Best Sellers</h2>
        <p class="text-sm text-gray-600 mt-1">Manage products marked as best sellers</p>
      </div>
      <button
        @click="loadBestSellers"
        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        <i class="bi bi-arrow-clockwise mr-2"></i>
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Loading best sellers...</p>
    </div>

    <!-- Best Sellers Grid -->
    <div v-else-if="bestSellers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="product in bestSellers"
        :key="product.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <!-- Image -->
        <img
          :src="product.thumbnail_image || '/img/placeholder.jpg'"
          :alt="product.title"
          class="w-full h-48 object-cover rounded-lg mb-3"
        />

        <!-- Info -->
        <div class="mb-3">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-lg">{{ product.title }}</h3>
            <div class="flex gap-1">
              <span
                v-if="product.is_featured"
                class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                title="Featured"
              >
                <i class="bi bi-star-fill"></i>
              </span>
              <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full" title="Best Seller">
                <i class="bi bi-trophy-fill"></i>
              </span>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-2">{{ product.name }}</p>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ product.category_name }}</span>
            <span class="font-semibold text-yellow-600">
              {{ product.price ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : "N/A" }}
            </span>
          </div>

          <div class="mt-2 text-xs text-gray-500">
            <span>{{ product.view_count || 0 }} views</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="toggleBestSeller(product.id)"
            class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            <i class="bi bi-x-circle mr-1"></i>
            Remove from Best Sellers
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-500">
      <i class="bi bi-trophy text-4xl mb-2"></i>
      <p class="text-lg">No best sellers yet</p>
      <p class="text-sm mt-2">Go to Products tab to mark products as best sellers</p>
      <NuxtLink
        to="/admin/catalog?tab=products"
        class="inline-block mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        Go to Products
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
    emit("alert", "Failed to load best sellers: " + result.error, "error");
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
    emit("alert", "Failed to update product: " + result.error, "error");
  }
};

// Initialize
onMounted(() => {
  loadBestSellers();
});
</script>
