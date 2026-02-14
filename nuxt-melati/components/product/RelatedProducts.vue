<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  products: any[];
}>();

const emit = defineEmits<{
  (e: "product-click", product: any): void;
}>();

// Debug
console.log("[RelatedProducts] Received products:", props.products?.length || 0);

// Carousel state (for mobile)
const scrollContainer = ref<HTMLElement | null>(null);

// Image optimization
const optimizeImage = (url: string) => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  return url.replace("/upload/", "/upload/w_400,h_500,c_fill,f_auto,q_auto/");
};

const getProductImage = (product: any) => {
  // Handle both thumbnail_image and images array (can be jsonb or regular array)
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

  return optimizeImage(imageUrl || "/img/placeholder.jpg");
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
        <div
          class="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <!-- Image -->
          <div class="relative w-50 aspect-[3/4] overflow-hidden bg-gray-100">
            <img
              :src="getProductImage(product)"
              :alt="product.title || product.name"
              class="w-full h-full object-cover transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
          </div>

          <!-- Info -->
          <div class="p-1.5">
            <h3 class="font-semibold text-gray-900 text-xs line-clamp-2 mb-0.5">
              {{ product.title || product.name }}
            </h3>
            <p class="text-maroon font-bold text-xs">
              {{ formatPrice(product.price) }}
            </p>
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
          <div class="bg-white rounded-xl overflow-hidden shadow-sm">
            <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
              <img
                :src="getProductImage(product)"
                :alt="product.title || product.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="p-2">
              <h3 class="font-semibold text-gray-900 text-xs line-clamp-2 mb-1">
                {{ product.title || product.name }}
              </h3>
              <p class="text-maroon font-bold text-xs">
                {{ formatPrice(product.price) }}
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
