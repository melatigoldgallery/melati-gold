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
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
    <article v-for="product in products" :key="product.id" class="group cursor-pointer" @click="handleClick(product)">
      <div
        class="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <!-- Product Image -->
        <div class="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img
            :src="getOptimizedImage(product)"
            :alt="product.name || product.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />

          <!-- Hover Overlay -->
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
          >
            <span
              class="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
            >
              Lihat Detail
            </span>
          </div>

          <!-- Badge if featured or new -->
          <div
            v-if="product.is_featured"
            class="absolute top-2 right-2 bg-gold text-white text-xs px-2 py-1 rounded-full font-semibold"
          >
            Featured
          </div>
        </div>

        <!-- Product Info -->
        <div class="p-3 md:p-4">
          <h3 class="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-2">
            {{ product.name || product.title }}
          </h3>

          <p v-if="product.price" class="text-maroon font-bold text-sm md:text-base">
            {{ formatPrice(product.price) }}
          </p>
          <p v-else class="text-gray-600 text-sm italic">Hubungi untuk harga</p>

          <!-- Specifications (if available) -->
          <div v-if="product.karat || product.weight" class="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
            <span v-if="product.karat" class="inline-flex items-center gap-1">
              <i class="bi bi-gem text-gold"></i>
              {{ product.karat }}
            </span>
            <span v-if="product.weight" class="inline-flex items-center gap-1">
              <i class="bi bi-clock text-gold"></i>
              {{ product.weight }}
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
