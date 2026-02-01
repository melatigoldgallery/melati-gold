<template>
  <div class="min-h-screen bg-cream">
    <SiteHeader />
    <main class="relative">
      <HeroSection />
      <CatalogShowcase />
      <FeaturedProducts />
      <CustomServices @open-service="openService" />
      <CareTips />
      <Testimonials />
      <AboutUs />
      <FinalCta />
    </main>
    <SiteFooter />

    <!-- Custom Service Modal (keep only this one) -->
    <CustomServiceModal
      :show="showServiceModal"
      :service="selectedService"
      @close="closeServiceModal"
      @select-product="openProductFromService"
    />
  </div>
</template>

<script setup lang="ts">
// Lazy load heavy components
const CustomServiceModal = defineAsyncComponent(() => import("~/components/CustomServiceModal.vue"));

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

const { getProductById } = useCatalogManager();

// State management - only for custom service modal
const showServiceModal = ref(false);
const selectedService = ref<any>(null);

// Open service modal
const openService = (service: any) => {
  selectedService.value = service;
  showServiceModal.value = true;
};

// Close service modal
const closeServiceModal = () => {
  showServiceModal.value = false;
};

// Open product from service - navigate to product page
const openProductFromService = async (product: any) => {
  if (product?.id) {
    // Navigate to product detail page
    await navigateTo(`/product/${product.id}`);
  }
  showServiceModal.value = false;
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
