<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 bg-maroon/90 backdrop-blur supports-[backdrop-filter]:bg-maroon/80 text-white shadow-elegant">
    <div class="container mx-auto flex max-w-6xl items-center justify-between py-3">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-full bg-gold/90 ring-2 ring-gold/50 grid place-items-center text-maroon font-black">M</div>
        <span class="font-serif text-xl tracking-wide">Melati Gold</span>
      </NuxtLink>

      <button class="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold" @click="open = !open" aria-label="Toggle menu">
        <i class="fa-solid" :class="open ? 'fa-xmark' : 'fa-bars'" />
      </button>

      <nav class="hidden md:flex items-center gap-6">
        <a href="#produk" class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full">Produk</a>
        <a href="#keunggulan" class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full">Keunggulan</a>
        <a href="#testimoni" class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full">Testimoni</a>
        <a href="#tentang" class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full">Tentang</a>
        <a href="#kontak" class="relative hover:text-gold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gold after:transition-all hover:after:w-full">Kontak</a>
        <NuxtLink to="#produk" class="btn-outline">Lihat Koleksi</NuxtLink>
      </nav>
    </div>

    <transition name="fade">
      <div v-if="open" class="md:hidden border-t border-white/10">
        <nav class="container mx-auto max-w-6xl py-3 grid gap-3">
          <a href="#produk" class="py-2 hover:text-gold" @click="open=false">Produk</a>
          <a href="#keunggulan" class="py-2 hover:text-gold" @click="open=false">Keunggulan</a>
          <a href="#testimoni" class="py-2 hover:text-gold" @click="open=false">Testimoni</a>
          <a href="#tentang" class="py-2 hover:text-gold" @click="open=false">Tentang</a>
          <a href="#kontak" class="py-2 hover:text-gold" @click="open=false">Kontak</a>
          <a href="#produk" class="btn-outline w-full text-center" @click="open=false">Lihat Koleksi</a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
