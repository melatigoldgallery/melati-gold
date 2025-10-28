<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Manajemen Produk</h2>
      <button
        @click="openModal()"
        class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        <i class="bi bi-plus-circle mr-2"></i>
        Tambah Produk
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <select
        v-model="filters.categoryId"
        @change="loadProducts"
        class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

      <select
        v-model="filters.subcategoryId"
        @change="loadProducts"
        class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Semua Subkategori</option>
        <option v-for="sub in filteredSubcategories" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
      </select>

      <select
        v-model="filters.status"
        @change="loadProducts"
        class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
    <div v-else-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="product in products"
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
              <span
                v-if="product.is_best_seller"
                class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                title="Best Seller"
              >
                <i class="bi bi-trophy-fill"></i>
              </span>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-2">{{ product.price_display || formatPrice(product.price) }}</p>
          <p class="text-xs text-gray-500">{{ product.category?.name }} → {{ product.subcategory?.name }}</p>

          <div class="flex gap-2 mt-2 text-xs">
            <span v-if="product.karat" class="px-2 py-1 bg-gray-100 rounded">{{ product.karat }}</span>
            <span v-if="product.weight" class="px-2 py-1 bg-gray-100 rounded">{{ product.weight }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="toggleFeatured(product)"
            :class="[
              'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
              product.is_featured
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            <i class="bi bi-star-fill mr-1"></i>
            Featured
          </button>
          <button
            @click="toggleBestSeller(product)"
            :class="[
              'flex-1 px-3 py-2 text-sm rounded-lg transition-colors',
              product.is_best_seller
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            <i class="bi bi-trophy-fill mr-1"></i>
            Best
          </button>
        </div>

        <div class="flex gap-2 mt-2">
          <button
            @click="openModal(product)"
            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          >
            <i class="bi bi-pencil mr-1"></i>
            Edit
          </button>
          <button
            @click="confirmDelete(product)"
            class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            <i class="bi bi-trash mr-1"></i>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-500">
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

const { getProducts, getCategories, getSubcategories, deleteProduct, toggleProductFeatured, toggleProductBestSeller } =
  useCatalogManager();

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

// Computed
const filteredSubcategories = computed(() => {
  if (!filters.value.categoryId) return subcategories.value;
  return subcategories.value.filter((sub: any) => sub.category_id === filters.value.categoryId);
});

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
  } else {
    emit("alert", "Failed to load products: " + result.error, "error");
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
const openModal = (product?: any) => {
  selectedProduct.value = product || null;
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
    emit("alert", "Failed to delete product: " + result.error, "error");
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
