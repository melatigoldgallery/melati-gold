<script setup lang="ts">
import { ref, computed, watch } from "vue";
import CatalogFilterSidebar from "~/components/catalog/FilterSidebar.vue";
import CatalogProductGrid from "~/components/catalog/ProductGrid.vue";

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

  try {
    const productFilters: any = {
      categoryId: category.value.id,
    };

    if (filters.value.subcategoryId) {
      productFilters.subcategoryId = filters.value.subcategoryId;
    }

    const result = await getProducts(productFilters);

    if (result.success) {
      let productList = result.data;
      console.log("[Catalog] Raw products:", productList.length);

      // Apply client-side filters
      // Price filter
      if (filters.value.priceMin !== null) {
        productList = productList.filter((p: any) => {
          const price = p.price || 0;
          return price >= filters.value.priceMin!;
        });
        console.log("[Catalog] After priceMin filter:", productList.length);
      }
      if (filters.value.priceMax !== null) {
        productList = productList.filter((p: any) => {
          const price = p.price || 0;
          return price <= filters.value.priceMax!;
        });
        console.log("[Catalog] After priceMax filter:", productList.length);
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
        console.log("[Catalog] After karat filter:", productList.length, "Filter:", filters.value.karat);
      }

      // Apply sorting
      switch (filters.value.sortBy) {
        case "price-asc":
          productList.sort((a: any, b: any) => {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return priceA - priceB;
          });
          console.log("[Catalog] Sorted by price ascending");
          break;
        case "price-desc":
          productList.sort((a: any, b: any) => {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return priceB - priceA;
          });
          console.log("[Catalog] Sorted by price descending");
          break;
        case "newest":
        default:
          productList.sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          console.log("[Catalog] Sorted by newest");
      }

      products.value = productList;
      console.log("[Catalog] Final products:", products.value.length);
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error("[Catalog] Error fetching products:", err);
    products.value = [];
  }
};

// Handle filter changes
const handleFilterChange = async (newFilters: any) => {
  console.log("[Catalog] Filter changed:", newFilters);
  filters.value = { ...filters.value, ...newFilters };
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
      },
    },
    { replace: true },
  );

  // Refetch products
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
  <div class="min-h-screen bg-cream">
    <main class="container mx-auto max-w-7xl px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm">
        <ol class="flex items-center gap-2 text-neutral-600">
          <li>
            <NuxtLink to="/" class="hover:text-maroon transition-colors">
              <i class="bi bi-house-door"></i>
              Home
            </NuxtLink>
          </li>
          <li><i class="bi bi-chevron-right text-xs"></i></li>
          <li>
            <span class="text-neutral-400">Katalog</span>
          </li>
          <li><i class="bi bi-chevron-right text-xs"></i></li>
          <li>
            <span class="font-semibold text-maroon">{{ category?.name || "Loading..." }}</span>
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-600"></div>
        <p class="mt-4 text-gray-600">Memuat katalog...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <i class="bi bi-exclamation-triangle text-6xl text-red-500"></i>
        <p class="mt-4 text-gray-600">{{ error }}</p>
        <NuxtLink to="/" class="mt-4 inline-block px-6 py-2 bg-maroon text-white rounded-lg hover:bg-maroon-dark">
          Kembali ke Beranda
        </NuxtLink>
      </div>

      <!-- Main Content -->
      <div v-else class="flex flex-col lg:flex-row gap-6">
        <!-- Filter Sidebar -->
        <aside class="lg:w-64 flex-shrink-0">
          <CatalogFilterSidebar :category="category" :filters="filters" @update:filters="handleFilterChange" />
        </aside>

        <!-- Product Grid -->
        <div class="flex-1">
          <!-- Category Header -->
          <div class="mb-8">
            <h1 class="text-3xl md:text-3xl font-serif text-maroon mb-3">
              {{ category?.name }}
            </h1>
            <p v-if="category?.description" class="text-neutral-600 text-lg">
              {{ category.description }}
            </p>
            <p class="mt-2 text-sm text-neutral-500">{{ products.length }} produk ditemukan</p>
          </div>

          <!-- Empty State -->
          <div v-if="products.length === 0" class="text-center py-16">
            <i class="bi bi-inbox text-6xl text-gray-400"></i>
            <p class="mt-4 text-gray-600">Belum ada produk tersedia untuk kategori ini</p>
          </div>

          <!-- Products Grid -->
          <CatalogProductGrid v-else :products="products" @product-click="handleProductClick" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
