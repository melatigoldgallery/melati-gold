<script setup lang="ts">
import { ref, watchEffect } from "vue";

const props = defineProps<{
  show: boolean;
  category: string | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", subcategory: string): void;
}>();

const subcategoriesMap: Record<string, { key: string; title: string; image: string }[]> = {
  Kalung: [
    { key: "anak", title: "Kalung Anak", image: "/img/kids-necklace.jpg" },
    { key: "fashion", title: "Kalung Fashion", image: "/img/necklace2.jpg" },
    { key: "pria", title: "Kalung Laki-laki", image: "/img/necklace-man.jpg" },
  ],
};

const items = ref<{ key: string; title: string; image: string }[]>([]);

watchEffect(() => {
  items.value = props.category ? subcategoriesMap[props.category] || [] : [];
});
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modal d-block" tabindex="-1" role="dialog" @click.self="emit('close')">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content bg-white rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header border-0">
            <h5 class="modal-title">Pilih Sub-Kategori {{ category }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="emit('close')"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div v-for="it in items" :key="it.key" class="col-12 col-md-4">
                <button class="w-100 btn p-0 border-0 bg-transparent" @click="emit('select', it.key)">
                  <div class="position-relative rounded-3 overflow-hidden subcard">
                    <img :src="it.image" :alt="it.title" class="w-100 h-100 object-fit-cover" />
                    <div class="overlay d-flex align-items-center justify-content-center">
                      <span class="text-white fw-semibold">{{ it.title }}</span>
                    </div>
                  </div>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal {
  background: rgba(0, 0, 0, 0.5);
}
.subcard {
  aspect-ratio: 4/5;
}
.subcard img {
  transition: transform 0.4s ease;
}
.subcard:hover img {
  transform: scale(1.05);
}
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.15));
}
</style>
