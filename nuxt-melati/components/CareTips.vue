<template>
  <section
    id="perawatan"
    class="relative overflow-hidden bg-gradient-to-br from-white via-cream/70 to-white py-10 md:py-14"
  >
    <div
      class="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
    ></div>
    <div class="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-maroon/10 blur-3xl"></div>

    <div class="mx-auto max-w-6xl px-4">
      <Transition name="care-fade" appear>
        <div class="text-center mb-16">
          <p class="text-lg uppercase tracking-[0.4em] text-gold/100">Panduan Perawatan</p>
          <h2 class="mt-3 text-3xl md:text-4xl font-serif text-maroon">
            Bagaimana Melakukan Perawatan Emas yang Baik?
          </h2>
          <p class="mt-6 text-neutral-600 md:text-lg max-w-3xl mx-auto">
            Agar emas tetap berkilau dan awet, berikut adalah beberapa cara merawatnya.
          </p>
        </div>
      </Transition>

      <div class="flex items-center gap-1 sm:gap-3" role="region" aria-label="Carousel tips perawatan">
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
          <div ref="viewport" class="overflow-hidden" tabindex="0" @keydown="onKeydown">
            <div
              ref="track"
              class="flex gap-6 px-0 md:px-3 py-4 ease-out"
              :class="{ 'transition-transform duration-500': transitionEnabled }"
              :style="{ transform: `translateX(-${offsetPx}px)` }"
            >
              <article
                v-for="(tip, index) in displayTips"
                :key="tip._cloneId || tip.title"
                class="relative flex-none group overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-md shadow-maroon/10 backdrop-blur transition-transform duration-500 hover:-translate-y-2"
                :style="{ flex: `0 0 ${slideWidthPx}px` }"
              >
                <div class="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div class="absolute -top-16 right-0 h-40 w-40 rounded-full bg-gold/20 blur-3xl"></div>
                  <div class="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-maroon/10 blur-3xl"></div>
                </div>

                <div class="relative flex items-start gap-4">
                  <span class="flex h-12 w-12 items-center justify-center text-2xl text-gold">
                    <i class="bi bi-gem text-xl"></i>
                  </span>
                  <div>
                    <h3 class="text-xl font-semibold text-maroon">{{ tip.title }}</h3>
                    <p class="mt-2 text-md leading-relaxed text-neutral-600">
                      {{ tip.description }}
                    </p>
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
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from "vue";

// Type definition for tips with optional clone identifier
interface Tip {
  title: string;
  description: string;
  _cloneId?: string;
}

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const activeIndex = ref(3); // Start at index 3 (first real slide after 3 clones)
const offsetPx = ref(0);
const slideWidthPx = ref(0);
const transitionEnabled = ref(true);

const tips: Tip[] = [
  {
    title: "Bersihkan Secara Berkala",
    description:
      "Rendam emas dalam air hangat yang dicampur sabun lembut, sikat perlahan dengan sikat halus, kemudian bilas dan keringkan dengan kain lembut.",
  },
  {
    title: "Hindari Paparan Bahan Kimia",
    description:
      "Lepaskan perhiasan saat menggunakan parfum, hairspray, lotion, atau berenang di kolam klorin agar kilau emas tidak mudah memudar.",
  },
  {
    title: "Simpan dengan Benar",
    description:
      "Gunakan kotak atau pouch berlapis kain lembut dan simpan perhiasan secara terpisah untuk menghindari goresan dan gesekan.",
  },
  {
    title: "Hindari Aktivitas Berat",
    description:
      "Jangan kenakan perhiasan emas saat berolahraga atau melakukan pekerjaan kasar agar tidak mudah bengkok atau tergores.",
  },
  {
    title: "Periksa ke Toko Perhiasan",
    description:
      "Lakukan pengecekan rutin untuk polishing atau gold plating, serta pastikan tidak ada bagian yang longgar atau rusak.",
  },
  {
    title: "Gunakan Lap Poles Khusus",
    description:
      "Lap kain microfiber khusus perhiasan membantu menghilangkan noda dan menjaga kilau emas tanpa merusak permukaannya.",
  },
];

// Create display array with clones for infinite loop
// Clone 3 cards (max visible on desktop) at each end to prevent empty spaces
const CLONE_COUNT = 3;
const displayTips = computed<Tip[]>(() => {
  if (tips.length === 0) return [];

  const len = tips.length;
  // Clone last N cards for start
  const clonesStart: Tip[] = [];
  for (let i = 0; i < CLONE_COUNT; i++) {
    const idx = (len - CLONE_COUNT + i) % len;
    clonesStart.push({ ...tips[idx], _cloneId: `clone-start-${i}` });
  }

  // Clone first N cards for end
  const clonesEnd: Tip[] = [];
  for (let i = 0; i < CLONE_COUNT; i++) {
    clonesEnd.push({ ...tips[i], _cloneId: `clone-end-${i}` });
  }

  return [...clonesStart, ...tips, ...clonesEnd];
});

const slideCount = computed(() => tips.length);

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
      vp: null,
      tr: null,
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

function goTo(index: number, instant = false) {
  const { vp, slides, slideWidth, gap } = getMetrics();
  if (!vp || slides.length === 0) return;

  const totalSlides = displayTips.value.length;

  // Calculate offset
  const calculatedOffset = index * (slideWidth + gap);

  if (instant) {
    // Instant jump without transition
    transitionEnabled.value = false;
    offsetPx.value = calculatedOffset;
    activeIndex.value = index;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        transitionEnabled.value = true;
      });
    });
  } else {
    // Smooth transition
    offsetPx.value = calculatedOffset;
    activeIndex.value = index;

    // Check clone boundaries after transition completes
    setTimeout(() => {
      const realCount = tips.length;
      const realStartIndex = CLONE_COUNT;
      const realEndIndex = CLONE_COUNT + realCount - 1;

      // If in start clone zone (index < CLONE_COUNT), jump to equivalent real position at end
      if (activeIndex.value < CLONE_COUNT) {
        const offset = CLONE_COUNT - activeIndex.value;
        goTo(realEndIndex - offset + 1, true);
      }
      // If in end clone zone (index >= realEndIndex + 1), jump to equivalent real position at start
      else if (activeIndex.value > realEndIndex) {
        const offset = activeIndex.value - realEndIndex;
        goTo(realStartIndex + offset - 1, true);
      }
    }, 500); // Match transition duration
  }
}

function getTargetCols() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
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
  goTo(activeIndex.value - 1);
}

function next() {
  goTo(activeIndex.value + 1);
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

onMounted(() => {
  const onResize = () => requestAnimationFrame(() => updateLayout());
  window.addEventListener("resize", onResize);
  nextTick(() => {
    requestAnimationFrame(() => {
      updateLayout();
      // Start at index 3 (first real slide after 3 clones)
      goTo(CLONE_COUNT, true);
    });
  });
  onUnmounted(() => window.removeEventListener("resize", onResize));
});
</script>

<style scoped>
.care-fade-enter-active,
.care-fade-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.care-fade-enter-from,
.care-fade-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

.carousel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition:
    background-color 0.3s ease,
    transform 0.3s ease,
    border-color 0.3s ease;
}

.carousel-button:hover {
  transform: translateY(-2px);
}

.carousel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 640px) {
  .carousel-button {
    width: 2rem;
    height: 2rem;
    background-color: transparent;
    border: none;
    color: #591927;
  }
  .carousel-button:hover {
    background-color: transparent;
    transform: none;
    border-color: transparent;
  }
  .carousel-button i {
    font-size: 0.875rem;
    line-height: 1;
  }
}
</style>
