<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  product: null | {
    id: number;
    name: string;
    price: string;
    description: string;
    specs: string[];
    images: string[];
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <Transition name="fade">
    <div v-if="show && product" class="modal d-block" tabindex="-1" @click.self="emit('close')">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content rounded-4 overflow-hidden">
          <div class="modal-body p-0">
            <div class="row g-0">
              <div class="col-12 col-lg-7 p-3 p-lg-4">
                <div id="carousel" class="carousel slide">
                  <div class="carousel-inner rounded-3 overflow-hidden">
                    <div class="carousel-item" :class="{ active: i === 0 }" v-for="(img, i) in product.images" :key="i">
                      <img :src="img" class="d-block w-100" :alt="product.name" />
                    </div>
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#carousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                  </button>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <img v-for="(img, i) in product.images" :key="'t' + i" :src="img" class="thumb" />
                </div>
              </div>

              <div class="col-12 col-lg-5 p-4 p-lg-5 bg-light">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h4 class="mb-0">{{ product.name }}</h4>
                  <button type="button" class="btn-close" @click="emit('close')"></button>
                </div>
                <p class="text-muted">{{ product.description }}</p>
                <ul class="small">
                  <li v-for="(s, i) in product.specs" :key="i">{{ s }}</li>
                </ul>
                <div class="h5 text-maroon fw-semibold">{{ product.price }}</div>
                <a
                  :href="`https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20tanya%20produk%20${encodeURIComponent(
                    product.name
                  )}`"
                  target="_blank"
                  class="btn btn-success mt-3"
                >
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
.thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
