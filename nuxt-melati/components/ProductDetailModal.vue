<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  product: null | any;
  serviceContext?: any | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { getProductById } = useCatalogManager();

// Local state for product detail
const productDetail = ref<any>(null);
const loading = ref(false);

// Fetch product detail jika data tidak lengkap
const loadProductDetail = async () => {
  if (!props.product) {
    productDetail.value = null;
    return;
  }

  // Cek apakah data sudah lengkap (punya images array dan description)
  const hasCompleteData =
    props.product.images && Array.isArray(props.product.images) && props.product.description !== undefined;

  if (hasCompleteData) {
    console.log("[ProductDetailModal] Product data already complete, using provided data");
    productDetail.value = props.product;
    return;
  }

  // Data tidak lengkap, fetch dari database
  console.log("[ProductDetailModal] Fetching complete product data for ID:", props.product.id);
  loading.value = true;

  try {
    const result = await getProductById(props.product.id);

    if (result.success && result.data) {
      console.log("[ProductDetailModal] Product detail loaded:", result.data);
      productDetail.value = result.data;
    } else {
      console.error("[ProductDetailModal] Failed to load product:", result.error);
      // Fallback ke data yang ada
      productDetail.value = props.product;
    }
  } catch (error) {
    console.error("[ProductDetailModal] Error loading product:", error);
    // Fallback ke data yang ada
    productDetail.value = props.product;
  } finally {
    loading.value = false;
  }
};

// Watch untuk product changes
watch(
  () => props.product,
  async (newProduct) => {
    if (newProduct && props.show) {
      await loadProductDetail();
    }
  },
  { immediate: true }
);

// Watch untuk show changes
watch(
  () => props.show,
  async (isShown) => {
    if (isShown && props.product) {
      await loadProductDetail();
    } else if (!isShown) {
      // Reset currentSlide when modal closes
      currentSlide.value = 0;
    }
  }
);

// 🚀 Image optimization - inline functions
const optimizeCloudinaryImage = (url: string, width: number, height: number, quality: number | "auto" = "auto") => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  const transformations = `w_${width},h_${height},c_fill,f_auto,q_${quality}`;
  return url.replace("/upload/", `/upload/${transformations}/`);
};

const presets = {
  detail: (url: string) => optimizeCloudinaryImage(url, 1000, 1000, 90),
  thumbnail: (url: string) => optimizeCloudinaryImage(url, 400, 400, "auto"),
};

// Carousel state
const currentSlide = ref(0);

// Format price to Rupiah
const formatPrice = (price: number) => {
  if (!price) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Derived values to handle both demo and db product shapes
const displayName = computed(
  () => productDetail.value && (productDetail.value.name || productDetail.value.title || "")
);
const displayImages = computed(() => {
  if (!productDetail.value) return [];
  if (productDetail.value.images && productDetail.value.images.length) return productDetail.value.images;
  if (productDetail.value.gallery_images && productDetail.value.gallery_images.length)
    return productDetail.value.gallery_images;
  if (productDetail.value.thumbnail_image) return [productDetail.value.thumbnail_image];
  return [];
});

const displaySpecs = computed(() => {
  if (!productDetail.value) return [];
  return productDetail.value.specs || [];
});

const displayPrice = computed(() => {
  if (!productDetail.value) return "Rp 0";
  const price = productDetail.value.price || 0;
  return formatPrice(price);
});

// Optimize images for carousel (main view - high quality)
const getOptimizedMainImage = (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
    return imageUrl;
  }
  return presets.detail(imageUrl); // 1000x1000, high quality
};

// Optimize thumbnail images (smaller size)
const getOptimizedThumbImage = (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
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
      class="fixed inset-0 z-[65] flex items-center justify-center bg-black/55 p-4"
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

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            <p class="mt-4 text-gray-600">Memuat detail produk...</p>
          </div>
        </div>

        <!-- Content -->
        <div v-else-if="productDetail" class="grid grid-cols-1 lg:grid-cols-2 gap-0">
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
              {{productDetail.title || "" }}
            </h3>
            <p v-if="productDetail.description" class="text-neutral-600 mb-4">
              {{ productDetail.description || "" }}
            </p>

            <!-- Specs -->
            <ul v-if="displaySpecs.length" class="space-y-2 text-sm text-neutral-700 mb-4">
              <li v-for="(s, i) in displaySpecs" :key="i" class="flex items-start gap-2">
                <i class="bi bi-check-circle-fill text-gold mt-0.5"></i>
                <span>{{ s }}</span>
              </li>
            </ul>

            <!-- Price -->
            <div class="mb-3">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-maroon">±{{ displayPrice }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">*Harga dapat berubah mengikuti harga emas</p>
            </div>

            <!-- Contact Buttons (Shopee & WhatsApp) -->
            <ProductContactButtons :product="productDetail" />
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
