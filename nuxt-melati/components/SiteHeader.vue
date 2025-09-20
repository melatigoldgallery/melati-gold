<script setup lang="ts">
const open = ref(false);
</script>

<template>
  <header class="sticky top-0 z-50 relative text-white shadow-elegant border-b border-white/10">
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0">
        <img src="/img/wedding-cover.jpg" alt="Background" class="h-full w-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-black/60" />
      <div class="absolute inset-0 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur-md" />
    </div>
    <div class="container mx-auto flex max-w-6xl items-center justify-between py-0 md:py-0">
      <NuxtLink to="/" class="flex items-center gap-3">
        <img src="/img/logo.png" alt="Melati Gold" class="h-14 w-auto sm:h-16 md:h-20" />
        <span class="sr-only">Melati Gold</span>
      </NuxtLink>

      <button
        class="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        @click="open = !open"
        aria-label="Toggle menu"
      >
        <i class="fa-solid" :class="open ? 'fa-xmark' : 'fa-bars'" />
      </button>

      <nav class="hidden md:flex items-center gap-6">
        <a
          href="#produk"
          class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
        >
          Produk
        </a>
        <a
          href="#keunggulan"
          class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
        >
          Keunggulan
        </a>
        <a
          href="#testimoni"
          class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
        >
          Testimoni
        </a>
        <a
          href="#tentang"
          class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
        >
          Tentang
        </a>
        <a
          href="#kontak"
          class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full"
        >
          Kontak
        </a>
        <NuxtLink to="#produk" class="btn-outline py-2">Lihat Koleksi</NuxtLink>
      </nav>
    </div>

    <transition name="fade">
      <div v-if="open" class="md:hidden border-t border-white/10">
        <nav class="container mx-auto max-w-6xl py-3 grid gap-2">
          <a href="#produk" class="py-3 hover:text-gold" @click="open = false">Produk</a>
          <a href="#keunggulan" class="py-3 hover:text-gold" @click="open = false">Keunggulan</a>
          <a href="#testimoni" class="py-3 hover:text-gold" @click="open = false">Testimoni</a>
          <a href="#tentang" class="py-3 hover:text-gold" @click="open = false">Tentang</a>
          <a href="#kontak" class="py-3 hover:text-gold" @click="open = false">Kontak</a>
          <a href="#produk" class="btn-outline w-full py-3 text-center" @click="open = false">Lihat Koleksi</a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
