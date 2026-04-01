<script setup lang="ts">
const BASE = "https://ik.imagekit.io/melatigold/melati-gold/testimonials";
const TR = "?tr=f-auto,q-auto";

const screenshots = [
  `${BASE}/Screenshot%20(655).png${TR}`,
  `${BASE}/Screenshot%20(656).png${TR}`,
  `${BASE}/Screenshot%20(659).png${TR}`,
  `${BASE}/Screenshot%20(660).png${TR}`,
  `${BASE}/Screenshot%20(662).png${TR}`,
  `${BASE}/Screenshot%20(664).png${TR}`,
  `${BASE}/Screenshot%20(665).png${TR}`,
  `${BASE}/Screenshot%20(666).png${TR}`,
  `${BASE}/Screenshot%20(667).png${TR}`,
];
</script>

<template>
  <section id="testimoni" class="container py-10 md:py-20">
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
