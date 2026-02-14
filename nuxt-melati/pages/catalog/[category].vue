<script setup lang="ts">
import { ref, computed, watch } from "vue";
import CatalogFilterSidebar from "~/components/catalog/FilterSidebar.vue";
import CatalogProductGrid from "~/components/catalog/ProductGrid.vue";
import CatalogPaginationControls from "~/components/catalog/PaginationControls.vue";

// Disable default layout (which includes SiteHeader)
definePageMeta({
  layout: false,
});

// Get route params
const route = useRoute();
const categorySlug = computed(() => route.params.category as string);

// Composables
const { getCategoryBySlug, getProducts } = useCatalogManager();

// State
const category = ref<any>(null);
const products = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Filters state
const filters = ref({
  subcategoryId: (route.query.subcategory as string) || "",
  priceMin: route.query.price_min ? Number(route.query.price_min) : null,
  priceMax: route.query.price_max ? Number(route.query.price_max) : null,
  karat: (route.query.karat as string) || "",
  sortBy: (route.query.sort as string) || "newest",
});

// Pagination state
const currentPage = ref(route.query.page ? Number(route.query.page) : 1);
const itemsPerPage = ref(route.query.limit ? Number(route.query.limit) : 24);
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));
const paginationData = ref<any>(null);

// Fetch category data
const fetchCategoryData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get category by slug
    const categoryResult = await getCategoryBySlug(categorySlug.value);

    if (!categoryResult.success || !categoryResult.data) {
      throw createError({
        statusCode: 404,
        message: "Kategori tidak ditemukan",
      });
    }

    category.value = categoryResult.data;

    // Fetch products for this category
    await fetchProducts();
  } catch (err: any) {
    error.value = err.message || "Gagal memuat data katalog";
    console.error("[Catalog] Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

// Fetch products with filters
const fetchProducts = async () => {
  if (!category.value) return;

  loading.value = true;
  try {
    const productFilters: any = {
      categoryId: category.value.id,
      page: currentPage.value,
      limit: itemsPerPage.value,
      useCache: true,
    };

    if (filters.value.subcategoryId) {
      productFilters.subcategoryId = filters.value.subcategoryId;
    }

    const result = await getProducts(productFilters);

    if (result.success) {
      let productList = result.data;
      paginationData.value = result.pagination;

      console.log("[Catalog] Raw products:", productList.length);

      // Apply client-side filters (for filters not supported by API)
      // Price filter
      if (filters.value.priceMin !== null) {
        productList = productList.filter((p: any) => {
          const price = p.price || 0;
          return price >= filters.value.priceMin!;
        });
      }
      if (filters.value.priceMax !== null) {
        productList = productList.filter((p: any) => {
          const price = p.price || 0;
          return price <= filters.value.priceMax!;
        });
      }

      // Karat filter
      if (filters.value.karat) {
        productList = productList.filter((p: any) => {
          if (!p.karat) return false;
          // Normalize karat format (18k, 18K, 18 Karat, etc.)
          const productKarat = p.karat.toLowerCase().replace(/[^0-9]/g, "");
          const filterKarat = filters.value.karat.toLowerCase().replace(/[^0-9]/g, "");
          return productKarat === filterKarat;
        });
      }

      // Apply sorting
      switch (filters.value.sortBy) {
        case "price-asc":
          productList.sort((a: any, b: any) => {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return priceA - priceB;
          });
          break;
        case "price-desc":
          productList.sort((a: any, b: any) => {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return priceB - priceA;
          });
          break;
        case "newest":
        default:
          productList.sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
      }

      products.value = productList;
      totalItems.value = productList.length;
      console.log("[Catalog] Final products:", products.value.length, "Total:", totalItems.value);
    } else {
      products.value = [];
      totalItems.value = 0;
    }
  } catch (err) {
    console.error("[Catalog] Error fetching products:", err);
    products.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

// Handle filter changes
const handleFilterChange = async (newFilters: any) => {
  console.log("[Catalog] Filter changed:", newFilters);
  filters.value = { ...filters.value, ...newFilters };
  currentPage.value = 1; // Reset to first page on filter change
  console.log("[Catalog] Current filters:", filters.value);

  // Update URL query params
  await navigateTo(
    {
      path: route.path,
      query: {
        subcategory: filters.value.subcategoryId || undefined,
        price_min: filters.value.priceMin || undefined,
        price_max: filters.value.priceMax || undefined,
        karat: filters.value.karat || undefined,
        sort: filters.value.sortBy,
        page: 1,
        limit: itemsPerPage.value,
      },
    },
    { replace: true },
  );

  // Refetch products
  await fetchProducts();
};

// Handle pagination changes
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await navigateTo(
    {
      path: route.path,
      query: {
        ...route.query,
        page,
      },
    },
    { replace: true },
  );
  await fetchProducts();
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Handle items per page change
const handleItemsPerPageChange = async (limit: number) => {
  itemsPerPage.value = limit;
  currentPage.value = 1; // Reset to first page
  await navigateTo(
    {
      path: route.path,
      query: {
        ...route.query,
        limit,
        page: 1,
      },
    },
    { replace: true },
  );
  await fetchProducts();
};

// Handle product click - navigate to product detail page
const handleProductClick = (product: any) => {
  navigateTo(`/product/${product.id}`);
};

// Watch route changes
watch(
  () => route.query,
  () => {
    filters.value = {
      subcategoryId: (route.query.subcategory as string) || "",
      priceMin: route.query.price_min ? Number(route.query.price_min) : null,
      priceMax: route.query.price_max ? Number(route.query.price_max) : null,
      karat: (route.query.karat as string) || "",
      sortBy: (route.query.sort as string) || "newest",
    };
    currentPage.value = route.query.page ? Number(route.query.page) : 1;
    itemsPerPage.value = route.query.limit ? Number(route.query.limit) : 24;
    fetchProducts();
  },
);

// Initial fetch
await fetchCategoryData();

// SEO Meta tags
useHead({
  title: `${category.value?.name || "Katalog"} - Melati Gold Shop`,
  meta: [
    {
      name: "description",
      content: category.value?.description || `Jelajahi koleksi ${category.value?.name} premium dari Melati Gold Shop`,
    },
    { property: "og:title", content: `${category.value?.name} - Melati Gold Shop` },
    {
      property: "og:description",
      content: category.value?.description || `Koleksi ${category.value?.name} berkualitas tinggi`,
    },
    { property: "og:image", content: category.value?.cover_image || "/img/placeholder.jpg" },
    { property: "og:type", content: "website" },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-cream via-white to-cream">
    <main class="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-3 md:py-3">
      <!-- Breadcrumb - Enhanced -->
      <nav class="mb-1">
        <div class="px-5 py-3 inline-flex">
          <ol class="flex items-center gap-2 text-xs text-neutral-600">
            <li>
              <NuxtLink to="/" class="hover:text-maroon transition-colors duration-300 flex items-center gap-2">
                <i class="bi bi-house-door text-sm"></i>
                <span>Home</span>
              </NuxtLink>
            </li>
            <li><i class="bi bi-chevron-right text-[10px]"></i></li>
            <li>
              <span class="text-neutral-400">Katalog</span>
            </li>
            <li><i class="bi bi-chevron-right text-[10px]"></i></li>
            <li>
              <span class="font-semibold text-maroon">{{ category?.name || "Loading..." }}</span>
            </li>
          </ol>
        </div>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-maroon border-t-transparent shadow-lg"
        ></div>
        <p class="mt-4 text-gray-600 font-medium">Memuat katalog...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <i class="bi bi-exclamation-triangle text-6xl text-red-500"></i>
        <p class="mt-4 text-gray-600">{{ error }}</p>
        <NuxtLink
          to="/"
          class="mt-6 inline-block px-6 py-3 bg-maroon text-white rounded-2xl hover:bg-maroon-dark shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        >
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Main Content -->
      <div v-else class="flex flex-col lg:flex-row gap-2 lg:gap-8">
        <!-- Filter Sidebar -->
        <aside class="lg:w-64 flex-shrink-0">
          <CatalogFilterSidebar :category="category" :filters="filters" @update:filters="handleFilterChange" />
        </aside>

        <!-- Product Grid -->
        <div class="flex-1 min-w-0">
          <!-- Category Header - Enhanced -->
          <div class="mb-6">
            <div class="flex items-center gap-2.5 mb-1">
              <h1 class="text-xl md:text-3xl lg:text-2xl font-serif font-bold text-maroon">
                {{ category?.name }}
              </h1>
            </div>
            <div class="h-1 w-20 bg-gradient-to-r from-gold to-maroon rounded-full mb-3"></div>
            <p v-if="category?.description" class="text-neutral-600 text-base leading-relaxed max-w-3xl">
              {{ category.description }}
            </p>
          </div>

          <!-- Empty State -->
          <div v-if="products.length === 0 && !loading" class="text-center py-16 bg-white/50 rounded-2xl">
            <i class="bi bi-inbox text-6xl text-gray-400"></i>
            <p class="mt-4 text-gray-600">Belum ada produk tersedia untuk kategori ini</p>
          </div>

          <!-- Products Grid -->
          <div v-else>
            <CatalogProductGrid :products="products" @product-click="handleProductClick" />

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="mt-10">
              <CatalogPaginationControls
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="totalItems"
                :items-per-page="itemsPerPage"
                :loading="loading"
                @page-change="handlePageChange"
                @items-per-page-change="handleItemsPerPageChange"
              />
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
