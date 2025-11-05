<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  items: any[]; // Accept products from database
}>();

const emit = defineEmits<{
  (e: "open", product: any): void; // Emit full product object
}>();

// 🚀 Image optimization
const { presets } = useImageOptimization();

// Desktop columns: default 6, but if items < 6, use items.length (min 1)
const desktopCols = computed(() => {
  const len = Array.isArray(props.items) ? props.items.length : 0;
  return Math.max(1, Math.min(len, 6));
});

// Optimize images untuk grid thumbnail
const getOptimizedImage = (product: any) => {
  const imageUrl = product.thumbnail_image || product.images?.[0] || '/img/placeholder.jpg';
  
  // Skip optimization untuk local images
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // Use card preset (600x600, auto-compressed)
  return presets.card(imageUrl);
};
</script>

<template>
  <div class="lookbook-grid-wrap" :class="`maxw-d-${desktopCols}`">
    <div class="lookbook-grid" :class="`cols-d-${desktopCols}`">
      <div v-for="product in items" :key="product.id" class="item" @click="emit('open', product)">
        <!-- ✨ Optimized image with lazy loading -->
        <img
          :src="getOptimizedImage(product)"
          :alt="product.title || product.name"
          loading="lazy"
          decoding="async"
        />
        <div class="hover-overlay">
          <span>Lihat Detail</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lookbook-grid-wrap {
  width: 100%;
  margin: 0 auto;
  /* Shared sizing tokens for grid and wrapper (desktop) */
  --col-w: 220px; /* target card width on desktop */
  --gap: 12px; /* must match grid gap */
}
.lookbook-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--gap);
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

/* Desktop adjustments: shrink columns and wrapper when items < 6 */
@media (min-width: 1201px) {
  /* Dynamic column counts on desktop */
  .lookbook-grid.cols-d-1 {
    grid-template-columns: repeat(1, 1fr);
  }
  .lookbook-grid.cols-d-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .lookbook-grid.cols-d-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .lookbook-grid.cols-d-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  .lookbook-grid.cols-d-5 {
    grid-template-columns: repeat(5, 1fr);
  }
  .lookbook-grid.cols-d-6 {
    grid-template-columns: repeat(6, 1fr);
  }

  /* Shrink wrapper max-width so cards don't grow when < 6 items */
  .lookbook-grid-wrap.maxw-d-1 {
    max-width: calc(1 * var(--col-w) + 0 * var(--gap));
  }
  .lookbook-grid-wrap.maxw-d-2 {
    max-width: calc(2 * var(--col-w) + 1 * var(--gap));
  }
  .lookbook-grid-wrap.maxw-d-3 {
    max-width: calc(3 * var(--col-w) + 2 * var(--gap));
  }
  .lookbook-grid-wrap.maxw-d-4 {
    max-width: calc(4 * var(--col-w) + 3 * var(--gap));
  }
  .lookbook-grid-wrap.maxw-d-5 {
    max-width: calc(5 * var(--col-w) + 4 * var(--gap));
  }
  /* For 6 or more, let it fill available width (no max-width cap) */
}
</style>
