<script setup lang="ts">
// Minimal local type for custom items
interface CustomItem {
  id: string;
  title: string;
  images: { src: string; caption?: string }[];
  cover: string; // main image
  description: string;
}

const items = ref<CustomItem[]>([
  {
    id: "custom-liontin-nama",
    title: "Custom Liontin Nama",
    cover: "/img/pandent2.jpg",
    images: [
      { src: "/img/pandent2.jpg", caption: "Liontin nama huruf tebal" },
      { src: "/img/pandent.jpg", caption: "Pilihan huruf tipis elegan" },
    ],
    description: "Buat liontin nama dengan font sesuai keinginan dan finishing rapi.",
  },
  {
    id: "custom-kalung-nama",
    title: "Custom Kalung Nama",
    cover: "/img/necklace.jpg",
    images: [
      { src: "/img/necklace.jpg", caption: "Kalung nama dengan chain klasik" },
      { src: "/img/necklace2.jpg", caption: "Gaya minimalis dan modern" },
    ],
    description: "Kalung nama personal dengan variasi rantai dan ukuran.",
  },
  {
    id: "custom-cincin-nama",
    title: "Custom Cincin Nama",
    cover: "/img/ring.jpg",
    images: [
      { src: "/img/ring.jpg", caption: "Cincin nama ukiran halus" },
      { src: "/img/ring2.jpg", caption: "Pilihan bentuk band beragam" },
    ],
    description: "Cincin dengan ukiran nama, nyaman dipakai harian.",
  },
  {
    id: "custom-cincin-couple",
    title: "Custom Cincin Couple",
    cover: "/img/couplering.jpg",
    images: [
      { src: "/img/couplering.jpg", caption: "Set couple matching" },
      { src: "/img/mensring.jpg", caption: "Pilihan maskulin dan feminin" },
      { src: "/img/mensring1.jpg", caption: "Finishing matte/glossy" },
    ],
    description: "Cincin couple spesial dengan ukuran dan desain personal.",
  },
  {
    id: "custom-gantungan-lm",
    title: "Custom Gantungan LM",
    cover: "/img/custom.jpg",
    images: [
      { src: "/img/custom.jpg", caption: "Gantungan LM aman dan stylish" },
      { src: "/img/menu2.jpg", caption: "Pilihan model frame" },
    ],
    description: "Gantungan untuk LM/emas batangan, desain sesuai preferensi.",
  },
]);

const isOpen = ref(false);
const selected = ref<CustomItem | null>(null);
const currentIndex = ref(0);

const whatsappNumber = "6281234567890"; // ganti dengan nomor toko

function openItem(item: CustomItem) {
  selected.value = item;
  currentIndex.value = 0;
  isOpen.value = true;
}

function closeModal() {
  isOpen.value = false;
  selected.value = null;
}

function prev() {
  if (!selected.value) return;
  currentIndex.value = (currentIndex.value + selected.value.images.length - 1) % selected.value.images.length;
}

function next() {
  if (!selected.value) return;
  currentIndex.value = (currentIndex.value + 1) % selected.value.images.length;
}

function waLink(item: CustomItem | null) {
  const base = `https://wa.me/${whatsappNumber}`;
  const text = item ? `Halo, saya ingin custom ${item.title}. Bisa dibantu untuk konsultasi desain?` : "Halo";
  return `${base}?text=${encodeURIComponent(text)}`;
}

const visibleItems = computed(() => items.value);
</script>

<template>
  <section id="custom" class="bg-cream py-16">
    <div class="container mx-auto max-w-7xl px-4">
      <div class="mb-8 text-center reveal-up">
        <h2 class="section-title text-maroon">Layanan Custom</h2>
        <p class="mt-3 text-neutral-600">Kami melayani pembuatan perhiasan sesuai keinginan Anda.</p>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <article
          v-for="it in visibleItems"
          :key="it.id"
          class="group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/5]"
          @click="openItem(it)"
        >
          <div class="relative h-full">
            <img :src="it.cover" :alt="it.title" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div class="absolute inset-0 flex items-end p-4">
              <div>
                <h3 class="font-serif text-white text-lg md:text-xl drop-shadow">{{ it.title }}</h3>
                <span class="text-white/90 text-xs">Klik untuk detail</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Modal -->
      <transition name="fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <div class="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-elegant">
            <div class="flex items-center justify-between px-5 py-4 border-b">
              <h3 class="text-lg font-semibold text-maroon">{{ selected?.title }}</h3>
              <button class="chip" @click="closeModal">Tutup</button>
            </div>
            <div class="grid md:grid-cols-2 gap-4 p-5">
              <!-- Slider -->
              <div>
                <div class="relative">
                  <img
                    :src="selected?.images[currentIndex].src"
                    :alt="selected?.title"
                    class="w-full h-64 object-cover rounded-lg"
                  />
                  <button class="absolute left-2 top-1/2 -translate-y-1/2 chip" @click.stop="prev">◀</button>
                  <button class="absolute right-2 top-1/2 -translate-y-1/2 chip" @click.stop="next">▶</button>
                </div>
                <div class="mt-3 text-sm text-neutral-600">{{ selected?.images[currentIndex].caption }}</div>
                <div class="mt-3 flex gap-2 overflow-x-auto">
                  <button
                    v-for="(img, idx) in selected?.images"
                    :key="idx"
                    class="rounded-lg overflow-hidden border hover:border-gold focus:ring-1 focus:ring-gold"
                    @click="currentIndex = idx"
                  >
                    <img :src="img.src" :alt="`Slide ${idx + 1}`" class="h-16 w-20 object-cover" loading="lazy" />
                  </button>
                </div>
              </div>
              <!-- Detail + WA -->
              <div class="space-y-3">
                <p class="text-sm text-neutral-700">{{ selected?.description }}</p>
                <a
                  :href="waLink(selected)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition"
                >
                  Konsultasi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </section>
</template>
