<script setup lang="ts">
import { computed } from "vue";
import ProductGallery from "~/components/product/ProductGallery.vue";
import ProductInfo from "~/components/product/ProductInfo.vue";
import ProductRelatedProducts from "~/components/product/RelatedProducts.vue";
import { HomeIcon, ChevronRightIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

// Disable default layout (which includes SiteHeader)
definePageMeta({
  layout: false,
});

const route = useRoute();
const productId = computed(() => route.params.id as string);

const { getProductById, getRelatedProducts } = useCatalogManager();

// useAsyncData tanpa await: halaman baru langsung render dengan loading state
// watch: [productId] otomatis re-fetch saat navigasi antar produk
const {
  data: pageData,
  status,
  error: fetchError,
} = useAsyncData(
  () => `product-${productId.value}`,
  async () => {
    const result = await getProductById(productId.value);

    if (!result.success || !result.data) {
      throw createError({ statusCode: 404, message: "Produk tidak ditemukan" });
    }

    const relatedResult = await getRelatedProducts(productId.value, 6);

    return {
      product: result.data,
      relatedProducts: relatedResult.success ? relatedResult.data : [],
    };
  },
  { watch: [productId] },
);

const product = computed(() => pageData.value?.product ?? null);
const relatedProducts = computed(() => pageData.value?.relatedProducts ?? []);
const loading = computed(() => status.value === "pending");
const error = computed(() => fetchError.value?.message ?? null);

const handleRelatedProductClick = (relatedProduct: any) => {
  navigateTo(`/product/${relatedProduct.id}`);
};

// SEO Meta tags - reaktif mengikuti data produk
useHead(
  computed(() => ({
    title: `${product.value?.name || "Produk"} - Melati Gold Shop`,
    meta: [
      { name: "description", content: product.value?.description || `Detail produk ${product.value?.name}` },
      { property: "og:title", content: `${product.value?.name} - Melati Gold Shop` },
      { property: "og:description", content: product.value?.description || "Produk perhiasan emas berkualitas" },
      {
        property: "og:image",
        content: product.value?.thumbnail_image || product.value?.images?.[0] || "/img/placeholder.jpg",
      },
      { property: "og:type", content: "product" },
      { property: "product:price:amount", content: product.value?.price || 0 },
      { property: "product:price:currency", content: "IDR" },
    ],
    link: [{ rel: "canonical", href: `https://melatigoldshop.com/product/${productId.value}` }],
  })),
);
</script>

<template>
  <div class="min-h-screen bg-cream overflow-x-hidden">
    <main class="container mx-auto max-w-[2000px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 md:py-6 lg:py-8 overflow-x-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-600"></div>
        <p class="mt-4 text-gray-600">Memuat produk...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto" />
        <p class="mt-4 text-gray-600">{{ error }}</p>
        <NuxtLink to="/" class="mt-4 inline-block px-6 py-2 bg-maroon text-white rounded-lg hover:bg-maroon-dark">
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Product Detail -->
      <div v-else>
        <!-- Breadcrumb -->
        <nav class="mb-4 md:mb-6 text-sm">
          <ol class="flex items-center gap-2 text-neutral-600 flex-wrap">
            <li>
              <NuxtLink to="/" class="hover:text-maroon transition-colors flex items-center gap-1">
                <HomeIcon class="w-4 h-4" />
                Home
              </NuxtLink>
            </li>
            <template v-if="product?.category_name">
              <li><ChevronRightIcon class="w-3 h-3" /></li>
              <li>
                <NuxtLink
                  :to="`/catalog/${product.category_slug || product.category_name.toLowerCase().replace(/\s+/g, '-')}`"
                  class="hover:text-maroon transition-colors"
                >
                  {{ product.category_name }}
                </NuxtLink>
              </li>
            </template>
            <li><ChevronRightIcon class="w-3 h-3" /></li>
            <li>
              <span class="font-semibold text-maroon">{{ product?.name }}</span>
            </li>
          </ol>
        </nav>

        <!-- Product Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 mb-8 md:mb-10 lg:mb-12">
          <!-- Product Gallery -->
          <div class="lg:sticky lg:top-4 lg:self-start">
            <ProductGallery
              :images="product?.images || []"
              :videoUrl="product?.video_url"
              :productName="product?.name"
            />
          </div>

          <!-- Product Info -->
          <div>
            <ProductInfo :product="product" />
          </div>
        </div>

        <!-- Related Products -->
        <div class="mt-8 md:mt-10 lg:mt-12">
          <ProductRelatedProducts
            v-if="relatedProducts.length > 0"
            :products="relatedProducts"
            @product-click="handleRelatedProductClick"
          />
          <div v-else class="py-8 border-t">
            <!-- Debug info when no related products -->
            <div class="mb-6">
              <h2 class="text-2xl md:text-3xl font-serif text-gray-900">Produk Terkait</h2>
              <p class="text-gray-600 mt-2">Tidak ada produk terkait tersedia saat ini</p>
              <p class="text-xs text-gray-400 mt-2">
                Debug: Category ID: {{ product?.category_id }} | Subcategory ID: {{ product?.subcategory_id }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
