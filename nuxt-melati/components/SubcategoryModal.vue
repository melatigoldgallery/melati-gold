<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  category: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", subcategoryId: string, subcategoryName: string): void;
}>();

// Fetch subcategories from database
const { getSubcategories } = useCatalogManager();

const subcategories = ref<any[]>([]);
const loading = ref(false);

// Load subcategories when category changes
const loadSubcategories = async (categoryId: string) => {
  if (!categoryId) {
    subcategories.value = [];
    return;
  }

  loading.value = true;
  const result = await getSubcategories(categoryId);

  if (result.success) {
    // Filter only active subcategories and sort by display_order
    subcategories.value = result.data
      .filter((sub: any) => sub.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order);
  } else {
    subcategories.value = [];
  }

  loading.value = false;
};

// Watch for show and category changes
watch(
  () => [props.show, props.category],
  async ([isShown, category]) => {
    if (isShown && category && category.id) {
      await loadSubcategories(category.id);
    } else if (!isShown) {
      // Reset when modal closes
      subcategories.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      tabindex="-1"
      role="dialog"
      @click.self="emit('close')"
    >
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="subcategories.length <= 2 ? 'max-w-md' : 'max-w-3xl'"
        role="document"
      >
        <div class="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 bg-white border-b">
          <h5 class="text-lg font-semibold text-neutral-800">Pilih Sub-Kategori {{ category?.name || "" }}</h5>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
            @click="emit('close')"
          >
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div
              class="inline-block w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="mt-4 text-gray-600">Memuat sub-kategori...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="subcategories.length === 0" class="text-center py-12 text-gray-500">
            <i class="bi bi-inbox text-6xl mb-3 block"></i>
            <p>Belum ada sub-kategori untuk {{ category?.name || "" }}</p>
          </div>

          <!-- Subcategories Grid -->
          <div
            v-else
            class="grid gap-3 justify-items-center"
            :class="{
              'grid-cols-2 md:grid-cols-4': subcategories.length === 4,
              'grid-cols-2 md:grid-cols-3': subcategories.length === 3,
              'grid-cols-2': subcategories.length <= 2,
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4': subcategories.length > 4,
            }"
          >
            <button
              v-for="subcategory in subcategories"
              :key="subcategory.id"
              class="w-full p-0 border-0 bg-transparent cursor-pointer"
              @click="emit('select', subcategory.id, subcategory.name)"
            >
              <div class="relative rounded-lg overflow-hidden subcard group">
                <!-- Image with fallback -->
                <img
                  v-if="subcategory.cover_image"
                  :src="subcategory.cover_image"
                  :alt="subcategory.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                  style="background: linear-gradient(135deg, #8b6914 0%, #d4af37 100%)"
                >
                  <i class="bi bi-gem text-6xl text-white opacity-50"></i>
                </div>
                <div class="overlay flex items-center justify-center">
                  <span class="text-white font-semibold">{{ subcategory.name }}</span>
                </div>
              </div>
            </button>
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
