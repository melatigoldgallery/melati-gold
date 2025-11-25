<script setup>
// Hero slides data
const heroSlides = [
  {
    id: 1,
    image: "/img/bg.png",
    title: "Welcome to Melati Gold Shop",
    subtitle: "Discover our premium gold jewelry collection with the latest trending design at Melati Gold Shop.",
    buttonText: "View Collection",
  },
  {
    id: 2,
    image: "/img/bg2.png",
    title: "Kilau Elegan, Pesona Abadi",
    subtitle:
      "Perhiasan emas stylish dengan desain kekinian. Percayakan kilauanmu pada koleksi terbaik dari Melati Gold Shop.",
    buttonText: "Lihat Koleksi",
  },
];

const currentSlideIndex = ref(0);
const currentSlide = computed(() => heroSlides[currentSlideIndex.value]);
const isTransitioning = ref(false);

// Auto slide functionality
let slideInterval = null;

const nextSlide = () => {
  if (isTransitioning.value) return;

  isTransitioning.value = true;
  currentSlideIndex.value = (currentSlideIndex.value + 1) % heroSlides.length;

  setTimeout(() => {
    isTransitioning.value = false;
  }, 1000);
};

const goToSlide = (index) => {
  if (isTransitioning.value || index === currentSlideIndex.value) return;

  isTransitioning.value = true;
  currentSlideIndex.value = index;

  setTimeout(() => {
    isTransitioning.value = false;
  }, 1000);
};

const startAutoSlide = () => {
  slideInterval = setInterval(nextSlide, 10000); // Change slide every 10 seconds
};

const stopAutoSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
};

// Lifecycle
onMounted(() => {
  startAutoSlide();
});

onUnmounted(() => {
  stopAutoSlide();
});

// Debug: Check if image loads
const imageLoaded = ref(false);
const imageError = ref(false);

const onImageLoad = () => {
  imageLoaded.value = true;
};

const onImageError = () => {
  imageError.value = true;
};
</script>

<template>
  <section
    class="relative overflow-hidden text-white h-screen w-full flex items-center justify-center hero-section"
    @mouseenter="stopAutoSlide"
    @mouseleave="startAutoSlide"
  >
    <!-- Animated Background Images -->
    <div class="absolute inset-0 z-0">
      <!-- Slide backgrounds -->
      <div
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-100': index === currentSlideIndex, 'opacity-0': index !== currentSlideIndex }"
      >
        <img
          :src="slide.image"
          :alt="`Hero Background ${index + 1}`"
          class="absolute inset-0 w-full h-full object-cover hero-image-animated"
          @load="onImageLoad"
          @error="onImageError"
        />
      </div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/60 z-10" />
    </div>

    <!-- Hero Content -->
    <div class="container relative z-20 mx-auto max-w-6xl px-4 text-center">
      <div class="space-y-8" :class="{ 'slide-in': !isTransitioning, 'slide-out': isTransitioning }">
        <!-- Logo -->
        <div class="mb-6 transition-all duration-700">
          <img
            src="/img/logo.png"
            alt="Melati Gold Logo"
            class="mx-auto w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 object-contain drop-shadow-2xl filter brightness-110 hover:scale-105 transition-transform duration-500"
          />
        </div>

        <!-- Title -->
        <h1
          class="font-script text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight text-gold drop-shadow-lg transition-all duration-700 delay-100"
        >
          {{ currentSlide.title }}
        </h1>

        <!-- Subtitle -->
        <p
          class="text-white/90 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light transition-all duration-700 delay-200 leading-relaxed"
        >
          {{ currentSlide.subtitle }}
        </p>

        <!-- CTA Button -->
        <div class="mt-10 transition-all duration-700 delay-300">
          <a
            href="#produk"
            class="inline-block bg-gold hover:bg-gold/90 text-black font-semibold px-6 py-3 md:px-5 md:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-base md:text-lg"
          >
            {{ currentSlide.buttonText }}
          </a>
        </div>
      </div>
    </div>

    <!-- Slide Navigation Dots -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-4">
      <button
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        @click="goToSlide(index)"
        class="w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 border-2"
        :class="{
          'bg-gold border-gold': index === currentSlideIndex,
          'bg-white/30 border-white/50 hover:bg-white/50 hover:border-white/70': index !== currentSlideIndex,
        }"
        :aria-label="`Go to slide ${index + 1}`"
      />
    </div>
  </section>
</template>

<style scoped>
@keyframes zoomIn {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOutDown {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Animated hero image */
.hero-image-animated {
  animation: zoomIn 25s ease-in-out infinite alternate;
  z-index: 1;
}

/* Content slide animations */
.slide-in {
  animation: slideInUp 0.8s ease-out forwards;
}

.slide-out {
  animation: slideOutDown 0.5s ease-in forwards;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .hero-image-animated {
    animation: zoomIn 20s ease-in-out infinite alternate;
  }

  /* Logo sizing for mobile - DIPERBESAR */
  img[alt="Melati Gold Logo"] {
    width: 10rem !important;
    height: 10rem !important;
  }

  /* Title sizing for mobile */
  h1 {
    font-size: 2.5rem !important;
    line-height: 1.2 !important;
  }

  /* Subtitle sizing for mobile */
  p {
    font-size: 1rem !important;
    line-height: 1.5 !important;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  /* Logo sizing for tablet */
  img[alt="Melati Gold Logo"] {
    width: 8rem !important;
    height: 8rem !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Logo sizing for small desktop */
  img[alt="Melati Gold Logo"] {
    width: 10rem !important;
    height: 10rem !important;
  }
}

@media (min-width: 1025px) {
  /* Logo sizing for large desktop */
  img[alt="Melati Gold Logo"] {
    width: 12rem !important;
    height: 12rem !important;
  }
}

@media (min-width: 1440px) {
  /* Logo sizing for extra large screens */
  img[alt="Melati Gold Logo"] {
    width: 14rem !important;
    height: 14rem !important;
  }
}

/* Ensure text is readable on all devices */
@media (max-width: 768px) {
  section {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }
}

/* Logo styling */
img[alt="Melati Gold Logo"] {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4)) brightness(1.1) contrast(1.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

img[alt="Melati Gold Logo"]:hover {
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.5)) brightness(1.2) contrast(1.2);
  transform: scale(1.05) rotate(1deg);
}

/* Add subtle text shadow for better readability */
h1,
p {
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.6);
}

/* Logo animation on slide transition */
@keyframes logoFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.slide-in img[alt="Melati Gold Logo"] {
  animation: logoFadeIn 0.8s ease-out forwards;
}

/* Navigation buttons hover effects */
button:focus {
  outline: 2px solid rgba(247, 227, 161, 0.5);
  outline-offset: 2px;
}

/* Smooth transitions for all interactive elements */
button,
a {
  transition: all 0.3s ease;
}

/* Enhanced dot navigation */
.absolute.bottom-8 button {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
}

.absolute.bottom-8 button:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

/* Arrow buttons styling */
.absolute.left-4,
.absolute.right-4,
.absolute.left-8,
.absolute.right-8 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.absolute.left-4:hover,
.absolute.right-4:hover,
.absolute.left-8:hover,
.absolute.right-8:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-50%) scale(1.1);
}

/* Enhanced dot navigation */
.absolute.bottom-8 button {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.absolute.bottom-8 button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Arrow buttons styling */
.absolute.left-4,
.absolute.right-4 {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.absolute.left-4:hover,
.absolute.right-4:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  transform: translateY(-50%) scale(1.1);
}
</style>
