<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Manage Categories</h2>
      <button
        @click="openModal()"
        class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        <i class="bi bi-plus-circle mr-2"></i>
        Add Category
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Loading categories...</p>
    </div>

    <!-- Categories List -->
    <div v-else-if="!loading && categories.length > 0" class="space-y-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <!-- Image -->
        <div class="flex-shrink-0">
          <img
            :src="category.cover_image || '/img/placeholder.jpg'"
            :alt="category.name"
            class="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        <!-- Info -->
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-lg">{{ category.name }}</h3>
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full',
                category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
              ]"
            >
              {{ category.is_active ? "Active" : "Inactive" }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ category.description || "No description" }}</p>
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Slug: {{ category.slug }}</span>
            <span>Order: {{ category.display_order }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="openModal(category)"
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            @click="confirmDelete(category)"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && categories.length === 0" class="text-center py-12 text-gray-500">
      <i class="bi bi-grid-3x3-gap text-4xl mb-2"></i>
      <p>No categories found. Create one to get started.</p>
      <p class="text-xs mt-2">Debug: Loading={{ loading }}, Categories={{ categories.length }}</p>
    </div>

    <!-- Debug State (Fallback) -->
    <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 class="font-semibold text-yellow-900 mb-2">⚠️ Debug Info</h3>
      <div class="text-sm text-yellow-800 space-y-1">
        <p>Loading: {{ loading }}</p>
        <p>Categories length: {{ categories.length }}</p>
        <p>Categories data: {{ categories }}</p>
      </div>
    </div>

    <!-- Modal -->
    <CatalogCategoryModal v-if="showModal" :category="selectedCategory" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const { getCategories, deleteCategory } = useCatalogManager();

// State
const categories = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const selectedCategory = ref<any>(null);

// Load categories
const loadCategories = async () => {
  loading.value = true;
  console.log("[CatalogCategoryManager] Loading categories...");

  const result = await getCategories();
  console.log("[CatalogCategoryManager] Result:", result);

  if (result.success) {
    categories.value = result.data;
    console.log("[CatalogCategoryManager] Categories loaded:", categories.value.length, "items");
  } else {
    console.error("[CatalogCategoryManager] Error:", result.error);
    emit("alert", "Failed to load categories: " + result.error, "error");
  }
  loading.value = false;
};

// Modal handlers
const openModal = (category?: any) => {
  selectedCategory.value = category || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCategory.value = null;
};

const handleSaved = () => {
  loadCategories();
  closeModal();
  emit("alert", "Category saved successfully!", "success");
};

// Delete handler
const confirmDelete = async (category: any) => {
  if (
    !confirm(
      `Are you sure you want to delete "${category.name}"? This will also delete all its subcategories and products.`
    )
  ) {
    return;
  }

  const result = await deleteCategory(category.id);
  if (result.success) {
    emit("alert", "Category deleted successfully!", "success");
    loadCategories();
  } else {
    emit("alert", "Failed to delete category: " + result.error, "error");
  }
};

// Initialize
onMounted(() => {
  console.log("[CatalogCategoryManager] Component mounted, calling loadCategories...");
  loadCategories();
});

// Debug watcher
watch(categories, (newVal) => {
  console.log("[CatalogCategoryManager] Categories changed:", newVal.length, "items");
});

watch(loading, (newVal) => {
  console.log("[CatalogCategoryManager] Loading state:", newVal);
});
</script>
