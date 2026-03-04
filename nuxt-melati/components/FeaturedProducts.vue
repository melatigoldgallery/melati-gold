<script setup lang="ts">
// Fetch featured products from database
const { getProducts } = useCatalogManager();

// 🚀 Image optimization — eager CDN 3:4 portrait (w_400,h_533)
const { presets } = useImageOptimization();

// State
const products = ref<any[]>([]);
const loading = ref(true);

// Load featured products
const loadFeaturedProducts = async () => {
  loading.value = true;

  const result = await getProducts({
    isFeatured: true,
  });

  if (result.success) {
    products.value = result.data;
  }

  loading.value = false;
};

// Optimize images
const getOptimizedImage = (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
    return imageUrl || "/img/placeholder.jpg";
  }
  return presets.card(imageUrl);
};

// Error handler for broken images
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/img/placeholder.jpg";
};

// Format price to Indonesian Rupiah
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Load on mount
onMounted(() => {
  loadFeaturedProducts();
});
</script>

<template>
  <section id="best-produk" class="container py-10 md:py-20">
    <div class="mx-auto mb-6 text-center max-w-2xl reveal-in">
      <h2 class="section-title">Produk Pilihan</h2>
      <p class="mt-2 text-neutral-600">Koleksi favorit pilihan pelanggan, siap memancarkan pesonamu.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      <p class="mt-4 text-gray-600">Memuat produk...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-12">
      <i class="bi bi-box-seam text-6xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Belum ada produk tersedia</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid gap-4 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <NuxtLink
        v-for="p in products"
        :key="p.id"
        :to="`/product/${p.slug || p.id}`"
        class="glass overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant reveal-up block rounded-2xl"
      >
        <div class="relative aspect-[3/4] overflow-hidden">
          <!-- ✨ Optimized image — lazy load, CDN-cached eager transform (w_400,h_533,3:4) -->
          <img
            :src="getOptimizedImage(p.thumbnail_image)"
            :alt="p.title || p.name"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <span
            v-if="p.is_best_seller"
            class="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r from-gold to-yellow-500 text-white text-[9px] md:text-xs px-2 py-0.5 md:px-3 md:py-1.5 rounded-full font-semibold shadow-lg"
          >
            Best Seller
          </span>
        </div>
        <div class="px-3 md:px-3 py-2.5 md:py-2 flex flex-col gap-2 md:gap-1.5 text-center">
          <!-- Product name -->
          <h3
            class="font-medium text-maroon leading-tight text-md md:text-base lg:text-lg truncate"
            :title="p.title || p.name"
          >
            {{ p.title || p.name }}
          </h3>
          <!-- Price info -->
          <p class="text-xs md:text-sm text-neutral-600">Mulai dari {{ formatPrice(p.price) }}</p>

          <span
            class="btn-outline text-xs md:text-xs px-3 py-1.5 md:px-3 md:py-1.5 whitespace-nowrap rounded-md mt-1 inline-block"
          >
            Lihat Detail
          </span>
        </div>
      </NuxtLink>
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
</style>
