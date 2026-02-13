<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  category: any;
  filters: {
    subcategoryId: string;
    priceMin: number | null;
    priceMax: number | null;
    karat: string;
    sortBy: string;
  };
}>();

const emit = defineEmits<{
  (e: "update:filters", filters: any): void;
}>();

// Get subcategories for this category
const { getSubcategories } = useCatalogManager();
const subcategories = ref<any[]>([]);
const loading = ref(false);

// Local filter state
const localFilters = ref({ ...props.filters });

// Mobile filter drawer state
const showMobileFilters = ref(false);

// Load subcategories
const loadSubcategories = async () => {
  if (!props.category?.id) return;

  loading.value = true;
  const result = await getSubcategories(props.category.id);

  if (result.success) {
    subcategories.value = result.data
      .filter((sub: any) => sub.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order);
  }

  loading.value = false;
};

// Watch category changes
watch(() => props.category, loadSubcategories, { immediate: true });

// Watch props.filters changes (sync from parent)
watch(
  () => props.filters,
  (newFilters) => {
    console.log("[FilterSidebar] Props filters changed:", newFilters);
    localFilters.value = { ...newFilters };
  },
  { deep: true },
);

// Handle filter changes
const updateFilters = () => {
  console.log("[FilterSidebar] Updating filters:", localFilters.value);
  emit("update:filters", { ...localFilters.value });
  showMobileFilters.value = false;
};

// Clear all filters
const clearFilters = () => {
  localFilters.value = {
    subcategoryId: "",
    priceMin: null,
    priceMax: null,
    karat: "",
    sortBy: "newest",
  };
  updateFilters();
};

// Toggle subcategory selection
const toggleSubcategory = (subcategoryId: string) => {
  if (localFilters.value.subcategoryId === subcategoryId) {
    localFilters.value.subcategoryId = "";
  } else {
    localFilters.value.subcategoryId = subcategoryId;
  }
  updateFilters();
};

// Price range presets
const priceRanges = [
  { label: "Semua Harga", min: null, max: null },
  { label: "Di bawah 5 juta", min: null, max: 5000000 },
  { label: "5 - 10 juta", min: 5000000, max: 10000000 },
  { label: "10 - 20 juta", min: 10000000, max: 20000000 },
  { label: "20 - 50 juta", min: 20000000, max: 50000000 },
  { label: "Di atas 50 juta", min: 50000000, max: null },
];

const setPriceRange = (min: number | null, max: number | null) => {
  localFilters.value.priceMin = min;
  localFilters.value.priceMax = max;
  updateFilters();
};

const isPriceRangeActive = (min: number | null, max: number | null) => {
  return localFilters.value.priceMin === min && localFilters.value.priceMax === max;
};

// Karat options
const karatOptions = [
  { value: "", label: "Semua Karat" },
  { value: "18K", label: "18 Karat" },
  { value: "17K", label: "17 Karat" },
  { value: "16K", label: "16 Karat" },
  { value: "22K", label: "22 Karat" },
  { value: "9K", label: "9 Karat" },
  { value: "8K", label: "8 Karat" },
];

// Sort options
const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price-desc", label: "Harga: Tinggi ke Rendah" },
];

// Check if any filter is active
const hasActiveFilters = computed(() => {
  const hasFilters =
    localFilters.value.subcategoryId !== "" ||
    localFilters.value.priceMin !== null ||
    localFilters.value.priceMax !== null ||
    localFilters.value.karat !== "" ||
    localFilters.value.sortBy !== "newest";

  console.log("[FilterSidebar] Has active filters:", hasFilters, localFilters.value);
  return hasFilters;
});
</script>

<template>
  <div>
    <!-- Mobile Filter Button -->
    <div class="lg:hidden mb-4">
      <button
        @click="showMobileFilters = true"
        class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-between hover:bg-cream hover:border-maroon transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <span class="flex items-center gap-3">
          <i class="bi bi-funnel text-maroon"></i>
          <span class="font-semibold text-gray-900">Filter & Urutkan</span>
        </span>
        <span v-if="hasActiveFilters" class="text-xs bg-maroon text-white px-3 py-1.5 rounded-full font-semibold">
          Aktif
        </span>
      </button>
    </div>

    <!-- Desktop Sidebar -->
    <div
      class="hidden lg:block bg-white/95 backdrop-blur rounded-2xl shadow-lg border-l-4 border-gold p-5 lg:p-6 sticky top-4"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="bi bi-funnel text-maroon"></i>
          Filter
        </h3>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="text-sm text-maroon hover:underline font-medium transition-all duration-300"
        >
          Reset
        </button>
      </div>

      <!-- Subcategories -->
      <div class="mb-6 border-b border-gray-200 pb-6">
        <h4 class="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Sub-Kategori</h4>
        <div v-if="loading" class="text-center py-4">
          <div class="inline-block w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div v-else-if="subcategories.length === 0" class="text-sm text-gray-500 italic">Tidak ada sub-kategori</div>
        <div v-else class="space-y-2">
          <label
            v-for="sub in subcategories"
            :key="sub.id"
            class="flex items-center gap-2.5 cursor-pointer hover:bg-cream/50 p-2 rounded-xl transition-all duration-300"
          >
            <input
              type="checkbox"
              :checked="localFilters.subcategoryId === sub.id"
              @change="toggleSubcategory(sub.id)"
              class="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-2 focus:ring-maroon"
            />
            <span class="text-sm text-gray-700 font-medium">{{ sub.name }}</span>
          </label>
        </div>
      </div>

      <!-- Price Range -->
      <div class="mb-6 border-b border-gray-200 pb-6">
        <h4 class="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Harga</h4>
        <div class="space-y-2">
          <button
            v-for="range in priceRanges"
            :key="range.label"
            @click="setPriceRange(range.min, range.max)"
            class="w-full text-left px-3 py-2 text-sm rounded-xl transition-all duration-300 font-medium"
            :class="
              isPriceRangeActive(range.min, range.max)
                ? 'bg-maroon text-white shadow-md'
                : 'text-gray-700 hover:bg-cream border border-gray-200'
            "
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Karat -->
      <div class="mb-6 border-b border-gray-200 pb-6">
        <h4 class="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Karat</h4>
        <div class="space-y-2">
          <label
            v-for="option in karatOptions"
            :key="option.value"
            class="flex items-center gap-2.5 cursor-pointer hover:bg-cream/50 p-2 rounded-xl transition-all duration-300"
          >
            <input
              type="radio"
              name="karat"
              :value="option.value"
              v-model="localFilters.karat"
              @change="updateFilters"
              class="w-4 h-4 text-maroon border-gray-300 focus:ring-2 focus:ring-maroon"
            />
            <span class="text-sm text-gray-700 font-medium">{{ option.label }}</span>
          </label>
        </div>
      </div>

      <!-- Sort -->
      <div>
        <h4 class="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Urutkan</h4>
        <select
          v-model="localFilters.sortBy"
          @change="updateFilters"
          class="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:border-maroon transition-all duration-300 font-medium bg-white hover:border-maroon"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Mobile Filter Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showMobileFilters" class="fixed inset-0 z-50 lg:hidden" @click.self="showMobileFilters = false">
          <div class="absolute inset-0 bg-black/50" @click="showMobileFilters = false"></div>
          <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div
              class="sticky top-0 bg-white border-b border-gray-200 px-5 py-5 flex items-center justify-between z-10"
            >
              <h3 class="text-lg font-bold text-gray-900">Filter & Urutkan</h3>
              <button
                @click="showMobileFilters = false"
                class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                <i class="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div class="p-5">
              <!-- Same filter content as desktop -->
              <!-- Subcategories -->
              <div class="mb-6">
                <h4 class="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Sub-Kategori</h4>
                <div v-if="loading" class="text-center py-4">
                  <div
                    class="inline-block w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin"
                  ></div>
                </div>
                <div v-else-if="subcategories.length === 0" class="text-sm text-gray-500 italic">
                  Tidak ada sub-kategori
                </div>
                <div v-else class="space-y-2">
                  <label
                    v-for="sub in subcategories"
                    :key="sub.id"
                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      :checked="localFilters.subcategoryId === sub.id"
                      @change="toggleSubcategory(sub.id)"
                      class="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-maroon"
                    />
                    <span class="text-sm text-gray-700">{{ sub.name }}</span>
                  </label>
                </div>
              </div>

              <!-- Price Range -->
              <div class="mb-6">
                <h4 class="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Harga</h4>
                <div class="space-y-2">
                  <button
                    v-for="range in priceRanges"
                    :key="range.label"
                    @click="setPriceRange(range.min, range.max)"
                    class="w-full text-left px-3 py-2 text-sm rounded transition-colors"
                    :class="
                      isPriceRangeActive(range.min, range.max)
                        ? 'bg-maroon text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    "
                  >
                    {{ range.label }}
                  </button>
                </div>
              </div>

              <!-- Karat -->
              <div class="mb-6">
                <h4 class="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Karat</h4>
                <div class="space-y-2">
                  <label
                    v-for="option in karatOptions"
                    :key="option.value"
                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="karat-mobile"
                      :value="option.value"
                      v-model="localFilters.karat"
                      @change="updateFilters"
                      class="w-4 h-4 text-maroon border-gray-300 focus:ring-maroon"
                    />
                    <span class="text-sm text-gray-700">{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Sort -->
              <div class="mb-6">
                <h4 class="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Urutkan</h4>
                <select
                  v-model="localFilters.sortBy"
                  @change="updateFilters"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  v-if="hasActiveFilters"
                  @click="clearFilters"
                  class="flex-1 px-4 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Reset
                </button>
                <button
                  @click="showMobileFilters = false"
                  class="flex-1 px-4 py-4 bg-maroon text-white rounded-xl font-semibold hover:bg-maroon-dark transition-all duration-300 shadow-lg"
                >
                  Tampilkan Hasil
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .absolute,
.drawer-leave-active .absolute {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .absolute:last-child,
.drawer-leave-to .absolute:last-child {
  transform: translateY(100%);
}
</style>
