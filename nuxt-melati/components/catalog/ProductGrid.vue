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
        class="relative bg-white/95 backdrop-blur rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
      >
        <!-- Product Image -->
        <div class="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            :src="getOptimizedImage(product)"
            :alt="product.name || product.title"
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />

          <!-- Hover Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center"
          >
            <span
              class="text-white font-semibold text-sm md:text-base opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 px-6 py-3 rounded-xl"
            >
              Lihat Detail
            </span>
          </div>

          <!-- Badge if featured or new -->
          <div
            v-if="product.is_featured"
            class="absolute top-3 right-3 bg-gradient-to-r from-gold to-yellow-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg"
          >
            Featured
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-3 md:p-4 lg:p-5 space-y-2">
          <h3
            class="font-medium text-gray-900 text-sm md:text-base line-clamp-2 leading-snug group-hover:text-maroon transition-colors duration-300"
          >
            {{ product.name || product.title }}
          </h3>

          <p v-if="product.price" class="text-maroon font-bold text-base md:text-lg">
            {{ formatPrice(product.price) }}
          </p>
          <p v-else class="text-gray-500 text-sm italic font-medium">Hubungi untuk harga</p>

          <!-- Specifications (if available) -->
          <div
            v-if="product.karat || product.weight"
            class="flex flex-wrap gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100"
          >
            <span v-if="product.karat" class="inline-flex items-center gap-1.5 bg-cream/50 px-2.5 py-1 rounded-lg">
              <i class="bi bi-gem text-gold text-sm"></i>
              <span class="font-medium">{{ product.karat }}</span>
            </span>
            <span v-if="product.weight" class="inline-flex items-center gap-1.5 bg-cream/50 px-2.5 py-1 rounded-lg">
              <i class="bi bi-clock text-gold text-sm"></i>
              <span class="font-medium">{{ product.weight }}</span>
            </span>
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
