<script setup lang="ts">
import { ref, computed } from "vue";
import CatalogProductGrid from "~/components/catalog/ProductGrid.vue";
import {
  HomeIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  InboxIcon,
  PhoneIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";

// Disable default layout (which includes SiteHeader)
definePageMeta({
  layout: false,
});

// Get route params
const route = useRoute();
const serviceId = computed(() => route.params.id as string);

// Composables
const { getServiceWithProducts } = useCatalogManager();

// State
const service = ref<any>(null);
const products = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// WhatsApp contact
const whatsappNumber = "6281234567890";

// Fetch service detail with products
const fetchServiceDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await getServiceWithProducts(serviceId.value);

    if (!result.success || !result.data) {
      throw createError({
        statusCode: 404,
        message: "Layanan tidak ditemukan",
      });
    }

    service.value = result.data;
    products.value = result.data.products || [];
  } catch (err: any) {
    error.value = err.message || "Gagal memuat detail layanan";
    console.error("[Service] Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

// Navigate to product detail
const handleProductClick = (product: any) => {
  navigateTo(`/product/${product.id}`);
};

// Contact via WhatsApp
const contactWhatsApp = () => {
  const text = `Halo, saya ingin konsultasi tentang layanan ${service.value?.title}`;
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
};

// Initial fetch
await fetchServiceDetail();

// SEO Meta tags
useHead({
  title: `${service.value?.title || "Layanan"} - Melati Gold Shop`,
  meta: [
    {
      name: "description",
      content: service.value?.description || `Layanan custom ${service.value?.title}`,
    },
    { property: "og:title", content: `${service.value?.title} - Melati Gold Shop` },
    {
      property: "og:description",
      content: service.value?.description || "Layanan pembuatan perhiasan custom sesuai keinginan Anda",
    },
    {
      property: "og:image",
      content: service.value?.image_url || "/img/placeholder.jpg",
    },
    { property: "og:type", content: "website" },
  ],
  link: [
    {
      rel: "canonical",
      href: `https://melatigoldshop.com/service/${serviceId.value}`,
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-cream overflow-x-hidden">
    <main class="container mx-auto max-w-7xl px-4 py-8 overflow-x-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-600"></div>
        <p class="mt-4 text-gray-600">Memuat layanan...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto" />
        <p class="mt-4 text-gray-600">{{ error }}</p>
        <NuxtLink to="/" class="mt-4 inline-block px-6 py-2 bg-maroon text-white rounded-lg hover:bg-maroon-dark">
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Service Detail -->
      <div v-else>
        <!-- Breadcrumb -->
        <nav class="mb-6 text-sm">
          <ol class="flex items-center gap-2 text-neutral-600 flex-wrap">
            <li>
              <NuxtLink to="/" class="hover:text-maroon transition-colors flex items-center gap-1">
                <HomeIcon class="w-4 h-4" />
                Home
              </NuxtLink>
            </li>
            <li><ChevronRightIcon class="w-3 h-3" /></li>
            <li>
              <NuxtLink to="/#custom" class="hover:text-maroon transition-colors">Layanan Custom</NuxtLink>
            </li>
            <li><ChevronRightIcon class="w-3 h-3" /></li>
            <li>
              <span class="font-semibold text-maroon">{{ service?.title }}</span>
            </li>
          </ol>
        </nav>

        <!-- Service Header -->
        <div class="mb-8">
          <h1 class="text-xl md:text-3xl lg:text-2xl font-serif font-bold text-maroon mb-4">
            Custom {{ service?.title }}
          </h1>

          <!-- Service Info Card -->
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <p class="text-gray-700 mb-4 leading-relaxed">{{ service?.description }}</p>

            <!-- Features -->
            <div v-if="service?.features && service.features.length > 0" class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <StarIconSolid class="w-5 h-5 text-gold" />
                <span>Keunggulan Layanan</span>
              </h3>
              <ul class="space-y-2">
                <li v-for="(feature, idx) in service.features" :key="idx" class="flex items-start gap-2">
                  <CheckCircleIcon class="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span class="text-gray-700">{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- Meta Info -->
            <div class="flex flex-wrap gap-4 text-sm border-t pt-4 mt-4">
              <span v-if="service?.duration" class="flex items-center gap-2 text-gray-600">
                <ClockIcon class="w-4 h-4" />
                {{ service.duration }}
              </span>
              <span v-if="service?.price_info" class="flex items-center gap-2 text-maroon font-semibold">
                <TagIcon class="w-4 h-4" />
                {{ service.price_info }}
              </span>
            </div>

            <!-- WhatsApp CTA Button -->
            <div class="mt-6">
              <button
                @click="contactWhatsApp"
                class="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <PhoneIcon class="w-5 h-5" />
                <span>Konsultasi via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Example Products Section -->
        <div v-if="products.length > 0" class="mt-12">
          <div class="mb-6">
            <h2 class="text-xl md:text-2xl lg:text-xl font-serif font-bold text-gray-900 mb-2">Contoh Produk</h2>
            <p class="text-gray-600 text-sm">Berikut adalah contoh produk dari layanan {{ service?.title }}</p>
          </div>

          <!-- Wrapper untuk grid lebih kecil dan proporsional -->
          <div class="example-products-grid">
            <CatalogProductGrid :products="products" @product-click="handleProductClick" />
          </div>
        </div>

        <!-- Empty Products State -->
        <div v-else class="mt-12 text-center py-16 bg-white rounded-xl shadow-md">
          <InboxIcon class="w-16 h-16 text-gray-400 mx-auto" />
          <p class="mt-4 text-gray-600 mb-6">
            Belum ada contoh produk untuk layanan ini.
            <br />
            Silakan hubungi kami untuk konsultasi lebih lanjut.
          </p>
          <button
            @click="contactWhatsApp"
            class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <PhoneIcon class="w-5 h-5" />
            <span>Konsultasi via WhatsApp</span>
          </button>
        </div>

        <!-- Back Button -->
        <div class="mt-8 text-center">
          <NuxtLink
            to="/#custom"
            class="inline-flex items-center gap-2 text-maroon hover:text-maroon-dark transition-colors"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            <span>Kembali ke Layanan Custom</span>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Override grid untuk contoh produk - sedikit lebih besar dan proporsional */
.example-products-grid :deep(.grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .example-products-grid :deep(.grid) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 1024px) {
  .example-products-grid :deep(.grid) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .example-products-grid :deep(.grid) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.example-products-grid :deep(.grid article) {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.example-products-grid :deep(.aspect-\[4\/5\]) {
  aspect-ratio: 1 / 1;
}

.example-products-grid :deep(.group h3) {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

@media (min-width: 768px) {
  .example-products-grid :deep(.group h3) {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

.example-products-grid :deep(.group p) {
  font-size: 0.75rem;
  line-height: 1rem;
}

@media (min-width: 768px) {
  .example-products-grid :deep(.group p) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}
</style>
