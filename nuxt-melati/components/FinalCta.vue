<script setup lang="ts">
const isOpen = ref(false);

// Get karat configurations from database
const { $supabase } = useNuxtApp();
const supabase = $supabase as any;

const karatMuda = ref<any>(null);
const karatTua = ref<any>(null);
const loading = ref(true);

// Fetch karat configurations
const loadKaratConfigs = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase.from("karat_configurations").select("*").order("id");

    if (error) throw error;

    if (data) {
      karatMuda.value = data.find((c: any) => c.category === "kadar_muda");
      karatTua.value = data.find((c: any) => c.category === "kadar_tua");
    }
  } catch (error) {
    console.error("Error loading karat configs:", error);
  } finally {
    loading.value = false;
  }
};

function openModal() {
  isOpen.value = true;
}
function closeModal() {
  isOpen.value = false;
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOpen.value) closeModal();
}

function waLink(config: any, category: string) {
  if (!config || !config.whatsapp_number) return "#";
  const categoryName = category === "kadar_muda" ? "Kadar Muda" : "Kadar Tua";
  const text = `Halo Admin ${categoryName}, saya ingin bertanya tentang produk perhiasan emas.`;
  return `https://wa.me/${config.whatsapp_number}?text=${encodeURIComponent(text)}`;
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  loadKaratConfigs();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <section class="relative overflow-hidden py-20 bg-cream">
    <!-- Decorative Elements -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-1/4 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
    </div>

    <div class="container text-center reveal-in">
      <!-- Icon -->
      <div
        class="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-maroon to-black flex items-center justify-center shadow-elegant ring-1 ring-gold/30"
      >
        <img src="/img/logo.png" alt="Melati Gold" class="h-20 w-20 object-contain" />
      </div>

      <!-- Title -->
      <h2 class="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">Siap Bersinar Hari Ini?</h2>
      <p class="mt-3 text-lg text-black/80 max-w-2xl mx-auto">
        Temukan perhiasan emas berkualitas yang melengkapi pesona dan gaya Anda.
      </p>

      <!-- CTA Button -->
      <div class="mt-8">
        <button
          class="px-8 py-4 bg-gradient-to-r from-maroon to-black text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg ring-1 ring-gold/40"
          @click="openModal"
        >
          <i class="bi bi-cart-fill mr-2"></i>
          Belanja Sekarang
        </button>
      </div>

      <!-- Trust Badges -->
      <div class="mt-10 flex flex-wrap justify-center gap-6 text-maroon/80">
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
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        @click.self="closeModal"
      >
        <div
          class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transform transition-all my-8 max-h-[90vh] flex flex-col"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-maroon to-black px-4 sm:px-6 py-4 border-b border-gold/20 flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3 class="text-lg sm:text-xl font-serif font-semibold text-white">Belanja di Toko Resmi</h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                @click="closeModal"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <!-- Body - Scrollable -->
          <div class="p-4 sm:p-6 bg-gradient-to-br from-cream to-white overflow-y-auto flex-1">
            <!-- Logo -->
            <div class="text-center mb-4 sm:mb-6">
              <div
                class="mx-auto mb-3 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-maroon to-black flex items-center justify-center shadow-elegant ring-1 ring-gold/30"
              >
                <img src="/img/logo.png" alt="Melati Gold" class="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
              </div>
              <p class="text-maroon font-serif font-semibold text-base sm:text-lg">Melati Gold Shop</p>
              <p class="text-xs sm:text-sm text-gray-600 mt-1">Pilih platform belanja favorit Anda</p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-6">
              <i class="bi bi-arrow-clockwise animate-spin text-2xl text-gold"></i>
              <p class="text-sm text-gray-600 mt-2">Memuat...</p>
            </div>

            <!-- Store Links -->
            <div v-else class="space-y-2 sm:space-y-3">
              <!-- Shopee Kadar Muda (8K-9K) -->
              <a
                v-if="karatMuda && karatMuda.shopee_store_url"
                :href="karatMuda.shopee_store_url"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <i class="bi bi-shop text-lg sm:text-xl"></i>
                  <div class="text-left">
                    <span class="block text-xs sm:text-sm font-semibold">Shopee Kadar Muda</span>
                    <span class="block text-xs opacity-90">8K dan 9K</span>
                  </div>
                </div>
              </a>

              <!-- Shopee Kadar Tua (16K-24K) -->
              <a
                v-if="karatTua && karatTua.shopee_store_url"
                :href="karatTua.shopee_store_url"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <i class="bi bi-shop text-lg sm:text-xl"></i>
                  <div class="text-left">
                    <span class="block text-xs sm:text-sm font-semibold">Shopee Kadar Tua</span>
                    <span class="block text-xs opacity-90">16K - 24K</span>
                  </div>
                </div>
              </a>

              <!-- Tokopedia (Single Link) -->
              <a
                v-if="karatMuda && karatMuda.tokopedia_store_url"
                :href="karatMuda.tokopedia_store_url"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <i class="bi bi-bag-check-fill text-lg sm:text-xl"></i>
                  <div class="text-left">
                    <span class="block text-xs sm:text-sm font-semibold">Tokopedia</span>
                    <span class="block text-xs opacity-90">Semua Produk</span>
                  </div>
                </div>
              </a>

              <!-- WhatsApp Kadar Muda -->
              <a
                v-if="karatMuda && karatMuda.whatsapp_number"
                :href="waLink(karatMuda, 'kadar_muda')"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <i class="bi bi-whatsapp text-lg sm:text-xl"></i>
                  <div class="text-left">
                    <span class="block text-xs sm:text-sm font-semibold">Chat Admin Kadar Muda</span>
                    <span class="block text-xs opacity-90">8K dan 9K</span>
                  </div>
                </div>
              </a>

              <!-- WhatsApp Kadar Tua -->
              <a
                v-if="karatTua && karatTua.whatsapp_number"
                :href="waLink(karatTua, 'kadar_tua')"
                target="_blank"
                rel="noopener"
                class="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <i class="bi bi-whatsapp text-lg sm:text-xl"></i>
                  <div class="text-left">
                    <span class="block text-xs sm:text-sm font-semibold">Chat Admin Kadar Tua</span>
                    <span class="block text-xs opacity-90">16K - 24K</span>
                  </div>
                </div>
              </a>
            </div>

            <!-- Info -->
            <div class="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for modal body */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
