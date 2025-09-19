<script setup lang="ts">
// Data katalog per kategori (placeholder images from /public/img)
const categories = [
  {
    title: "Kalung",
    items: [
      { label: "Dewasa", img: "/img/necklace.jpg" },
      { label: "Anak-anak", img: "/img/kids-necklace.jpg" },
      { label: "Best Seller", img: "/img/necklace2.jpg" },
    ],
  },
  {
    title: "Liontin",
    items: [
      { label: "Best Seller", img: "/img/pandent2.jpg" },
      { label: "Anak-anak", img: "/img/kids-set.jpg" },
    ],
  },
  {
    title: "Anting",
    items: [
      { label: "Best Seller", img: "/img/earrings2.jpg" },
      { label: "Anak-anak", img: "/img/kidsearring.jpg" },
    ],
  },
  {
    title: "Cincin",
    items: [
      { label: "Anak-anak", img: "/img/kidsring.jpg" },
      { label: "Fashion", img: "/img/rings1.jpg" },
      { label: "Couple Ring", img: "/img/couplering.jpg" },
      { label: "Men Ring", img: "/img/mensring.jpg" },
      { label: "Best Seller", img: "/img/ring2.jpg" },
    ],
  },
  {
    title: "Gelang",
    items: [
      { label: "Best Seller", img: "/img/bangle1.jpg" },
      { label: "Anak-anak", img: "/img/kids-bracelet.jpg" },
      { label: "Fashion", img: "/img/mens-brecelet.jpg" },
    ],
  },
  {
    title: "Giwang",
    items: [
      { label: "Best Seller", img: "/img/earring.jpg" },
      { label: "Fashion", img: "/img/earring2.jpg" },
    ],
  },
];
</script>

<template>
  <section class="bg-cream py-20">
    <div class="container mx-auto max-w-6xl">
      <div class="mb-6 text-center">
        <h2 class="section-title">Katalog Best Seller</h2>
        <p class="mt-2 text-neutral-600">Jelajahi pilihan kategori populer kami.</p>
      </div>

      <!-- Unified responsive grid -->
      <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="cat in categories" :key="cat.title" class="rounded-2xl glass p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-serif text-2xl text-maroon">{{ cat.title }}</h3>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <a
              v-for="(it, idx) in cat.items"
              :key="it.label + idx"
              href="#produk"
              class="group relative overflow-hidden rounded-xl"
            >
              <img
                :src="it.img"
                :alt="`${cat.title} - ${it.label}`"
                loading="lazy"
                class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-black/0" />
              <span class="absolute bottom-2 left-2 chip">{{ it.label }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
