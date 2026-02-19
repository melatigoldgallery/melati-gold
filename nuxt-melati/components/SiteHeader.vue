<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const open = ref(false);
const isScrolled = ref(false);

// Update CSS variable with actual header height
const updateHeaderHeight = () => {
  const header = document.querySelector("header");
  if (header) {
    const height = header.offsetHeight;
    document.documentElement.style.setProperty("--header-height", `${height}px`);
  }
};

// Smart navigation handler - navigate to home with hash if not on home page
const handleNavigation = async (hash: string) => {
  closeMenu();

  // If not on home page, navigate to home with hash
  if (route.path !== "/") {
    await router.push(`/${hash}`);
  }

  // Smooth scroll to element - respects scroll-padding-top from CSS
  setTimeout(() => {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
};

// Detect scroll position
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Close menu when clicking outside
const closeMenu = () => {
  open.value = false;
};

// Handle ESC key to close menu
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && open.value) {
    closeMenu();
  }
};

// Prevent body scroll when menu is open
watch(open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("keydown", handleKeydown);

  // Set initial header height
  updateHeaderHeight();

  // Update on resize
  window.addEventListener("resize", updateHeaderHeight);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", updateHeaderHeight);
  // Cleanup: restore body scroll
  document.body.style.overflow = "";
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
    <div class="w-full overflow-x-hidden">
      <div class="container mx-auto flex max-w-7xl items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div>
            <h1
              class="font-script text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-gold transition-all duration-300"
            >
              Melati Gold Shop
            </h1>
          </div>
        </NuxtLink>

        <button
          class="md:hidden inline-flex items-center justify-center rounded-md p-2 focus:outline-none transition-all duration-200 relative w-10 h-10 isolate"
          :class="!isScrolled ? 'backdrop-blur-sm' : ''"
          @click="open = !open"
          aria-label="Toggle menu"
        >
          <span class="relative w-6 h-6 flex items-center justify-center">
            <i
              v-show="!open"
              class="bi bi-list text-2xl absolute transition-all duration-300"
              :style="{
                opacity: open ? '0' : '1',
                transform: open ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
              }"
            />
            <i
              v-show="open"
              class="bi bi-x-lg text-2xl absolute transition-all duration-300"
              :style="{
                opacity: open ? '1' : '0',
                transform: open ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
              }"
            />
          </span>
        </button>

        <nav class="hidden md:flex items-center gap-6">
          <button
            @click="handleNavigation('#produk')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Katalog Produk
          </button>
          <button
            @click="handleNavigation('#best-produk')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Best Seller
          </button>
          <button
            @click="handleNavigation('#custom')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Layanan Custom
          </button>
          <button
            @click="handleNavigation('#perawatan')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Tips
          </button>
          <button
            @click="handleNavigation('#testimoni')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Testimoni
          </button>
          <button
            @click="handleNavigation('#tentang')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Tentang
          </button>
          <button
            @click="handleNavigation('#kontak')"
            class="relative text-gold hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full transition-colors duration-300 bg-none border-none cursor-pointer"
          >
            Kontak
          </button>
        </nav>
      </div>
    </div>

    <!-- Mobile Menu Dropdown with Backdrop -->
    <transition name="fade">
      <div v-if="open" class="md:hidden fixed inset-0 top-[60px] z-40 bg-black/50 backdrop-blur-sm" @click="closeMenu">
        <div class="bg-black/95 backdrop-blur-md border-t border-white/20" @click.stop>
          <nav class="container mx-auto max-w-6xl py-3 px-4 grid gap-2">
            <button
              @click="handleNavigation('#produk')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Katalog Produk
            </button>
            <button
              @click="handleNavigation('#best-produk')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Best Seller
            </button>
            <button
              @click="handleNavigation('#custom')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Layanan Custom
            </button>
            <button
              @click="handleNavigation('#perawatan')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Tips & Panduan
            </button>
            <button
              @click="handleNavigation('#testimoni')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Testimoni
            </button>
            <button
              @click="handleNavigation('#tentang')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Tentang
            </button>
            <button
              @click="handleNavigation('#kontak')"
              class="py-3 text-gold hover:text-white transition-colors text-left bg-none border-none cursor-pointer"
            >
              Kontak
            </button>
          </nav>
        </div>
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
  text-shadow:
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(247, 227, 161, 0.4),
    0 0 40px rgba(247, 227, 161, 0.2);
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
