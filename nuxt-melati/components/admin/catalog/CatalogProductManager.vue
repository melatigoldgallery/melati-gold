<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Manajemen Produk</h2>
      <button
        @click="openModal()"
        class="w-full sm:w-auto px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm sm:text-base"
      >
        <i class="bi bi-plus-circle mr-2"></i>
        Tambah Produk
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <select
        v-model="filters.categoryId"
        @change="loadProducts"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

      <select
        v-model="filters.subcategoryId"
        @change="loadProducts"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Semua Subkategori</option>
        <option v-for="sub in filteredSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
      </select>

      <select
        v-model="filters.status"
        @change="loadProducts"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Semua Status</option>
        <option value="featured">Featured</option>
        <option value="best_seller">Best Seller</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Loading products...</p>
    </div>

    <!-- Products Grid -->
    <div v-else-if="paginatedProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div
        v-for="product in paginatedProducts"
        :key="product.id"
        class="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
      >
        <!-- Image -->
        <img
          :src="product.thumbnail_image || '/img/placeholder.jpg'"
          :alt="product.title"
          class="w-full h-40 sm:h-48 object-cover rounded-lg mb-2 sm:mb-3"
        />

        <!-- Info -->
        <div class="mb-2 sm:mb-3">
          <div class="flex items-start justify-between mb-1 sm:mb-2">
            <h3 class="font-semibold text-sm sm:text-lg line-clamp-2 flex-1">{{ product.title }}</h3>
            <div class="flex gap-1 ml-2 flex-shrink-0">
              <span
                v-if="product.video_url"
                class="px-1.5 sm:px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                title="Has Video"
              >
                <i class="bi bi-camera-video-fill"></i>
              </span>
              <span
                v-if="product.is_featured"
                class="px-1.5 sm:px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                title="Featured"
              >
                <i class="bi bi-star-fill"></i>
              </span>
              <span
                v-if="product.is_best_seller"
                class="px-1.5 sm:px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                title="Best Seller"
              >
                <i class="bi bi-trophy-fill"></i>
              </span>
            </div>
          </div>

          <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            {{ formatPrice(product.price) }}
          </p>
          <p class="text-xs text-gray-500 truncate">{{ product.category?.name }} → {{ product.subcategory?.name }}</p>

          <div class="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs">
            <span v-if="product.karat" class="px-2 py-0.5 sm:py-1 bg-gray-100 rounded">{{ product.karat }}</span>
            <span v-if="product.weight" class="px-2 py-0.5 sm:py-1 bg-gray-100 rounded">{{ product.weight }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-1 sm:gap-2">
          <button
            @click="toggleFeatured(product)"
            :class="[
              'flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors',
              product.is_featured
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            <i class="bi bi-star-fill"></i>
            <span class="hidden xs:inline ml-1">Featured</span>
          </button>
          <button
            @click="toggleBestSeller(product)"
            :class="[
              'flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors',
              product.is_best_seller
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            <i class="bi bi-trophy-fill"></i>
            <span class="hidden xs:inline ml-1">Best</span>
          </button>
        </div>

        <div class="flex gap-1 sm:gap-2 mt-1 sm:mt-2">
          <button
            @click="openModal(product)"
            class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs sm:text-sm"
          >
            <i class="bi bi-pencil"></i>
            <span class="hidden xs:inline ml-1">Edit</span>
          </button>
          <button
            @click="confirmDelete(product)"
            class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm"
          >
            <i class="bi bi-trash"></i>
            <span class="hidden xs:inline ml-1">Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && products.length > 0"
      class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
    >
      <!-- Page Info -->
      <div class="text-sm text-gray-600">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
          Math.min(currentPage * itemsPerPage, totalItems)
        }}
        dari {{ totalItems }} produk
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <!-- Page Numbers -->
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
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="text-center py-12 text-gray-500">
      <i class="bi bi-box-seam text-4xl mb-2"></i>
      <p>Tidak ada produk ditemukan. Buat untuk memulai.</p>
    </div>

    <!-- Modal -->
    <CatalogProductModal
      v-if="showModal"
      :product="selectedProduct"
      :categories="categories"
      :subcategories="subcategories"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const {
  getProducts,
  getProductById,
  getCategories,
  getSubcategories,
  deleteProduct,
  toggleProductFeatured,
  toggleProductBestSeller,
} = useCatalogManager();

// State
const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const subcategories = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const selectedProduct = ref<any>(null);

const filters = ref({
  categoryId: "",
  subcategoryId: "",
  status: "",
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(12);
const totalItems = ref(0);

// Computed
const filteredSubcategories = computed(() => {
  if (!filters.value.categoryId) return subcategories.value;
  return subcategories.value.filter((sub: any) => sub.category_id === filters.value.categoryId);
});

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return products.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    // Show pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
});

// Pagination helpers
const goToPage = (page: number | string) => {
  if (typeof page === "string") return; // Skip ellipsis clicks
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const nextPage = () => goToPage(currentPage.value + 1);
const prevPage = () => goToPage(currentPage.value - 1);

// Load data
const loadProducts = async () => {
  loading.value = true;
  const filterObj: any = {};

  if (filters.value.categoryId) filterObj.categoryId = filters.value.categoryId;
  if (filters.value.subcategoryId) filterObj.subcategoryId = filters.value.subcategoryId;
  if (filters.value.status === "featured") filterObj.isFeatured = true;
  if (filters.value.status === "best_seller") filterObj.isBestSeller = true;

  const result = await getProducts(filterObj);
  if (result.success) {
    products.value = result.data;
    totalItems.value = result.data.length;
    currentPage.value = 1;
  } else {
    const errorMsg = "error" in result ? result.error : "Unknown error";
    emit("alert", "Failed to load products: " + errorMsg, "error");
  }
  loading.value = false;
};

const loadCategories = async () => {
  const result = await getCategories();
  if (result.success) categories.value = result.data;
};

const loadSubcategories = async () => {
  const result = await getSubcategories();
  if (result.success) subcategories.value = result.data;
};

// Modal handlers
const openModal = async (product?: any) => {
  if (product) {
    // Fetch full product data with all fields
    loading.value = true;
    const result = await getProductById(product.id);
    loading.value = false;

    if (result.success) {
      selectedProduct.value = result.data;
    } else {
      emit("alert", "Failed to load product details", "error");
      return;
    }
  } else {
    selectedProduct.value = null;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedProduct.value = null;
};

const handleSaved = () => {
  loadProducts();
  closeModal();
  emit("alert", "Product saved successfully!", "success");
};

// Toggle handlers
const toggleFeatured = async (product: any) => {
  const result = await toggleProductFeatured(product.id);
  if (result.success) {
    loadProducts();
    emit("alert", `Product ${!product.is_featured ? "added to" : "removed from"} featured`, "success");
  } else {
    emit("alert", "Failed to update product", "error");
  }
};

const toggleBestSeller = async (product: any) => {
  const result = await toggleProductBestSeller(product.id);
  if (result.success) {
    loadProducts();
    emit("alert", `Product ${!product.is_best_seller ? "added to" : "removed from"} best sellers`, "success");
  } else {
    emit("alert", "Failed to update product", "error");
  }
};

// Delete handler
const confirmDelete = async (product: any) => {
  if (!confirm(`Delete "${product.title}"?`)) return;

  const result = await deleteProduct(product.id);
  if (result.success) {
    emit("alert", "Product deleted successfully!", "success");
    loadProducts();
  } else {
    const errorMsg = "error" in result ? result.error : "Unknown error";
    emit("alert", "Failed to delete product: " + errorMsg, "error");
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
  loadCategories();
  loadSubcategories();
  loadProducts();
});
</script>
