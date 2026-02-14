<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

interface ImageWithClone {
  src: string;
  _cloneId?: string;
}

const props = withDefaults(
  defineProps<{
    images: string[];
    autoplay?: boolean;
    interval?: number;
    showArrows?: boolean;
    showDots?: boolean;
    loop?: boolean;
    aspect?: string;
    ariaLabel?: string;
  }>(),
  {
    autoplay: true,
    interval: 5000,
    showArrows: true,
    showDots: false,
    loop: true,
    ariaLabel: "Carousel testimoni",
  },
);

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const activeIndex = ref(4); // Start at index 4 (first real slide after 4 clones)
const offsetPx = ref(0);
const slideWidthPx = ref(0);
const transitionEnabled = ref(true);
let timer: number | undefined;
const isHovered = ref(false);
const isFocused = ref(false);

const slideCount = computed(() => props.images?.length ?? 0);

// Create display array with clones for infinite loop
const CLONE_COUNT = 4;
const displayImages = computed<ImageWithClone[]>(() => {
  if (props.images.length === 0) return [];

  const len = props.images.length;
  // Clone last N images for start
  const clonesStart: ImageWithClone[] = [];
  for (let i = 0; i < CLONE_COUNT; i++) {
    const idx = (len - CLONE_COUNT + i) % len;
    clonesStart.push({ src: props.images[idx], _cloneId: `clone-start-${i}` });
  }

  // Clone first N images for end
  const clonesEnd: ImageWithClone[] = [];
  for (let i = 0; i < CLONE_COUNT; i++) {
    clonesEnd.push({ src: props.images[i], _cloneId: `clone-end-${i}` });
  }

  const realImages: ImageWithClone[] = props.images.map((src) => ({ src }));
  return [...clonesStart, ...realImages, ...clonesEnd];
});

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
    };
  }
  const styles = getComputedStyle(tr);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const slideWidth = slides[0].clientWidth;
  return { vp, tr, slides, slideWidth, gap };
}

function goTo(index: number, instant = false) {
  const { vp, slides, slideWidth, gap } = getMetrics();
  if (!vp || slides.length === 0) return;

  const totalSlides = displayImages.value.length;

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
      const realCount = props.images.length;
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

function updateLayout() {
  const vp = viewport.value;
  const tr = track.value;
  if (!vp || !tr) return;
  const slides = getSlides();
  if (slides.length === 0) return;
  const styles = getComputedStyle(tr);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
  const paddingRight = parseFloat(styles.paddingRight || "0") || 0;
  const paddingX = paddingLeft + paddingRight;

  // Calculate slide width based on viewport and desired visible count
  const getTargetCols = () => {
    if (typeof window === "undefined") return 1;
    const w = window.innerWidth;
    if (w >= 1024) return 4; // lg: show 4
    if (w >= 768) return 3; // md: show 3
    if (w >= 640) return 2; // sm: show 2
    return 1; // mobile: show 1
  };

  const cols = getTargetCols();
  const width = Math.max(0, (vp.clientWidth - paddingX - gap * (cols - 1)) / cols);
  slideWidthPx.value = width;
  requestAnimationFrame(() => goTo(activeIndex.value, true));
}

function prev() {
  goTo(activeIndex.value - 1);
}

function next() {
  goTo(activeIndex.value + 1);
}

function startAutoplay() {
  if (!props.autoplay || slideCount.value <= 1) return;
  stopAutoplay();
  timer = window.setInterval(() => {
    if (isHovered.value || isFocused.value) return;
    next();
  }, props.interval);
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

function onMouseEnter() {
  isHovered.value = true;
}
function onMouseLeave() {
  isHovered.value = false;
}
function onFocusIn() {
  isFocused.value = true;
}
function onFocusOut() {
  isFocused.value = false;
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
      // Start at index 4 (first real slide after 4 clones)
      goTo(CLONE_COUNT, true);
      startAutoplay();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
    stopAutoplay();
  });
});

watch(
  () => props.autoplay,
  () => startAutoplay(),
);
watch(
  () => props.interval,
  () => startAutoplay(),
);
watch(
  () => props.images,
  () => {
    activeIndex.value = CLONE_COUNT;
    nextTick(() => {
      updateLayout();
      goTo(CLONE_COUNT, true);
      startAutoplay();
    });
  },
);
</script>

<template>
  <div
    class="w-full"
    role="region"
    :aria-label="ariaLabel"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div class="relative">
      <div ref="viewport" class="overflow-hidden" tabindex="0" @keydown="onKeydown">
        <div
          ref="track"
          class="flex gap-4 md:gap-6 px-1 ease-out"
          :class="{ 'transition-transform duration-500': transitionEnabled }"
          :style="{ transform: `translateX(-${offsetPx}px)` }"
        >
          <div
            v-for="(image, i) in displayImages"
            :key="image._cloneId || `image-${i}`"
            class="relative flex-none"
            :style="{ flex: `0 0 ${slideWidthPx}px` }"
          >
            <img
              :src="image.src"
              :alt="`Testimoni screenshot ${i + 1}`"
              class="h-full w-full object-contain select-none"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <button
        v-if="showArrows && slideCount > 1"
        class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 hover:bg-white text-maroon shadow ring-1 ring-black/5 p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
        @click="prev"
        aria-label="Sebelumnya"
        type="button"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        v-if="showArrows && slideCount > 1"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 hover:bg-white text-maroon shadow ring-1 ring-black/5 p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
        @click="next"
        aria-label="Berikutnya"
        type="button"
      >
        <span aria-hidden="true">›</span>
      </button>

      <div v-if="showDots && slideCount > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        <button
          v-for="(_, i) in images"
          :key="i"
          class="h-2 w-2 rounded-full transition"
          :class="i === activeIndex - CLONE_COUNT ? 'bg-maroon' : 'bg-neutral-300 hover:bg-neutral-400'"
          @click="goTo(i + CLONE_COUNT)"
          type="button"
          :aria-label="`Ke slide ${i + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles removed - no longer needed for scroll-based carousel */
</style>
