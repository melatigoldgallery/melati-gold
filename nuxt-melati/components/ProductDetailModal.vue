<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  show: boolean;
  product: null | any;
  serviceContext?: any | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// 🚀 Image optimization
const { presets } = useImageOptimization();

// Carousel state
const currentSlide = ref(0);

// Derived values to handle both demo and db product shapes
const displayName = computed(() => props.product && (props.product.name || props.product.title || ""));
const displayImages = computed(() => {
  if (!props.product) return [];
  if (props.product.images && props.product.images.length) return props.product.images;
  if (props.product.gallery_images && props.product.gallery_images.length) return props.product.gallery_images;
  if (props.product.thumbnail_image) return [props.product.thumbnail_image];
  return [];
});

const whatsappLink = computed(() => {
  if (!props.product) return `https://wa.me/6281234567890`;
  const base = `https://wa.me/6281234567890`;
  const productName = displayName.value || "produk";
  const service = props.serviceContext?.title ? ` untuk layanan ${props.serviceContext.title}` : "";
  const text = `Halo, saya ingin tanya tentang ${productName}${service}. Bisa dibantu?`;
  return `${base}?text=${encodeURIComponent(text)}`;
});

const displaySpecs = computed(() => {
  if (!props.product) return [];
  return props.product.specs || props.product.specs || [];
});

// Optimize images for carousel (main view - high quality)
const getOptimizedMainImage = (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  return presets.detail(imageUrl); // 1000x1000, high quality
};

// Optimize thumbnail images (smaller size)
const getOptimizedThumbImage = (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  return presets.thumbnail(imageUrl); // 400x400, compressed
};

// Carousel navigation
const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const nextSlide = () => {
  if (currentSlide.value < displayImages.value.length - 1) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = displayImages.value.length - 1;
  }
};
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="show && product" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      @click.self="emit('close')"
    >
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
          aria-label="Close"
        >
          <i class="bi bi-x-lg text-xl"></i>
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Left: Image Carousel -->
          <div class="p-4 lg:p-6">
            <div class="relative">
              <!-- Main Carousel Image -->
              <div class="relative rounded-xl overflow-hidden bg-gray-100 mb-4">
                <div class="aspect-[4/5] w-full max-w-md mx-auto">
                  <img
                    :src="getOptimizedMainImage(displayImages[currentSlide])"
                    :alt="displayName"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <!-- Navigation Buttons -->
                <template v-if="displayImages.length > 1">
                  <button
                    @click="prevSlide"
                    class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    aria-label="Previous image"
                  >
                    <i class="bi bi-chevron-left text-xl"></i>
                  </button>
                  <button
                    @click="nextSlide"
                    class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    aria-label="Next image"
                  >
                    <i class="bi bi-chevron-right text-xl"></i>
                  </button>
                </template>

                <!-- Indicators -->
                <div v-if="displayImages.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    v-for="(img, i) in displayImages"
                    :key="'ind' + i"
                    @click="goToSlide(i)"
                    class="w-2 h-2 rounded-full transition-all"
                    :class="i === currentSlide ? 'bg-gold w-6' : 'bg-white/70 hover:bg-white'"
                    :aria-label="`Go to slide ${i + 1}`"
                  ></button>
                </div>
              </div>

              <!-- Thumbnails -->
              <div class="flex gap-2 flex-wrap justify-center">
                <button
                  v-for="(img, i) in displayImages"
                  :key="'t' + i"
                  @click="goToSlide(i)"
                  class="w-12 h-12 rounded-lg overflow-hidden border-2 transition-all"
                  :class="i === currentSlide ? 'border-gold scale-105' : 'border-gray-200 hover:border-gold'"
                  :aria-label="`Go to image ${i + 1}`"
                >
                  <img
                    :src="getOptimizedThumbImage(img)"
                    :alt="`${displayName} thumbnail ${i + 1}`"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Product Info -->
          <div class="p-6 lg:p-8 bg-gray-50">
            <h3 class="text-2xl lg:text-3xl font-semibold text-neutral-800 mb-3">
              {{ product.name || product.title }}
            </h3>
            <p class="text-neutral-600 mb-4">
              {{ product.description || product.subtitle || "" }}
            </p>

            <!-- Specs -->
            <ul v-if="displaySpecs.length" class="space-y-2 text-sm text-neutral-700 mb-4">
              <li v-for="(s, i) in displaySpecs" :key="i" class="flex items-start gap-2">
                <i class="bi bi-check-circle-fill text-gold mt-0.5"></i>
                <span>{{ s }}</span>
              </li>
            </ul>

            <!-- Price -->
            <div class="text-2xl font-bold text-maroon mb-6">
              {{ product.price || product.price_formatted || "" }}
            </div>

            <!-- WhatsApp Button -->
            <a
              :href="whatsappLink"
              target="_blank"
              class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <i class="bi bi-whatsapp text-xl"></i>
              Chat WhatsApp
            </a>
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
</style>
