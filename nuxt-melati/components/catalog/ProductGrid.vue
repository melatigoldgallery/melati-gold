<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  products: any[];
}>();

const emit = defineEmits<{
  (e: "product-click", product: any): void;
}>();

// 🚀 Image optimization - inline functions
const optimizeCloudinaryImage = (url: string, width: number, height: number, quality: number | "auto" = "auto") => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  const transformations = `w_${width},h_${height},c_fill,f_auto,q_${quality}`;
  return url.replace("/upload/", `/upload/${transformations}/`);
};

const presets = {
  card: (url: string) => optimizeCloudinaryImage(url, 600, 600, "auto"),
};

// Optimize images untuk grid thumbnail
const getOptimizedImage = (product: any) => {
  const imageUrl = product.thumbnail_image || product.images?.[0] || "/img/placeholder.jpg";

  // Skip optimization untuk local images
  if (!imageUrl.includes("cloudinary.com")) {
    return imageUrl;
  }

  return presets.card(imageUrl);
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

// Handle product click
const handleClick = (product: any) => {
  emit("product-click", product);
};
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
    <article v-for="product in products" :key="product.id" class="group cursor-pointer" @click="handleClick(product)">
      <div
        class="relative bg-white/95 backdrop-blur rounded-1xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100"
      >
        <!-- Product Image -->
        <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img
            :src="getOptimizedImage(product)"
            :alt="product.name || product.title"
            class="w-full h-full object-cover transition-transform duration-700"
            loading="lazy"
            decoding="async"
          />

          <!-- Hover Overlay with Text -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4"
          >
            <span
              class="text-white text-sm md:text-base lg:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
            >
              Lihat Produk
            </span>
          </div>

          <!-- Badge if featured or new -->
          <div
            v-if="product.is_featured"
            class="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r from-gold to-yellow-500 text-white text-[9px] md:text-xs px-2 py-0.5 md:px-3 md:py-1.5 rounded-full font-semibold shadow-lg"
          >
            Best Seller
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-1 md:p-2 lg:p-3 space-y-1">
          <!-- Product Name -->
          <h3
            class="font-semibold text-maroon text-sm md:text-base lg:text-lg leading-tight group-hover:text-maroon transition-colors duration-300 text-center mt-2"
          >
            {{ product.name || product.title }}
          </h3>

          <!-- Price -->
          <div class="mb-2">
            <p v-if="product.price" class="text-gray-900 text-xs md:text-sm lg:text-sm leading-tight text-center">
              Mulai dari {{ formatPrice(product.price) }}
            </p>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
