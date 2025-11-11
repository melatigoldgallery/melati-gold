<template>
  <div class="min-h-screen bg-cream">
    <SiteHeader />
    <main class="relative">
      <HeroSection />
      <CatalogShowcase @open-subcategories="openSubcategories" />
      <FeaturedProducts />
      <CustomServices @open-service="openService" />
      <CareTips />
      <Testimonials />
      <AboutUs />
      <FinalCta />
    </main>
    <SiteFooter />

    <!-- Subcategory Modal -->
    <SubcategoryModal
      :show="showSubcategoryModal"
      :category="selectedCategory"
      @close="closeSubcategoryModal"
      @select="selectSubcategory"
    />

    <!-- Lookbook Grid Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLookbookModal"
          class="fixed inset-0 bg-black/60 z-[55] flex items-center justify-center p-4"
          @click.self="closeLookbookModal"
        >
          <div class="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6">
            <!-- Loading State -->
            <div v-if="loadingProducts" class="text-center py-12">
              <div
                class="inline-block w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin"
              ></div>
              <p class="mt-4 text-neutral-600">Memuat produk...</p>
            </div>

            <!-- Products Grid -->
            <div v-else>
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-900">
                  {{ selectedCategoryName }} - {{ selectedSubcategoryName }}
                </h3>
                <button
                  @click="closeLookbookModal"
                  class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <i class="bi bi-x-lg text-2xl"></i>
                </button>
              </div>
              <LookbookGrid :items="currentProducts" @open="openProductDetail" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Product Detail Modal -->
    <ProductDetailModal
      :show="showProductModal"
      :product="selectedProduct"
      :serviceContext="selectedService"
      @close="closeProductModal"
    />

    <!-- Custom Service Modal -->
    <CustomServiceModal
      :show="showServiceModal"
      :service="selectedService"
      @close="closeServiceModal"
      @select-product="openProductFromService"
    />
  </div>
</template>

<script setup lang="ts">
// Lazy load heavy components with image galleries and modals
const ProductDetailModal = defineAsyncComponent(() => import("~/components/ProductDetailModal.vue"));

const SubcategoryModal = defineAsyncComponent(() => import("~/components/SubcategoryModal.vue"));

const LookbookGrid = defineAsyncComponent(() => import("~/components/LookbookGrid.vue"));

useHead({
  title: "Melati Gold Shop",
  meta: [{ name: "description", content: "Discover exquisite jewelry at Melati Gold Shop." }],
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    },
  ],
});

const { getProducts: getCatalogProducts, getProductById } = useCatalogManager();
const { getProducts, getProductDetail } = useCatalogData();

// State management
const showSubcategoryModal = ref(false);
const showLookbookModal = ref(false);
const showProductModal = ref(false);
const showServiceModal = ref(false);
const selectedCategory = ref<any>(null);
const selectedCategoryName = ref<string | null>(null);
const selectedSubcategory = ref<string | null>(null);
const selectedSubcategoryName = ref<string>("");
const selectedProduct = ref<any>(null);
const selectedService = ref<any>(null);
const currentProducts = ref<any[]>([]);
const loadingProducts = ref(false);

// Open subcategory modal
const openSubcategories = (category: any) => {
  selectedCategory.value = category;
  selectedCategoryName.value = category.name || category;
  showSubcategoryModal.value = true;
};

// Close subcategory modal
const closeSubcategoryModal = () => {
  showSubcategoryModal.value = false;
};

// Select subcategory and show lookbook with products from database
const selectSubcategory = async (subcategoryId: string, subcategoryName: string) => {
  selectedSubcategory.value = subcategoryId;
  selectedSubcategoryName.value = subcategoryName;
  showSubcategoryModal.value = false;

  // Fetch products for this subcategory from database
  loadingProducts.value = true;
  const result = await getCatalogProducts({ subcategoryId });

  if (result.success && result.data.length > 0) {
    currentProducts.value = result.data;
    showLookbookModal.value = true;
  } else {
    // No products found
    alert(`Belum ada produk untuk ${subcategoryName}`);
  }

  loadingProducts.value = false;
};

// Close lookbook modal
const closeLookbookModal = () => {
  showLookbookModal.value = false;
};

// Open product detail (using database product)
const openProductDetail = (product: any) => {
  selectedProduct.value = product;
  showProductModal.value = true;
};

// Close product detail modal
const closeProductModal = () => {
  showProductModal.value = false;
};

// Open service modal
const openService = (service: any) => {
  selectedService.value = service;
  showServiceModal.value = true;
};

// Close service modal
const closeServiceModal = () => {
  showServiceModal.value = false;
};

// Open product from service (close service modal, open product detail)
const openProductFromService = async (product: any) => {
  // Prefer fetching full product detail from DB so images/gallery are available
  try {
    if (product?.id) {
      const result = await getProductById(product.id);
      if (result.success && result.data) {
        selectedProduct.value = result.data;
      } else {
        // Fallback to the minimal product object if detail fetch fails
        selectedProduct.value = product;
      }
    } else {
      selectedProduct.value = product;
    }
  } catch (e) {
    // Silent fallback
    selectedProduct.value = product;
  }

  showServiceModal.value = false;
  showProductModal.value = true;
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
