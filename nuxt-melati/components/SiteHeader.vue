<script setup lang="ts">
const open = ref(false);
const isScrolled = ref(false);

// Detect scroll position
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header class="fixed top-0 w-full z-50 text-white transition-all duration-500">
    <div class="absolute inset-0 -z-10">
      <div
        class="absolute inset-0 transition-all duration-500"
        :class="isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'"
      />
    </div>
    <div class="container mx-auto flex max-w-6xl items-center justify-between py-3 px-4">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div>
          <h1
            class="font-script text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-gold group-hover:scale-105 transition-all duration-300"
          >
            Melati Gold Shop
          </h1>
        </div>
      </NuxtLink>

      <button
        class="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all duration-200"
        @click="open = !open"
        aria-label="Toggle menu"
      >
        <i class="bi text-2xl" :class="open ? 'bi-x-lg' : 'bi-list'" />
      </button>

      <nav class="hidden md:flex items-center gap-6">
        <a
          href="#produk"
          class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300"
        >
          Katalog Produk
        </a>
        <a
          href="#best-produk"
          class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300"
        >
          Best Seller
        </a>
        <a
          href="#testimoni"
          class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300"
        >
          Testimoni
        </a>
        <a
          href="#tentang"
          class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300"
        >
          Tentang
        </a>
        <a
          href="#kontak"
          class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300"
        >
          Kontak
        </a>
      </nav>
    </div>

    <transition name="fade">
      <div v-if="open" class="md:hidden border-t border-white/20 bg-black/80 backdrop-blur-md">
        <nav class="container mx-auto max-w-6xl py-3 px-4 grid gap-2">
          <a href="#produk" class="py-3 text-gold hover:text-white transition-colors" @click="open = false">Produk</a>
          <a href="#best-produk" class="py-3 text-gold hover:text-white transition-colors" @click="open = false">
            Best Seller
          </a>
          <a href="#testimoni" class="py-3 text-gold hover:text-white transition-colors" @click="open = false">
            Testimoni
          </a>
          <a href="#tentang" class="py-3 text-gold hover:text-white transition-colors" @click="open = false">Tentang</a>
          <a href="#kontak" class="py-3 text-gold hover:text-white transition-colors" @click="open = false">Kontak</a>
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

/* Logo text styling */
.font-script {
  font-family: "Allura", cursive;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* Enhanced hover effects for navigation */
nav a {
  font-weight: 500;
  letter-spacing: 0.025em;
}

nav a:hover {
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.3);
}

/* Mobile button styling */
button i {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Logo styling */
h1.text-gold {
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

/* Logo hover glow effect */
.group:hover h1 {
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5), 0 0 20px rgba(247, 227, 161, 0.4), 0 0 40px rgba(247, 227, 161, 0.2);
  filter: brightness(1.1);
}

/* Header background transition */
header {
  border-bottom: 1px solid transparent;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When scrolled, add subtle border */
header:has(.bg-black\/80) {
  border-bottom-color: rgba(247, 227, 161, 0.2);
}
</style>
