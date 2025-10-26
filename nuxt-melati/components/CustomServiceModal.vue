<script setup lang="ts">
import { ref, watch } from "vue";

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
    <div v-if="show && service" class="modal d-block" tabindex="-1" role="dialog" @click.self="emit('close')">
      <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
        <div class="modal-content bg-white rounded-4 shadow-lg overflow-hidden">
          <!-- Header -->
          <div class="modal-header border-0 bg-gradient-to-r from-maroon to-gold text-white">
            <div>
              <h5 class="modal-title mb-1">{{ service.title }}</h5>
              <p v-if="service.subtitle" class="mb-0 small opacity-90">{{ service.subtitle }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="emit('close')"></button>
          </div>

          <div class="modal-body p-4">
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
                <h6 class="fw-semibold mb-3">📦 Contoh Produk untuk Layanan Ini:</h6>
                <div class="row g-3">
                  <div v-for="product in products" :key="product.id" class="col-6 col-md-4 col-lg-3">
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
                        <div
                          v-else
                          class="w-100 h-100 bg-gradient-to-br from-maroon to-gold d-flex align-items-center justify-content-center"
                        >
                          <i class="bi bi-image text-white opacity-50" style="font-size: 2rem"></i>
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
</style>
