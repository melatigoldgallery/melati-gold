<script setup lang="ts">
import { computed, onMounted } from "vue";

const props = defineProps<{
  show: boolean;
  product: null | any;
  serviceContext?: any | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Derived values to handle both demo and db product shapes
const displayName = computed(() => props.product && (props.product.name || props.product.title || ""));
const displayImages = computed(() => {
  if (!props.product) return [];
  if (props.product.images && props.product.images.length) return props.product.images;
  if (props.product.gallery_images && props.product.gallery_images.length) return props.product.gallery_images;
  if (props.product.thumbnail_image) return [props.product.thumbnail_image];
  return [];
});

const whatsappLink = computed(() => {
  if (!props.product) return `https://wa.me/6281234567890`;
  const base = `https://wa.me/6281234567890`;
  const productName = displayName.value || "produk";
  const service = props.serviceContext?.title ? ` untuk layanan ${props.serviceContext.title}` : "";
  const text = `Halo, saya ingin tanya tentang ${productName}${service}. Bisa dibantu?`;
  return `${base}?text=${encodeURIComponent(text)}`;
});

const displaySpecs = computed(() => {
  if (!props.product) return [];
  return props.product.specs || props.product.specs || [];
});

// Function to navigate to specific slide when clicking thumbnail
const goToSlide = (index: number) => {
  if (typeof window !== "undefined" && (window as any).bootstrap) {
    const carouselElement = document.getElementById("productCarousel");
    if (carouselElement) {
      const bootstrap = (window as any).bootstrap;
      const carousel = bootstrap.Carousel.getInstance(carouselElement) || new bootstrap.Carousel(carouselElement);
      carousel.to(index);
    }
  }
};

// Initialize carousel on mount
onMounted(() => {
  if (typeof window !== "undefined" && (window as any).bootstrap) {
    const carouselElement = document.getElementById("productCarousel");
    if (carouselElement) {
      const bootstrap = (window as any).bootstrap;
      new bootstrap.Carousel(carouselElement, {
        interval: false, // Disable auto-sliding
        touch: true, // Enable touch/swipe gestures
      });
    }
  }
});
</script>

<template>
  <Transition name="fade">
    <div v-if="show && product" class="modal d-block" tabindex="-1" @click.self="emit('close')">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content rounded-4 overflow-hidden">
          <div class="modal-body p-0">
            <div class="row g-0">
              <div class="col-12 col-lg-7 p-3 p-lg-4">
                <div id="productCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-touch="true">
                  <!-- Carousel Indicators -->
                  <div class="carousel-indicators" v-if="displayImages.length > 1">
                    <button
                      v-for="(img, i) in displayImages"
                      :key="'ind' + i"
                      type="button"
                      data-bs-target="#productCarousel"
                      :data-bs-slide-to="i"
                      :class="{ active: i === 0 }"
                      :aria-current="i === 0 ? 'true' : 'false'"
                      :aria-label="`Slide ${i + 1}`"
                    ></button>
                  </div>

                  <div class="carousel-inner rounded-3 overflow-hidden">
                    <div class="carousel-item" :class="{ active: i === 0 }" v-for="(img, i) in displayImages" :key="i">
                      <img :src="img" class="d-block w-100" :alt="displayName" />
                    </div>
                  </div>

                  <!-- Navigation buttons (only show if more than 1 image) -->
                  <template v-if="displayImages.length > 1">
                    <button
                      class="carousel-control-prev"
                      type="button"
                      data-bs-target="#productCarousel"
                      data-bs-slide="prev"
                    >
                      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Previous</span>
                    </button>
                    <button
                      class="carousel-control-next"
                      type="button"
                      data-bs-target="#productCarousel"
                      data-bs-slide="next"
                    >
                      <span class="carousel-control-next-icon" aria-hidden="true"></span>
                      <span class="visually-hidden">Next</span>
                    </button>
                  </template>
                </div>
                <div class="d-flex gap-2 mt-3 flex-wrap justify-content-center">
                  <img
                    v-for="(img, i) in displayImages"
                    :key="'t' + i"
                    :src="img"
                    class="thumb"
                    @click="goToSlide(i)"
                    role="button"
                    :aria-label="`Go to image ${i + 1}`"
                  />
                </div>
              </div>

              <div class="col-12 col-lg-5 p-4 p-lg-5 bg-light">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h4 class="mb-0">{{ product.name || product.title }}</h4>
                  <button type="button" class="btn-close" @click="emit('close')"></button>
                </div>
                <p class="text-muted">{{ product.description || product.subtitle || "" }}</p>
                <ul class="small">
                  <li v-for="(s, i) in displaySpecs" :key="i">{{ s }}</li>
                </ul>
                <div class="h5 text-maroon fw-semibold">{{ product.price || product.price_formatted || "" }}</div>
                <a :href="whatsappLink" target="_blank" class="btn btn-success mt-3">
                  <i class="fab fa-whatsapp me-2"></i>
                  Chat WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal {
  background: rgba(0, 0, 0, 0.55);
}
/* Carousel main image styling */
.carousel-item img {
  width: 100%;
  max-width: 420px;
  height: auto;
  max-height: 420px;
  aspect-ratio: 4/5;
  object-fit: cover;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

@media (max-width: 1200px) {
  .carousel-item img {
    max-width: 320px;
    max-height: 320px;
  }
}
@media (max-width: 768px) {
  .carousel-item img {
    max-width: 220px;
    max-height: 220px;
  }
}

/* Thumbnail styling */
.thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #eee;
  transition: border-color 0.2s, transform 0.2s;
  cursor: pointer;
}
.thumb:hover {
  border-color: #b48c5a;
  transform: scale(1.05);
}

/* Carousel indicators styling */
.carousel-indicators {
  margin-bottom: 0.5rem;
}
.carousel-indicators button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #b48c5a;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.carousel-indicators button.active {
  opacity: 1;
}

/* Carousel controls styling */
.carousel-control-prev,
.carousel-control-next {
  width: 40px;
  height: 40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}
.carousel:hover .carousel-control-prev,
.carousel:hover .carousel-control-next {
  opacity: 1;
}
.carousel-control-prev {
  left: 10px;
}
.carousel-control-next {
  right: 10px;
}
</style>
