<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4">
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-0">Melati Gold Admin</h1>
          <div class="flex flex-wrap items-center space-x-3 sm:space-x-4">
            <NuxtLink to="/dashboard" class="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
              ← Dashboard
            </NuxtLink>
            <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm sm:text-base">Website</NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Navigation Tabs -->
      <div class="mb-6 sm:mb-8">
        <nav class="flex flex-wrap gap-2 sm:space-x-4 sm:gap-0">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium flex-1 sm:flex-none min-w-0',
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200',
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-lg shadow">
        <!-- Products Section -->
        <div v-if="activeTab === 'products'" class="p-4 sm:p-6">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0"
          >
            <h2 class="text-lg sm:text-xl font-semibold">Manage Products</h2>
            <button @click="openModal('products')" class="btn-primary w-full sm:w-auto">+ Add Product</button>
          </div>
          <ProductList :items="getContent('products').value" @edit="editItem" @delete="deleteItem" />
        </div>

        <!-- Services Section -->
        <div v-if="activeTab === 'services'" class="p-4 sm:p-6">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0"
          >
            <h2 class="text-lg sm:text-xl font-semibold">Manage Services</h2>
            <button @click="openModal('services')" class="btn-primary w-full sm:w-auto">+ Add Service</button>
          </div>
          <ServiceList :items="getContent('services').value" @edit="editItem" @delete="deleteItem" />
        </div>

        <!-- About Section -->
        <div v-if="activeTab === 'about'" class="p-4 sm:p-6">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0"
          >
            <h2 class="text-lg sm:text-xl font-semibold">Manage About Content</h2>
            <button @click="openModal('about')" class="btn-primary w-full sm:w-auto">+ Add Content</button>
          </div>
          <AboutList :items="getContent('about').value" @edit="editItem" @delete="deleteItem" />
        </div>
      </div>
    </div>

    <!-- Universal Edit Modal -->
    <EditModal v-if="showModal" :section="currentSection" :item="editingItem" @save="saveItem" @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
// Add authentication middleware
definePageMeta({
  layout: false,
  middleware: "auth",
});

const { getContent, loadContent, saveContent, deleteContent } = useContentManager();

const activeTab = ref("products");
const showModal = ref(false);
const currentSection = ref("");
const editingItem = ref<any>(null);

const tabs = [
  { key: "products", label: "Products" },
  { key: "services", label: "Services" },
  { key: "about", label: "About" },
];

const openModal = (section: string, item?: any) => {
  currentSection.value = section;
  editingItem.value = item || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const editItem = (item: any) => {
  openModal(item.sectionKey, item);
};

const saveItem = async (data: any) => {
  const result = await saveContent(data);
  if (result.success) {
    closeModal();
    // Show success message
  }
};

const deleteItem = async (item: any) => {
  if (confirm("Are you sure you want to delete this item?")) {
    const result = await deleteContent(item.id, item.sectionKey);
    if (result.success) {
      // Show success message
    }
  }
};

onMounted(() => {
  loadContent();
});
</script>

<style scoped>
.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}
</style>
