<script setup lang="ts">
const emit = defineEmits<{
  (e: "open-subcategories", category: string): void;
}>();

const categories = [
  {
    id: 1,
    title: "Kalung",
    image: "/img/necklace-cvr.jpg",
    description: "Koleksi kalung emas elegan",
  },
  {
    id: 2,
    title: "Liontin",
    image: "/img/pandent2.jpg",
    description: "Liontin cantik untuk penampilan istimewa",
  },
  {
    id: 3,
    title: "Anting",
    image: "/img/earringcvr.jpg",
    description: "Anting emas yang mempesona",
  },
  {
    id: 4,
    title: "Cincin",
    image: "/img/ringcvr.jpg",
    description: "Cincin emas berkualitas premium",
  },
  {
    id: 5,
    title: "Gelang",
    image: "/img/bangle1.jpg",
    description: "Gelang emas dengan desain modern",
  },
  {
    id: 6,
    title: "Giwang",
    image: "/img/earring2.jpg",
    description: "Giwang tradisional dan kontemporer",
  },
];
</script>

<template>
  <section id="produk" class="bg-cream py-20">
    <div class="container mx-auto max-w-7xl px-4">
      <!-- Header Section -->
      <div class="mb-12 text-center reveal-up">
        <h2 class="section-title text-maroon">Katalog Produk</h2>
        <p class="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          Jelajahi koleksi perhiasan emas premium dengan berbagai kategori pilihan terbaik
        </p>
      </div>

      <!-- Catalog Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <div v-for="category in categories" :key="category.id" class="group cursor-pointer">
          <!-- Card with Overlay Content -->
          <div
            class="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/5] transform hover:scale-105"
          >
            <!-- Background Image -->
            <img
              :src="category.image"
              :alt="category.title"
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />

            <!-- Dark Overlay -->
            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>

            <!-- Content Overlay -->
            <div class="absolute inset-0 flex flex-col justify-end items-center text-left p-2 space-y-0">
              <!-- Category Title -->
              <h3 class="font-serif text-white text-2xl md:text-3xl lg:text-2xl xl:text-3xl mb-2 drop-shadow-lg">
                {{ category.title }}
              </h3>

              <div class="h-px w-full bg-gradient-to-r from-transparent via-white/90 to-transparent"></div>

              <!-- CTA Button -->
              <button
                type="button"
                @click="category.title === 'Kalung' ? emit('open-subcategories', 'Kalung') : null"
                class="text-white bg-transparent py-2 px-3 md:py-2 md:px-2 transition-transform duration-300 transform hover:scale-55 text-sm"
              >
                Lihat Katalog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
