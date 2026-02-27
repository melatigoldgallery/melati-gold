<template>
  <section id="perawatan" class="bg-cream py-10 md:py-14">
    <div class="mx-auto max-w-7xl 2xl:max-w-[1600px] px-4 2xl:px-8">
      <Transition name="care-fade" appear>
        <div class="text-center mb-4 md:mb-12">
          <h2 class="mt-3 text-2xl md:text-4xl font-serif text-maroon leading-tight">
            Tips Perawatan Emas & Panduan Ukuran Perhiasan
          </h2>
          <p class="mt-4 md:mt-6 text-sm md:text-lg text-neutral-600 max-w-3xl mx-auto">
            Informasi lengkap perawatan dan panduan ukuran untuk perhiasan emas Anda.
          </p>
        </div>
      </Transition>

      <!-- Tab Navigation -->
      <div class="flex justify-center my-4 md:mb-10">
        <div class="w-full md:w-auto overflow-x-auto scrollbar-hide relative">
          <div
            class="flex gap-2 md:gap-3 bg-white/60 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl shadow-lg border border-white/40 justify-between md:justify-center"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'tab-button flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2 md:px-6 py-1.5 md:py-3 rounded-xl font-medium transition-all duration-300 flex-shrink-0',
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-gold/20 to-maroon/10 text-maroon shadow-md border-2 border-gold'
                  : 'text-neutral-600 hover:text-maroon hover:bg-white/50',
              ]"
              :aria-selected="activeTab === tab.id"
              role="tab"
            >
              <component :is="tab.icon" class="w-5 h-5 md:w-5 md:h-5" />
              <span class="text-xs md:text-sm whitespace-nowrap leading-tight text-center">{{ tab.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content with Transition -->
      <Transition name="tab-fade" mode="out-in">
        <!-- Tab 1: Tips Perawatan (Carousel) -->
        <div v-if="activeTab === 'care'" key="care">
          <div class="flex items-center gap-2 md:gap-3" role="region" aria-label="Carousel tips perawatan">
            <button
              v-if="slideCount > 1"
              type="button"
              class="carousel-button shrink-0"
              @click="prev"
              aria-label="Sebelumnya"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>

            <div class="relative flex-1 min-w-0">
              <div
                ref="viewport"
                class="overflow-hidden touch-pan-y"
                tabindex="0"
                @keydown="onKeydown"
                @touchstart.passive="(e) => onTouchStart(e, 'care')"
                @touchmove="(e) => onTouchMove(e, 'care')"
                @touchend.passive="() => onTouchEnd('care')"
              >
                <div
                  ref="track"
                  class="flex gap-4 md:gap-6 px-0 md:px-3 py-4 ease-out"
                  :class="{ 'transition-transform duration-500': carousels.care.transitionEnabled }"
                  :style="{ transform: `translateX(-${carousels.care.offset}px)` }"
                >
                  <article
                    v-for="(tip, index) in displayTips"
                    :key="tip._cloneId || tip.title"
                    class="relative flex-none group overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-4 md:p-6 shadow-md shadow-maroon/10 backdrop-blur transition-transform duration-500 hover:-translate-y-2"
                    :style="{ flex: `0 0 ${carousels.care.slideWidth}px` }"
                  >
                    <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
                      <span
                        class="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center text-2xl text-gold"
                      >
                        <SparklesIcon class="w-6 h-6 md:w-7 md:h-7" />
                      </span>
                      <div class="flex-1 min-w-0">
                        <h3 class="text-base md:text-xl font-semibold text-maroon">{{ tip.title }}</h3>
                        <p class="mt-1.5 md:mt-2 text-sm md:text-md leading-relaxed text-neutral-600">
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
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Tab 2: Ukuran Cincin -->
        <div v-else-if="activeTab === 'ring'" key="ring" class="space-y-6 md:space-y-8">
          <!-- Guide Steps -->
          <div>
            <h3 class="text-xl md:text-2xl font-serif text-maroon text-center mb-4 md:mb-6">Cara Mengukur Cincin</h3>

            <!-- Desktop: Grid -->
            <div class="hidden md:grid md:grid-cols-3 gap-3 md:gap-6">
              <div
                v-for="(step, index) in ringGuideSteps"
                :key="index"
                class="step-card bg-white/90 backdrop-blur rounded-2xl p-4 md:p-6 shadow-lg border border-white/60 hover:-translate-y-2 transition-all duration-300"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="flex flex-col items-center text-center space-y-3 md:space-y-4">
                  <div class="relative">
                    <div class="absolute inset-0 bg-gold/20 rounded-full blur-xl"></div>
                    <div
                      class="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gold/30 to-maroon/20 rounded-full flex items-center justify-center"
                    >
                      <span class="text-xl md:text-2xl font-bold text-maroon">{{ index + 1 }}</span>
                    </div>
                  </div>
                  <h4 class="text-base md:text-lg font-semibold text-maroon">{{ step.title }}</h4>
                  <p class="text-sm md:text-sm text-neutral-600 leading-relaxed">{{ step.description }}</p>
                </div>
              </div>
            </div>

            <!-- Mobile: Carousel -->
            <div class="md:hidden flex items-center gap-3">
              <button
                type="button"
                class="carousel-button shrink-0"
                @click="carouselPrev('ring')"
                aria-label="Sebelumnya"
              >
                <ChevronLeftIcon class="w-5 h-5" />
              </button>

              <div class="relative flex-1 min-w-0">
                <div
                  ref="ringViewport"
                  class="overflow-hidden touch-pan-y"
                  @touchstart.passive="(e) => onTouchStart(e, 'ring')"
                  @touchmove="(e) => onTouchMove(e, 'ring')"
                  @touchend.passive="() => onTouchEnd('ring')"
                >
                  <div
                    ref="ringTrack"
                    class="flex gap-4 py-4 ease-out"
                    :class="{ 'transition-transform duration-500': carousels.ring.transitionEnabled }"
                    :style="{ transform: `translateX(-${carousels.ring.offset}px)` }"
                  >
                    <div
                      v-for="(step, index) in displayRingSteps"
                      :key="step._cloneId || `ring-${index}`"
                      class="step-card flex-none bg-white/90 rounded-2xl p-4 border border-white/60"
                      :style="{ width: `${carousels.ring.slideWidth}px` }"
                    >
                      <div class="flex flex-col items-center text-center space-y-3">
                        <div class="relative">
                          <div class="absolute inset-0 bg-gold/20 rounded-full blur-xl"></div>
                          <div
                            class="relative w-12 h-12 bg-gradient-to-br from-gold/30 to-maroon/20 rounded-full flex items-center justify-center"
                          >
                            <span class="text-xl font-bold text-maroon">{{ step.stepNumber }}</span>
                          </div>
                        </div>
                        <h4 class="text-base font-semibold text-maroon">{{ step.title }}</h4>
                        <p class="text-sm text-neutral-600 leading-relaxed">{{ step.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="carousel-button shrink-0"
                @click="carouselNext('ring')"
                aria-label="Berikutnya"
              >
                <ChevronRightIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Ring Size Table Button -->
          <div class="flex justify-center mt-6 md:mt-8">
            <button
              @click="showRingModal = true"
              class="group relative inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-gold/20 to-maroon/10 hover:from-gold/30 hover:to-maroon/20 border-2 border-gold/40 hover:border-gold rounded-2xl font-semibold text-maroon shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-sm md:text-base">Lihat Tabel Ukuran Cincin</span>
            </button>
          </div>
        </div>

        <!-- Tab 3: Ukuran Gelang -->
        <div v-else-if="activeTab === 'bracelet'" key="bracelet" class="space-y-6 md:space-y-8">
          <!-- Guide Steps -->
          <div>
            <h3 class="text-xl md:text-2xl font-serif text-maroon text-center mb-4 md:mb-6">Cara Mengukur Gelang</h3>

            <!-- Desktop: Grid -->
            <div class="hidden md:grid md:grid-cols-3 gap-3 md:gap-6">
              <div
                v-for="(step, index) in braceletGuideSteps"
                :key="index"
                class="step-card bg-white/90 backdrop-blur rounded-2xl p-4 md:p-6 shadow-lg border border-white/60 hover:-translate-y-2 transition-all duration-300"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="flex flex-col items-center text-center space-y-3 md:space-y-4">
                  <div class="relative">
                    <div class="absolute inset-0 bg-gold/20 rounded-full blur-xl"></div>
                    <div
                      class="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gold/30 to-maroon/20 rounded-full flex items-center justify-center"
                    >
                      <span class="text-xl md:text-2xl font-bold text-maroon">{{ index + 1 }}</span>
                    </div>
                  </div>
                  <h4 class="text-base md:text-lg font-semibold text-maroon">{{ step.title }}</h4>
                  <p class="text-sm md:text-sm text-neutral-600 leading-relaxed">{{ step.description }}</p>
                </div>
              </div>
            </div>

            <!-- Mobile: Carousel -->
            <div class="md:hidden flex items-center gap-3">
              <button
                type="button"
                class="carousel-button shrink-0"
                @click="carouselPrev('bracelet')"
                aria-label="Sebelumnya"
              >
                <ChevronLeftIcon class="w-5 h-5" />
              </button>

              <div class="relative flex-1 min-w-0">
                <div
                  ref="braceletViewport"
                  class="overflow-hidden touch-pan-y"
                  @touchstart.passive="(e) => onTouchStart(e, 'bracelet')"
                  @touchmove="(e) => onTouchMove(e, 'bracelet')"
                  @touchend.passive="() => onTouchEnd('bracelet')"
                >
                  <div
                    ref="braceletTrack"
                    class="flex gap-4 py-4 ease-out"
                    :class="{ 'transition-transform duration-500': carousels.bracelet.transitionEnabled }"
                    :style="{ transform: `translateX(-${carousels.bracelet.offset}px)` }"
                  >
                    <div
                      v-for="(step, index) in displayBraceletSteps"
                      :key="step._cloneId || `bracelet-${index}`"
                      class="step-card flex-none bg-white/90 rounded-2xl p-4 border border-white/60"
                      :style="{ width: `${carousels.bracelet.slideWidth}px` }"
                    >
                      <div class="flex flex-col items-center text-center space-y-3">
                        <div class="relative">
                          <div class="absolute inset-0 bg-gold/20 rounded-full blur-xl"></div>
                          <div
                            class="relative w-12 h-12 bg-gradient-to-br from-gold/30 to-maroon/20 rounded-full flex items-center justify-center"
                          >
                            <span class="text-xl font-bold text-maroon">{{ step.stepNumber }}</span>
                          </div>
                        </div>
                        <h4 class="text-base font-semibold text-maroon">{{ step.title }}</h4>
                        <p class="text-sm text-neutral-600 leading-relaxed">{{ step.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="carousel-button shrink-0"
                @click="carouselNext('bracelet')"
                aria-label="Berikutnya"
              >
                <ChevronRightIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Bracelet Size Table Button -->
          <div class="flex justify-center mt-6 md:mt-8">
            <button
              @click="showBraceletModal = true"
              class="group relative inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-gold/20 to-maroon/10 hover:from-gold/30 hover:to-maroon/20 border-2 border-gold/40 hover:border-gold rounded-2xl font-semibold text-maroon shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-sm md:text-base">Lihat Tabel Ukuran Gelang</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Modal: Ring Size Table -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div
            v-if="showRingModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            @click.self="showRingModal = false"
          >
            <div
              class="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden"
              @click.stop
            >
              <!-- Modal Header -->
              <div class="flex items-center justify-between px-3 py-1 md:p-3 border-b border-gray-200">
                <h3 class="text-lg md:text-xl font-serif font-semibold text-maroon">Tabel Ukuran Cincin</h3>
                <button
                  @click="showRingModal = false"
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Tutup"
                >
                  <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal Body -->
              <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-1 md:p-2">
                <img
                  src="public/img/Tabel-cincin.jpg"
                  alt="Tabel Ukuran Cincin"
                  class="w-full h-auto rounded-lg shadow-md"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Modal: Bracelet Size Table -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div
            v-if="showBraceletModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            @click.self="showBraceletModal = false"
          >
            <div
              class="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden"
              @click.stop
            >
              <!-- Modal Header -->
              <div class="flex items-center justify-between px-3 py-1 md:p-3 border-b border-gray-200">
                <h3 class="text-lg md:text-xl font-serif font-semibold text-maroon">Tabel Ukuran Gelang</h3>
                <button
                  @click="showBraceletModal = false"
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Tutup"
                >
                  <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal Body -->
              <div class="overflow-y-auto max-h-[calc(90vh-80px)] p-1 md:p-2">
                <img
                  src="public/img/Tabel-gelang.jpg"
                  alt="Tabel Ukuran Gelang"
                  class="w-full h-auto rounded-lg shadow-md"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from "vue";
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon, LinkIcon, LifebuoyIcon } from "@heroicons/vue/24/outline";

// Type definitions
interface Tip {
  title: string;
  description: string;
  _cloneId?: string;
}

interface GuideStep {
  title: string;
  description: string;
  _cloneId?: string;
  stepNumber?: number;
}

// Tab Management
const activeTab = ref("care");

const tabs = [
  { id: "care", label: "Tips Perawatan", icon: SparklesIcon },
  { id: "ring", label: "Ukuran Cincin", icon: LifebuoyIcon },
  { id: "bracelet", label: "Ukuran Gelang", icon: LinkIcon },
];

// Ring Size Guide Steps
const ringGuideSteps: GuideStep[] = [
  {
    title: "Ukur Keliling Jari",
    description:
      "Jika tidak ada contoh cincin, gunakan tali atau kertas untuk mengukur lingkar jari. Kemudian kertas atau tali diukur menggunakan penggaris dimulai dari 0.",
  },
  {
    title: "Ukur Diameter Cincin",
    description:
      "Jika ada contoh cincin yang sudah pas, ukur diameter cincin tersebut menggunakan penggaris. Diameter diukur dari sisi dalam cincin.",
  },
  {
    title: "Cocokkan dengan Tabel",
    description: "Bandingkan hasil pengukuran dengan tabel di bawah untuk menentukan ukuran cincin yang tepat.",
  },
];

// Bracelet Size Guide Steps
const braceletGuideSteps: GuideStep[] = [
  {
    title: "Ukur Pergelangan Tangan",
    description:
      "Gunakan kertas atau benang untuk mengukur lingkar pergelangan tangan pada posisi yang biasa dipakai gelang.",
  },
  {
    title: "Pilih Jenis Gelang",
    description: "Tentukan apakah gelang bertipe kaku (bengle) atau rantai, karena perhitungan ukurannya berbeda.",
  },
  {
    title: "Cocokkan dengan Tabel",
    description: "Gunakan tabel untuk menemukan ukuran gelang yang sesuai dengan ukuran pergelangan tangan.",
  },
];

// Generic carousel state
const viewport = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const ringViewport = ref<HTMLElement | null>(null);
const ringTrack = ref<HTMLElement | null>(null);
const braceletViewport = ref<HTMLElement | null>(null);
const braceletTrack = ref<HTMLElement | null>(null);

const carousels = ref({
  care: { index: 3, offset: 0, slideWidth: 0, transitionEnabled: true },
  ring: { index: 1, offset: 0, slideWidth: 0, transitionEnabled: true },
  bracelet: { index: 1, offset: 0, slideWidth: 0, transitionEnabled: true },
});

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

// Create display arrays with clones for ring and bracelet (infinite loop)
const RING_BRACELET_CLONE_COUNT = 1;

const displayRingSteps = computed(() => {
  if (ringGuideSteps.length === 0) return [];
  const len = ringGuideSteps.length;
  const cloneStart = { ...ringGuideSteps[len - 1], _cloneId: "ring-clone-start", stepNumber: len };
  const cloneEnd = { ...ringGuideSteps[0], _cloneId: "ring-clone-end", stepNumber: 1 };
  const stepsWithNumbers = ringGuideSteps.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
  return [cloneStart, ...stepsWithNumbers, cloneEnd];
});

const displayBraceletSteps = computed(() => {
  if (braceletGuideSteps.length === 0) return [];
  const len = braceletGuideSteps.length;
  const cloneStart = { ...braceletGuideSteps[len - 1], _cloneId: "bracelet-clone-start", stepNumber: len };
  const cloneEnd = { ...braceletGuideSteps[0], _cloneId: "bracelet-clone-end", stepNumber: 1 };
  const stepsWithNumbers = braceletGuideSteps.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
  return [cloneStart, ...stepsWithNumbers, cloneEnd];
});

// Touch swipe support for mobile
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchCurrentX = ref(0);
const touchCurrentY = ref(0);
const touchDragging = ref(false);
const touchStartOffset = ref(0);
const isHorizontalSwipe = ref(false); // Track if current gesture is horizontal
const SWIPE_THRESHOLD = 20; // Minimum pixels to detect as swipe
const DIRECTION_THRESHOLD = 10; // Minimum pixels to detect scroll direction

// Modal state
const showRingModal = ref(false);
const showBraceletModal = ref(false);

// Close modal on ESC key
function handleEscKey(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (showRingModal.value) showRingModal.value = false;
    if (showBraceletModal.value) showBraceletModal.value = false;
  }
}

function getMetrics(type: "care" | "ring" | "bracelet" = "care") {
  const vp = type === "care" ? viewport.value : type === "ring" ? ringViewport.value : braceletViewport.value;
  const tr = type === "care" ? track.value : type === "ring" ? ringTrack.value : braceletTrack.value;
  const slides = tr ? (Array.from(tr.children) as HTMLElement[]) : [];
  if (!vp || !tr || slides.length === 0) {
    return { vp: null, tr: null, slides, slideWidth: 0, gap: 0, visibleCount: 1, maxIndex: 0, maxOffset: 0 };
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

function goTo(index: number, type: "care" | "ring" | "bracelet" = "care", instant = false) {
  const { vp, slides, slideWidth, gap } = getMetrics(type);
  if (!vp || slides.length === 0) return;

  const carousel = carousels.value[type];
  const calculatedOffset = index * (slideWidth + gap);

  if (instant) {
    carousel.transitionEnabled = false;
    carousel.offset = calculatedOffset;
    carousel.index = index;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        carousel.transitionEnabled = true;
      });
    });
  } else {
    carousel.offset = calculatedOffset;
    carousel.index = index;

    // Handle infinite loop boundaries
    if (type === "care") {
      setTimeout(() => {
        const realCount = tips.length;
        const realStartIndex = CLONE_COUNT;
        const realEndIndex = CLONE_COUNT + realCount - 1;

        if (carousel.index < CLONE_COUNT) {
          const offset = CLONE_COUNT - carousel.index;
          goTo(realEndIndex - offset + 1, type, true);
        } else if (carousel.index > realEndIndex) {
          const offset = carousel.index - realEndIndex;
          goTo(realStartIndex + offset - 1, type, true);
        }
      }, 500);
    } else if (type === "ring" || type === "bracelet") {
      // Ring and bracelet have 1 clone on each side
      setTimeout(() => {
        const stepCount = type === "ring" ? ringGuideSteps.length : braceletGuideSteps.length;
        const realStartIndex = RING_BRACELET_CLONE_COUNT;
        const realEndIndex = RING_BRACELET_CLONE_COUNT + stepCount - 1;

        // If at start clone (index 0), jump to last real item (index 3)
        if (carousel.index < RING_BRACELET_CLONE_COUNT) {
          goTo(realEndIndex, type, true);
        }
        // If at end clone (index 4), jump to first real item (index 1)
        else if (carousel.index > realEndIndex) {
          goTo(realStartIndex, type, true);
        }
      }, 500);
    }
  }
}

function getTargetCols() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

function updateLayout(type: "care" | "ring" | "bracelet" = "care") {
  const vp = type === "care" ? viewport.value : type === "ring" ? ringViewport.value : braceletViewport.value;
  const tr = type === "care" ? track.value : type === "ring" ? ringTrack.value : braceletTrack.value;
  if (!vp || !tr) return;
  const styles = getComputedStyle(tr);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const paddingLeft = parseFloat(styles.paddingLeft || "0") || 0;
  const paddingRight = parseFloat(styles.paddingRight || "0") || 0;
  const paddingX = paddingLeft + paddingRight;
  const cols = type === "care" ? getTargetCols() : 1; // Ring and bracelet always 1 col on mobile

  const mobileAdjustment = window.innerWidth < 640 ? 16 : 0;
  const width = Math.max(0, (vp.clientWidth - paddingX - gap * (cols - 1)) / cols - mobileAdjustment);

  carousels.value[type].slideWidth = width;
  requestAnimationFrame(() => goTo(carousels.value[type].index, type));
}

function prev() {
  goTo(carousels.value.care.index - 1, "care");
}

function next() {
  goTo(carousels.value.care.index + 1, "care");
}

function carouselPrev(type: "ring" | "bracelet") {
  const carousel = carousels.value[type];
  const newIndex = carousel.index - 1;
  goTo(newIndex, type);
}

function carouselNext(type: "ring" | "bracelet") {
  const carousel = carousels.value[type];
  const newIndex = carousel.index + 1;
  goTo(newIndex, type);
}

// Touch swipe handlers for mobile with scroll direction detection
function onTouchStart(e: TouchEvent, type: "care" | "ring" | "bracelet" = "care") {
  if (type === "care" && tips.length <= 1) return;
  const touch = e.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  touchCurrentX.value = touch.clientX;
  touchCurrentY.value = touch.clientY;
  touchDragging.value = true;
  touchStartOffset.value = carousels.value[type].offset;
  isHorizontalSwipe.value = false; // Reset direction flag
  carousels.value[type].transitionEnabled = false;
}

function onTouchMove(e: TouchEvent, type: "care" | "ring" | "bracelet" = "care") {
  if (!touchDragging.value) return;

  const touch = e.touches[0];
  touchCurrentX.value = touch.clientX;
  touchCurrentY.value = touch.clientY;

  // Calculate deltas
  const deltaX = Math.abs(touchCurrentX.value - touchStartX.value);
  const deltaY = Math.abs(touchCurrentY.value - touchStartY.value);

  // Detect scroll direction on first significant movement
  if (!isHorizontalSwipe.value && (deltaX > DIRECTION_THRESHOLD || deltaY > DIRECTION_THRESHOLD)) {
    // Determine if this is horizontal or vertical gesture
    isHorizontalSwipe.value = deltaX > deltaY;
  }

  // Only handle horizontal swipe and prevent page scroll
  if (isHorizontalSwipe.value) {
    // Prevent default to stop page scroll
    e.preventDefault();

    // Calculate current offset based on touch position
    const deltaXSigned = touchCurrentX.value - touchStartX.value;
    const newOffset = Math.max(0, touchStartOffset.value - deltaXSigned);
    carousels.value[type].offset = newOffset;
  } else if (deltaY > DIRECTION_THRESHOLD) {
    // Vertical scroll detected - allow page scroll by canceling carousel drag
    touchDragging.value = false;
    carousels.value[type].transitionEnabled = true;
    // Reset to original position
    goTo(carousels.value[type].index, type, true);
  }
}

function onTouchEnd(type: "care" | "ring" | "bracelet" = "care") {
  if (!touchDragging.value) return;

  touchDragging.value = false;
  carousels.value[type].transitionEnabled = true;

  // Only process if it was a horizontal swipe
  if (isHorizontalSwipe.value) {
    const deltaX = touchCurrentX.value - touchStartX.value;
    const absDelta = Math.abs(deltaX);

    if (absDelta >= SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        if (type === "care") prev();
        else carouselPrev(type);
      } else {
        if (type === "care") next();
        else carouselNext(type);
      }
    } else {
      goTo(carousels.value[type].index, type);
    }
  } else {
    // Was vertical scroll, just reset position
    goTo(carousels.value[type].index, type, true);
  }

  // Reset flags
  isHorizontalSwipe.value = false;
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

// Watch activeTab to update layout when switching tabs (fix bug 3 kolom menumpuk)
watch(activeTab, (newTab) => {
  if (typeof window === "undefined") return;
  if (window.innerWidth >= 768) return; // Only for mobile

  // Use setTimeout to wait for tab transition animation (0.3s) to complete
  nextTick(() => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (newTab === "ring") {
          // Retry layout update to ensure viewport is ready
          const retryRingLayout = () => {
            const vp = ringViewport.value;
            if (vp && vp.clientWidth > 0) {
              updateLayout("ring");
              if (carousels.value.ring.index === 0 || carousels.value.ring.slideWidth === 0) {
                goTo(RING_BRACELET_CLONE_COUNT, "ring", true);
              }
            } else {
              // Retry after 50ms if viewport not ready
              setTimeout(retryRingLayout, 50);
            }
          };
          retryRingLayout();
        } else if (newTab === "bracelet") {
          // Retry layout update to ensure viewport is ready
          const retryBraceletLayout = () => {
            const vp = braceletViewport.value;
            if (vp && vp.clientWidth > 0) {
              updateLayout("bracelet");
              if (carousels.value.bracelet.index === 0 || carousels.value.bracelet.slideWidth === 0) {
                goTo(RING_BRACELET_CLONE_COUNT, "bracelet", true);
              }
            } else {
              // Retry after 50ms if viewport not ready
              setTimeout(retryBraceletLayout, 50);
            }
          };
          retryBraceletLayout();
        }
      });
    }, 350); // Wait for tab-fade transition (0.3s) + small buffer
  });
});

// Lock body scroll when modal is open
watch([showRingModal, showBraceletModal], ([ringOpen, braceletOpen]) => {
  if (typeof document === "undefined") return;
  if (ringOpen || braceletOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onMounted(() => {
  const onResize = () => {
    requestAnimationFrame(() => {
      updateLayout("care");
      if (window.innerWidth < 768) {
        updateLayout("ring");
        updateLayout("bracelet");
      }
    });
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", handleEscKey);

  nextTick(() => {
    requestAnimationFrame(() => {
      updateLayout("care");
      goTo(CLONE_COUNT, "care", true);
      if (window.innerWidth < 768) {
        updateLayout("ring");
        goTo(RING_BRACELET_CLONE_COUNT, "ring", true);
        updateLayout("bracelet");
        goTo(RING_BRACELET_CLONE_COUNT, "bracelet", true);
      }
    });
  });

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", handleEscKey);
    // Restore body scroll when component unmounts
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  });
});
</script>

<style scoped>
/* Fade transitions for section appearance */
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

/* Tab content transitions */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Carousel buttons */
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

/* Step cards animation */
.step-card {
  animation: fadeInUp 0.6s ease backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth scroll for tab navigation */
.scrollbar-hide {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Tab content container for better spacing */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .md\\:space-y-8 > * + * {
    margin-top: 2rem;
  }
}

/* Tab button optimizations */
.tab-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-button:active {
  transform: scale(0.95);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .carousel-button {
    width: 2.25rem;
    height: 2.25rem;
    background-color: transparent;
    backdrop-filter: blur(4px);
    color: #591927;
  }

  .carousel-button:hover {
    background-color: transparent;
    transform: none;
  }

  .carousel-button:active {
    transform: scale(0.95);
  }

  /* Mobile tab improvements */
  .tab-button {
    min-width: auto;
    flex: 1;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  @media (min-width: 768px) {
    .tab-button {
      flex: 0 0 auto;
    }
  }

  /* Optimize card layout for mobile */
  article {
    min-height: 180px;
  }

  /* Add subtle gradient hint for scrollable tabs */
  .scrollbar-hide::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 30px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.8), transparent);
    pointer-events: none;
  }
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from > div {
  transform: scale(0.95) translateY(20px);
}

.modal-fade-leave-to > div {
  transform: scale(0.95) translateY(20px);
}

/* Better touch handling for mobile carousel */
.touch-pan-y {
  touch-action: pan-y pinch-zoom;
  -webkit-overflow-scrolling: touch;
}
</style>
