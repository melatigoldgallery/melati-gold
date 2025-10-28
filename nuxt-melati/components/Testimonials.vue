<script setup lang="ts">
// Use actual files found under /public/img
const screenshots = [
  "/img/Screenshot (655).png",
  "/img/Screenshot (656).png",
  "/img/Screenshot (659).png",
  "/img/Screenshot (660).png",
  "/img/Screenshot (661).png",
  "/img/Screenshot (662).png",
  "/img/Screenshot (663).png",
  "/img/Screenshot (664).png",
  "/img/Screenshot (665).png",
  "/img/Screenshot (666).png",
  "/img/Screenshot (667).png",
];
</script>

<template>
  <section id="testimoni" class="container py-20">
    <div class="mx-auto mb-12 text-center max-w-2xl reveal-in">
      <h2 class="section-title">Testimoni Pelanggan</h2>
      <p class="mt-2 text-neutral-600">Cuplikan testimoni pelanggan kami.</p>
    </div>

    <div class="mx-auto max-w-5xl reveal-up">
      <ImageCarousel
        :images="screenshots"
        :autoplay="true"
        :interval="5000"
        :show-arrows="true"
        :show-dots="false"
        aspect="aspect-[4/3]"
        aria-label="Carousel testimoni"
      />
    </div>
  </section>
</template>
