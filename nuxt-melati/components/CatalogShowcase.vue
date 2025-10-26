<script setup lang="ts">
const emit = defineEmits<{
  (e: "open-subcategories", category: any): void;
}>();

// Fetch categories from database
const { getCategories } = useCatalogManager();
const categories = ref<any[]>([]);
const loading = ref(true);

// Rolling Gallery State
const isScreenSizeSm = ref(false);
const rotateYValue = ref(0);
const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null);
const autoplayTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const isDragging = ref(false);
const isHovered = ref(false);
const dragStartX = ref(0);
const dragStartRotation = ref(0);

// Configuration Constants
const DRAG_FACTOR = 0.15;
const MOMENTUM_FACTOR = 0.05;
const AUTOPLAY_INTERVAL = 3000;
const DRAG_RESTART_DELAY = 1500;
const HOVER_RESTART_DELAY = 100;
const HOVER_DEBOUNCE_DELAY = 50;

// Computed properties for cylinder dimensions
const cylinderWidth = computed(() => (isScreenSizeSm.value ? 1400 : 2200));
const faceCount = computed(() => Math.max(categories.value.length, 6));
const cardWidth = computed(() => (isScreenSizeSm.value ? 200 : 280));
const radius = computed(() => cylinderWidth.value / (2 * Math.PI));

const trackStyle = computed(() => ({
  width: `${cylinderWidth.value}px`,
  transformStyle: "preserve-3d" as const,
}));

const animateProps = computed(() => ({
  transform: `rotateY(${rotateYValue.value}deg)`,
}));

const transitionStyle = computed(() => {
  if (isDragging.value) {
    return "none";
  } else {
    return "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  }
});

// Style cache for performance
const styleCache = new Map<string, { width: string; transform: string }>();

const getItemStyle = (index: number) => {
  const cacheKey = `${index}-${cardWidth.value}-${radius.value}-${faceCount.value}`;

  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }

  const angle = (360 / faceCount.value) * index;
  const style = {
    width: `${cardWidth.value}px`,
    transform: `rotateY(${angle}deg) translateZ(${radius.value}px)`,
  };

  if (styleCache.size > 50) {
    styleCache.clear();
  }

  styleCache.set(cacheKey, style);
  return style;
};

// Screen size detection
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

function checkScreenSize() {
  isScreenSizeSm.value = window.innerWidth <= 768;
}

function throttledResize() {
  if (resizeTimeout) return;
  resizeTimeout = setTimeout(() => {
    checkScreenSize();
    resizeTimeout = null;
  }, 100);
}

// Mouse drag handlers
function handleMouseDown(event: MouseEvent | TouchEvent) {
  isDragging.value = true;
  const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
  dragStartX.value = clientX;
  dragStartRotation.value = rotateYValue.value;

  stopAutoplay();

  if ("touches" in event) {
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
  } else {
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });
  }
  event.preventDefault();
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return;

  const deltaX = event.clientX - dragStartX.value;
  const rotationDelta = deltaX * DRAG_FACTOR;
  rotateYValue.value = dragStartRotation.value + rotationDelta;
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;

  const deltaX = event.touches[0].clientX - dragStartX.value;
  const rotationDelta = deltaX * DRAG_FACTOR;
  rotateYValue.value = dragStartRotation.value + rotationDelta;
  event.preventDefault();
}

function handleMouseUp(event: MouseEvent) {
  if (!isDragging.value) return;

  isDragging.value = false;

  const deltaX = event.clientX - dragStartX.value;
  const velocity = deltaX * MOMENTUM_FACTOR;
  rotateYValue.value += velocity;

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);

  stopAutoplay();

  autoplayTimeout.value = setTimeout(() => {
    if (!isDragging.value && !isHovered.value) {
      startAutoplay();
    }
  }, DRAG_RESTART_DELAY);
}

function handleTouchEnd(event: TouchEvent) {
  if (!isDragging.value) return;

  isDragging.value = false;

  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);

  stopAutoplay();

  autoplayTimeout.value = setTimeout(() => {
    if (!isDragging.value && !isHovered.value) {
      startAutoplay();
    }
  }, DRAG_RESTART_DELAY);
}

// Autoplay functionality
function startAutoplay() {
  if (isDragging.value || isHovered.value) return;

  stopAutoplay();

  autoplayInterval.value = setInterval(() => {
    if (!isDragging.value && !isHovered.value) {
      rotateYValue.value -= 360 / faceCount.value;
    }
  }, AUTOPLAY_INTERVAL);
}

function stopAutoplay() {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
  if (autoplayTimeout.value) {
    clearTimeout(autoplayTimeout.value);
    autoplayTimeout.value = null;
  }
}

// Hover handlers
function handleMouseEnter() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = setTimeout(() => {
    isHovered.value = true;

    if (!isDragging.value) {
      stopAutoplay();
    }
  }, HOVER_DEBOUNCE_DELAY);
}

function handleMouseLeave() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = setTimeout(() => {
    isHovered.value = false;

    if (!isDragging.value) {
      stopAutoplay();
      autoplayTimeout.value = setTimeout(() => {
        if (!isDragging.value && !isHovered.value) {
          startAutoplay();
        }
      }, HOVER_RESTART_DELAY);
    }
  }, HOVER_DEBOUNCE_DELAY);
}

const loadCategories = async () => {
  loading.value = true;

  const result = await getCategories();

  if (result.success) {
    // Filter only active categories and sort by display_order
    categories.value = result.data
      .filter((cat: any) => cat.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order);
  }

  loading.value = false;
};

// Lifecycle
onMounted(() => {
  loadCategories();
  checkScreenSize();
  window.addEventListener("resize", throttledResize, { passive: true });

  // Start autoplay after categories load
  setTimeout(() => {
    if (categories.value.length > 0) {
      startAutoplay();
    }
  }, 1000);
});

onUnmounted(() => {
  window.removeEventListener("resize", throttledResize);
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", handleTouchEnd);
  stopAutoplay();
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
});
</script>

<template>
  <section id="produk" class="relative bg-gradient-to-b from-cream via-white to-cream py-20 overflow-hidden">
    <div class="container mx-auto max-w-7xl px-4">
      <!-- Header Section -->
      <div class="mb-12 text-center reveal-up">
        <h2 class="section-title text-maroon">Katalog Produk</h2>
        <p class="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          Jelajahi koleksi perhiasan emas premium dengan berbagai kategori pilihan terbaik
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        <p class="mt-4 text-gray-600">Memuat katalog...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="categories.length === 0" class="text-center py-12">
        <i class="bi bi-box-seam text-6xl text-gray-400"></i>
        <p class="mt-4 text-gray-600">Belum ada kategori tersedia</p>
      </div>

      <!-- 3D Rolling Gallery -->
      <div v-else class="relative">
        <!-- Gradient Edge Overlays -->
        <div
          class="absolute top-0 left-0 h-full w-24 md:w-32 z-10 bg-gradient-to-r from-cream via-cream/80 to-transparent pointer-events-none"
        ></div>
        <div
          class="absolute top-0 right-0 h-full w-24 md:w-32 z-10 bg-gradient-to-l from-cream via-cream/80 to-transparent pointer-events-none"
        ></div>

        <!-- 3D Carousel Container -->
        <div class="flex h-[320px] md:h-[420px] items-center justify-center perspective-1000 preserve-3d">
          <div
            :style="{
              ...trackStyle,
              transform: animateProps.transform,
              transition: transitionStyle,
            }"
            class="flex min-h-[300px] items-center justify-center cursor-grab select-none will-change-transform preserve-3d active:cursor-grabbing"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @mousedown="handleMouseDown"
            @touchstart="handleMouseDown"
          >
            <!-- Category Cards -->
            <article
              v-for="(category, index) in categories"
              :key="category.id"
              :style="getItemStyle(index)"
              class="absolute flex items-center justify-center px-4 backface-hidden will-change-transform"
            >
              <!-- Card -->
              <div
                @click="emit('open-subcategories', category)"
                class="group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gray-900 cursor-pointer transform hover:scale-105 w-full"
                :style="{ aspectRatio: '3/4', maxWidth: cardWidth + 'px' }"
              >
                <!-- Background Image -->
                <img
                  :src="category.cover_image || '/img/placeholder.jpg'"
                  :alt="category.name"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                <!-- Gradient Overlay -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500"
                ></div>

                <!-- Content -->
                <div class="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <!-- Category Name -->
                  <h3
                    class="font-serif text-white text-xl md:text-2xl lg:text-3xl mb-1 md:mb-2 leading-tight drop-shadow-2xl transform group-hover:translate-y-[-4px] transition-transform duration-500"
                  >
                    {{ category.name }}
                  </h3>

                  <!-- Description -->
                  <p
                    v-if="category.description"
                    class="text-white/90 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                  >
                    {{ category.description }}
                  </p>

                  <!-- Divider -->
                  <div
                    class="h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent mb-2 md:mb-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
                  ></div>

                  <!-- CTA Button -->
                  <button
                    type="button"
                    class="inline-flex items-center justify-center text-white hover:text-gold transition-colors duration-300 text-sm md:text-sm font-semibold hover:bg-white/10 px-4 py-2 md:px-5 md:py-2.5 hover:border-gold/50"
                  >
                    <span>Lihat Katalog</span>
                    <i class="bi bi-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Navigation Hint -->
        <div class="text-center mt-8 opacity-70">
          <p class="text-sm text-neutral-600 flex items-center justify-center gap-2">
            <i class="bi bi-hand-index-thumb text-gold"></i>
            <span class="hidden md:inline">Geser atau drag untuk melihat kategori lainnya</span>
            <span class="md:hidden">Swipe untuk melihat lebih banyak</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 3D Perspective */
.perspective-1000 {
  perspective: 1200px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

/* Line Clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Drop Shadow Glow */
.drop-shadow-glow {
  filter: drop-shadow(0 0 8px rgba(218, 165, 32, 0.6));
}

/* Floating Animations */
@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-30px) translateX(10px);
    opacity: 1;
  }
}

@keyframes float-medium {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-40px) translateX(-15px);
    opacity: 1;
  }
}

@keyframes float-fast {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-50px) translateX(20px);
    opacity: 1;
  }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 3s ease-in-out infinite 0.5s;
}

.animate-float-fast {
  animation: float-fast 2.5s ease-in-out infinite 1s;
}

/* Shadow Enhancements */
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5);
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .perspective-1000 {
    perspective: 1000px;
  }
}

/* Smooth scrolling for touch devices */
@media (hover: none) {
  .cursor-grab {
    cursor: default;
  }

  .active\:cursor-grabbing:active {
    cursor: default;
  }
}
</style>
