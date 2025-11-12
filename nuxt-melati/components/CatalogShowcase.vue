<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from "vue";

const emit = defineEmits<{
  (e: "open-subcategories", category: any): void;
}>();

// Fetch categories from database
const { getCategories } = useCatalogManager();
const categories = ref<any[]>([]);
const loading = ref(true);

// Carousel refs and state (translateX-based with looping)
const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const offsetPx = ref(0);
const slideWidthPx = ref(0);

const slideCount = computed(() => categories.value.length);

function getSlides(): HTMLElement[] {
  const el = track.value;
  if (!el) return [];
  return Array.from(el.children) as HTMLElement[];
}

function getMetrics() {
  const vp = viewport.value;
  const tr = track.value;
  const slides = getSlides();
  if (!vp || !tr || slides.length === 0) {
    return {
      vp: null as HTMLElement | null,
      tr: null as HTMLElement | null,
      slides,
      slideWidth: 0,
      gap: 0,
      visibleCount: 1,
      maxIndex: 0,
      maxOffset: 0,
    };
  }
  // Read current gap from computed styles for precise layout
  const styles = getComputedStyle(tr);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
  const paddingRight = parseFloat(styles.paddingRight || "0") || 0;
  const paddingX = paddingLeft + paddingRight;
  const slideWidth = slides[0].clientWidth;
  // Derive visible count considering track paddings and gaps
  const visibleSpace = Math.max(0, vp.clientWidth - paddingX);
  const visibleCount = Math.max(1, Math.floor((visibleSpace + gap) / (slideWidth + gap)));
  const maxIndex = Math.max(0, slides.length - visibleCount);
  const maxOffset = Math.max(0, tr.scrollWidth - vp.clientWidth);
  return { vp, tr, slides, slideWidth, gap, visibleCount, maxIndex, maxOffset };
}

function goTo(index: number) {
  const { vp, slides, maxIndex, maxOffset, slideWidth, gap } = getMetrics();
  if (!vp || slides.length === 0) return;
  // Clamp to page-bound index to avoid partial trailing space
  if (index < 0) index = 0;
  if (index > maxIndex) index = maxIndex;

  // Calculate offset based on card width and gap for precise positioning
  const calculatedOffset = index * (slideWidth + gap);
  const clamped = Math.min(calculatedOffset, maxOffset);
  offsetPx.value = clamped;
  activeIndex.value = index;
}

function getTargetCols() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= 1024) return 4; // lg and up: 4-up
  if (w >= 768) return 2; // md: 2-up
  return 1; // sm and below: 1-up
}

function updateLayout() {
  const vp = viewport.value;
  const tr = track.value;
  if (!vp || !tr) return;
  const styles = getComputedStyle(tr);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
  const paddingRight = parseFloat(styles.paddingRight || "0") || 0;
  const paddingX = paddingLeft + paddingRight;
  const cols = getTargetCols();
  const width = Math.max(0, (vp.clientWidth - paddingX - gap * (cols - 1)) / cols);
  slideWidthPx.value = width;
  // Re-align to current active index after layout change
  requestAnimationFrame(() => goTo(activeIndex.value));
}

function prev() {
  const { maxIndex } = getMetrics();
  if (activeIndex.value <= 0) {
    goTo(maxIndex);
  } else {
    goTo(activeIndex.value - 1);
  }
}
function next() {
  const { maxIndex } = getMetrics();
  if (activeIndex.value >= maxIndex) {
    goTo(0);
  } else {
    goTo(activeIndex.value + 1);
  }
}

// No scroll handler: manual scroll disabled; navigation via buttons/keyboard

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  }
}

// Looping enabled: arrows remain active

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
  // Ensure DOM renders carousel before measuring and positioning
  await nextTick();
  requestAnimationFrame(() => {
    updateLayout();
    goTo(0);
  });
};

// Lifecycle
onMounted(() => {
  const onResize = () =>
    requestAnimationFrame(() => {
      updateLayout();
    });
  window.addEventListener("resize", onResize);
  loadCategories();
  // Initialize layout after first render
  requestAnimationFrame(() => updateLayout());
  onUnmounted(() => window.removeEventListener("resize", onResize));
});
</script>

<template>
  <section id="produk" class="relative bg-gradient-to-b from-cream via-white to-cream py-16 overflow-hidden">
    <div class="container mx-auto max-w-7xl px-4">
      <div class="mb-12 text-center reveal-up">
        <h2 class="section-title text-maroon">Katalog Produk</h2>
        <p class="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          Jelajahi koleksi perhiasan emas premium dengan berbagai kategori pilihan terbaik
        </p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-600"></div>
        <p class="mt-4 text-gray-600">Memuat katalog...</p>
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-12">
        <i class="bi bi-box-seam text-6xl text-gray-400"></i>
        <p class="mt-4 text-gray-600">Belum ada kategori tersedia</p>
      </div>

      <div v-else>
        <div class="flex items-center gap-1 sm:gap-3" role="region" aria-label="Carousel katalog">
          <button
            v-if="slideCount > 1"
            type="button"
            class="carousel-button shrink-0"
            @click="prev"
            aria-label="Sebelumnya"
          >
            <i class="bi bi-chevron-left"></i>
          </button>

          <div class="relative flex-1 min-w-0">
            <!-- TranslateX-based viewport & track (no manual scroll) -->
            <div ref="viewport" class="overflow-hidden" tabindex="0" @keydown="onKeydown">
              <div
                ref="track"
                class="flex gap-3 md:gap-4 px-0 md:px-3 py-4 md:py-6 transition-transform duration-500 ease-out"
                :style="{ transform: `translateX(-${offsetPx}px)` }"
              >
                <article
                  v-for="category in categories"
                  :key="category.id"
                  class="relative flex-none"
                  :style="{ flex: `0 0 ${slideWidthPx}px` }"
                >
                  <div
                    class="group relative block w-full overflow-hidden rounded-1xl transition-all duration-300 hover:-translate-y-1 aspect-[3/4]"
                    @click="emit('open-subcategories', category)"
                    role="button"
                    tabindex="0"
                  >
                    <img
                      :src="category.cover_image || '/img/placeholder.jpg'"
                      :alt="category.name"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-100"
                    ></div>

                    <div class="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                      <h3 class="font-serif text-white text-lg sm:text-xl drop-shadow-2xl">
                        {{ category.name }}
                      </h3>
                      <p v-if="category.description" class="mt-2 text-sm text-white/90 line-clamp-2">
                        {{ category.description }}
                      </p>
                      <div class="mt-4 flex items-center gap-2 text-sm font-semibold text-gold">
                        <span>Lihat katalog</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <button
            v-if="slideCount > 1"
            type="button"
            class="carousel-button shrink-0"
            @click="next"
            aria-label="Berikutnya"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background-color: rgba(17, 24, 39, 0.65);
  color: #f9fafb;
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: background-color 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
}

.carousel-button:hover {
  background-color: rgba(17, 24, 39, 0.85);
  transform: translateY(-2px);
  border-color: rgba(255, 215, 0, 0.6);
}

.carousel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Mobile adjustments: smaller arrows, no background/box outside cards */
@media (max-width: 640px) {
  .carousel-button {
    width: 2rem;
    height: 2rem;
    background-color: transparent;
    border: none;
    color: #591927; /* maroon */
  }
  .carousel-button:hover {
    background-color: transparent;
    transform: none;
    border-color: transparent;
  }
  .carousel-button i {
    font-size: 0.875rem; /* text-sm */
    line-height: 1;
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
