<script setup lang="ts">
const props = defineProps<{
  items: { id: number; title: string; image: string; large?: boolean }[];
}>();

const emit = defineEmits<{
  (e: "open", id: number): void;
}>();
</script>

<template>
  <div class="lookbook-grid">
    <div v-for="it in items" :key="it.id" class="item" :class="{ large: it.large }" @click="emit('open', it.id)">
      <img :src="it.image" :alt="it.title" />
      <div class="hover-overlay">
        <span>Lihat Detail</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lookbook-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
@media (max-width: 1200px) {
  .lookbook-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 768px) {
  .lookbook-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.item {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 4/5;
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.item.large {
  grid-column: span 2;
  grid-row: span 2;
  aspect-ratio: 1/1;
}
.item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.item:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}
.hover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  background: rgba(0, 0, 0, 0.25);
  transition: opacity 0.3s ease;
}
.item:hover .hover-overlay {
  opacity: 1;
}
</style>
