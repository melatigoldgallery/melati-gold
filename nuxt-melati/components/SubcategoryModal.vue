<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  category: string | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", subcategoryId: string, subcategoryName: string): void;
}>();

// Fetch subcategories from database
const { getCategories, getSubcategories } = useCatalogManager();

const categories = ref<any[]>([]);
const subcategories = ref<any[]>([]);
const loading = ref(false);
const selectedCategoryId = ref<string | null>(null);

// Load categories and map by name
const loadCategories = async () => {
  const result = await getCategories();
  if (result.success) {
    categories.value = result.data;
  }
};

// Load subcategories when category changes
const loadSubcategories = async () => {
  if (!selectedCategoryId.value) {
    subcategories.value = [];
    return;
  }

  loading.value = true;
  const result = await getSubcategories(selectedCategoryId.value);

  if (result.success) {
    // Filter only active subcategories and sort by display_order
    subcategories.value = result.data
      .filter((sub: any) => sub.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order);
  }

  loading.value = false;
};

// Watch for category prop changes
watch(
  () => props.category,
  async (newCategory) => {
    if (newCategory && categories.value.length > 0) {
      // Find category by name
      const foundCategory = categories.value.find((cat: any) => cat.name === newCategory);
      if (foundCategory) {
        selectedCategoryId.value = foundCategory.id;
        await loadSubcategories();
      }
    }
  },
  { immediate: true }
);

// Watch show prop to reload when modal opens
watch(
  () => props.show,
  async (isShown) => {
    if (isShown && categories.value.length === 0) {
      await loadCategories();
    }
  }
);

// Initialize
onMounted(async () => {
  await loadCategories();
});
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal d-block" tabindex="-1" role="dialog" @click.self="emit('close')">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content bg-white rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header border-0">
            <h5 class="modal-title">Pilih Sub-Kategori {{ category }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="emit('close')"></button>
          </div>
          <div class="modal-body">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Memuat sub-kategori...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="subcategories.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 mb-2 d-block"></i>
              <p>Belum ada sub-kategori untuk {{ category }}</p>
            </div>

            <!-- Subcategories Grid -->
            <div v-else class="row g-3 justify-content-center">
              <div
                v-for="subcategory in subcategories"
                :key="subcategory.id"
                :class="
                  subcategories.length === 4
                    ? 'col-6 col-md-3'
                    : subcategories.length <= 3
                    ? 'col-6 col-md-4'
                    : 'col-6 col-md-6'
                "
              >
                <button
                  class="w-100 btn p-0 border-0 bg-transparent"
                  @click="emit('select', subcategory.id, subcategory.name)"
                >
                  <div class="position-relative rounded-3 overflow-hidden subcard">
                    <!-- Image with fallback -->
                    <img
                      v-if="subcategory.cover_image"
                      :src="subcategory.cover_image"
                      :alt="subcategory.name"
                      class="w-100 h-100 object-fit-cover"
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="w-100 h-100 d-flex align-items-center justify-content-center bg-gradient"
                      style="background: linear-gradient(135deg, #8b6914 0%, #d4af37 100%)"
                    >
                      <i class="bi bi-gem fs-1 text-white opacity-50"></i>
                    </div>
                    <div class="overlay d-flex align-items-center justify-content-center">
                      <span class="text-white fw-semibold fs-6">{{ subcategory.name }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal {
  background: rgba(0, 0, 0, 0.5);
}
.subcard {
  aspect-ratio: 4/5;
}
.subcard img {
  transition: transform 0.4s ease;
}
.subcard:hover img {
  transform: scale(1.05);
}
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.15));
}
</style>
