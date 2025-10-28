<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Manajemen Subkategori</h2>
      <button
        @click="openModal()"
        class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        <i class="bi bi-plus-circle mr-2"></i>
        Tambah Subkategori
      </button>
    </div>

    <!-- Category Filter -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Filter berdasarkan Kategori</label>
      <select
        v-model="selectedCategoryId"
        @change="loadSubcategories"
        class="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Memuat subkategori...</p>
    </div>

    <!-- Subcategories List -->
    <div v-else-if="subcategories.length > 0" class="space-y-4">
      <div
        v-for="subcategory in subcategories"
        :key="subcategory.id"
        class="border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <!-- Image -->
        <div class="flex-shrink-0">
          <img
            :src="subcategory.cover_image || '/img/placeholder.jpg'"
            :alt="subcategory.name"
            class="w-20 h-20 object-cover rounded-lg"
          />
        </div>

        <!-- Info -->
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-lg">{{ subcategory.name }}</h3>
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full',
                subcategory.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
              ]"
            >
              {{ subcategory.is_active ? "Active" : "Inactive" }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            {{ subcategory.description || "No description" }}
          </p>
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span class="font-medium">Kategori: {{ subcategory.category?.name || "N/A" }}</span>
            <span>Slug: {{ subcategory.slug }}</span>
            <span>Urutan: {{ subcategory.display_order }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="openModal(subcategory)"
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            @click="confirmDelete(subcategory)"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-500">
      <i class="bi bi-diagram-3 text-4xl mb-2"></i>
      <p>Tidak ada subkategori ditemukan.</p>
      <p class="text-sm mt-1">
        {{ selectedCategoryId ? "Coba pilih kategori lain" : "Buat satu untuk memulai" }}
      </p>
    </div>

    <!-- Modal -->
    <CatalogSubcategoryModal
      v-if="showModal"
      :subcategory="selectedSubcategory"
      :categories="categories"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const { getCategories, getSubcategories, deleteSubcategory } = useCatalogManager();

// State
const categories = ref<any[]>([]);
const subcategories = ref<any[]>([]);
const selectedCategoryId = ref("");
const loading = ref(true);
const showModal = ref(false);
const selectedSubcategory = ref<any>(null);

// Load categories for filter
const loadCategories = async () => {
  const result = await getCategories();
  if (result.success) {
    categories.value = result.data;
  }
};

// Load subcategories
const loadSubcategories = async () => {
  loading.value = true;
  const result = await getSubcategories(selectedCategoryId.value || undefined);
  if (result.success) {
    subcategories.value = result.data;
  } else {
    emit("alert", "Failed to load subcategories: " + result.error, "error");
  }
  loading.value = false;
};

// Modal handlers
const openModal = (subcategory?: any) => {
  selectedSubcategory.value = subcategory || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedSubcategory.value = null;
};

const handleSaved = () => {
  loadSubcategories();
  closeModal();
  emit("alert", "Subcategory saved successfully!", "success");
};

// Delete handler
const confirmDelete = async (subcategory: any) => {
  if (
    !confirm(
      `Are you sure you want to delete "${subcategory.name}"? This will also delete all products in this subcategory.`
    )
  ) {
    return;
  }

  const result = await deleteSubcategory(subcategory.id);
  if (result.success) {
    emit("alert", "Subcategory deleted successfully!", "success");
    loadSubcategories();
  } else {
    emit("alert", "Failed to delete subcategory: " + result.error, "error");
  }
};

// Initialize
onMounted(async () => {
  await loadCategories();
  await loadSubcategories();
});
</script>
