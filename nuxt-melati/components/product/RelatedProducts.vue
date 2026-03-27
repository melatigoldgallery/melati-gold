<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  products: any[];
}>();

const emit = defineEmits<{
  (e: "product-click", product: any): void;
}>();

// Carousel state (for mobile)
const scrollContainer = ref<HTMLElement | null>(null);

// 🚀 Image optimization — eager CDN mobile-first (w_320, w_400)
const { presets, generateSrcSet } = useImageOptimization();

const getRawImageUrl = (product: any): string => {
  let imageUrl = product.thumbnail_image;
  if (!imageUrl && product.images) {
    if (Array.isArray(product.images)) {
      imageUrl = product.images[0];
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        imageUrl = parsed[0];
      } catch {
        imageUrl = product.images;
      }
    }
  }
  return imageUrl || "/img/placeholder.jpg";
};

// Desktop grid: aspect-[3/4] → presets.card (w_400,h_533)
const getProductImage = (product: any) => {
  const url = getRawImageUrl(product);
  if (!url.includes("ik.imagekit.io")) return url;
  return presets.card(url);
};

// Mobile carousel: aspect-[4/5] → presets.cardCatalog (w_400,h_500)
const getProductImageMobile = (product: any) => {
  const url = getRawImageUrl(product);
  if (!url.includes("ik.imagekit.io")) return url;
  return presets.cardCatalog(url);
};

// Format price
const formatPrice = (price: number) => {
  if (!price) return "Hubungi Kami";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Handle click
const handleClick = (product: any) => {
  emit("product-click", product);
};

// Error handler for broken images
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/img/placeholder.jpg";
};
</script>

<template>
  <section class="py-8 border-t">
    <div class="mb-6">
      <h2 class="text-xl md:text-2xl font-serif text-gray-900">Produk Terkait</h2>
      <p class="text-gray-600 mt-2 text-sm md:text-base">Anda mungkin juga menyukai produk ini</p>
    </div>

    <!-- Desktop Grid -->
    <div class="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      <article v-for="product in products" :key="product.id" class="group cursor-pointer" @click="handleClick(product)">
        <div class="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
          <!-- Image -->
          <div class="relative w-50 aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              :src="getProductImage(product)"
              :srcset="generateSrcSet(getRawImageUrl(product), [320, 400])"
              sizes="(max-width: 768px) 160px, (max-width: 1024px) 20vw, 16vw"
              :alt="product.title || product.name"
              class="w-full h-full object-cover transition-transform duration-500"
              loading="lazy"
              decoding="async"
              @error="handleImageError"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
          </div>

          <!-- Info -->
          <div class="p-1.5 text-center">
            <h3 class="font-semibold text-gray-900 text-base truncate mb-0.5">
              {{ product.title || product.name }}
            </h3>
            <p class="text-maroon font-bold text-sm whitespace-nowrap">Mulai dari {{ formatPrice(product.price) }}</p>
          </div>
        </div>
      </article>
    </div>

    <!-- Mobile Carousel -->
    <div class="md:hidden relative">
      <div ref="scrollContainer" class="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
        <article
          v-for="product in products"
          :key="product.id"
          class="flex-shrink-0 w-[160px] snap-start cursor-pointer"
          @click="handleClick(product)"
        >
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                :src="getProductImageMobile(product)"
                :srcset="generateSrcSet(getRawImageUrl(product), [320])"
                sizes="160px"
                :alt="product.title || product.name"
                class="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                @error="handleImageError"
              />
            </div>
            <div class="p-2 text-center">
              <h3 class="font-semibold text-gray-900 text-xs truncate mb-1">
                {{ product.title || product.name }}
              </h3>
              <p class="text-maroon font-bold text-[10px] whitespace-nowrap">
                Mulai dari {{ formatPrice(product.price) }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
