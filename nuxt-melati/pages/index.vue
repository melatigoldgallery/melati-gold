<template>
  <div class="min-h-screen bg-cream">
    <SiteHeader />
    <main class="relative">
      <HeroSection />
      <CatalogShowcase />
      <FeaturedProducts />
      <CustomServices />
      <CareTips />
      <Testimonials />
      <AboutUs />
      <FinalCta />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
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
