<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "page-change", page: number): void;
  (e: "items-per-page-change", limit: number): void;
}>();

// Items per page options
const itemsPerPageOptions = [12, 24, 48];

// Calculate visible page numbers with ellipsis
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    // Show all pages if 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }
  }

  return pages;
});

// Calculate display range
const displayRange = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage + 1;
  const end = Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
  return { start, end };
});

// Handle page change
const goToPage = (page: number | string) => {
  if (typeof page === "number" && page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit("page-change", page);
  }
};

// Handle items per page change
const changeItemsPerPage = (limit: number) => {
  emit("items-per-page-change", limit);
};

// Navigation helpers
const goToPrevious = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1);
  }
};

const goToNext = () => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1);
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Results Summary -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
      <div class="font-medium">
        Menampilkan
        <span class="text-maroon font-semibold">{{ displayRange.start }}-{{ displayRange.end }}</span>
        dari
        <span class="text-maroon font-semibold">{{ totalItems }}</span>
        produk
      </div>

      <!-- Items Per Page Selector -->
      <div class="flex items-center gap-2.5">
        <span class="text-gray-500 text-xs">Tampilkan:</span>
        <div class="flex gap-1.5">
          <button
            v-for="option in itemsPerPageOptions"
            :key="option"
            @click="changeItemsPerPage(option)"
            :disabled="loading"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300"
            :class="
              itemsPerPage === option
                ? 'bg-maroon text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-cream border border-gray-200 hover:border-maroon'
            "
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <nav
      v-if="totalPages > 1"
      class="flex flex-col sm:flex-row items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <!-- Previous Button -->
      <button
        @click="goToPrevious"
        :disabled="currentPage === 1 || loading"
        class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 min-w-[110px] justify-center"
        :class="
          currentPage === 1 || loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-maroon hover:bg-maroon hover:text-white border border-maroon shadow-md hover:shadow-lg'
        "
      >
        <i class="bi bi-chevron-left"></i>
        <span>Sebelumnya</span>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="(page, index) in visiblePages"
          :key="index"
          @click="goToPage(page)"
          :disabled="page === '...' || loading"
          class="min-w-[44px] h-[44px] rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center"
          :class="
            page === currentPage
              ? 'bg-maroon text-white shadow-lg scale-110'
              : page === '...'
                ? 'bg-transparent text-gray-400 cursor-default'
                : 'bg-white text-gray-700 hover:bg-cream border border-gray-200 hover:border-maroon hover:scale-105 shadow-sm'
          "
        >
          {{ page }}
        </button>
      </div>

      <!-- Next Button -->
      <button
        @click="goToNext"
        :disabled="currentPage === totalPages || loading"
        class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 min-w-[110px] justify-center"
        :class="
          currentPage === totalPages || loading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-maroon hover:bg-maroon hover:text-white border border-maroon shadow-md hover:shadow-lg'
        "
      >
        <span>Selanjutnya</span>
        <i class="bi bi-chevron-right"></i>
      </button>
    </nav>

    <!-- Loading State Overlay -->
    <div v-if="loading" class="flex justify-center py-4">
      <div class="flex items-center gap-3 text-maroon">
        <div class="w-5 h-5 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-medium">Memuat produk...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure smooth transitions */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active:not(:disabled) {
  transform: scale(0.95);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .min-w-\[48px\] {
    min-width: 44px;
    height: 44px;
  }
}
</style>
