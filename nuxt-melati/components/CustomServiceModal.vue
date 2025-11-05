<script setup lang="ts">
import { ref, watch, computed } from "vue";

const props = defineProps<{
  show: boolean;
  service: any | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select-product", product: any): void;
}>();

// Fetch service with products
const { getServiceWithProducts } = useCatalogManager();

const serviceData = ref<any>(null);
const products = ref<any[]>([]);
const loading = ref(false);

// Desktop grid columns: default up to 4 columns, shrink to product count when < 4
const desktopCols = computed(() => {
  const len = Array.isArray(products.value) ? products.value.length : 0;
  return Math.max(1, Math.min(len, 4));
});

// Modal size class based on product count (desktop)
const modalSizeClass = computed(() => {
  const n = desktopCols.value;
  if (n <= 1) return "modal-md";
  if (n === 2 || n === 3) return "modal-lg";
  return "modal-xl"; // 4 or more
});

// Load service data with products
const loadServiceData = async () => {
  if (!props.service?.id) {
    serviceData.value = null;
    products.value = [];
    return;
  }

  console.log("[CustomServiceModal] Loading service data for ID:", props.service.id);
  loading.value = true;

  const result = await getServiceWithProducts(props.service.id);

  console.log("[CustomServiceModal] Result:", result);
  console.log("[CustomServiceModal] Service data:", result.data);
  console.log("[CustomServiceModal] Products:", result.data?.products);
  console.log("[CustomServiceModal] Example products array:", result.data?.example_products);

  if (result.success && result.data) {
    serviceData.value = result.data;
    products.value = result.data.products || [];
    console.log("[CustomServiceModal] Products set to:", products.value);
  } else {
    console.error("[CustomServiceModal] Failed to load service:", "error" in result ? result.error : "Unknown error");
  }

  loading.value = false;
};

// Watch for service changes
watch(
  () => props.service,
  async (newService) => {
    if (newService && props.show) {
      await loadServiceData();
    }
  },
  { immediate: true }
);

// Watch show prop
watch(
  () => props.show,
  async (isShown) => {
    if (isShown && props.service) {
      await loadServiceData();
    }
  }
);

// Handle product selection
const selectProduct = (product: any) => {
  emit("select-product", product);
};

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// WhatsApp contact
const whatsappNumber = "6281234567890";
const contactWhatsApp = () => {
  const text = `Halo, saya ingin konsultasi tentang layanan ${serviceData.value?.title}`;
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show && service"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      @click.self="emit('close')"
    >
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto" :class="modalSizeClass">
        <!-- Header -->
        <div class="sticky top-0 z-10 flex items-start justify-between gap-4 p-4 border-b bg-white">
          <div>
            <h5 class="text-lg font-semibold text-neutral-800">Custom {{ service.title }}</h5>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
            @click="emit('close')"
          >
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div class="p-4">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Memuat contoh produk...</p>
          </div>

          <!-- Content -->
          <div v-else>
            <!-- Service Description -->
            <div v-if="serviceData" class="mb-4 p-4 bg-light rounded-3">
              <p class="text-muted mb-3">{{ serviceData.description }}</p>

              <!-- Features -->
              <div v-if="serviceData.features && serviceData.features.length > 0" class="mb-3">
                <h6 class="fw-semibold mb-2">✨ Keunggulan Layanan:</h6>
                <ul class="list-unstyled mb-0">
                  <li v-for="(feature, idx) in serviceData.features" :key="idx" class="mb-1">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    <span>{{ feature }}</span>
                  </li>
                </ul>
              </div>

              <!-- Meta Info -->
              <div class="d-flex gap-4 text-sm">
                <span v-if="serviceData.duration" class="text-muted">
                  <i class="bi bi-clock me-1"></i>
                  {{ serviceData.duration }}
                </span>
                <span v-if="serviceData.price_info" class="text-warning fw-semibold">
                  <i class="bi bi-tag me-1"></i>
                  {{ serviceData.price_info }}
                </span>
              </div>

              <!-- WhatsApp Button -->
              <div class="mt-3">
                <button @click="contactWhatsApp" class="btn btn-success">
                  <i class="bi bi-whatsapp me-2"></i>
                  Konsultasi via WhatsApp
                </button>
              </div>
            </div>

            <!-- Products Grid -->
            <div v-if="products.length > 0">
              <h6 class="fw-semibold mb-3">📦 Contoh Produk</h6>
              <div class="product-grid-wrap" :class="`maxw-d-${desktopCols}`">
                <div class="product-grid" :class="`cols-d-${desktopCols}`">
                  <div v-for="product in products" :key="product.id" class="product-cell">
                    <div
                      class="card h-100 border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                      @click="selectProduct(product)"
                    >
                      <!-- Product Image -->
                      <div class="position-relative" style="aspect-ratio: 1/1">
                        <img
                          v-if="product.thumbnail_image"
                          :src="product.thumbnail_image"
                          :alt="product.title"
                          class="card-img-top object-fit-cover w-100 h-100"
                          loading="lazy"
                        />
                        <div v-else class="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                          <i class="bi bi-image text-muted opacity-50" style="font-size: 2rem"></i>
                        </div>

                        <!-- Stock Badge -->
                        <div v-if="product.stock <= 0" class="position-absolute top-0 end-0 m-2">
                          <span class="badge bg-danger">Habis</span>
                        </div>
                      </div>

                      <!-- Product Info -->
                      <div class="card-body p-3">
                        <h6 class="card-title small mb-1 text-truncate">{{ product.title }}</h6>
                        <p v-if="product.subtitle" class="card-text text-muted small mb-2 text-truncate">
                          {{ product.subtitle }}
                        </p>
                        <p class="fw-semibold text-warning mb-0 small">
                          {{ formatPrice(product.price) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-5">
              <i class="bi bi-box-seam text-muted" style="font-size: 3rem"></i>
              <p class="text-muted mt-3 mb-0">
                Belum ada contoh produk untuk layanan ini.
                <br />
                Silakan hubungi kami untuk konsultasi lebih lanjut.
              </p>
              <button @click="contactWhatsApp" class="btn btn-success mt-3">
                <i class="bi bi-whatsapp me-2"></i>
                Konsultasi via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Product card image container */
.card .position-relative {
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

/* Product image styling - Proporsional untuk desktop dan mobile */
.card-img-top {
  transition: transform 0.3s ease;
}

.card:hover .card-img-top {
  transform: scale(1.05);
}

/* Responsive grid adjustments */
@media (max-width: 576px) {
  /* Mobile: 2 columns dengan ukuran lebih kecil */
  .col-6 {
    max-width: 48%;
  }

  .card-body {
    padding: 0.75rem !important;
  }

  .card-title {
    font-size: 0.8rem !important;
  }

  .card-text {
    font-size: 0.7rem !important;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  /* Tablet: 3 columns */
  .col-md-4 {
    flex: 0 0 auto;
    width: 33.333333%;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  /* Medium screens: 3 columns */
  .col-lg-3 {
    flex: 0 0 auto;
    width: 33.333333%;
  }
}

@media (min-width: 993px) {
  /* Desktop: 4 columns */
  .col-lg-3 {
    flex: 0 0 auto;
    width: 25%;
  }
}

/* Ensure consistent card height */
.card {
  transition: all 0.3s ease;
}

/* Image container with fixed aspect ratio */
.position-relative[style*="aspect-ratio"] {
  background-color: #f8f9fa;
}

/* Badge positioning */
.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

/* New responsive product grid (replaces Bootstrap row/cols for this section) */
.product-grid-wrap {
  width: 100%;
  margin: 0 auto;
  /* sizing tokens */
  --col-w: 220px; /* desktop card width target */
  --gap: 12px; /* spacing between cards */
}
.product-grid {
  display: grid;
  gap: var(--gap);
  grid-template-columns: repeat(4, 1fr);
}

/* Tablet and mobile breakpoints: keep previous intent */
@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop dynamic adjustments based on product count */
@media (min-width: 993px) {
  .product-grid.cols-d-1 {
    grid-template-columns: repeat(1, 1fr);
  }
  .product-grid.cols-d-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .product-grid.cols-d-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .product-grid.cols-d-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  /* Shrink wrapper so cards stay proportional when < 4 items */
  .product-grid-wrap.maxw-d-1 {
    max-width: calc(1 * var(--col-w) + 0 * var(--gap));
  }
  .product-grid-wrap.maxw-d-2 {
    max-width: calc(2 * var(--col-w) + 1 * var(--gap));
  }
  .product-grid-wrap.maxw-d-3 {
    max-width: calc(3 * var(--col-w) + 2 * var(--gap));
  }
  /* For 4 or more, allow full modal width (no cap) */
}
</style>
