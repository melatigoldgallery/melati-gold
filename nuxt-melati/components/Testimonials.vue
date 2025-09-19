<script setup lang="ts">
const items = [
  {
    quote: "“Sangat elegan dan kualitasnya bagus banget. Pelayanan juga ramah.”",
    name: "Nadia",
    city: "Denpasar",
    img: "/img/earrings2.jpg",
  },
  {
    quote: "“Modelnya eksklusif, cocok untuk hadiah spesial. Pengiriman cepat.”",
    name: "Raka",
    city: "Badung",
    img: "/img/ring2.jpg",
  },
  {
    quote: "“Suka banget sama detailnya. Nilai uangnya sepadan.”",
    name: "Citra",
    city: "Gianyar",
    img: "/img/necklace2.jpg",
  },
];
</script>

<template>
  <section id="testimoni" class="container py-20">
    <div class="mx-auto mb-12 text-center max-w-2xl reveal-in">
      <h2 class="section-title">Testimoni Pelanggan</h2>
      <p class="mt-2 text-neutral-600">Cerita nyata dari pelanggan kami.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <figure v-for="(t, i) in items" :key="i" class="glass p-6 rounded-2xl reveal-up">
        <blockquote class="text-neutral-700">{{ t.quote }}</blockquote>
        <figcaption class="mt-4 flex items-center gap-3">
          <img
            :src="t.img"
            loading="lazy"
            class="h-10 w-10 rounded-full object-cover ring-1 ring-gold/30"
            :alt="t.name"
          />
          <div>
            <div class="font-medium text-maroon">{{ t.name }}</div>
            <div class="text-xs text-neutral-500">{{ t.city }}</div>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
