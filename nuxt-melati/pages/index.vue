<template>
  <div class="min-h-screen bg-cream overflow-x-hidden">
    <SiteHeader />
    <main class="relative overflow-x-hidden">
      <div class="section-full" data-aos="fade-in">
        <HeroSection />
      </div>
      <div class="section-full" data-aos="zoom-in" data-aos-duration="800">
        <CatalogShowcase />
      </div>
      <div class="section-full" data-aos="fade-up" data-aos-duration="900" data-aos-delay="100">
        <FeaturedProducts />
      </div>
      <div class="section-full" data-aos="fade-up" data-aos-duration="800" data-aos-delay="50">
        <CustomServices />
      </div>
      <div class="section-full" data-aos="fade-up" data-aos-duration="850" data-aos-delay="75">
        <CareTips />
      </div>
      <div class="section-full" data-aos="fade-up" data-aos-duration="800" data-aos-delay="100">
        <Testimonials />
      </div>
      <div class="section-full" data-aos="fade-left" data-aos-duration="900" data-aos-delay="50">
        <AboutUs />
      </div>
      <div class="section-full" data-aos="zoom-in" data-aos-duration="800" data-aos-delay="100">
        <FinalCta />
      </div>
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
      as: "style",
    },
    { rel: "preconnect", href: "https://res.cloudinary.com", crossorigin: "" },
    { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
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

.section-full {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
