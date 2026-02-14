<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  product: any;
}>();

// Format price
const formatPrice = (price: number) => {
  if (!price) return "Hubungi Kami";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

// Product specs
const specs = computed(() => {
  const result: Array<{ label: string; value: string }> = [];

  if (props.product?.karat) {
    result.push({ label: "Karat", value: props.product.karat });
  }
  if (props.product?.weight) {
    result.push({ label: "Berat", value: `± ${props.product.weight}` });
  }
  if (props.product?.stone_type) {
    result.push({ label: "Jenis Batu", value: props.product.stone_type });
  }
  if (props.product?.size) {
    result.push({ label: "Ukuran", value: props.product.size });
  }

  // Additional specs from product.specs array
  if (props.product?.specs && Array.isArray(props.product.specs)) {
    props.product.specs.forEach((spec: any) => {
      if (spec.label && spec.value) {
        result.push({ label: spec.label, value: spec.value });
      }
    });
  }

  return result;
});

// No longer need these handlers - handled by ProductContactButtons
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Product Title & Category -->
    <div>
      <div
        v-if="product?.category_name"
        class="text-xs sm:text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide"
      >
        {{ product.category_name }}
        <span v-if="product?.subcategory_name" class="text-gold">/ {{ product.subcategory_name }}</span>
      </div>
      <h1 class="font-bold text-xl sm:text-2xl lg:text-2xl font-serif text-gray-900 leading-tight">
        {{ product?.title || product?.name || "Loading..." }}
      </h1>
    </div>

    <!-- Price -->
    <div class="border-t border-b border-gray-200 py-3 md:py-4 bg-gradient-to-r from-amber-50/50 to-transparent">
      <div class="text-xl sm:text-2xl lg:text-xl font-bold text-maroon">± {{ formatPrice(product?.price) }}</div>
      <p v-if="product?.price" class="text-xs sm:text-sm text-gray-600 mt-1.5 flex items-center gap-1">
        <i class="bi bi-info-circle"></i>
        <span>Harga dapat berubah mengikuti harga emas terbaru</span>
      </p>
    </div>

    <!-- Description -->
    <div v-if="product?.description" class="prose prose-sm max-w-none">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <i class="bi bi-file-text text-maroon"></i>
        <span>Deskripsi</span>
      </h3>
      <p class="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">{{ product.description }}</p>
    </div>

    <!-- Specifications -->
    <div
      v-if="specs.length > 0"
      class="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 md:p-5 border border-gray-200"
    >
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <i class="bi bi-list-check text-maroon"></i>
        <span>Spesifikasi</span>
      </h3>
      <dl class="space-y-1.5">
        <div
          v-for="(spec, index) in specs"
          :key="index"
          class="flex justify-between items-center py-1 border-b border-gray-200 last:border-0 gap-2"
        >
          <dt class="text-sm sm:text-base text-gray-600 font-medium flex items-center gap-2">
            <i class="bi bi-dot text-maroon text-xl"></i>
            {{ spec.label }}
          </dt>
          <dd class="text-sm sm:text-base text-gray-900 font-semibold text-right">{{ spec.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- CTA Buttons (Shopee, Tokopedia, WhatsApp) -->
    <div class="pt-2">
      <ProductContactButtons :product="product" />
    </div>

    <!-- Additional Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4 text-xs sm:text-sm text-blue-900">
      <div class="flex gap-2 md:gap-3">
        <i class="bi bi-shield-check text-blue-600 flex-shrink-0 mt-0.5 text-lg"></i>
        <div class="space-y-1.5">
          <p class="font-semibold text-sm sm:text-base">Jaminan Kualitas</p>
          <ul class="space-y-1 text-blue-800">
            <li class="flex items-start gap-2">
              <i class="bi bi-check2 text-blue-600 flex-shrink-0 mt-0.5"></i>
              <span>Semua produk dijamin keasliannya dengan sertifikat</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="bi bi-check2 text-blue-600 flex-shrink-0 mt-0.5"></i>
              <span>Menerima jual dan tukar tambah emas</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="bi bi-check2 text-blue-600 flex-shrink-0 mt-0.5"></i>
              <span>Bisa custom perhiasan sesuai model yang diinginkan</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
