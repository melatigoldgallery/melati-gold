<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  images: string[];
  productName?: string;
}>();

// State
const currentSlide = ref(0);
const showLightbox = ref(false);

// Computed
const displayImages = computed(() => {
  if (!props.images || props.images.length === 0) {
    return ["/img/placeholder.jpg"];
  }
  return props.images;
});

const currentImage = computed(() => displayImages.value[currentSlide.value]);

// Image optimization
const optimizeImage = (url: string, size: "large" | "thumbnail" = "large") => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const transformations = size === "large" ? "w_1000,h_1000,c_fill,f_auto,q_90" : "w_150,h_150,c_fill,f_auto,q_auto";

  return url.replace("/upload/", `/upload/${transformations}/`);
};

// Navigation
const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % displayImages.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + displayImages.value.length) % displayImages.value.length;
};

// Lightbox
const openLightbox = () => {
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};
</script>

<template>
  <div class="space-y-3 md:space-y-4 max-w-full lg:max-w-md xl:max-w-lg mx-auto">
    <!-- Main Image -->
    <div
      class="relative aspect-square bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <img
        :src="optimizeImage(currentImage, 'large')"
        :alt="productName || 'Product image'"
        class="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
        @click="openLightbox"
      />

      <!-- Navigation Arrows (if multiple images) -->
      <template v-if="displayImages.length > 1">
        <button
          @click="prevSlide"
          class="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
          aria-label="Previous image"
        >
          <i class="bi bi-chevron-left text-lg md:text-xl"></i>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
          aria-label="Next image"
        >
          <i class="bi bi-chevron-right text-lg md:text-xl"></i>
        </button>
      </template>

      <!-- Zoom Icon -->
      <div
        class="absolute top-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center gap-1.5"
      >
        <i class="bi bi-zoom-in"></i>
        <span class="hidden sm:inline">Zoom</span>
      </div>

      <!-- Image Counter -->
      <div
        v-if="displayImages.length > 1"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs md:text-sm backdrop-blur-sm font-medium"
      >
        {{ currentSlide + 1 }} / {{ displayImages.length }}
      </div>
    </div>

    <!-- Thumbnail Strip (only show if multiple images exist) -->
    <div
      v-if="displayImages.length > 1 && props.images && props.images.length > 1"
      class="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <button
        v-for="(image, index) in displayImages"
        :key="index"
        @click="goToSlide(index)"
        class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105"
        :class="
          index === currentSlide
            ? 'border-maroon shadow-md ring-2 ring-maroon/30'
            : 'border-gray-300 hover:border-gray-400'
        "
      >
        <img
          :src="optimizeImage(image, 'thumbnail')"
          :alt="`${productName} thumbnail ${index + 1}`"
          class="w-full h-full object-cover"
        />
      </button>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLightbox"
          class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          @click.self="closeLightbox"
        >
          <!-- Close Button -->
          <button
            @click="closeLightbox"
            class="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
            aria-label="Close"
          >
            <i class="bi bi-x-lg text-2xl"></i>
          </button>

          <!-- Image Counter -->
          <div
            class="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm z-10"
          >
            {{ currentSlide + 1 }} / {{ displayImages.length }}
          </div>

          <!-- Main Lightbox Image -->
          <div class="relative max-w-5xl max-h-full">
            <img
              :src="optimizeImage(currentImage, 'large')"
              :alt="productName || 'Product image'"
              class="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          <!-- Navigation -->
          <template v-if="displayImages.length > 1">
            <button
              @click="prevSlide"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Previous image"
            >
              <i class="bi bi-chevron-left text-2xl"></i>
            </button>
            <button
              @click="nextSlide"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Next image"
            >
              <i class="bi bi-chevron-right text-2xl"></i>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for thumbnail strip */
::-webkit-scrollbar {
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
