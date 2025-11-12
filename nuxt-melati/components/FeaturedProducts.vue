<script setup lang="ts">
// Fetch featured products from database
const { getProducts } = useCatalogManager();

// 🚀 Image optimization - inline functions
const optimizeCloudinaryImage = (url: string, width: number, height: number, quality: number | "auto" = "auto") => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }
  const transformations = `w_${width},h_${height},c_fill,f_auto,q_${quality}`;
  return url.replace("/upload/", `/upload/${transformations}/`);
};

const presets = {
  thumbnail: (url: string) => optimizeCloudinaryImage(url, 400, 400, "auto"),
};

// State
const products = ref<any[]>([]);
const loading = ref(true);
const selectedProduct = ref<any>(null);
const showProductModal = ref(false);

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
  return presets.thumbnail(imageUrl);
};

// Format price to Indonesian Rupiah
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Open product detail modal
const openDetail = (product: any) => {
  selectedProduct.value = product;
  showProductModal.value = true;
};

// Close modal
const closeProductModal = () => {
  showProductModal.value = false;
  selectedProduct.value = null;
};

// Load on mount
onMounted(() => {
  loadFeaturedProducts();
});
</script>

<template>
  <section id="best-produk" class="container py-20">
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
    <div v-else class="grid gap-7 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <article
        v-for="p in products"
        :key="p.id"
        class="glass overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-elegant reveal-up"
      >
        <div class="relative">
          <!-- ✨ Optimized image with lazy loading -->
          <img
            :src="getOptimizedImage(p.thumbnail_image)"
            :alt="p.title || p.name"
            loading="lazy"
            decoding="async"
            class="h-56 w-full object-cover"
          />
          <span v-if="p.karat" class="chip absolute left-3 top-3 text-white">{{ p.karat }}</span>
          <span v-if="p.is_best_seller" class="chip absolute right-3 top-3 bg-yellow-600 text-white">Best</span>
        </div>
        <div class="px-3 py-2 flex flex-col gap-2">
          <!-- Header row: name + Detail button side-by-side -->
          <div class="flex items-center justify-between gap-1 md:gap-2 min-w-0">
            <h3 class="font-medium text-maroon flex-1 min-w-0 truncate leading-tight text-sm md:text-base">
              {{ p.title || p.name }}
            </h3>
          </div>
          <!-- Optional brief info under name -->
          <p class="text-sm text-neutral-600">{{ p.karat ? p.karat + " • " : "" }}{{ formatPrice(p.price) }}</p>

          <button
            class="btn-outline shrink-0 text-[11px] md:text-sm px-2 py-1 md:px-3 md:py-1.5 whitespace-nowrap rounded-md"
            @click="openDetail(p)"
          >
            Detail
          </button>
        </div>
      </article>
    </div>

    <!-- Product Detail Modal -->
    <ProductDetailModal :show="showProductModal" :product="selectedProduct" @close="closeProductModal" />
  </section>
</template>
