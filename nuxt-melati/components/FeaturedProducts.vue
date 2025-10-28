<script setup lang="ts">
// Fetch featured products from database
const { getProducts } = useCatalogManager();

// State
const products = ref<any[]>([]);
const loading = ref(true);
const selectedProduct = ref<any>(null);

// Load featured products
const loadFeaturedProducts = async () => {
  loading.value = true;

  const result = await getProducts({
    isFeatured: true,
  });

  if (result.success) {
    products.value = result.data;
  }

  loading.value = false;
};

// Format price to Indonesian Rupiah
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Load on mount
onMounted(() => {
  loadFeaturedProducts();
});

// Modal state
const selected = ref<any>(null);
const mainImage = ref<string>("");
const isOpen = ref(false);

function openDetail(p: any) {
  selected.value = p;
  mainImage.value = p.images?.[0] || p.thumbnail_image;
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

onMounted(() => {
  loadFeaturedProducts();
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

// WhatsApp contact
const whatsappNumber = "6281234567890"; // Ganti dengan nomor WA toko (format internasional tanpa +)
function buildWhatsAppLink(p: any) {
  const base = `https://wa.me/${whatsappNumber}`;
  const text = p
    ? `Halo, saya tertarik dengan ${p.title || p.name} (Kadar: ${p.karat}, Berat: ${p.weight}). Apakah masih tersedia?`
    : "Halo, saya tertarik dengan produk Anda.";
  return `${base}?text=${encodeURIComponent(text)}`;
}
</script>

<template>
  <section id="best-produk" class="container py-20">
    <div class="mx-auto mb-6 text-center max-w-2xl reveal-in">
      <h2 class="section-title">Produk Pilihan</h2>
      <p class="mt-2 text-neutral-600">Koleksi favorit pilihan pelanggan, siap memancarkan pesonamu.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      <p class="mt-4 text-gray-600">Memuat produk...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-12">
      <i class="bi bi-box-seam text-6xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Belum ada produk tersedia</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid gap-7 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <article
        v-for="p in products"
        :key="p.id"
        class="glass overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-elegant reveal-up"
      >
        <div class="relative">
          <img
            :src="p.thumbnail_image || '/img/placeholder.jpg'"
            :alt="p.title || p.name"
            loading="lazy"
            class="h-56 w-full object-cover"
          />
          <span v-if="p.karat" class="chip absolute left-3 top-3 text-white">{{ p.karat }}</span>
          <span v-if="p.is_best_seller" class="chip absolute right-3 top-3 bg-yellow-600 text-white">Best</span>
        </div>
        <div class="px-3 py-2 flex flex-col gap-2">
          <!-- Header row: name + Detail button side-by-side -->
          <div class="flex items-center justify-between gap-1 md:gap-2 min-w-0">
            <h3 class="font-medium text-maroon flex-1 min-w-0 truncate leading-tight text-sm md:text-base">
              {{ p.title || p.name }}
            </h3>
          </div>
          <!-- Optional brief info under name -->
          <p class="text-sm text-neutral-600">
            {{ p.karat ? p.karat + " • " : "" }}{{ p.price_display || formatPrice(p.price) }}
          </p>

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
            <h3 class="text-lg font-semibold text-maroon">{{ selected?.title || selected?.name }}</h3>
            <button class="chip" @click="closeModal">Tutup</button>
          </div>
          <div class="grid md:grid-cols-2 gap-4 p-5">
            <!-- Images -->
            <div>
              <img
                :src="mainImage || selected?.thumbnail_image || '/img/placeholder.jpg'"
                :alt="selected?.title || selected?.name || 'Produk'"
                class="w-full h-64 object-cover rounded-lg"
              />
              <div v-if="selected?.images?.length" class="mt-3 flex gap-2 overflow-x-auto">
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
                {{ selected?.title || selected?.name }}
              </div>
              <div v-if="selected?.karat" class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Kadar:</span>
                {{ selected?.karat }}
              </div>
              <div v-if="selected?.weight" class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Berat:</span>
                {{ selected?.weight }}
              </div>
              <div class="text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Harga:</span>
                {{ selected?.price_display || formatPrice(selected?.price) }}
              </div>
              <div v-if="selected?.description" class="pt-2 text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Deskripsi:</span>
                {{ selected?.description }}
              </div>
              <div v-if="selected?.specs?.length" class="pt-2 text-sm text-neutral-700">
                <span class="font-medium text-neutral-900">Spesifikasi:</span>
                <ul class="list-disc list-inside mt-1">
                  <li v-for="(spec, idx) in selected.specs" :key="idx">{{ spec }}</li>
                </ul>
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
