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
  <section class="relative overflow-hidden py-20">
    <div class="absolute inset-0 -z-10 bg-gradient-to-br from-maroon/5 to-gold/10" />
    <div class="container text-center reveal-in">
      <div class="mx-auto mb-4 h-24 w-24 rounded-full border border-gold/40"></div>
      <h2 class="section-title">Siap Bersinar Hari Ini?</h2>
      <p class="mt-2 text-neutral-700">Temukan perhiasan yang melengkapi pesona dirimu.</p>
      <div class="mt-6">
        <button class="btn-primary w-full sm:w-auto" @click="openModal">Belanja Sekarang</button>
      </div>
    </div>

    <!-- Modal Store Links -->
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-elegant">
          <div class="flex items-center justify-between px-5 py-4 border-b">
            <h3 class="text-lg font-semibold text-maroon">Belanja di Toko Resmi</h3>
            <button class="chip" @click="closeModal">Tutup</button>
          </div>
          <div class="p-6 text-center space-y-5">
            <!-- Logo -->
            <img src="/img/logo.png" alt="Logo Toko" class="mx-auto h-16 w-16 object-contain" />

            <div class="grid grid-cols-1 gap-3">
              <a :href="shopeeUrl" target="_blank" rel="noopener" class="btn-primary">Buka Shopee</a>
              <a :href="tokopediaUrl" target="_blank" rel="noopener" class="btn-outline">Buka Tokopedia</a>
              <a
                :href="waLink()"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition"
              >
                Hubungi Admin via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>
