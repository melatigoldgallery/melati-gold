<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from "vue";

// Emit event untuk membuka modal service
const emit = defineEmits<{
  (e: "open-service", service: any): void;
}>();

// Fetch custom services from database
const { getCustomServices } = useCatalogManager();

// State data
const services = ref<any[]>([]);
const loading = ref(true);

// Carousel refs and state (translateX-based with looping)
const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const offsetPx = ref(0);
const slideWidthPx = ref(0);

const slideCount = computed(() => services.value.length);

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
  const styles = getComputedStyle(tr);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
  const paddingRight = parseFloat(styles.paddingRight || "0") || 0;
  const paddingX = paddingLeft + paddingRight;
  const slideWidth = slides[0].clientWidth;
  const visibleSpace = Math.max(0, vp.clientWidth - paddingX);
  const visibleCount = Math.max(1, Math.floor((visibleSpace + gap) / (slideWidth + gap)));
  const maxIndex = Math.max(0, slides.length - visibleCount);
  const maxOffset = Math.max(0, tr.scrollWidth - vp.clientWidth);
  return { vp, tr, slides, slideWidth, gap, visibleCount, maxIndex, maxOffset };
}

function goTo(index: number) {
  const { vp, slides, maxIndex, maxOffset, slideWidth, gap } = getMetrics();
  if (!vp || slides.length === 0) return;
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

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  }
}

// Load services
const loadServices = async () => {
  loading.value = true;
  const result = await getCustomServices();
  if (result.success) {
    services.value = result.data
      .filter((service: any) => service.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order);
  }
  loading.value = false;
  // Ensure DOM renders before measuring and positioning
  await nextTick();
  requestAnimationFrame(() => {
    updateLayout();
    goTo(0);
  });
};

// Handle service card click
const openService = (service: any) => {
  emit("open-service", service);
};

// Lifecycle
onMounted(() => {
  const onResize = () => requestAnimationFrame(() => updateLayout());
  window.addEventListener("resize", onResize);
  loadServices();
  requestAnimationFrame(() => updateLayout());
  onUnmounted(() => window.removeEventListener("resize", onResize));
});
</script>

<template>
  <section id="custom" class="bg-cream py-16">
    <div class="container mx-auto max-w-7xl px-4">
      <div class="mb-8 text-center reveal-up">
        <h2 class="section-title text-maroon">Layanan Custom</h2>
        <p class="mt-3 text-neutral-600">Kami melayani pembuatan perhiasan sesuai keinginan Anda.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-neutral-600">Memuat layanan...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!services.length" class="text-center py-12">
        <p class="text-neutral-600">Belum ada layanan custom tersedia.</p>
      </div>

      <!-- Cards -->
      <div v-else>
        <div class="flex items-center gap-1 sm:gap-3" role="region" aria-label="Carousel layanan custom">
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
                  v-for="service in services"
                  :key="service.id"
                  class="relative flex-none"
                  :style="{ flex: `0 0 ${slideWidthPx}px` }"
                >
                  <div
                    class="group relative block w-full overflow-hidden rounded-1xl bg-gray-900 transition-all duration-300 hover:-translate-y-1 aspect-[3/4]"
                    @click="openService(service)"
                    role="button"
                    tabindex="0"
                  >
                    <img
                      v-if="service.image_url"
                      :src="service.image_url"
                      :alt="service.title"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="absolute inset-0 bg-gradient-to-br from-maroon to-gold flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-16 w-16 text-white opacity-60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>

                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-100"
                    ></div>
                    <div class="absolute inset-0 flex items-end p-4 sm:p-5">
                      <div>
                        <h3 class="font-serif text-white text-lg sm:text-xl drop-shadow-2xl">
                          {{ service.title }}
                        </h3>
                        <span class="text-white/90 text-xs sm:text-sm">Lihat Contoh Produk</span>
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
</style>
