<script setup lang="ts">
// TODO: After database setup, replace with:
// const { getContent, loadContent } = useContentManager()
// const products = getContent('products')

// Local type for card + modal needs in this component only
type CardProduct = {
  id: string;
  name: string;
  image: string;
  karat: string;
  best?: boolean;
  images: string[];
  weight: string; // e.g., "2.5 gr"
  estimatedPrice: number; // IDR
  description: string;
};

// Placeholder data; wire to Supabase later via useProducts()
const products = ref<CardProduct[]>([
  {
    id: "1",
    name: "Cincin Berlian",
    image: "/img/ring.jpg",
    karat: "17K",
    best: true,
    images: ["/img/ring.jpg", "/img/ring2.jpg", "/img/rings1.jpg"],
    weight: "2.8 gr",
    estimatedPrice: 4500000,
    description: "Cincin berlian elegan dengan potongan modern, cocok untuk momen spesial.",
  },
  {
    id: "2",
    name: "Anting Elegan",
    image: "/img/earrings1.jpg",
    karat: "16K",
    best: false,
    images: ["/img/earring.jpg", "/img/earrings1.jpg", "/img/earrings2.jpg"],
    weight: "2.1 gr",
    estimatedPrice: 2800000,
    description: "Anting emas berkilau dengan desain timeless untuk tampilan anggun.",
  },
  {
    id: "3",
    name: "Kalung Mewah",
    image: "/img/necklace.jpg",
    karat: "17K",
    best: true,
    images: ["/img/necklace.jpg", "/img/necklace2.jpg", "/img/necklace-man.jpg"],
    weight: "5.4 gr",
    estimatedPrice: 5200000,
    description: "Kalung emas mewah dengan detail halus yang menonjolkan pesona.",
  },
  {
    id: "4",
    name: "Gelang Rantai",
    image: "/img/bracelet3.jpg",
    karat: "16K",
    best: false,
    images: ["/img/bracelet3.jpg", "/img/mens-brecelet.jpg", "/img/bangle1.jpg"],
    weight: "3.2 gr",
    estimatedPrice: 3200000,
    description: "Gelang rantai kokoh dengan sentuhan modern untuk gaya harian.",
  },
  {
    id: "5",
    name: "Couple Ring",
    image: "/img/couplering.jpg",
    karat: "16K",
    best: true,
    images: ["/img/couplering.jpg", "/img/mensring.jpg", "/img/mensring1.jpg"],
    weight: "3.0 gr",
    estimatedPrice: 4900000,
    description: "Cincin pasangan romantis dengan finishing halus dan nyaman dipakai.",
  },
  {
    id: "6",
    name: "Kalung Elegan",
    image: "/img/necklace2.jpg",
    karat: "17K",
    best: false,
    images: ["/img/necklace2.jpg", "/img/necklace.jpg"],
    weight: "4.2 gr",
    estimatedPrice: 4100000,
    description: "Kalung simpel dan elegan yang mudah dipadupadankan.",
  },
  {
    id: "7",
    name: "Gelang Bangle",
    image: "/img/bangle1.jpg",
    karat: "16K",
    best: true,
    images: ["/img/bangle1.jpg", "/img/bangle2.jpg"],
    weight: "3.8 gr",
    estimatedPrice: 3600000,
    description: "Bangle minimalis dengan kilau menawan untuk tampilan chic.",
  },
  {
    id: "8",
    name: "Liontin Classic",
    image: "/img/pandent.jpg",
    karat: "16K",
    best: true,
    images: ["/img/pandent.jpg", "/img/pandent2.jpg"],
    weight: "1.5 gr",
    estimatedPrice: 2100000,
    description: "Liontin klasik yang tak lekang oleh waktu, cocok untuk hadiah.",
  },
]);

const filter = ref<"all" | "best">("all");
const filtered = computed(() => (filter.value === "all" ? products.value : products.value.filter((p) => p.best)));

// Modal state
const selected = ref<CardProduct | null>(null);
const mainImage = ref<string>("");
const isOpen = ref(false);

function openDetail(p: CardProduct) {
  selected.value = p;
  mainImage.value = p.images?.[0] || p.image;
  isOpen.value = true;
}

function closeModal() {
  isOpen.value = false;
  selected.value = null;
}

function formatIDR(n: number | undefined) {
  if (!n && n !== 0) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) closeModal();
}

onMounted(() => window.addEventListener("keydown", onKeyDown));
onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

// WhatsApp contact
const whatsappNumber = "6281234567890"; // Ganti dengan nomor WA toko (format internasional tanpa +)
function buildWhatsAppLink(p: CardProduct | null) {
  const base = `https://wa.me/${whatsappNumber}`;
  const text = p
    ? `Halo, saya tertarik dengan ${p.name} (Kadar: ${p.karat}, Berat: ${p.weight}). Apakah masih tersedia?`
    : "Halo, saya tertarik dengan produk Anda.";
  return `${base}?text=${encodeURIComponent(text)}`;
}
</script>

<template>
  <section id="best-produk" class="container py-20">
    <div class="mx-auto mb-6 text-center max-w-2xl reveal-in">
      <h2 class="section-title">Best Seller Bulan September</h2>
      <p class="mt-2 text-neutral-600">Koleksi favorit pilihan pelanggan, siap memancarkan pesonamu.</p>
    </div>
    <div class="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2 overflow-x-auto px-2">
      <button class="chip" :class="filter === 'all' ? 'ring-1 ring-gold bg-gold/15' : ''" @click="filter = 'all'">
        Semua
      </button>
      <button class="chip" :class="filter === 'best' ? 'ring-1 ring-gold bg-gold/15' : ''" @click="filter = 'best'">
        Best Seller
      </button>
    </div>

    <div class="grid gap-7 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <article
        v-for="p in filtered"
        :key="p.id"
        class="glass overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-elegant reveal-up"
      >
        <div class="relative">
          <img :src="p.image" :alt="p.name" loading="lazy" class="h-56 w-full object-cover" />
          <span class="chip absolute left-3 top-3">{{ p.karat }}</span>
        </div>
        <div class="p-5 flex flex-col gap-2">
          <!-- Header row: name + Detail button side-by-side -->
          <div class="flex items-center justify-between gap-2 md:gap-3 min-w-0">
            <h3 class="font-medium text-maroon flex-1 min-w-0 truncate leading-tight text-sm md:text-base">
              {{ p.name }}
            </h3>
          </div>
          <!-- Optional brief info under name -->
          <p class="text-sm text-neutral-600">{{ p.karat }} {{ formatIDR(p.estimatedPrice) }}</p>

          <button
            class="btn-outline shrink-0 text-[11px] md:text-sm px-2 py-1 md:px-3 md:py-1.5 whitespace-nowrap rounded-md"
            @click="openDetail(p)"
          >
            Detail
          </button>
        </div>
      </article>
    </div>

    <!-- Modal: Product Detail -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-elegant">
          <div class="flex items-center justify-between px-5 py-4 border-b">
            <h3 class="text-lg font-semibold text-maroon">{{ selected?.name }}</h3>
            <button class="chip" @click="closeModal">Tutup</button>
          </div>
          <div class="grid md:grid-cols-2 gap-4 p-5">
            <!-- Images -->
            <div>
              <img
                :src="mainImage || selected?.image"
                :alt="selected?.name || 'Produk'"
                class="w-full h-64 object-cover rounded-lg"
              />
              <div class="mt-3 flex gap-2 overflow-x-auto">
                <button
                  v-for="(img, idx) in selected?.images"
                  :key="idx"
                  class="rounded-lg overflow-hidden border hover:border-gold focus:ring-1 focus:ring-gold"
                  @click="mainImage = img"
                >
                  <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="h-16 w-20 object-cover" loading="lazy" />
                </button>
              </div>
            </div>
            <!-- Details -->
            <div class="space-y-2">
              <div class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Nama:</span>
                {{ selected?.name }}
              </div>
              <div class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Kadar:</span>
                {{ selected?.karat }}
              </div>
              <div class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Berat:</span>
                {{ selected?.weight }}
              </div>
              <div class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Estimasi Harga:</span>
                {{ formatIDR(selected?.estimatedPrice) }}
              </div>
              <div class="pt-2 text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Deskripsi:</span>
                {{ selected?.description }}
              </div>
              <div class="pt-4">
                <a
                  :href="buildWhatsAppLink(selected)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>
