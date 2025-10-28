<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

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
  }
);

const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
let timer: number | undefined;
const isHovered = ref(false);
const isFocused = ref(false);

const slideCount = computed(() => props.images?.length ?? 0);

function getSlides(): HTMLElement[] {
  const el = track.value;
  if (!el) return [];
  return Array.from(el.children) as HTMLElement[];
}

function goTo(index: number, behavior: ScrollBehavior = "smooth") {
  if (!viewport.value || slideCount.value === 0) return;
  const slides = getSlides();
  if (slides.length === 0) return;
  if (!props.loop) {
    index = Math.max(0, Math.min(index, slides.length - 1));
  } else {
    index = (index + slides.length) % slides.length;
  }
  const target = slides[index];
  const vp = viewport.value;
  const offset = target.offsetLeft - (vp.clientWidth - target.clientWidth) / 2;
  vp.scrollTo({ left: Math.max(0, offset), behavior });
  activeIndex.value = index;
}

function prev() {
  goTo(activeIndex.value - 1);
}
function next() {
  goTo(activeIndex.value + 1);
}

function onScroll() {
  if (!viewport.value) return;
  const slides = getSlides();
  if (slides.length === 0) return;
  const vp = viewport.value;
  const vpCenter = vp.scrollLeft + vp.clientWidth / 2;
  let closest = 0;
  let minDist = Infinity;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const center = s.offsetLeft + s.clientWidth / 2;
    const dist = Math.abs(center - vpCenter);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }
  activeIndex.value = closest;
}

function startAutoplay() {
  if (!props.autoplay || slideCount.value <= 1) return;
  stopAutoplay();
  timer = window.setInterval(() => {
    if (isHovered.value || isFocused.value) return;
    if (!props.loop && activeIndex.value >= slideCount.value - 1) {
      stopAutoplay();
      return;
    }
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
  // Snap to the first slide
  goTo(activeIndex.value, "auto");
  viewport.value?.addEventListener("scroll", onScroll, { passive: true });
  startAutoplay();
});

onBeforeUnmount(() => {
  viewport.value?.removeEventListener("scroll", onScroll);
  stopAutoplay();
});

watch(
  () => props.autoplay,
  () => startAutoplay()
);
watch(
  () => props.interval,
  () => startAutoplay()
);
watch(
  () => props.images,
  () => {
    activeIndex.value = 0;
    goTo(0, "auto");
    startAutoplay();
  }
);

const atStart = computed(() => !props.loop && activeIndex.value <= 0);
const atEnd = computed(() => !props.loop && activeIndex.value >= slideCount.value - 1);
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
      <div
        ref="viewport"
        class="overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
        tabindex="0"
        @keydown="onKeydown"
      >
        <div ref="track" class="flex gap-4 md:gap-6 px-1">
          <div
            v-for="(src, i) in images"
            :key="i"
            class="relative flex-none snap-center w-[85%] sm:w-[70%] md:w-1/2 lg:w-1/4"
          >
            <img
              :src="src"
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
        class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 hover:bg-white text-maroon shadow ring-1 ring-black/5 p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon disabled:opacity-40"
        @click="prev"
        :disabled="atStart"
        aria-label="Sebelumnya"
        type="button"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        v-if="showArrows && slideCount > 1"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 hover:bg-white text-maroon shadow ring-1 ring-black/5 p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon disabled:opacity-40"
        @click="next"
        :disabled="atEnd"
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
          :class="i === activeIndex ? 'bg-maroon' : 'bg-neutral-300 hover:bg-neutral-400'"
          @click="goTo(i)"
          type="button"
          :aria-label="`Ke slide ${i + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
