<script setup lang="ts">
const isOpen = ref(false);
const shopeeUrl = "https://shopee.co.id/"; // ganti dengan link toko
const tokopediaUrl = "https://www.tokopedia.com/"; // ganti dengan link toko
const whatsappNumber = "6281234567890"; // ganti nomor WA toko

function openModal() {
  isOpen.value = true;
}
function closeModal() {
  isOpen.value = false;
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) closeModal();
}
onMounted(() => window.addEventListener("keydown", onKeyDown));
onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

function waLink() {
  const text = "Halo admin, saya ingin bertanya tentang produk.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
</script>

<template>
  <section class="relative overflow-hidden py-20 bg-gradient-to-b from-black via-maroon to-maroon">
    <!-- Decorative Elements -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-1/4 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
    </div>

    <div class="container text-center reveal-in">
      <!-- Icon -->
      <div
        class="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-maroon to-dark flex items-center justify-center shadow-elegant"
      >
        <img src="public/img/logo.png" alt="" />
      </div>

      <!-- Title -->
      <h2 class="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Siap Bersinar Hari Ini?</h2>
      <p class="mt-3 text-lg text-white/90 max-w-2xl mx-auto">
        Temukan perhiasan emas berkualitas yang melengkapi pesona dan gaya Anda.
      </p>

      <!-- CTA Button -->
      <div class="mt-8">
        <button
          class="px-8 py-4 bg-gradient-to-r from-gold to-yellow-600 text-maroon font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
          @click="openModal"
        >
          <i class="bi bi-cart-fill mr-2"></i>
          Belanja Sekarang
        </button>
      </div>

      <!-- Trust Badges -->
      <div class="mt-10 flex flex-wrap justify-center gap-6 text-white/80">
        <div class="flex items-center gap-2">
          <i class="bi bi-shield-check text-gold text-xl"></i>
          <span class="text-sm">Emas Asli</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="bi bi-award text-gold text-xl"></i>
          <span class="text-sm">Berkualitas</span>
        </div>
        <div class="flex items-center gap-2">
          <i class="bi bi-star-fill text-gold text-xl"></i>
          <span class="text-sm">Terpercaya</span>
        </div>
      </div>
    </div>

    <!-- Modal Store Links -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all">
          <!-- Header -->
          <div class="bg-gradient-to-r from-maroon to-black px-6 py-5 border-b border-gold/20">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-serif font-semibold text-white">Belanja di Toko Resmi</h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                @click="closeModal"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 bg-gradient-to-br from-cream to-white">
            <!-- Logo -->
            <div class="text-center mb-6">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold to-yellow-600 shadow-lg mb-3"
              >
                <i class="bi bi-gem text-3xl text-white"></i>
              </div>
              <p class="text-maroon font-serif font-semibold text-lg">Melati Gold Shop</p>
              <p class="text-sm text-gray-600 mt-1">Pilih platform belanja favorit Anda</p>
            </div>

            <!-- Store Links -->
            <div class="space-y-3">
              <!-- Shopee -->
              <a
                :href="shopeeUrl"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <i class="bi bi-bag-fill text-xl"></i>
                <span>Buka Shopee</span>
              </a>

              <!-- Tokopedia -->
              <a
                :href="tokopediaUrl"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <i class="bi bi-shop text-xl"></i>
                <span>Buka Tokopedia</span>
              </a>

              <!-- WhatsApp -->
              <a
                :href="waLink()"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <i class="bi bi-whatsapp text-xl"></i>
                <span>Chat via WhatsApp</span>
              </a>
            </div>

            <!-- Info -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <p class="text-xs text-center text-gray-600">
                <i class="bi bi-shield-check text-gold mr-1"></i>
                Belanja aman dan terpercaya
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>
