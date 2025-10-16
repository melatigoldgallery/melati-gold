<template>
  <div class="min-h-screen bg-cream">
    <SiteHeader />
    <main class="relative">
      <HeroSection />
      <CatalogShowcase @open-subcategories="openSubcategories" />
      <CustomServices />
      <FeaturedProducts />
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
          class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          @click.self="closeLookbookModal"
        >
          <div class="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-gray-900">{{ selectedCategory }} - {{ selectedSubcategoryTitle }}</h3>
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
      </Transition>
    </Teleport>

    <!-- Product Detail Modal -->
    <ProductDetailModal :show="showProductModal" :product="selectedProduct" @close="closeProductModal" />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Melati Gold Gallery - Handcrafted Jewelry",
  meta: [{ name: "description", content: "Discover exquisite handcrafted jewelry at Melati Gold Gallery." }],
  link: [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    },
  ],
});

const { getProducts, getProductDetail } = useCatalogData();

// State management
const showSubcategoryModal = ref(false);
const showLookbookModal = ref(false);
const showProductModal = ref(false);
const selectedCategory = ref<string | null>(null);
const selectedSubcategory = ref<string | null>(null);
const selectedSubcategoryTitle = ref<string>("");
const selectedProduct = ref<any>(null);
const currentProducts = ref<any[]>([]);

// Mapping subcategory key to title
const subcategoryTitles: Record<string, string> = {
  anak: "Anak",
  fashion: "Fashion",
  pria: "Pria",
  bangle: "Bangle",
};

// Open subcategory modal
const openSubcategories = (category: string) => {
  selectedCategory.value = category;
  showSubcategoryModal.value = true;
};

// Close subcategory modal
const closeSubcategoryModal = () => {
  showSubcategoryModal.value = false;
};

// Select subcategory and show lookbook
const selectSubcategory = (subcategory: string) => {
  selectedSubcategory.value = subcategory;
  selectedSubcategoryTitle.value = subcategoryTitles[subcategory] || subcategory;
  showSubcategoryModal.value = false;

  // Get products for this category and subcategory
  if (selectedCategory.value) {
    currentProducts.value = getProducts(selectedCategory.value, subcategory);
    showLookbookModal.value = true;
  }
};

// Close lookbook modal
const closeLookbookModal = () => {
  showLookbookModal.value = false;
};

// Open product detail
const openProductDetail = (productId: number) => {
  if (selectedCategory.value && selectedSubcategory.value) {
    selectedProduct.value = getProductDetail(selectedCategory.value, selectedSubcategory.value, productId);
    showProductModal.value = true;
  }
};

// Close product detail modal
const closeProductModal = () => {
  showProductModal.value = false;
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
