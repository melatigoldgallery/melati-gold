<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Custom Services</h2>
      <button
        @click="openModal()"
        class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        <i class="bi bi-plus-circle mr-2"></i>
        Add Service
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      <p class="mt-2 text-gray-600">Loading services...</p>
    </div>

    <!-- Services List -->
    <div v-else-if="services.length > 0" class="space-y-4">
      <div
        v-for="service in services"
        :key="service.id"
        class="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div class="flex-shrink-0 w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i :class="service.icon || 'bi bi-gear'" class="text-3xl text-yellow-600"></i>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-semibold text-xl text-gray-900">{{ service.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ service.subtitle }}</p>
              </div>
              <span
                :class="[
                  'px-3 py-1 text-xs rounded-full',
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                ]"
              >
                {{ service.is_active ? "Active" : "Inactive" }}
              </span>
            </div>

            <p class="text-gray-700 mb-3">{{ service.description }}</p>

            <!-- Features -->
            <div v-if="service.features && service.features.length > 0" class="mb-3">
              <p class="text-sm font-medium text-gray-700 mb-1">Features:</p>
              <ul class="list-disc list-inside text-sm text-gray-600">
                <li v-for="(feature, idx) in service.features" :key="idx">{{ feature }}</li>
              </ul>
            </div>

            <!-- Meta Info -->
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span v-if="service.duration">
                <i class="bi bi-clock mr-1"></i>
                {{ service.duration }}
              </span>
              <span v-if="service.price_info">
                <i class="bi bi-tag mr-1"></i>
                {{ service.price_info }}
              </span>
              <span>Order: {{ service.display_order }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <button
              @click="openModal(service)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <i class="bi bi-pencil mr-1"></i>
              Edit
            </button>
            <button
              @click="confirmDelete(service)"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              <i class="bi bi-trash mr-1"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-500">
      <i class="bi bi-tools text-4xl mb-2"></i>
      <p>No custom services found. Create one to get started.</p>
    </div>

    <!-- Modal -->
    <CatalogServiceModal v-if="showModal" :service="selectedService" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["alert"]);

const { getCustomServices, deleteCustomService } = useCatalogManager();

// State
const services = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const selectedService = ref<any>(null);

// Load services
const loadServices = async () => {
  loading.value = true;
  const result = await getCustomServices();
  if (result.success) {
    services.value = result.data;
  } else {
    emit("alert", "Failed to load services: " + result.error, "error");
  }
  loading.value = false;
};

// Modal handlers
const openModal = (service?: any) => {
  selectedService.value = service || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedService.value = null;
};

const handleSaved = () => {
  loadServices();
  closeModal();
  emit("alert", "Service saved successfully!", "success");
};

// Delete handler
const confirmDelete = async (service: any) => {
  if (!confirm(`Are you sure you want to delete "${service.title}"?`)) {
    return;
  }

  const result = await deleteCustomService(service.id);
  if (result.success) {
    emit("alert", "Service deleted successfully!", "success");
    loadServices();
  } else {
    emit("alert", "Failed to delete service: " + result.error, "error");
  }
};

// Initialize
onMounted(() => {
  loadServices();
});
</script>
